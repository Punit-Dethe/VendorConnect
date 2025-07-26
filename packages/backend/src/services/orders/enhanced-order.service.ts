import { query } from '../../config/database';
import contractService from '../contracts/contract.service';
import paymentService from '../payments/payment.service';

interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

interface CreateOrderRequest {
  vendorId: number;
  supplierId: number;
  items: OrderItem[];
  orderType: 'one_time' | 'recurring';
  recurringFrequency?: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod?: 'card' | 'upi' | 'netbanking' | 'wallet' | 'pay_later';
}

class EnhancedOrderService {
  async createOrder(orderData: CreateOrderRequest) {
    try {
      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Calculate total amount
      const totalAmount = await this.calculateTotalAmount(orderData.items);

      // Get supplier payment terms
      const supplierResult = await query(`
        SELECT sp.payment_terms FROM supplier_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE u.id = $1
      `, [orderData.supplierId]);

      const paymentTerms = supplierResult.rows[0]?.payment_terms || 30;
      const paymentDueDate = new Date();
      paymentDueDate.setDate(paymentDueDate.getDate() + paymentTerms);

      // Create order
      const orderResult = await query(`
        INSERT INTO orders (vendor_id, supplier_id, order_number, order_type, recurring_frequency, 
                           total_amount, delivery_address, notes, status, payment_due_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        orderData.vendorId,
        orderData.supplierId,
        orderNumber,
        orderData.orderType,
        orderData.recurringFrequency,
        totalAmount,
        orderData.deliveryAddress,
        orderData.notes,
        'pending',
        paymentDueDate
      ]);

      const order = orderResult.rows[0];

      // Create order items and update stock
      const orderItems = [];
      for (const item of orderData.items) {
        // Check stock availability
        const stockCheck = await query(`
          SELECT stock_quantity FROM products WHERE id = $1
        `, [item.productId]);

        if (stockCheck.rows[0]?.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        // Create order item
        const itemResult = await query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [
          order.id,
          item.productId,
          item.quantity,
          item.unitPrice,
          item.quantity * item.unitPrice
        ]);

        // Reserve stock (don't deduct yet, wait for approval)
        await query(`
          UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2
        `, [item.quantity, item.productId]);

        orderItems.push(itemResult.rows[0]);
      }

      // Generate digital contract
      const contractData = {
        vendorId: orderData.vendorId,
        supplierId: orderData.supplierId,
        orderId: order.id,
        contractType: orderData.orderType as 'order' | 'recurring',
        totalAmount,
        paymentTerms,
        startDate: new Date().toISOString().split('T')[0],
        endDate: orderData.orderType === 'recurring' ?
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
        orderItems
      };

      const contract = await contractService.generateContract(contractData);

      // Send real-time notification to supplier
      await this.sendOrderNotification(order, 'new_order');

      // If pay_later is selected, create payment record
      if (orderData.paymentMethod === 'pay_later') {
        await paymentService.initiatePayment({
          orderId: order.id,
          vendorId: orderData.vendorId,
          supplierId: orderData.supplierId,
          amount: totalAmount,
          paymentMethod: 'pay_later',
          dueDate: paymentDueDate.toISOString().split('T')[0]
        });
      }

      return { order, contract };
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  async approveOrder(orderId: number, supplierId: number, notes?: string) {
    try {
      // Update order status
      await query(`
        UPDATE orders SET status = 'approved', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND supplier_id = $2
      `, [orderId, supplierId]);

      // Send notification to vendor
      await this.sendOrderNotification({ id: orderId }, 'order_approved');

      // Get order details for response
      const orderResult = await query(`
        SELECT o.*, u.name as vendor_name, u.trust_score as vendor_trust_score
        FROM orders o
        JOIN users u ON o.vendor_id = u.id
        WHERE o.id = $1
      `, [orderId]);

      return orderResult.rows[0];
    } catch (error) {
      console.error('Order approval error:', error);
      throw error;
    }
  }

  async rejectOrder(orderId: number, supplierId: number, reason?: string) {
    try {
      // Update order status
      await query(`
        UPDATE orders SET status = 'rejected', notes = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND supplier_id = $3
      `, [reason, orderId, supplierId]);

      // Restore stock for rejected order
      const orderItems = await query(`
        SELECT oi.product_id, oi.quantity
        FROM order_items oi
        WHERE oi.order_id = $1
      `, [orderId]);

      for (const item of orderItems.rows) {
        await query(`
          UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2
        `, [item.quantity, item.product_id]);
      }

      // Send notification to vendor
      await this.sendOrderNotification({ id: orderId }, 'order_rejected');

      return { success: true, message: 'Order rejected successfully' };
    } catch (error) {
      console.error('Order rejection error:', error);
      throw error;
    }
  }

  async getSupplierOrders(supplierId: number) {
    const result = await query(`
      SELECT o.*, 
             u.name as vendor_name, u.trust_score as vendor_trust_score,
             vp.business_name as vendor_business,
             COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.vendor_id = u.id
      LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.supplier_id = $1
      GROUP BY o.id, u.name, u.trust_score, vp.business_name
      ORDER BY o.created_at DESC
    `, [supplierId]);

    return result.rows;
  }

  async getVendorOrders(vendorId: number) {
    const result = await query(`
      SELECT o.*, 
             u.name as supplier_name,
             sp.business_name as supplier_business,
             COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.supplier_id = u.id
      LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.vendor_id = $1
      GROUP BY o.id, u.name, sp.business_name
      ORDER BY o.created_at DESC
    `, [vendorId]);

    return result.rows;
  }

  async getOrderDetails(orderId: number) {
    const orderResult = await query(`
      SELECT o.*, 
             v.name as vendor_name, v.trust_score as vendor_trust_score,
             vp.business_name as vendor_business,
             s.name as supplier_name,
             sp.business_name as supplier_business
      FROM orders o
      JOIN users v ON o.vendor_id = v.id
      JOIN users s ON o.supplier_id = s.id
      LEFT JOIN vendor_profiles vp ON v.id = vp.user_id
      LEFT JOIN supplier_profiles sp ON s.id = sp.user_id
      WHERE o.id = $1
    `, [orderId]);

    const itemsResult = await query(`
      SELECT oi.*, p.name as product_name, p.unit
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);

    const order = orderResult.rows[0];
    if (order) {
      order.items = itemsResult.rows;
    }

    return order;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }

  private async calculateTotalAmount(items: OrderItem[]): Promise<number> {
    let total = 0;
    for (const item of items) {
      total += item.quantity * item.unitPrice;
    }
    return total;
  }

  private async sendOrderNotification(order: any, type: string) {
    let title, message, userId;

    switch (type) {
      case 'new_order':
        title = 'New Order Received';
        message = `You have received a new order #${order.order_number || order.id}`;
        userId = order.supplier_id;
        break;
      case 'order_approved':
        title = 'Order Approved';
        message = `Your order #${order.order_number || order.id} has been approved`;
        userId = order.vendor_id;
        break;
      case 'order_rejected':
        title = 'Order Rejected';
        message = `Your order #${order.order_number || order.id} has been rejected`;
        userId = order.vendor_id;
        break;
      default:
        return;
    }

    await query(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, type, title, message, JSON.stringify({ orderId: order.id })]);
  }

  async restockProduct(productId: number, quantity: number, supplierId: number) {
    try {
      const result = await query(`
        UPDATE products 
        SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND supplier_id = $3
        RETURNING *
      `, [quantity, productId, supplierId]);

      if (result.rows.length === 0) {
        throw new Error('Product not found or unauthorized');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Restock error:', error);
      throw error;
    }
  }

  async getLowStockProducts(supplierId: number) {
    const result = await query(`
      SELECT * FROM products 
      WHERE supplier_id = $1 AND stock_quantity <= minimum_stock AND is_active = true
      ORDER BY stock_quantity ASC
    `, [supplierId]);

    return result.rows;
  }
}

export default new EnhancedOrderService();