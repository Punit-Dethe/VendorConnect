import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { AppError } from '../middleware/error.middleware';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    // Assuming these repositories have default constructors or don't need pool directly in controller
    // You might need to adjust this based on actual repository constructors
    this.analyticsService = new AnalyticsService(); // AnalyticsService doesn't need constructor args in updated code
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
      const userId = (req as any).user?.id; // Assuming user ID is available from authentication middleware
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
      }
      const analytics = await this.analyticsService.getVendorAnalytics(userId);
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  };

  getSupplierAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
      }
      const analytics = await this.analyticsService.getSupplierAnalytics(userId);
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  };

  getTrustScoreTrend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const trustScoreTrend = await this.analyticsService.getTrustScoreTrend(userId);
      res.json({ success: true, data: trustScoreTrend });
    } catch (error) {
      next(error);
    }
  };

  getTopSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topSuppliers = await this.analyticsService.getTopSuppliers();
      res.json({ success: true, data: topSuppliers });
    } catch (error) {
      next(error);
    }
  };

  getTopVendors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topVendors = await this.analyticsService.getTopVendors();
      res.json({ success: true, data: topVendors });
    } catch (error) {
      next(error);
    }
  };
} 