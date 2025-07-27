import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticateToken, requireRole } from '@middleware/auth.middleware';

const router = Router();
const paymentController = new PaymentController();

router.use(authenticateToken);

// Routes for initiating payments (typically by vendors)
router.post('/initiate', requireRole(['vendor']), paymentController.initiatePayment);

// Routes for payment gateway callbacks (no role required, handled by system)
router.post('/callback', paymentController.processPaymentCallback); // This endpoint needs careful security considerations

// Routes for viewing payment status (by vendors and suppliers)
router.get('/:id', requireRole(['vendor', 'supplier']), paymentController.getPaymentStatus);
router.get('/order/:orderId', requireRole(['vendor', 'supplier']), paymentController.getPaymentsForOrder);

// Routes for refunds (typically by admin or authorized personnel)
router.post('/:id/refund', requireRole(['admin']), paymentController.refundPayment);

export default router;