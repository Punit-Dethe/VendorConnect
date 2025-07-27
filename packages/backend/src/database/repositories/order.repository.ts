import { BaseRepository } from './base.repository';
import { pool } from '../connection';
import { Order, OrderItem, OrderStatus, CreateOrderRequest, UpdateOrderRequest } from '@vendor-supplier/shared/src/types';
import { v4 as uuidv4 } from 'uuid';

export class OrderRepository extends BaseRepository {
  constructor(pool: any) { // Explicitly accept pool
    super(pool);
  }

  public async findAll(): Promise<Order[]> {
    const query = 'SELECT * FROM orders ORDER BY created_at DESC';
    const result = await this.query(query);
    return result.rows.map(row => this.mapOrderRowToOrder(row, [])); // Items will be fetched on demand or in detail view
  }

  public async findById(id: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result = await this.query(query, [id]);
    if (!result.rows[0]) return null;

    const orderItemsQuery = 'SELECT * FROM order_items WHERE order_id = $1';
    const itemsResult = await this.query(orderItemsQuery, [id]);

    return this.mapOrderRowToOrder(result.rows[0], itemsResult.rows);
  }

  public async findByVendorId(vendorId: string): Promise<Order[]> {
    const query = 'SELECT * FROM orders WHERE vendor_id = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [vendorId]);
    return Promise.all(result.rows.map(async row => {
      const orderItemsQuery = 'SELECT * FROM order_items WHERE order_id = $1';
      const itemsResult = await this.query(orderItemsQuery, [row.id]);
      return this.mapOrderRowToOrder(row, itemsResult.rows);
    }));
  }

  public async findBySupplierId(supplierId: string): Promise<Order[]> {
    const query = 'SELECT * FROM orders WHERE supplier_id = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [supplierId]);
    return Promise.all(result.rows.map(async row => {
      const orderItemsQuery = 'SELECT * FROM order_items WHERE order_id = $1';
      const itemsResult = await this.query(orderItemsQuery, [row.id]);
      return this.mapOrderRowToOrder(row, itemsResult.rows);
    }));
  }

  public async findByStatus(status: OrderStatus): Promise<Order[]> {
    const query = 'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [status]);
    return Promise.all(result.rows.map(async row => {
      const orderItemsQuery = 'SELECT * FROM order_items WHERE order_id = $1';
      const itemsResult = await this.query(orderItemsQuery, [row.id]);
      return this.mapOrderRowToOrder(row, itemsResult.rows);
    }));
  }

  public async createOrder(order: Partial<Order>): Promise<Order> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const orderNumber = `ORD-${Date.now()}`;
      const orderInsertQuery = `
        INSERT INTO orders (
          vendor_id, supplier_id, order_number, status, order_type,
          total_amount, delivery_address, delivery_city, delivery_pincode,
          estimated_delivery_time, actual_delivery_time, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
      `;
      const orderResult = await client.query(orderInsertQuery, [
        order.vendorId,
        order.supplierId,
        orderNumber,
        order.status || 'pending',
        order.orderType || 'one_time',
        order.totalAmount,
        order.deliveryAddress,
        order.deliveryCity,
        order.deliveryPincode,
        order.estimatedDeliveryTime || null,
        order.actualDeliveryTime || null,
        order.notes || null,
      ]);
      const newOrder = orderResult.rows[0];

      for (const item of order.items || []) {
        const orderItemInsertQuery = `
          INSERT INTO order_items (order_id, product_id, product_name, quantity, unit, price_per_unit, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7);
        `;
        await client.query(orderItemInsertQuery, [
          newOrder.id,
          item.productId,
          item.productName,
          item.quantity,
          item.unit,
          item.pricePerUnit,
          item.totalPrice,
        ]);
      }

      await client.query('COMMIT');

      return this.mapOrderRowToOrder(newOrder, order.items || []);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async update(id: string, updateData: Partial<Order>): Promise<Order | null> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const currentOrder = await this.findById(id);
      if (!currentOrder) {
        await client.query('ROLLBACK');
        return null;
      }

      const fields = [];
      const values = [];
      let paramIndex = 1;

      for (const key in updateData) {
        if (updateData.hasOwnProperty(key)) {
          const dbColumnName = this.toSnakeCase(key);
          if (dbColumnName !== 'items') { // items are handled separately or not updated via this generic update
            fields.push(`${dbColumnName} = $${paramIndex++}`);
            values.push((updateData as any)[key]);
          }
        }
      }
      fields.push(`updated_at = CURRENT_TIMESTAMP`);

      if (fields.length === 0) {
        await client.query('ROLLBACK');
        return currentOrder; // No fields to update
      }

      values.push(id); // Add order id for WHERE clause

      const updateQuery = `UPDATE orders SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await client.query(updateQuery, values);
      const updatedOrder = result.rows[0];

      // Optionally handle item updates here if needed, but for simplicity, assuming items are mostly set at creation

      await client.query('COMMIT');
      return this.mapOrderRowToOrder(updatedOrder, currentOrder.items);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private mapOrderRowToOrder(row: any, items: OrderItem[]): Order {
    return {
      id: row.id,
      vendorId: row.vendor_id,
      supplierId: row.supplier_id,
      orderNumber: row.order_number,
      items: items,
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      orderType: row.order_type,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method || '',
      deliveryAddress: row.delivery_address,
      deliveryCity: row.delivery_city,
      deliveryPincode: row.delivery_pincode,
      estimatedDeliveryTime: row.estimated_delivery_time ? new Date(row.estimated_delivery_time) : undefined,
      actualDeliveryTime: row.actual_delivery_time ? new Date(row.actual_delivery_time) : undefined,
      contractId: row.contract_id,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  // Methods for trust score calculation - previously in order.repository.ts
  public async countSupplierOrders(supplierId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM orders WHERE supplier_id = $1';
    const result = await this.query(query, [supplierId]);
    return parseInt(result.rows[0].count, 10);
  }

  public async countSuccessfulSupplierOrders(supplierId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM orders WHERE supplier_id = $1 AND status = \'delivered\'';
    const result = await this.query(query, [supplierId]);
    return parseInt(result.rows[0].count, 10);
  }

  public async countOnTimeSupplierDeliveries(supplierId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM orders WHERE supplier_id = $1 AND status = \'delivered\' AND actual_delivery_time <= estimated_delivery_time';
    const result = await this.query(query, [supplierId]);
    return parseInt(result.rows[0].count, 10);
  }

  public async countVendorOrders(vendorId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM orders WHERE vendor_id = $1';
    const result = await this.query(query, [vendorId]);
    return parseInt(result.rows[0].count, 10);
  }

  public async countAllOrders(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM orders';
    const result = await this.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  public async countOrdersByStatus(status: OrderStatus): Promise<number> {
    const query = 'SELECT COUNT(*) FROM orders WHERE status = $1';
    const result = await this.query(query, [status]);
    return parseInt(result.rows[0].count, 10);
  }
} 