import { Router } from 'express';
import {
  OrderController,
  createOrderValidation,
  updateOrderStatusValidation,
  updatePaymentStatusValidation,
  // RecurringOrderController // Will import once created
} from './order.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const orderController = new OrderController();
// const recurringOrderController = new RecurringOrderController(); // Will instantiate once created

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

// Recurring Order Routes (Vendor-specific)
router.post('/recurring', /* validation for recurring order */ orderController.createRecurringOrder);
router.get('/recurring/my', orderController.getRecurringOrders);
router.patch('/recurring/:id', /* validation for recurring order update */ orderController.updateRecurringOrder);
router.patch('/recurring/:id/cancel', orderController.cancelRecurringOrder);

// Admin route (if needed)
router.get('/', orderController.getAllOrders);

export default router;