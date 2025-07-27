import { Request, Response, NextFunction } from 'express';
import EnhancedOrderService from '../services/orders/enhanced-order.service'; // Corrected to default import
import { AppError } from '../middleware/error.middleware';
import { Order, CreateOrderRequest, UpdateOrderRequest } from '@vendor-supplier/shared/src/types';
import { validationResult } from 'express-validator';

export class EnhancedOrderController {
  private enhancedOrderService: EnhancedOrderService;

  constructor() {
    this.enhancedOrderService = new EnhancedOrderService();
  }

  createEnhancedOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR')); // Removed extra argument
      }

      const vendorId = (req as any).user.id; // Assuming user ID is available from authentication middleware
      const orderData: CreateOrderRequest = req.body;
      const newOrder = await this.enhancedOrderService.createOrder(orderData); // Removed vendorId as first arg based on new service code
      res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
      next(error);
    }
  };

  getAllEnhancedOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await this.enhancedOrderService.getAllOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  };

  getEnhancedOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = await this.enhancedOrderService.getOrderDetails(parseInt(id)); // Corrected method name and argument type
      if (!order) {
        return next(new AppError('Order not found', 404, 'NOT_FOUND'));
      }
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  updateEnhancedOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR')); // Removed extra argument
      }

      const { id } = req.params;
      const userId = (req as any).user.id; // User performing the update
      const userRole = (req as any).user.role; // Role of the user performing the update
      const statusData: UpdateOrderRequest = req.body;

      const updatedOrder = await this.enhancedOrderService.updateOrderStatus(parseInt(id), parseInt(userId), userRole, statusData);
      res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
      next(error);
    }
  };

  deleteEnhancedOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // Implement authorization check: only admin or specific roles can delete
      await this.enhancedOrderService.deleteOrder(parseInt(id)); // Assuming deleteOrder accepts orderId as number
      res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

// Validation for creating an enhanced order
import { body } from 'express-validator';

export const createEnhancedOrderValidation = [
  body('supplierId').isString().notEmpty().withMessage('Supplier ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isString().notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
  body('deliveryAddress').isString().notEmpty().withMessage('Delivery address is required'),
  body('deliveryCity').isString().notEmpty().withMessage('Delivery city is required'),
  body('deliveryPincode').isString().notEmpty().withMessage('Delivery pincode is required'),
  body('orderType').isIn(['one_time', 'recurring']).optional().withMessage('Invalid order type'),
  body('recurringConfig').optional().custom((value, { req }) => {
    if (req.body.orderType === 'recurring' && !value) {
      throw new Error('Recurring configuration is required for recurring orders');
    }
    return true;
  }),
  body('recurringConfig.frequency').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid recurring frequency'),
  body('recurringConfig.nextOrderDate').optional().isISO8601().toDate().withMessage('Next order date must be a valid date'),
  body('recurringConfig.templateData.items').optional().isArray({ min: 1 }).withMessage('Recurring order template must have items'),
  body('recurringConfig.templateData.deliveryAddress').optional().notEmpty().withMessage('Recurring order template delivery address is required'),
  body('recurringConfig.templateData.deliveryCity').optional().notEmpty().withMessage('Recurring order template delivery city is required'),
  body('recurringConfig.templateData.deliveryPincode').optional().notEmpty().withMessage('Recurring order template delivery pincode is required'),
];

// Validation for updating order status
export const updateEnhancedOrderStatusValidation = [
  body('status').isIn(['pending', 'accepted', 'in_progress', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('estimatedDeliveryTime').optional().isISO8601().toDate().withMessage('Estimated delivery time must be a valid date'),
  body('actualDeliveryTime').optional().isISO8601().toDate().withMessage('Actual delivery time must be a valid date'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];