import { Router } from 'express';
import { EnhancedProductController, createEnhancedProductValidation, updateEnhancedProductValidation } from './enhanced-product.controller';
import { authenticateToken, requireRole } from '@middleware/auth.middleware';

const router = Router();
const enhancedProductController = new EnhancedProductController();

router.use(authenticateToken);

// Routes accessible by suppliers (e.g., creating/managing products)
router.post('/create', requireRole(['supplier']), createEnhancedProductValidation, enhancedProductController.createEnhancedProduct);
router.put('/:id', requireRole(['supplier']), updateEnhancedProductValidation, enhancedProductController.updateEnhancedProduct);
router.delete('/:id', requireRole(['supplier']), enhancedProductController.deleteEnhancedProduct);

// Routes accessible by both vendors and suppliers (e.g., viewing products)
router.get('/all', requireRole(['vendor', 'supplier']), enhancedProductController.getAllEnhancedProducts);
router.get('/:id', requireRole(['vendor', 'supplier']), enhancedProductController.getEnhancedProductById);

export default router;