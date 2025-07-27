import { Router } from 'express';
import { ContractController } from './contract.controller';
import { authenticateToken, requireRole } from '@middleware/auth.middleware';

const router = Router();
const contractController = new ContractController();

router.use(authenticateToken);

// Routes accessible by vendors
router.post('/create', requireRole(['vendor']), contractController.createContract);
router.get('/my', requireRole(['vendor', 'supplier']), contractController.getContracts); // Vendors and Suppliers can see their contracts
router.get('/:id', requireRole(['vendor', 'supplier']), contractController.getContractById);

// Routes accessible by suppliers
router.put('/:id', requireRole(['supplier']), contractController.updateContract); // Only suppliers can update contracts
router.delete('/:id', requireRole(['supplier']), contractController.deleteContract); // Only suppliers can delete contracts

export default router;