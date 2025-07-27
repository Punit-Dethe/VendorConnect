import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { AuthService } from '../services/auth/auth.service';
import { AppError } from '../middleware/error.middleware';
import { RegisterRequest, LoginRequest } from '@vendor-supplier/shared/src/types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userData: RegisterRequest = req.body;
      const newUser = await this.authService.register(userData);
      return res.status(201).json({ success: true, data: newUser });
    } catch (error: any) {
      logger.error(`Registration error: ${error.message}`);
      return res.status(error.statusCode || 500).json({ success: false, error: { code: error.code || 'SERVER_ERROR', message: error.message } });
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const credentials: LoginRequest = req.body;
      const { user, token } = await this.authService.login(credentials);
      return res.status(200).json({ success: true, data: { user, token } });
    } catch (error: any) {
      logger.error(`Login error: ${error.message}`);
      return res.status(error.statusCode || 500).json({ success: false, error: { code: error.code || 'SERVER_ERROR', message: error.message } });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as any).user?.id;
      const role = (req as any).user?.role;
      if (!userId || !role) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token for refresh.' } });
      }
      const newToken = await this.authService.refreshToken(userId, role);
      return res.status(200).json({ success: true, data: { token: newToken } });
    } catch (error: any) {
      logger.error(`Token refresh error: ${error.message}`);
      return res.status(error.statusCode || 500).json({ success: false, error: { code: error.code || 'SERVER_ERROR', message: 'Failed to refresh token.' } });
    }
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not authenticated.' } });
      }
      await this.authService.logout(userId);
      return res.status(200).json({ success: true, data: { message: 'Logged out successfully.' } });
    }  catch (error: any) {
      logger.error(`Logout error: ${error.message}`);
      return res.status(error.statusCode || 500).json({ success: false, error: { code: error.code || 'SERVER_ERROR', message: error.message } });
    }
  };
} 