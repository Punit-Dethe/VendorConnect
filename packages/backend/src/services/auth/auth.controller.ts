import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from './auth.service';
import { ApiResponse, UserRegistration, UserLogin } from '@vendor-supplier/shared';
import { AppError } from '../../middleware/error.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const userData: UserRegistration = req.body;
      const result = await this.authService.register(userData);

      const response: ApiResponse = {
        success: true,
        data: result
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const credentials: UserLogin = req.body;
      const result = await this.authService.login(credentials);

      const response: ApiResponse = {
        success: true,
        data: result
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const user = await this.authService.getUserById(userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const response: ApiResponse = {
        success: true,
        data: user
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}

export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Invalid mobile number'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['vendor', 'supplier']).withMessage('Role must be vendor or supplier'),
  body('businessType').notEmpty().withMessage('Business type is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('pincode').matches(/^\d{6}$/).withMessage('Invalid pincode')
];

export const loginValidation = [
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Invalid mobile number'),
  body('password').notEmpty().withMessage('Password is required')
];