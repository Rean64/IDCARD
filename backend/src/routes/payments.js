import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index.js';

const router = express.Router();

// Process payment (public route)
router.post('/process', [
  body('applicationId').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('method').isIn(['CARD', 'MOBILE_MONEY', 'BANK_TRANSFER']),
  body('paymentDetails').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { applicationId, amount, method, paymentDetails } = req.body;

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

    // Verify amount matches application fee
    if (amount !== application.paymentAmount) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Payment amount does not match application fee'
      });
    }

    // Generate transaction ID
    const transactionId = `TXN-${uuidv4().split('-')[0].toUpperCase()}`;

    // Simulate payment processing based on method
    let paymentResult;
    switch (method) {
      case 'CARD':
        paymentResult = await processCardPayment(paymentDetails, amount);
        break;
      case 'MOBILE_MONEY':
        paymentResult = await processMobileMoneyPayment(paymentDetails, amount);
        break;
      case 'BANK_TRANSFER':
        paymentResult = await processBankTransferPayment(paymentDetails, amount);
        break;
      default:
        throw new Error('Unsupported payment method');
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        applicationId: application.id,
        amount,
        currency: 'FCFA',
        method,
        status: paymentResult.status,
        providerRef: paymentResult.providerRef,
        providerResponse: paymentResult.response,
        transactionId,
        description: `Payment for ${idType} ID card application`,
        paidAt: paymentResult.status === 'COMPLETED' ? new Date() : null
      }
    });

    // Update application payment status
    await prisma.application.update({
      where: { id: application.id },
      data: {
        paymentStatus: paymentResult.status,
        paymentMethod: method,
        paymentReference: transactionId,
        paidAt: paymentResult.status === 'COMPLETED' ? new Date() : null,
        status: paymentResult.status === 'COMPLETED' ? 'PAYMENT_COMPLETED' : 'PAYMENT_PENDING'
      }
    });

    res.json({
      message: paymentResult.status === 'COMPLETED' ? 'Payment processed successfully' : 'Payment initiated',
      payment: {
        transactionId,
        status: paymentResult.status,
        amount,
        method,
        providerMessage: paymentResult.message
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      message: error.message || 'Unable to process payment'
    });
  }
});

// Verify payment status (public route)
router.get('/verify/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      include: {
        application: {
          select: {
            applicationId: true,
            status: true,
            paymentStatus: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found',
        message: 'No payment found with this transaction ID'
      });
    }

    res.json({
      payment: {
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        method: payment.method,
        paidAt: payment.paidAt,
        application: payment.application
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      error: 'Payment verification failed',
      message: 'Unable to verify payment status'
    });
  }
});

// Get payment methods and fees
router.get('/methods/available', (req, res) => {
  const paymentMethods = [
    {
      id: 'CARD',
      name: 'Credit/Debit Card',
      description: 'Pay with Visa, Mastercard, or other major cards',
      processingTime: 'Instant',
      fees: 'No additional fees',
      enabled: true
    },
    {
      id: 'MOBILE_MONEY',
      name: 'Mobile Money',
      description: 'MTN Mobile Money, Orange Money, Express Union',
      processingTime: '1-5 minutes',
      fees: '1.5% transaction fee',
      enabled: true,
      providers: [
        { id: 'mtn', name: 'MTN Mobile Money', prefix: '67' },
        { id: 'orange', name: 'Orange Money', prefix: '69' },
        { id: 'express', name: 'Express Union Mobile', prefix: '62' }
      ]
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Bank Transfer',
      description: 'Direct transfer from your bank account',
      processingTime: '24-48 hours',
      fees: 'No additional fees',
      enabled: true,
      bankDetails: {
        bankName: 'United Bank for Africa (UBA)',
        accountName: 'MINDEF ID Card Services',
        accountNumber: '0123456789',
        swiftCode: 'UNAFCMCX'
      }
    }
  ];

  const applicationFees = {
    FIRST: 10000,
    RENEWAL: 5000,
    LOST: 10000,
    DAMAGED: 7500
  };

  res.json({
    paymentMethods,
    applicationFees
  });
});

// Payment processing helper functions
async function processCardPayment(details, amount) {
  // Simulate card payment processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05;
  
  return {
    status: isSuccess ? 'COMPLETED' : 'FAILED',
    providerRef: `CARD-${uuidv4().split('-')[0]}`,
    message: isSuccess ? 'Payment processed successfully' : 'Card payment failed',
    response: {
      cardLast4: details.cardNumber?.slice(-4) || '****',
      authCode: isSuccess ? `AUTH-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : null,
      processorResponse: isSuccess ? 'APPROVED' : 'DECLINED'
    }
  };
}

async function processMobileMoneyPayment(details, amount) {
  // Simulate mobile money processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Simulate 90% success rate
  const isSuccess = Math.random() > 0.1;
  
  return {
    status: isSuccess ? 'COMPLETED' : 'FAILED',
    providerRef: `MM-${uuidv4().split('-')[0]}`,
    message: isSuccess ? 'Mobile money payment successful' : 'Mobile money payment failed',
    response: {
      phoneNumber: details.phoneNumber,
      provider: details.provider,
      reference: isSuccess ? `MM${Math.random().toString(36).substr(2, 8).toUpperCase()}` : null
    }
  };
}

async function processBankTransferPayment(details, amount) {
  // Bank transfers are typically pending until confirmed
  return {
    status: 'PROCESSING',
    providerRef: `BT-${uuidv4().split('-')[0]}`,
    message: 'Bank transfer initiated, verification pending',
    response: {
      transferReference: details.reference || `BT${Date.now()}`,
      expectedProcessingTime: '24-48 hours'
    }
  };
}

export default router;