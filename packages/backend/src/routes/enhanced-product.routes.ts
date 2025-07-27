import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import {
  getAllProducts,
  getProductsForVendor,
  getSupplierProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restockProduct,
  updateStock,
  getLowStockProducts,
  getCategories,
  getProductAnalytics
} from '../controllers/enhanced-product.controller';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);

// All other routes require authentication
router.use(authenticateToken);

// Get all products (with filters)
router.get('/', getAllProducts);

// Get products for vendor (with supplier info)
router.get('/vendor', getProductsForVendor);

// Get supplier's own products
router.get('/supplier', getSupplierProducts);

// Get product analytics (suppliers only)
router.get('/analytics', getProductAnalytics);

// Get low stock products (suppliers only)
router.get('/low-stock', getLowStockProducts);

// Get specific product
router.get('/:productId', getProductById);

// Create new product (suppliers only)
router.post('/', createProduct);

// Update product (suppliers only)
router.put('/:productId', updateProduct);

// Delete product (suppliers only)
router.delete('/:productId', deleteProduct);

// Restock product (suppliers only)
router.post('/:productId/restock', restockProduct);

// Update stock (suppliers only)
router.put('/:productId/stock', updateStock);

export default router;