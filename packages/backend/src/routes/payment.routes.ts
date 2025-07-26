import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  initiatePayment,
  getPaymentHistory,
  getPendingPayments,
  updatePaymentStatus
} from '../controllers/payment.controller';

const router = express.Router();

// All payment routes require authentication
router.use(authenticateToken);

// Initiate payment (vendors only)
router.post('/initiate', initiatePayment);

// Get payment history
router.get('/history', getPaymentHistory);

// Get pending payments (suppliers only)
router.get('/pending', getPendingPayments);

// Update payment status
router.put('/:paymentId/status', updatePaymentStatus);

export default router;