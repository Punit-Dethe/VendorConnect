import { Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { SupplierService } from './supplier.service';
import { ApiResponse } from '../../types/shared';
import { AppError } from '../../middleware/error.middleware';

export class SupplierController {
  private supplierService: SupplierService;

  constructor() {
    this.supplierService = new SupplierService();
  }

  getAllSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const suppliers = await this.supplierService.getAllSuppliers();

      const response: ApiResponse = {
        success: true,
        data: suppliers
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getSupplierById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const supplier = await this.supplierService.getSupplierById(id);

      if (!supplier) {
        throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
      }

      const response: ApiResponse = {
        success: true,
        data: supplier
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getSuppliersByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const suppliers = await this.supplierService.getSuppliersByCategory(category);

      const response: ApiResponse = {
        success: true,
        data: suppliers
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getSuppliersByLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { city } = req.params;
      const { state } = req.query;
      const suppliers = await this.supplierService.getSuppliersByLocation(city, state as string);

      const response: ApiResponse = {
        success: true,
        data: suppliers
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  searchSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { q: searchQuery } = req.query;
      const suppliers = await this.supplierService.searchSuppliers(searchQuery as string);

      const response: ApiResponse = {
        success: true,
        data: suppliers
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getRecommendedSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      // Only vendors can get recommendations
      if (userRole !== 'vendor') {
        throw new AppError('Only vendors can get supplier recommendations', 403, 'UNAUTHORIZED');
      }

      // Mock vendor location - in real implementation, get from user profile
      const vendorLocation = {
        city: 'Mumbai',
        state: 'Maharashtra',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      };

      const {
        categories,
        maxDistance,
        minTrustScore,
        priceRange
      } = req.query;

      const preferences = {
        categories: categories ? (categories as string).split(',') : undefined,
        maxDistance: maxDistance ? parseInt(maxDistance as string) : undefined,
        minTrustScore: minTrustScore ? parseInt(minTrustScore as string) : undefined,
        priceRange: priceRange ? (priceRange as string).split(',') : undefined
      };

      const recommendations = await this.supplierService.getRecommendedSuppliers(
        vendorLocation,
        preferences
      );

      const response: ApiResponse = {
        success: true,
        data: recommendations
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getSupplierAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const analytics = await this.supplierService.getSupplierAnalytics(id);

      const response: ApiResponse = {
        success: true,
        data: analytics
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}

// Validation middleware
export const searchSuppliersValidation = [
  query('q').isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
];