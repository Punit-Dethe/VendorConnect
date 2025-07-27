import { Request, Response, NextFunction } from 'express';
import EnhancedProductService from '../services/products/enhanced-product.service';
import { AppError } from '../middleware/error.middleware';
import { Product } from '@vendor-supplier/shared/src/types';
import { validationResult } from 'express-validator';
import { body } from 'express-validator';

export class EnhancedProductController {
  private enhancedProductService: EnhancedProductService;

  constructor() {
    this.enhancedProductService = new EnhancedProductService();
  }

  createEnhancedProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
      }

      const productData: Partial<Product> = req.body;
      const newProduct = await this.enhancedProductService.createEnhancedProduct(productData);
      res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
      next(error);
    }
  };

  getAllEnhancedProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.enhancedProductService.getAllEnhancedProducts();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  };

  getEnhancedProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await this.enhancedProductService.getEnhancedProductById(id);
      if (!product) {
        return next(new AppError('Product not found', 404, 'NOT_FOUND'));
      }
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  updateEnhancedProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
      }

      const { id } = req.params;
      const updateData: Partial<Product> = req.body;
      const updatedProduct = await this.enhancedProductService.updateEnhancedProduct(id, updateData);
      if (!updatedProduct) {
        return next(new AppError('Product not found or update failed', 404, 'UPDATE_FAILED'));
      }
      res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
      next(error);
    }
  };

  deleteEnhancedProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.enhancedProductService.deleteEnhancedProduct(id);
      res.status(200).json({ success: true, data: { message: 'Product deleted successfully' } });
    } catch (error) {
      next(error);
    }
  };
}

export const createEnhancedProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('supplierId').notEmpty().withMessage('Supplier ID is required'),
  body('status').isIn(['active', 'inactive', 'out_of_stock']).withMessage('Invalid status'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
];

export const updateEnhancedProductValidation = [
  body('name').optional().notEmpty().withMessage('Product name is required'),
  body('description').optional().notEmpty().withMessage('Description is required'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().notEmpty().withMessage('Category is required'),
  body('supplierId').optional().notEmpty().withMessage('Supplier ID is required'),
  body('status').optional().isIn(['active', 'inactive', 'out_of_stock']).withMessage('Invalid status'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
];