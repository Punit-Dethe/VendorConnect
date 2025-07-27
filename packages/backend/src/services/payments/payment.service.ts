import { PaymentRepository } from '@repositories/payment.repository';
import { pool } from '@database/connection';
import { AppError } from '@middleware/error.middleware';
import { Payment, InitiatePaymentRequest, MarkPaidRequest, PaymentStatus } from '@vendor-supplier/shared/src/types';

export class PaymentService {
  private paymentRepository: PaymentRepository;

  constructor() {
    this.paymentRepository = new PaymentRepository(pool);
  }

  async initiatePayment(paymentData: InitiatePaymentRequest): Promise<Payment> {
    // In a real scenario, this would integrate with a payment gateway (e.g., Stripe, Razorpay)
    // For this example, we'll simulate a pending payment creation
    const newPayment: Partial<Payment> = {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      paymentStatus: 'pending', // Initial status
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      vendorId: 'dummy-vendor-id', // Replace with actual logic to get vendor/supplier IDs
      supplierId: 'dummy-supplier-id',
    };

    const createdPayment = await this.paymentRepository.create(newPayment);

    if (!createdPayment) {
      throw new AppError('Failed to initiate payment', 500, 'PAYMENT_INITIATION_FAILED');
    }
    return createdPayment;
  }

  async processPaymentCallback(callbackData: any): Promise<Payment> {
    // This method would be called by the payment gateway after a transaction
    // Parse callbackData to extract transaction status, ID, etc.

    const { paymentId, transactionId, status } = callbackData; // Simplified

    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }

    let newStatus: PaymentStatus = 'failed';
    if (status === 'success') {
      newStatus = 'completed';
    } else if (status === 'pending') {
      newStatus = 'processing';
    }

    const updatedPayment = await this.paymentRepository.update(paymentId, {
      paymentStatus: newStatus,
      transactionId: transactionId || payment.transactionId,
      paidAt: newStatus === 'completed' ? new Date() : payment.paidAt,
    });

    if (!updatedPayment) {
      throw new AppError('Failed to process payment callback', 500, 'PAYMENT_PROCESSING_FAILED');
    }

    return updatedPayment;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.paymentRepository.findById(id);
  }

  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    return this.paymentRepository.findByOrderId(orderId);
  }

  async refundPayment(paymentId: string, amount?: number): Promise<Payment | null> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }

    // Simulate refund logic (in a real app, integrate with payment gateway)
    const refundAmount = amount || payment.amount; // Refund full amount if not specified

    if (payment.paymentStatus !== 'completed') {
      throw new AppError('Only completed payments can be refunded', 400, 'INVALID_PAYMENT_STATUS');
    }

    // Update payment status to refunded
    const updatedPayment = await this.paymentRepository.update(paymentId, {
      paymentStatus: 'refunded',
      // You might store refund ID, refund date, etc.
    });

    if (!updatedPayment) {
      throw new AppError('Failed to process refund', 500, 'REFUND_FAILED');
    }

    return updatedPayment;
  }

  async markPaymentAsPaid(markPaidData: MarkPaidRequest): Promise<Payment> {
    const { paymentId, transactionId, notes } = markPaidData;

    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }

    if (payment.paymentStatus === 'completed') {
      throw new AppError('Payment is already completed', 400, 'PAYMENT_ALREADY_COMPLETED');
    }

    const updatedPayment = await this.paymentRepository.update(paymentId, {
      paymentStatus: 'completed',
      transactionId: transactionId || payment.transactionId,
      paidAt: new Date(),
      // notes: notes || payment.notes, // Assuming notes can be updated
    });

    if (!updatedPayment) {
      throw new AppError('Failed to mark payment as paid', 500, 'MARK_PAID_FAILED');
    }
    return updatedPayment;
  }
}