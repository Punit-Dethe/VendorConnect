import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { ProductService, CreateProductData, UpdateProductData } from './product.service';
import { ApiResponse } from '@vendor-supplier/shared';
import { AppError } from '../../middleware/error.middleware';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.productService.getAllProducts();

      const response: ApiResponse = {
        success: true,
        data: products
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      const response: ApiResponse = {
        success: true,
        data: product
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getSupplierProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      const products = await this.productService.getProductsBySupplierId(userId);

      const response: ApiResponse = {
        success: true,
        data: products
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const products = await this.productService.getProductsByCategory(category);

      const response: ApiResponse = {
        success: true,
        data: products
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const userId = (req as any).user?.userId;
      const productData: CreateProductData = req.body;

      const product = await this.productService.createProduct(userId, productData);

      const response: ApiResponse = {
        success: true,
        data: product
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const updateData: UpdateProductData = req.body;

      const product = await this.productService.updateProduct(id, userId, updateData);

      const response: ApiResponse = {
        success: true,
        data: product
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      await this.productService.deleteProduct(id, userId);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Product deleted successfully' }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { q: query, category } = req.query;
      const products = await this.productService.searchProducts(
        query as string,
        category as string | undefined
      );

      const response: ApiResponse = {
        success: true,
        data: products
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getLowStockProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      const products = await this.productService.getLowStockProducts(userId);

      const response: ApiResponse = {
        success: true,
        data: products
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  updateStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { id } = req.params;
      const { stock } = req.body;
      const userId = (req as any).user?.userId;

      const product = await this.productService.updateStock(id, userId, stock);

      const response: ApiResponse = {
        success: true,
        data: product
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}

// Validation middleware
export const createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('description').notEmpty().withMessage('Description is required')
];

export const updateProductValidation = [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('price').optional().isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('unit').optional().notEmpty().withMessage('Unit cannot be empty'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('status').optional().isIn(['active', 'inactive', 'out_of_stock']).withMessage('Invalid status')
];

export const searchProductsValidation = [
  query('q').isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
  query('category').optional().notEmpty().withMessage('Category cannot be empty')
];

export const updateStockValidation = [
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];