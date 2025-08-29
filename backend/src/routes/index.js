import express from 'express';

const router = express.Router();

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'MINDEF ID-CARD Management System API',
    version: '1.0.0',
    description: 'Backend API for Cameroon Ministry of Defense ID Card Management System',
    endpoints: {
      auth: {
        'POST /auth/login': 'Authenticate user and get access token',
        'POST /auth/register': 'Register new user (admin only)',
        'GET /auth/me': 'Get current user profile',
        'PUT /auth/change-password': 'Change user password',
        'POST /auth/refresh': 'Refresh access token'
      },
      applications: {
        'POST /applications': 'Create new ID card application',
        'GET /applications/:applicationId': 'Get application by ID',
        'GET /applications': 'Get all applications (admin only)',
        'PATCH /applications/:applicationId/status': 'Update application status (admin only)',
        'GET /applications/stats/overview': 'Get application statistics (admin only)',
        'GET /applications/search/query': 'Search applications (admin only)'
      },
      payments: {
        'POST /payments/process': 'Process payment for application',
        'GET /payments/verify/:transactionId': 'Verify payment status',
        'GET /payments/methods/available': 'Get available payment methods'
      },
      appointments: {
        'POST /appointments/book': 'Book biometric appointment',
        'GET /appointments/availability': 'Get available time slots',
        'GET /appointments/confirmation/:confirmationNumber': 'Get appointment by confirmation',
        'GET /appointments': 'Get all appointments (admin only)',
        'PATCH /appointments/:appointmentId/status': 'Update appointment status (admin only)'
      },
      locations: {
        'GET /locations': 'Get all active locations',
        'GET /locations/:locationId': 'Get location by ID',
        'POST /locations': 'Create new location (admin only)',
        'PUT /locations/:locationId': 'Update location (admin only)',
        'DELETE /locations/:locationId': 'Delete location (admin only)',
        'GET /locations/:locationId/stats': 'Get location statistics (admin only)'
      },
      upload: {
        'POST /upload/:applicationId/:documentType': 'Upload document',
        'DELETE /upload/:documentId': 'Delete document',
        'GET /upload/application/:applicationId': 'Get application documents'
      },
      admin: {
        'GET /admin/dashboard/stats': 'Get dashboard statistics',
        'POST /admin/applications/bulk-approve': 'Bulk approve applications',
        'GET /admin/export/applications': 'Export applications data',
        'GET /admin/reports/summary': 'Generate summary reports'
      }
    },
    authentication: {
      required: [
        'GET /auth/me',
        'PUT /auth/change-password',
        'POST /auth/refresh',
        'GET /applications (admin only)',
        'PATCH /applications/:applicationId/status',
        'GET /applications/stats/overview',
        'GET /applications/search/query',
        'GET /appointments (admin only)',
        'PATCH /appointments/:appointmentId/status',
        'POST /locations',
        'PUT /locations/:locationId',
        'DELETE /locations/:locationId',
        'GET /locations/:locationId/stats',
        'GET /admin/*'
      ],
      public: [
        'POST /auth/login',
        'POST /applications',
        'GET /applications/:applicationId',
        'POST /payments/process',
        'GET /payments/verify/:transactionId',
        'GET /payments/methods/available',
        'POST /appointments/book',
        'GET /appointments/availability',
        'GET /appointments/confirmation/:confirmationNumber',
        'GET /locations',
        'GET /locations/:locationId',
        'POST /upload/:applicationId/:documentType',
        'GET /upload/application/:applicationId'
      ]
    },
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

export default router;