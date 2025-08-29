import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all active locations (public route)
router.get('/', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      locations
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      error: 'Failed to retrieve locations',
      message: 'Unable to get locations'
    });
  }
});

// Get location by ID (public route)
router.get('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;

    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      return res.status(404).json({
        error: 'Location not found',
        message: 'Location not found'
      });
    }

    res.json({
      location
    });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({
      error: 'Failed to retrieve location',
      message: 'Unable to get location details'
    });
  }
});

// Create new location (admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('name').trim().isLength({ min: 1 }),
  body('address').trim().isLength({ min: 10 }),
  body('district').trim().isLength({ min: 1 }),
  body('workingHours').trim().isLength({ min: 1 }),
  body('availableDays').isArray({ min: 1 }),
  body('capacity').optional().isInt({ min: 1 })
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
      name,
      address,
      district,
      workingHours,
      availableDays,
      capacity = 20
    } = req.body;

    const location = await prisma.location.create({
      data: {
        name,
        address,
        district,
        workingHours,
        availableDays,
        capacity
      }
    });

    res.status(201).json({
      message: 'Location created successfully',
      location
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({
      error: 'Location creation failed',
      message: 'Unable to create location'
    });
  }
});

// Update location (admin only)
router.put('/:locationId', [
  authenticateToken,
  requireAdmin,
  body('name').optional().trim().isLength({ min: 1 }),
  body('address').optional().trim().isLength({ min: 10 }),
  body('district').optional().trim().isLength({ min: 1 }),
  body('workingHours').optional().trim().isLength({ min: 1 }),
  body('availableDays').optional().isArray({ min: 1 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { locationId } = req.params;
    const updateData = req.body;

    const location = await prisma.location.update({
      where: { id: locationId },
      data: updateData
    });

    res.json({
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      error: 'Location update failed',
      message: 'Unable to update location'
    });
  }
});

// Delete location (admin only)
router.delete('/:locationId', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const { locationId } = req.params;

    // Check if location has future appointments
    const futureAppointments = await prisma.appointment.count({
      where: {
        locationId,
        date: { gte: new Date() },
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      }
    });

    if (futureAppointments > 0) {
      return res.status(400).json({
        error: 'Cannot delete location',
        message: `Location has ${futureAppointments} future appointments. Please reschedule them first.`
      });
    }

    // Soft delete by setting isActive to false
    const location = await prisma.location.update({
      where: { id: locationId },
      data: { isActive: false }
    });

    res.json({
      message: 'Location deactivated successfully',
      location
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({
      error: 'Location deletion failed',
      message: 'Unable to delete location'
    });
  }
});

// Get location statistics (admin only)
router.get('/:locationId/stats', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const { locationId } = req.params;

    const [
      totalAppointments,
      todayAppointments,
      weeklyAppointments,
      monthlyAppointments,
      averageDaily
    ] = await Promise.all([
      prisma.appointment.count({
        where: { locationId }
      }),
      prisma.appointment.count({
        where: {
          locationId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      prisma.appointment.count({
        where: {
          locationId,
          date: {
            gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.appointment.count({
        where: {
          locationId,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.appointment.count({
        where: { locationId }
      }) / 30 // Simple average over 30 days
    ]);

    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    res.json({
      location,
      statistics: {
        totalAppointments,
        todayAppointments,
        weeklyAppointments,
        monthlyAppointments,
        averageDaily: Math.round(averageDaily),
        utilizationRate: Math.round((todayAppointments / location.capacity) * 100)
      }
    });
  } catch (error) {
    console.error('Get location stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      message: 'Unable to get location statistics'
    });
  }
});

export default router;