import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../../types/shared';
import { AppError } from '../../middleware/error.middleware';
import { OrderRepository } from '../../database/repositories/order.repository';
import { PaymentRepository } from '../../database/repositories/payment.repository';
import { TrustScoreRepository } from '../../database/repositories/trust-score.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { pool } from '../../database/connection';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    const orderRepository = new OrderRepository(pool);
    const paymentRepository = new PaymentRepository(pool);
    const trustScoreRepository = new TrustScoreRepository(pool);
    const userRepository = new UserRepository(pool);
    this.analyticsService = new AnalyticsService(
      orderRepository,
      paymentRepository,
      trustScoreRepository,
      userRepository
    );
  }

  getOverallAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await this.analyticsService.getOverallPlatformAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  };

  getVendorAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId; // Assuming userId is from authenticated user
      if (!userId) {
        throw new AppError('User ID not found', 400, 'VALIDATION_ERROR');
      }
      const analytics = await this.analyticsService.getVendorAnalytics(userId);
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  };

  getSupplierAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId; // Assuming userId is from authenticated user
      if (!userId) {
        throw new AppError('User ID not found', 400, 'VALIDATION_ERROR');
      }
      const analytics = await this.analyticsService.getSupplierAnalytics(userId);
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  };

  getTrustScoreTrend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params; // Assuming userId is passed as a param
      if (!userId) {
        throw new AppError('User ID is required', 400, 'VALIDATION_ERROR');
      }
      const trend = await this.analyticsService.getTrustScoreTrend(userId);
      res.json({ success: true, data: trend });
    } catch (error) {
      next(error);
    }
  };

  getTopSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const suppliers = await this.analyticsService.getTopSuppliers(limit);
      res.json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  };

  getTopVendors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const vendors = await this.analyticsService.getTopVendors(limit);
      res.json({ success: true, data: vendors });
    } catch (error) {
      next(error);
    }
  };
} 