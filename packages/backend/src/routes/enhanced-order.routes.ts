import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  createOrder,
  getSupplierOrders,
  getVendorOrders,
  getOrderDetails,
  approveOrder,
  rejectOrder,
  restockProduct,
  getLowStockProducts
} from '../controllers/enhanced-order.controller';

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// Create new order (vendors only)
router.post('/', createOrder);

// Get orders for supplier
router.get('/supplier', getSupplierOrders);

// Get orders for vendor
router.get('/vendor', getVendorOrders);

// Get specific order details
router.get('/:orderId', getOrderDetails);

// Approve order (suppliers only)
router.post('/:orderId/approve', approveOrder);

// Reject order (suppliers only)
router.post('/:orderId/reject', rejectOrder);

// Restock product (suppliers only)
router.post('/restock/:productId', restockProduct);

// Get low stock products (suppliers only)
router.get('/inventory/low-stock', getLowStockProducts);

export default router;