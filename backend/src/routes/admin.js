import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard/stats', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const [
      totalApplications,
      pendingReview,
      approved,
      rejected,
      totalRevenue,
      todayAppointments,
      statusDistribution,
      typeDistribution,
      recentApplications,
      paymentStats
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({
        where: { status: { in: ['PENDING_REVIEW', 'DOCUMENT_REVIEW'] } }
      }),
      prisma.application.count({
        where: { status: 'APPROVED' }
      }),
      prisma.application.count({
        where: { status: 'REJECTED' }
      }),
      prisma.application.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { paymentAmount: true }
      }),
      prisma.appointment.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] }
        }
      }),
      prisma.application.groupBy({
        by: ['status'],
        _count: true,
        orderBy: { _count: { _all: 'desc' } }
      }),
      prisma.application.groupBy({
        by: ['idType'],
        _count: true,
        orderBy: { _count: { _all: 'desc' } }
      }),
      prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          applicationId: true,
          firstName: true,
          lastName: true,
          idType: true,
          status: true,
          paymentStatus: true,
          paymentAmount: true,
          createdAt: true,
          email: true,
          phoneNumber: true
        }
      }),
      prisma.payment.groupBy({
        by: ['status'],
        _count: true,
        _sum: { amount: true },
        orderBy: { _count: { _all: 'desc' } }
      })
    ]);

    // Calculate trends (mock data for now)
    const trends = {
      applicationsGrowth: 12, // +12% from last month
      revenueGrowth: 8,       // +8% from last month
      approvalRate: Math.round((approved / totalApplications) * 100),
      averageProcessingTime: 5 // days
    };

    res.json({
      overview: {
        totalApplications,
        pendingReview,
        approved,
        rejected,
        totalRevenue: totalRevenue._sum.paymentAmount || 0,
        todayAppointments
      },
      trends,
      distribution: {
        byStatus: statusDistribution.map(item => ({
          status: item.status,
          count: item._count
        })),
        byType: typeDistribution.map(item => ({
          type: item.idType,
          count: item._count
        }))
      },
      recentApplications,
      paymentStats: paymentStats.map(item => ({
        status: item.status,
        count: item._count,
        totalAmount: item._sum.amount
      }))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      message: 'Unable to get dashboard statistics'
    });
  }
});

// Bulk approve applications
router.post('/applications/bulk-approve', [
  authenticateToken,
  requireAdmin,
  body('applicationIds').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { applicationIds } = req.body;

    const updatedApplications = await prisma.application.updateMany({
      where: {
        applicationId: { in: applicationIds },
        status: { in: ['PENDING_REVIEW', 'DOCUMENT_REVIEW'] }
      },
      data: {
        status: 'APPROVED',
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      }
    });

    res.json({
      message: `${updatedApplications.count} applications approved successfully`,
      approvedCount: updatedApplications.count
    });
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({
      error: 'Bulk approval failed',
      message: 'Unable to approve applications'
    });
  }
});

// Export applications to CSV
router.get('/export/applications', [
  authenticateToken,
  requireAdmin,
  query('format').optional().isIn(['csv', 'json']),
  query('status').optional().isIn(['PENDING_REVIEW', 'DOCUMENT_REVIEW', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'APPOINTMENT_SCHEDULED', 'BIOMETRIC_COMPLETED', 'APPROVED', 'REJECTED', 'COMPLETED']),
  query('idType').optional().isIn(['FIRST', 'RENEWAL', 'LOST', 'DAMAGED']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const format = req.query.format || 'json';
    const where = {};

    if (req.query.status) where.status = req.query.status;
    if (req.query.idType) where.idType = req.query.idType;
    if (req.query.dateFrom || req.query.dateTo) {
      where.createdAt = {};
      if (req.query.dateFrom) where.createdAt.gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) where.createdAt.lte = new Date(req.query.dateTo);
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        documents: true,
        appointment: {
          include: {
            location: true
          }
        }
      }
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Application ID',
        'Name',
        'ID Type',
        'Status',
        'Payment Status',
        'Payment Amount',
        'Email',
        'Phone',
        'Created At',
        'Reviewed At'
      ].join(',');

      const csvRows = applications.map(app => [
        app.applicationId,
        `"${app.firstName} ${app.lastName}"`,
        app.idType,
        app.status,
        app.paymentStatus,
        app.paymentAmount,
        app.email,
        app.phoneNumber,
        app.createdAt.toISOString(),
        app.reviewedAt ? app.reviewedAt.toISOString() : ''
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="mindef_applications_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      res.json({
        applications,
        exportedAt: new Date().toISOString(),
        totalRecords: applications.length
      });
    }
  } catch (error) {
    console.error('Export applications error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: 'Unable to export applications'
    });
  }
});

// Generate reports
router.get('/reports/summary', [
  authenticateToken,
  requireAdmin,
  query('period').optional().isIn(['day', 'week', 'month', 'year']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], async (req, res) => {
  try {
    const period = req.query.period || 'month';
    let dateFrom, dateTo;

    // Calculate date range based on period
    const now = new Date();
    switch (period) {
      case 'day':
        dateFrom = new Date(now.setHours(0, 0, 0, 0));
        dateTo = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateTo = new Date();
        break;
      case 'month':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        dateFrom = new Date(now.getFullYear(), 0, 1);
        dateTo = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        if (req.query.dateFrom) dateFrom = new Date(req.query.dateFrom);
        if (req.query.dateTo) dateTo = new Date(req.query.dateTo);
    }

    const where = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [
      applicationStats,
      paymentStats,
      appointmentStats,
      topLocations
    ] = await Promise.all([
      prisma.application.groupBy({
        by: ['status', 'idType'],
        where,
        _count: true
      }),
      prisma.payment.groupBy({
        by: ['status', 'method'],
        where: dateFrom || dateTo ? {
          createdAt: where.createdAt
        } : {},
        _count: true,
        _sum: { amount: true }
      }),
      prisma.appointment.groupBy({
        by: ['status'],
        where: dateFrom || dateTo ? {
          createdAt: where.createdAt
        } : {},
        _count: true
      }),
      prisma.appointment.groupBy({
        by: ['locationId'],
        where: dateFrom || dateTo ? {
          createdAt: where.createdAt
        } : {},
        _count: true,
        orderBy: { _count: { _all: 'desc' } },
        take: 5
      })
    ]);

    res.json({
      period,
      dateRange: { from: dateFrom, to: dateTo },
      summary: {
        applications: applicationStats,
        payments: paymentStats,
        appointments: appointmentStats,
        topLocations
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      error: 'Report generation failed',
      message: 'Unable to generate report'
    });
  }
});

export default router;