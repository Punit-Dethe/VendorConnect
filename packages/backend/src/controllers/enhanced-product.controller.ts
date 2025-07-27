import { Request, Response } from 'express';
import enhancedProductService from '../services/products/enhanced-product.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    mobile: string;
    name: string;
    email?: string;
    role: 'vendor' | 'supplier';
    trust_score: number;
    is_verified: boolean;
  };
}


export const getAllProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = req.query;
    const products = await enhancedProductService.getAllProducts(filters);
    res.json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProductsForVendor = async (req: AuthenticatedRequest, res: Response) => {
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

export const getSupplierProducts = async (req: AuthenticatedRequest, res: Response) => {
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

export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await enhancedProductService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
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

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const product = await enhancedProductService.updateProduct(productId, userId, updateData);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await enhancedProductService.deleteProduct(productId, userId);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const restockProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { additionalStock } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const product = await enhancedProductService.restockProduct(productId, userId, additionalStock);
    res.json(product);
  } catch (error) {
    console.error('Restock product error:', error);
    res.status(500).json({ error: 'Failed to restock product' });
  }
};

export const updateStock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { newStock } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const product = await enhancedProductService.updateStock(productId, userId, newStock);
    res.json(product);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};

export const getLowStockProducts = async (req: AuthenticatedRequest, res: Response) => {
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

export const getCategories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await enhancedProductService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

export const getProductAnalytics = async (req: AuthenticatedRequest, res: Response) => {
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