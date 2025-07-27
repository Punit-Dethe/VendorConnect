import { Router } from 'express';
import { EnhancedOrderController, createEnhancedOrderValidation, updateEnhancedOrderStatusValidation } from './enhanced-order.controller';
import { authenticateToken, requireRole } from '@middleware/auth.middleware';

const router = Router();
const enhancedOrderController = new EnhancedOrderController();

router.use(authenticateToken);

// Routes for vendors (e.g., creating orders)
router.post('/create', requireRole(['vendor']), createEnhancedOrderValidation, enhancedOrderController.createEnhancedOrder);

// Routes for both vendors and suppliers
router.get('/all', requireRole(['vendor', 'supplier']), enhancedOrderController.getAllEnhancedOrders);
router.get('/:id', requireRole(['vendor', 'supplier']), enhancedOrderController.getEnhancedOrderById);

// Routes for suppliers (e.g., updating order status)
router.put('/:id/status', requireRole(['supplier']), updateEnhancedOrderStatusValidation, enhancedOrderController.updateEnhancedOrderStatus);

// Admin or highly privileged users might delete orders
router.delete('/:id', requireRole(['admin']), enhancedOrderController.deleteEnhancedOrder);

export default router;