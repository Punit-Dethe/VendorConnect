import { Router } from 'express';
import { SupplierController, searchSuppliersValidation } from './supplier.controller';
import { authenticateToken } from '@middleware/auth.middleware';

const router = Router();
const supplierController = new SupplierController();

// Public routes (for browsing suppliers)
router.get('/search', searchSuppliersValidation, supplierController.searchSuppliers);
router.get('/category/:category', supplierController.getSuppliersByCategory);
router.get('/location/:city', supplierController.getSuppliersByLocation);
router.get('/analytics/:id', supplierController.getSupplierAnalytics);
router.get('/:id', supplierController.getSupplierById);
router.get('/', supplierController.getAllSuppliers);

// Protected routes (require authentication)
router.use(authenticateToken);

// Vendor-only routes (for getting recommendations)
router.get('/recommendations/for-me', supplierController.getRecommendedSuppliers);

export default router;