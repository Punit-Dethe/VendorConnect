import { Request, Response } from 'express';
import paymentService from '../services/payments/payment.service';

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, paymentMethod, dueDate } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'vendor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get order details to verify vendor ownership
    const orderResult = await paymentService.getPaymentHistory(userId, 'vendor');
    const order = orderResult.find(p => p.order_id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const paymentRequest = {
      orderId,
      vendorId: userId,
      supplierId: order.supplier_id,
      amount,
      paymentMethod,
      dueDate
    };

    const result = await paymentService.initiatePayment(paymentRequest);

    res.json(result);
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const payments = await paymentService.getPaymentHistory(userId, userRole);
    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
};

export const getPendingPayments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const pendingPayments = await paymentService.getPendingPayments(userId);
    res.json(pendingPayments);
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ error: 'Failed to get pending payments' });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await paymentService.updatePaymentStatus(parseInt(paymentId), status);
    res.json({ success: true, message: 'Payment status updated' });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};