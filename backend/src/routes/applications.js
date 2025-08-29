import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Generate application ID
const generateApplicationId = () => {
  const timestamp = Date.now();
  return `MINDEF-${timestamp}`;
};

// Create new application (public route)
router.post('/', [
  body('idType').isIn(['FIRST', 'RENEWAL', 'LOST', 'DAMAGED']),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('dateOfBirth').isISO8601(),
  body('placeOfBirth').trim().isLength({ min: 1 }),
  body('nationality').trim().isLength({ min: 1 }),
  body('gender').isIn(['MALE', 'FEMALE']),
  body('maritalStatus').isIn(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']),
  body('address').trim().isLength({ min: 10 }),
  body('phoneNumber').trim().isLength({ min: 9 }),
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      idType,
      firstName,
      lastName,
      dateOfBirth,
      placeOfBirth,
      nationality,
      gender,
      maritalStatus,
      profession,
      address,
      phoneNumber,
      email,
      emergencyContact,
      emergencyPhone,
      fatherName,
      fatherProfession,
      motherName,
      motherProfession,
      previousIdNumber,
      expiryDate
    } = req.body;

    // Calculate payment amount based on ID type
    const paymentAmounts = {
      FIRST: 10000,
      RENEWAL: 5000,
      LOST: 10000,
      DAMAGED: 7500
    };

    const paymentAmount = paymentAmounts[idType];

    // Create application
    const application = await prisma.application.create({
      data: {
        applicationId: generateApplicationId(),
        idType,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        placeOfBirth,
        nationality,
        gender,
        maritalStatus,
        profession,
        address,
        phoneNumber,
        email,
        emergencyContact,
        emergencyPhone,
        fatherName,
        fatherProfession,
        motherName,
        motherProfession,
        previousIdNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        paymentAmount,
        status: 'PENDING_REVIEW',
        submittedAt: new Date()
      },
      include: {
        documents: true
      }
    });

    res.status(201).json({
      message: 'Application created successfully',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      error: 'Application creation failed',
      message: 'Unable to create application'
    });
  }
});

// Get application by ID (public route with application ID)
router.get('/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await prisma.application.findUnique({
      where: { applicationId },
      include: {
        documents: true,
        appointment: {
          include: {
            location: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        message: 'No application found with this ID'
      });
    }

    res.json({
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      error: 'Failed to retrieve application',
      message: 'Unable to get application details'
    });
  }
});

// Update application status (admin only)
router.patch('/:applicationId/status', [
  authenticateToken,
  requireAdmin,
  body('status').isIn(['PENDING_REVIEW', 'DOCUMENT_REVIEW', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'APPOINTMENT_SCHEDULED', 'BIOMETRIC_COMPLETED', 'APPROVED', 'REJECTED', 'COMPLETED']),
  body('rejectionReason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { applicationId } = req.params;
    const { status, rejectionReason } = req.body;

    const updateData = {
      status,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    };

    if (status === 'REJECTED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const application = await prisma.application.update({
      where: { applicationId },
      data: updateData,
      include: {
        documents: true,
        appointment: {
          include: {
            location: true
          }
        }
      }
    });

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      error: 'Status update failed',
      message: 'Unable to update application status'
    });
  }
});

// Get all applications (admin only)
router.get('/', [
  authenticateToken,
  requireAdmin,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING_REVIEW', 'DOCUMENT_REVIEW', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'APPOINTMENT_SCHEDULED', 'BIOMETRIC_COMPLETED', 'APPROVED', 'REJECTED', 'COMPLETED']),
  query('idType').optional().isIn(['FIRST', 'RENEWAL', 'LOST', 'DAMAGED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.idType) where.idType = req.query.idType;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          documents: true,
          appointment: {
            include: {
              location: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      error: 'Failed to retrieve applications',
      message: 'Unable to get applications'
    });
  }
});

// Get application statistics (admin only)
router.get('/stats/overview', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const [
      totalApplications,
      pendingReview,
      approved,
      rejected,
      paymentCompleted,
      statusDistribution,
      typeDistribution,
      revenueData
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: { in: ['PENDING_REVIEW', 'DOCUMENT_REVIEW'] } } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.application.count({ where: { paymentStatus: 'COMPLETED' } }),
      prisma.application.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.application.groupBy({
        by: ['idType'],
        _count: true
      }),
      prisma.application.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { paymentAmount: true }
      })
    ]);

    res.json({
      overview: {
        totalApplications,
        pendingReview,
        approved,
        rejected,
        paymentCompleted,
        totalRevenue: revenueData._sum.paymentAmount || 0
      },
      distribution: {
        byStatus: statusDistribution.map(item => ({
          status: item.status,
          count: item._count
        })),
        byType: typeDistribution.map(item => ({
          type: item.idType,
          count: item._count
        }))
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      message: 'Unable to get application statistics'
    });
  }
});

// Search applications (admin only)
router.get('/search/query', [
  authenticateToken,
  requireAdmin,
  query('q').notEmpty().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const searchQuery = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const applications = await prisma.application.findMany({
      where: {
        OR: [
          { applicationId: { contains: searchQuery, mode: 'insensitive' } },
          { firstName: { contains: searchQuery, mode: 'insensitive' } },
          { lastName: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { phoneNumber: { contains: searchQuery, mode: 'insensitive' } }
        ]
      },
      skip,
      take: limit,
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

    res.json({
      applications,
      query: searchQuery
    });
  } catch (error) {
    console.error('Search applications error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Unable to search applications'
    });
  }
});

export default router;