import { Router } from 'express';
import {
  ProductController,
  createProductValidation,
  updateProductValidation,
  searchProductsValidation,
  updateStockValidation
} from './product.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

// Public routes (for vendors to browse products)
router.get('/search', searchProductsValidation, productController.searchProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.get('/', productController.getAllProducts);

// Protected routes (require authentication)
router.use(authenticateToken);

// Supplier-only routes
router.get('/supplier/my-products', productController.getSupplierProducts);
router.get('/supplier/low-stock', productController.getLowStockProducts);
router.post('/', createProductValidation, productController.createProduct);
router.put('/:id', updateProductValidation, productController.updateProduct);
router.patch('/:id/stock', updateStockValidation, productController.updateStock);
router.delete('/:id', productController.deleteProduct);

export default router;