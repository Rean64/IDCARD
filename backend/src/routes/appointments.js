import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Book appointment (public route)
router.post('/book', [
  body('applicationId').notEmpty(),
  body('locationId').isMongoId(),
  body('date').isISO8601(),
  body('timeSlot').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { applicationId, locationId, date, timeSlot } = req.body;

    // Find application
    const application = await prisma.application.findUnique({
      where: { applicationId }
    });

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        message: 'No application found with this ID'
      });
    }

    // Check if payment is completed
    if (application.paymentStatus !== 'COMPLETED') {
      return res.status(400).json({
        error: 'Payment required',
        message: 'Payment must be completed before booking appointment'
      });
    }

    // Find location
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location || !location.isActive) {
      return res.status(404).json({
        error: 'Location not available',
        message: 'Selected location is not available'
      });
    }

    // Check if date is valid (not weekend, within working days)
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();
    
    if (!location.availableDays.includes(dayOfWeek)) {
      return res.status(400).json({
        error: 'Invalid appointment date',
        message: 'Selected date is not available at this location'
      });
    }

    // Check appointment capacity
    const existingAppointments = await prisma.appointment.count({
      where: {
        locationId,
        date: appointmentDate,
        timeSlot,
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      }
    });

    if (existingAppointments >= location.capacity) {
      return res.status(400).json({
        error: 'Time slot full',
        message: 'This time slot is fully booked, please select another time'
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        timeSlot,
        locationId,
        status: 'SCHEDULED'
      },
      include: {
        location: true
      }
    });

    // Update application with appointment
    const updatedApplication = await prisma.application.update({
      where: { id: application.id },
      data: {
        appointmentId: appointment.id,
        status: 'APPOINTMENT_SCHEDULED'
      }
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment.id,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        location: appointment.location,
        status: appointment.status,
        confirmationNumber: `APT-${appointment.id.slice(-8).toUpperCase()}`
      }
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      error: 'Appointment booking failed',
      message: 'Unable to book appointment'
    });
  }
});

// Get available time slots for a date and location
router.get('/availability', [
  query('locationId').isMongoId(),
  query('date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { locationId, date } = req.query;
    const appointmentDate = new Date(date);

    // Get location
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      return res.status(404).json({
        error: 'Location not found',
        message: 'Location not found'
      });
    }

    // Check if date is valid
    const dayOfWeek = appointmentDate.getDay();
    if (!location.availableDays.includes(dayOfWeek)) {
      return res.json({
        availableSlots: [],
        message: 'Location is closed on this day'
      });
    }

    // Generate time slots based on working hours
    const timeSlots = [
      '08:00', '09:00', '10:00', '11:00',
      '13:00', '14:00', '15:00', '16:00'
    ];

    // Get existing appointments for this date and location
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        locationId,
        date: appointmentDate,
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      },
      select: {
        timeSlot: true,
        _count: true
      }
    });

    // Calculate availability for each slot
    const availableSlots = timeSlots.map(slot => {
      const booked = existingAppointments.filter(apt => apt.timeSlot === slot).length;
      return {
        time: slot,
        available: booked < location.capacity,
        capacity: location.capacity,
        booked
      };
    });

    res.json({
      date: appointmentDate,
      location,
      availableSlots
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      error: 'Failed to get availability',
      message: 'Unable to retrieve appointment availability'
    });
  }
});

// Get appointment by confirmation number
router.get('/confirmation/:confirmationNumber', async (req, res) => {
  try {
    const { confirmationNumber } = req.params;
    
    // Extract appointment ID from confirmation number (APT-XXXXXXXX)
    const appointmentIdSuffix = confirmationNumber.replace('APT-', '').toLowerCase();
    
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: { endsWith: appointmentIdSuffix }
      },
      include: {
        location: true,
        applications: {
          select: {
            applicationId: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            status: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'No appointment found with this confirmation number'
      });
    }

    res.json({
      appointment: {
        confirmationNumber,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        location: appointment.location,
        status: appointment.status,
        applications: appointment.applications
      }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      error: 'Failed to retrieve appointment',
      message: 'Unable to get appointment details'
    });
  }
});

// Update appointment status (admin only)
router.patch('/:appointmentId/status', [
  authenticateToken,
  requireAdmin,
  body('status').isIn(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { appointmentId } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        location: true,
        applications: true
      }
    });

    // Update related applications if appointment is completed
    if (status === 'COMPLETED') {
      await prisma.application.updateMany({
        where: { appointmentId },
        data: { status: 'BIOMETRIC_COMPLETED' }
      });
    }

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      error: 'Status update failed',
      message: 'Unable to update appointment status'
    });
  }
});

// Get appointments for admin dashboard
router.get('/', [
  authenticateToken,
  requireAdmin,
  query('date').optional().isISO8601(),
  query('locationId').optional().isMongoId(),
  query('status').optional().isIn(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const where = {};
    if (req.query.date) where.date = new Date(req.query.date);
    if (req.query.locationId) where.locationId = req.query.locationId;
    if (req.query.status) where.status = req.query.status;

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' }
      ],
      include: {
        location: true,
        applications: {
          select: {
            applicationId: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            idType: true,
            status: true
          }
        }
      }
    });

    res.json({
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      error: 'Failed to retrieve appointments',
      message: 'Unable to get appointments'
    });
  }
});

export default router;