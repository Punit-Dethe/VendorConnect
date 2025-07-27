import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import {
  getContracts,
  getContractById,
  signContract,
  generateContract
} from '../controllers/contract.controller';

const router = express.Router();

// All contract routes require authentication
router.use(authenticateToken);

// Get all contracts for user
router.get('/', getContracts);

// Get specific contract
router.get('/:contractId', getContractById);

// Sign a contract
router.post('/:contractId/sign', signContract);

// Generate a new contract
router.post('/generate', generateContract);

export default router;