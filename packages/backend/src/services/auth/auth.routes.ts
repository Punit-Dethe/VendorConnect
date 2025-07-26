import { Router } from 'express';
import { AuthController, registerValidation, loginValidation } from './auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', authenticateToken, authController.getProfile);

export default router;