import { BaseRepository } from './base.repository';
import { pool } from '../connection';
import { RecurringOrder, RecurringOrderConfig } from '@vendor-supplier/shared/src/types';

export class RecurringOrderRepository extends BaseRepository {
  constructor(pool: any) { // Explicitly accept pool
    super(pool);
  }

  public async createRecurringOrder(recurringOrder: Partial<RecurringOrder>): Promise<RecurringOrder> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO recurring_orders (
          vendor_id, supplier_id, frequency, next_order_date, is_active, reminder_sent, template_data, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
      `;
      const result = await client.query(insertQuery, [
        recurringOrder.vendorId,
        recurringOrder.supplierId || null,
        recurringOrder.frequency,
        recurringOrder.nextOrderDate,
        recurringOrder.isActive !== undefined ? recurringOrder.isActive : true,
        recurringOrder.reminderSent !== undefined ? recurringOrder.reminderSent : false,
        JSON.stringify(recurringOrder.templateData),
      ]);
      const newRecurringOrder = result.rows[0];

      await client.query('COMMIT');
      return this.mapRowToRecurringOrder(newRecurringOrder);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<RecurringOrder | null> {
    const query = 'SELECT * FROM recurring_orders WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0] ? this.mapRowToRecurringOrder(result.rows[0]) : null;
  }

  public async findByVendorId(vendorId: string): Promise<RecurringOrder[]> {
    const query = 'SELECT * FROM recurring_orders WHERE vendor_id = $1 ORDER BY next_order_date ASC';
    const result = await this.query(query, [vendorId]);
    return result.rows.map(this.mapRowToRecurringOrder);
  }

  public async updateRecurringOrder(id: string, updateData: Partial<RecurringOrder>): Promise<RecurringOrder | null> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const fields = [];
      const values = [];
      let paramIndex = 1;

      for (const key in updateData) {
        if (updateData.hasOwnProperty(key)) {
          const dbColumnName = this.toSnakeCase(key);
          if (dbColumnName !== 'template_data') { // Handle template_data separately if needed
            fields.push(`${dbColumnName} = $${paramIndex++}`);
            values.push((updateData as any)[key]);
          } else {
            fields.push(`template_data = $${paramIndex++}::jsonb`);
            values.push(JSON.stringify((updateData as any)[key]));
          }
        }
      }
      fields.push(`updated_at = CURRENT_TIMESTAMP`);

      if (fields.length === 0) {
        await client.query('ROLLBACK');
        return this.findById(id); // No fields to update
      }

      values.push(id); // Add recurring order id for WHERE clause

      const updateQuery = `UPDATE recurring_orders SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await client.query(updateQuery, values);
      const updatedRecurringOrder = result.rows[0];

      await client.query('COMMIT');
      return this.mapRowToRecurringOrder(updatedRecurringOrder);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async findDueOrders(): Promise<RecurringOrder[]> {
    const query = `
      SELECT * FROM recurring_orders
      WHERE next_order_date <= CURRENT_DATE AND is_active = TRUE
      ORDER BY next_order_date ASC;
    `;
    const result = await this.query(query);
    return result.rows.map(this.mapRowToRecurringOrder);
  }

  private mapRowToRecurringOrder(row: any): RecurringOrder {
    return {
      id: row.id,
      vendorId: row.vendor_id,
      supplierId: row.supplier_id,
      frequency: row.frequency,
      nextOrderDate: new Date(row.next_order_date),
      isActive: row.is_active,
      reminderSent: row.reminder_sent,
      templateData: row.template_data, // Stored as JSONB, will be parsed automatically
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}