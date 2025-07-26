import { Request, Response } from 'express';
import enhancedOrderService from '../services/orders/enhanced-order.service';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'vendor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    orderData.vendorId = userId;
    const result = await enhancedOrderService.createOrder(orderData);

    res.status(201).json(result);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getSupplierOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const orders = await enhancedOrderService.getSupplierOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error('Get supplier orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getVendorOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'vendor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const orders = await enhancedOrderService.getVendorOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const order = await enhancedOrderService.getOrderDetails(parseInt(orderId));

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.vendor_id !== userId && order.supplier_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Failed to get order details' });
  }
};

export const approveOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { notes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const order = await enhancedOrderService.approveOrder(parseInt(orderId), userId, notes);
    res.json(order);
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({ error: 'Failed to approve order' });
  }
};

export const rejectOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await enhancedOrderService.rejectOrder(parseInt(orderId), userId, reason);
    res.json(result);
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({ error: 'Failed to reject order' });
  }
};

export const restockProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const product = await enhancedOrderService.restockProduct(parseInt(productId), quantity, userId);
    res.json(product);
  } catch (error) {
    console.error('Restock product error:', error);
    res.status(500).json({ error: 'Failed to restock product' });
  }
};

export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const products = await enhancedOrderService.getLowStockProducts(userId);
    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ error: 'Failed to get low stock products' });
  }
};