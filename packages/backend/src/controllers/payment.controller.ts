import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payments/payment.service';
import { AppError } from '../middleware/error.middleware';
import { ApiResponse, InitiatePaymentRequest, Payment } from '@vendor-supplier/shared/src/types';
import { validationResult } from 'express-validator';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
      }

      const paymentData: InitiatePaymentRequest = req.body;
      const newPayment = await this.paymentService.initiatePayment(paymentData);
      const response: ApiResponse<Payment> = { success: true, data: newPayment };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  processPaymentCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // This endpoint would typically be hit by a payment gateway webhook.
      // Security: Validate webhook signature/IP to ensure it's from the legitimate gateway.
      const callbackData = req.body;
      const updatedPayment = await this.paymentService.processPaymentCallback(callbackData);
      const response: ApiResponse<Payment> = { success: true, data: updatedPayment };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.getPaymentById(id);
      if (!payment) {
        return next(new AppError('Payment not found', 404, 'NOT_FOUND'));
      }
      const response: ApiResponse<Payment> = { success: true, data: payment };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getPaymentsForOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const payments = await this.paymentService.getPaymentsByOrderId(orderId);
      const response: ApiResponse<Payment[]> = { success: true, data: payments };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  refundPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { amount } = req.body; // Optional: specify amount to refund
      const refundedPayment = await this.paymentService.refundPayment(id, amount);
      res.status(200).json({ success: true, data: refundedPayment, message: 'Payment refunded successfully' } as ApiResponse<Payment>); // Cast to ApiResponse<Payment> due to 'message' property.
    } catch (error) {
      next(error);
    }
  };
}