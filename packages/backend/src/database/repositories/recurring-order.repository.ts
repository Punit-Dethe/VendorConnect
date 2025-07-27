import { query } from 'src/config/database';
import { RecurringOrder } from '@vendor-supplier/shared/src/types';

export class RecurringOrderRepository {
  constructor() {}

  async createRecurringOrder(recurringOrderData: Partial<RecurringOrder>): Promise<RecurringOrder> {
    const { vendorId, supplierId, frequency, nextOrderDate, isActive, reminderSent, templateData } = recurringOrderData;
    const q = `
      INSERT INTO recurring_orders (id, vendor_id, supplier_id, frequency, next_order_date, is_active, reminder_sent, template_data)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [vendorId, supplierId, frequency, nextOrderDate, isActive, reminderSent, JSON.stringify(templateData)];
    const result = await query(q, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<RecurringOrder | null> {
    const q = 'SELECT * FROM recurring_orders WHERE id = $1;';
    const result = await query(q, [id]);
    return result.rows[0] || null;
  }

  async findByVendorId(vendorId: string): Promise<RecurringOrder[]> {
    const q = 'SELECT * FROM recurring_orders WHERE vendor_id = $1 ORDER BY created_at DESC;';
    const result = await query(q, [vendorId]);
    return result.rows;
  }

  async updateRecurringOrder(id: string, updateData: Partial<RecurringOrder>): Promise<RecurringOrder | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const key in updateData) {
      if (updateData.hasOwnProperty(key)) {
        const dbFieldName = this.toSnakeCase(key);
        setClauses.push(`${dbFieldName} = $${paramIndex}`);
        values.push((updateData as any)[key]);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id); // Nothing to update
    }

    values.push(id);
    const q = `
      UPDATE recurring_orders
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    const result = await query(q, values);
    return result.rows[0] || null;
  }

  async findDueOrders(): Promise<RecurringOrder[]> {
    const q = `
      SELECT * FROM recurring_orders
      WHERE next_order_date <= NOW() AND is_active = TRUE;
    `;
    const result = await query(q);
    return result.rows;
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}