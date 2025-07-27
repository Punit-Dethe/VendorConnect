import { BaseRepository } from './base.repository';
import { pool } from '../connection';
import { Payment } from '@vendor-supplier/shared/src/types';

export class PaymentRepository extends BaseRepository {
  constructor(pool: any) { // Explicitly accept pool
    super(pool);
  }

  private mapPaymentRowToPayment(row: any): Payment {
    return {
      id: row.id,
      orderId: row.order_id,
      vendorId: row.vendor_id,
      supplierId: row.supplier_id,
      amount: parseFloat(row.amount),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      transactionId: row.transaction_id,
      paymentGatewayResponse: row.payment_gateway_response,
      dueDate: new Date(row.due_date),
      paidAt: row.paid_at ? new Date(row.paid_at) : undefined,
      invoiceUrl: row.invoice_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  public async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const { orderId, vendorId, supplierId, amount, paymentMethod, paymentStatus, dueDate, transactionId, paymentGatewayResponse, invoiceUrl } = payment;
    const result = await this.query(
      `INSERT INTO payments (order_id, vendor_id, supplier_id, amount, payment_method, payment_status, due_date, transaction_id, payment_gateway_response, invoice_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [orderId, vendorId, supplierId, amount, paymentMethod, paymentStatus, dueDate, transactionId || null, paymentGatewayResponse || null, invoiceUrl || null]
    );
    return this.mapPaymentRowToPayment(result.rows[0]);
  }

  async findById(id: string): Promise<Payment | null> {
    const result = await this.query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0] ? this.mapPaymentRowToPayment(result.rows[0]) : null;
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    const result = await this.query('SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC', [orderId]);
    return result.rows.map(this.mapPaymentRowToPayment);
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    const result = await this.query(
      `SELECT * FROM payments WHERE vendor_id = $1 OR supplier_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows.map(this.mapPaymentRowToPayment);
  }

  async updateStatus(paymentId: string, status: Payment['paymentStatus'], paidAt?: Date, gatewayResponse?: object): Promise<Payment | null> {
    const result = await this.query(
      `UPDATE payments SET status = $1, paid_at = $2, payment_gateway_response = $3::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`,
      [status, paidAt || null, gatewayResponse || null, paymentId]
    );
    return result.rows[0] ? this.mapPaymentRowToPayment(result.rows[0]) : null;
  }

  public async countCompletedVendorPayments(vendorId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM payments WHERE vendor_id = $1 AND payment_status = \'completed\'';
    const result = await this.query(query, [vendorId]);
    return parseInt(result.rows[0].count, 10);
  }

  public async countOnTimeVendorPayments(vendorId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM payments WHERE vendor_id = $1 AND payment_status = \'completed\' AND paid_at <= due_date';
    const result = await this.query(query, [vendorId]);
    return parseInt(result.rows[0].count, 10);
  }

  public async sumCompletedPayments(): Promise<number> {
    const query = 'SELECT SUM(amount) AS total_revenue FROM payments WHERE payment_status = \'completed\'';
    const result = await this.query(query);
    return parseFloat(result.rows[0].total_revenue) || 0;
  }
} 