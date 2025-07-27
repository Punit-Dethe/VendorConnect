import { Request, Response, NextFunction } from 'express';
import { SupplierService } from '../services/suppliers/supplier.service';
import { AppError } from '../middleware/error.middleware';
import { ApiResponse, Supplier } from '@vendor-supplier/shared/src/types';
import { validationResult } from 'express-validator';
import { query } from 'express-validator';

export class SupplierController {
  private supplierService: SupplierService;

  constructor() {
    this.supplierService = new SupplierService();
  }

  getAllSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const suppliers = await this.supplierService.getAllSuppliers();
      const response: ApiResponse<Supplier[]> = { success: true, data: suppliers };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getSupplierById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const supplier = await this.supplierService.getSupplierById(id);
      if (!supplier) {
        return next(new AppError('Supplier not found', 404, 'NOT_FOUND'));
      }
      const response: ApiResponse<Supplier> = { success: true, data: supplier };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  searchSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
      }

      const { query: searchQuery, category, location } = req.query; // Renamed query to searchQuery to avoid conflict with express-validator's query function
      // Implement actual search logic in service. This is a placeholder.
      const suppliers = await this.supplierService.getAllSuppliers(); // Replace with actual search
      const response: ApiResponse<Supplier[]> = { success: true, data: suppliers };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getSuppliersByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      // Implement actual logic in service
      const suppliers = await this.supplierService.getAllSuppliers(); // Replace with actual category filter
      const response: ApiResponse<Supplier[]> = { success: true, data: suppliers };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getSuppliersByLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { city } = req.params;
      // Implement actual logic in service
      const suppliers = await this.supplierService.getAllSuppliers(); // Replace with actual location filter
      const response: ApiResponse<Supplier[]> = { success: true, data: suppliers };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getRecommendedSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id; // Assuming vendor ID from auth
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
      }
      // Implement recommendation logic in service
      const recommendations = await this.supplierService.getAllSuppliers(); // Placeholder
      const response: ApiResponse<Supplier[]> = { success: true, data: recommendations };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getSupplierAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // Assuming analytics logic exists in service
      const analytics = { supplierId: id, totalOrders: 100, averageRating: 4.5 }; // Placeholder
      const response: ApiResponse<any> = { success: true, data: analytics };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

// Validation for searching suppliers (example)
export const searchSuppliersValidation = [
  query('query').optional().isString().trim().escape(),
  query('category').optional().isString().trim().escape(),
  query('location').optional().isString().trim().escape(),
]; 