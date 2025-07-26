import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { OrderService, CreateOrderData, UpdateOrderStatusData } from './order.service';
import { ApiResponse } from '@vendor-supplier/shared';
import { AppError } from '../../middleware/error.middleware';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await this.orderService.getAllOrders();

      const response: ApiResponse = {
        success: true,
        data: orders
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      if (!order) {
        throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
      }

      const response: ApiResponse = {
        success: true,
        data: order
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      const orders = userRole === 'vendor'
        ? await this.orderService.getVendorOrders(userId)
        : await this.orderService.getSupplierOrders(userId);

      const response: ApiResponse = {
        success: true,
        data: orders
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getOrdersByStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.params;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      // Get all orders for the user first, then filter by status
      const allOrders = userRole === 'vendor'
        ? await this.orderService.getVendorOrders(userId)
        : await this.orderService.getSupplierOrders(userId);

      const filteredOrders = allOrders.filter(order => order.status === status);

      const response: ApiResponse = {
        success: true,
        data: filteredOrders
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      // Only vendors can create orders
      if (userRole !== 'vendor') {
        throw new AppError('Only vendors can create orders', 403, 'UNAUTHORIZED');
      }

      const orderData: CreateOrderData = req.body;
      const order = await this.orderService.createOrder(userId, orderData);

      const response: ApiResponse = {
        success: true,
        data: order
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const statusData: UpdateOrderStatusData = req.body;

      const order = await this.orderService.updateOrderStatus(id, userId, userRole, statusData);

      const response: ApiResponse = {
        success: true,
        data: order
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      const order = await this.orderService.cancelOrder(id, userId, userRole);

      const response: ApiResponse = {
        success: true,
        data: order
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { id } = req.params;
      const { paymentStatus } = req.body;

      const order = await this.orderService.updatePaymentStatus(id, paymentStatus);

      const response: ApiResponse = {
        success: true,
        data: order
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getOrderAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      const analytics = await this.orderService.getOrderAnalytics(userId, userRole);

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
export const createOrderValidation = [
  body('supplierId').notEmpty().withMessage('Supplier ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

export const updateOrderStatusValidation = [
  body('status').isIn(['pending', 'accepted', 'in_progress', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  body('expectedDelivery').optional().isISO8601().withMessage('Expected delivery must be a valid date'),
  body('actualDelivery').optional().isISO8601().withMessage('Actual delivery must be a valid date'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

export const updatePaymentStatusValidation = [
  body('paymentStatus').isIn(['pending', 'paid', 'failed']).withMessage('Invalid payment status')
];