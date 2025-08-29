import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../index.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  }
});

// Upload document
router.post('/:applicationId/:documentType', upload.single('file'), async (req, res) => {
  try {
    const { applicationId, documentType } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please select a file to upload'
      });
    }

    // Validate document type
    const validDocumentTypes = ['PHOTO', 'BIRTH_CERTIFICATE', 'PROOF_OF_ADDRESS', 'PREVIOUS_ID', 'POLICE_REPORT', 'PASSPORT'];
    if (!validDocumentTypes.includes(documentType.toUpperCase())) {
      return res.status(400).json({
        error: 'Invalid document type',
        message: 'Document type not supported'
      });
    }

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

    // Upload to Cloudinary or save locally based on configuration
    let fileUrl, cloudinaryId;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `mindef-idcard/${applicationId}`,
            public_id: `${documentType.toLowerCase()}_${Date.now()}`,
            resource_type: file.mimetype.includes('pdf') ? 'raw' : 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      fileUrl = uploadResult.secure_url;
      cloudinaryId = uploadResult.public_id;
    } else {
      // Save locally (development)
      const filename = `${applicationId}_${documentType.toLowerCase()}_${Date.now()}.${req.file.originalname.split('.').pop()}`;
      fileUrl = `/uploads/${filename}`;
      
      // In production, you'd save the file to disk here
      // For this example, we'll just use a placeholder URL
    }

    // Save document record to database
    const document = await prisma.document.create({
      data: {
        applicationId: application.id,
        type: documentType.toUpperCase(),
        filename: req.file.originalname,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        cloudinaryId
      }
    });

    // Check if all required documents are uploaded
    const requiredDocs = getRequiredDocuments(application.idType);
    const uploadedDocs = await prisma.document.findMany({
      where: { applicationId: application.id },
      select: { type: true }
    });

    const uploadedTypes = uploadedDocs.map(doc => doc.type);
    const allRequiredUploaded = requiredDocs.every(docType => uploadedTypes.includes(docType));

    // Update application status if all documents are uploaded
    if (allRequiredUploaded && application.status === 'PENDING_REVIEW') {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: 'DOCUMENT_REVIEW' }
      });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        type: document.type,
        filename: document.filename,
        size: document.size,
        url: document.url,
        uploadedAt: document.uploadedAt
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    
    if (error.message.includes('File type not allowed')) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: error.message
      });
    }
    
    if (error.message.includes('File too large')) {
      return res.status(400).json({
        error: 'File too large',
        message: `File size must be less than ${(parseInt(process.env.MAX_FILE_SIZE) / 1024 / 1024).toFixed(1)}MB`
      });
    }

    res.status(500).json({
      error: 'Upload failed',
      message: 'Unable to upload file'
    });
  }
});

// Delete document (before application is approved)
router.delete('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        application: true
      }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'Document not found'
      });
    }

    // Check if application is still editable
    if (['APPROVED', 'REJECTED', 'COMPLETED'].includes(document.application.status)) {
      return res.status(400).json({
        error: 'Cannot delete document',
        message: 'Cannot delete documents from finalized applications'
      });
    }

    // Delete from Cloudinary if exists
    if (document.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(document.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
      }
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId }
    });

    res.json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      error: 'Deletion failed',
      message: 'Unable to delete document'
    });
  }
});

// Get documents for an application
router.get('/application/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await prisma.application.findUnique({
      where: { applicationId }
    });

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        message: 'No application found with this ID'
      });
    }

    const documents = await prisma.document.findMany({
      where: { applicationId: application.id },
      orderBy: { uploadedAt: 'desc' }
    });

    res.json({
      documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      error: 'Failed to retrieve documents',
      message: 'Unable to get documents'
    });
  }
});

// Helper function to get required documents based on ID type
function getRequiredDocuments(idType) {
  const baseDocuments = ['PHOTO', 'BIRTH_CERTIFICATE', 'PROOF_OF_ADDRESS'];
  
  switch (idType) {
    case 'FIRST':
      return baseDocuments;
    case 'RENEWAL':
    case 'DAMAGED':
      return [...baseDocuments, 'PREVIOUS_ID'];
    case 'LOST':
      return [...baseDocuments, 'POLICE_REPORT'];
    default:
      return baseDocuments;
  }
}

export default router;