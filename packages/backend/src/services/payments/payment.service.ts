import { query } from '../../config/database';
import crypto from 'crypto';

export interface PaymentRequest {
  orderId: number;
  vendorId: number;
  supplierId: number;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'pay_later';
  dueDate?: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  paymentUrl?: string;
  message: string;
}

class PaymentService {
  // Mock Razorpay integration
  async initiatePayment(paymentRequest: PaymentRequest): Promise<PaymentGatewayResponse> {
    try {
      const { orderId, vendorId, supplierId, amount, paymentMethod, dueDate } = paymentRequest;

      // For pay_later, create a pending payment record
      if (paymentMethod === 'pay_later') {
        const paymentId = await this.createPayLaterRecord(paymentRequest);
        return {
          success: true,
          paymentId,
          message: 'Pay later option selected. Payment due date set.'
        };
      }

      // Mock payment gateway integration
      const transactionId = this.generateTransactionId();
      const gatewayResponse = await this.mockPaymentGateway(amount, paymentMethod);

      if (gatewayResponse.success) {
        // Create payment record
        const paymentResult = await query(`
          INSERT INTO payments (order_id, vendor_id, supplier_id, payment_gateway, gateway_transaction_id, 
                               amount, payment_method, status, paid_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [orderId, vendorId, supplierId, 'razorpay', transactionId, amount, paymentMethod, 'completed', new Date()]);

        // Update order payment status
        await query(`
          UPDATE orders SET payment_status = 'paid' WHERE id = $1
        `, [orderId]);

        return {
          success: true,
          paymentId: paymentResult.rows[0].id,
          transactionId,
          message: 'Payment completed successfully'
        };
      } else {
        return {
          success: false,
          message: 'Payment failed. Please try again.'
        };
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        message: 'Payment processing error'
      };
    }
  }

  private async createPayLaterRecord(paymentRequest: PaymentRequest): Promise<string> {
    const { orderId, vendorId, supplierId, amount, dueDate } = paymentRequest;

    const result = await query(`
      INSERT INTO payments (order_id, vendor_id, supplier_id, amount, payment_method, status, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [orderId, vendorId, supplierId, amount, 'pay_later', 'pending', dueDate]);

    // Update order payment status
    await query(`
      UPDATE orders SET payment_status = 'pending', payment_due_date = $1 WHERE id = $2
    `, [dueDate, orderId]);

    return result.rows[0].id;
  }

  private async mockPaymentGateway(amount: number, method: string): Promise<{ success: boolean }> {
    // Mock payment gateway - simulate 95% success rate
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return { success: Math.random() > 0.05 };
  }

  private generateTransactionId(): string {
    return 'TXN_' + crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  async getPaymentHistory(userId: number, role: 'vendor' | 'supplier') {
    const column = role === 'vendor' ? 'vendor_id' : 'supplier_id';

    const result = await query(`
      SELECT p.*, o.order_number, u.name as counterpart_name
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON u.id = ${role === 'vendor' ? 'p.supplier_id' : 'p.vendor_id'}
      WHERE p.${column} = $1
      ORDER BY p.created_at DESC
    `, [userId]);

    return result.rows;
  }

  async getPendingPayments(supplierId: number) {
    const result = await query(`
      SELECT p.*, o.order_number, u.name as vendor_name, u.trust_score
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON u.id = p.vendor_id
      WHERE p.supplier_id = $1 AND p.status = 'pending'
      ORDER BY p.due_date ASC
    `, [supplierId]);

    return result.rows;
  }

  async updatePaymentStatus(paymentId: number, status: string) {
    await query(`
      UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [status, paymentId]);

    if (status === 'completed') {
      // Update corresponding order
      await query(`
        UPDATE orders SET payment_status = 'paid' 
        WHERE id = (SELECT order_id FROM payments WHERE id = $1)
      `, [paymentId]);
    }
  }
}

export default new PaymentService();