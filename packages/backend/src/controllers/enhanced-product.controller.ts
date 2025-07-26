import { Request, Response } from 'express';
import enhancedProductService from '../services/products/enhanced-product.service';
import '../types/express';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const products = await enhancedProductService.getAllProducts(filters);
    res.json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProductsForVendor = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const filters = req.query;

    if (!userId || userRole !== 'vendor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const products = await enhancedProductService.getProductsForVendor(userId, filters);
    res.json(products);
  } catch (error) {
    console.error('Get products for vendor error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getSupplierProducts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const products = await enhancedProductService.getProductsBySupplierId(userId);
    res.json(products);
  } catch (error) {
    console.error('Get supplier products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await enhancedProductService.getProductById(parseInt(productId));

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const product = await enhancedProductService.createProduct(userId, productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const product = await enhancedProductService.updateProduct(parseInt(productId), userId, updateData);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await enhancedProductService.deleteProduct(parseInt(productId), userId);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const restockProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { additionalStock } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const product = await enhancedProductService.restockProduct(parseInt(productId), userId, additionalStock);
    res.json(product);
  } catch (error) {
    console.error('Restock product error:', error);
    res.status(500).json({ error: 'Failed to restock product' });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { newStock } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const product = await enhancedProductService.updateStock(parseInt(productId), userId, newStock);
    res.json(product);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};

export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const products = await enhancedProductService.getLowStockProducts(userId);
    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ error: 'Failed to get low stock products' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await enhancedProductService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

export const getProductAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const analytics = await enhancedProductService.getProductAnalytics(userId);
    res.json(analytics);
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};