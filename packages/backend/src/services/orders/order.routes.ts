import { Router } from 'express';
import {
  OrderController,
  createOrderValidation,
  updateOrderStatusValidation,
  updatePaymentStatusValidation
} from './order.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authenticateToken);

// General order routes
router.get('/my-orders', orderController.getMyOrders);
router.get('/analytics', orderController.getOrderAnalytics);
router.get('/status/:status', orderController.getOrdersByStatus);
router.get('/:id', orderController.getOrderById);

// Vendor-specific routes (create orders)
router.post('/', createOrderValidation, orderController.createOrder);

// Order management routes (both vendors and suppliers can update status)
router.patch('/:id/status', updateOrderStatusValidation, orderController.updateOrderStatus);
router.patch('/:id/cancel', orderController.cancelOrder);
router.patch('/:id/payment', updatePaymentStatusValidation, orderController.updatePaymentStatus);

// Admin route (if needed)
router.get('/', orderController.getAllOrders);

export default router;