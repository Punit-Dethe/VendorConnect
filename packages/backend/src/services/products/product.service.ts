import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/error.middleware';

export interface Product {
  id: string;
  supplierId: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  minStock: number;
  description: string;
  image?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  minStock: number;
  description: string;
  image?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  status?: 'active' | 'inactive' | 'out_of_stock';
}

// In-memory storage for mock data
class MockProductDatabase {
  private products: Product[] = [];

  constructor() {
    // Pre-populate with sample products
    this.products = [
      {
        id: 'prod-1',
        supplierId: 'supplier-1',
        name: 'Fresh Tomatoes',
        category: 'Vegetables',
        price: 40,
        unit: 'kg',
        stock: 150,
        minStock: 50,
        description: 'Fresh red tomatoes from local farms',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'prod-2',
        supplierId: 'supplier-1',
        name: 'Red Onions',
        category: 'Vegetables',
        price: 30,
        unit: 'kg',
        stock: 200,
        minStock: 75,
        description: 'Fresh red onions',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'prod-3',
        supplierId: 'supplier-1',
        name: 'Red Chili Powder',
        category: 'Spices',
        price: 200,
        unit: 'kg',
        stock: 8,
        minStock: 20,
        description: 'Premium quality red chili powder',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'prod-4',
        supplierId: 'supplier-1',
        name: 'Basmati Rice',
        category: 'Grains',
        price: 120,
        unit: 'kg',
        stock: 25,
        minStock: 100,
        description: 'Premium basmati rice',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];
  }

  findAll(): Product[] {
    return this.products;
  }

  findById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  findBySupplierId(supplierId: string): Product[] {
    return this.products.filter(product => product.supplierId === supplierId);
  }

  findByCategory(category: string): Product[] {
    return this.products.filter(product =>
      product.category.toLowerCase() === category.toLowerCase() &&
      product.status === 'active'
    );
  }

  create(supplierId: string, productData: CreateProductData): Product {
    const newProduct: Product = {
      ...productData,
      id: uuidv4(),
      supplierId,
      status: productData.stock > 0 ? 'active' : 'out_of_stock',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.products.push(newProduct);
    return newProduct;
  }

  update(id: string, supplierId: string, updateData: UpdateProductData): Product | null {
    const productIndex = this.products.findIndex(p => p.id === id && p.supplierId === supplierId);

    if (productIndex === -1) {
      return null;
    }

    const updatedProduct = {
      ...this.products[productIndex],
      ...updateData,
      updatedAt: new Date()
    };

    // Auto-update status based on stock
    if (updateData.stock !== undefined) {
      updatedProduct.status = updateData.stock > 0 ? 'active' : 'out_of_stock';
    }

    this.products[productIndex] = updatedProduct;
    return updatedProduct;
  }

  delete(id: string, supplierId: string): boolean {
    const productIndex = this.products.findIndex(p => p.id === id && p.supplierId === supplierId);

    if (productIndex === -1) {
      return false;
    }

    this.products.splice(productIndex, 1);
    return true;
  }

  search(query: string, category?: string): Product[] {
    return this.products.filter(product => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !category || product.category.toLowerCase() === category.toLowerCase();
      const isActive = product.status === 'active';

      return matchesQuery && matchesCategory && isActive;
    });
  }

  getLowStockProducts(supplierId: string): Product[] {
    return this.products.filter(product =>
      product.supplierId === supplierId &&
      product.stock <= product.minStock &&
      product.stock > 0
    );
  }
}

const mockProductDb = new MockProductDatabase();

export class ProductService {
  async getAllProducts(): Promise<Product[]> {
    return mockProductDb.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = mockProductDb.findById(id);
    return product || null;
  }

  async getProductsBySupplierId(supplierId: string): Promise<Product[]> {
    return mockProductDb.findBySupplierId(supplierId);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return mockProductDb.findByCategory(category);
  }

  async createProduct(supplierId: string, productData: CreateProductData): Promise<Product> {
    // Validate required fields
    if (!productData.name || !productData.category || !productData.price || !productData.unit) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    if (productData.price <= 0) {
      throw new AppError('Price must be greater than 0', 400, 'VALIDATION_ERROR');
    }

    if (productData.stock < 0 || productData.minStock < 0) {
      throw new AppError('Stock values cannot be negative', 400, 'VALIDATION_ERROR');
    }

    return mockProductDb.create(supplierId, productData);
  }

  async updateProduct(id: string, supplierId: string, updateData: UpdateProductData): Promise<Product> {
    const updatedProduct = mockProductDb.update(id, supplierId, updateData);

    if (!updatedProduct) {
      throw new AppError('Product not found or unauthorized', 404, 'PRODUCT_NOT_FOUND');
    }

    return updatedProduct;
  }

  async deleteProduct(id: string, supplierId: string): Promise<void> {
    const deleted = mockProductDb.delete(id, supplierId);

    if (!deleted) {
      throw new AppError('Product not found or unauthorized', 404, 'PRODUCT_NOT_FOUND');
    }
  }

  async searchProducts(query: string, category?: string): Promise<Product[]> {
    if (!query || query.trim().length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400, 'VALIDATION_ERROR');
    }

    return mockProductDb.search(query.trim(), category);
  }

  async getLowStockProducts(supplierId: string): Promise<Product[]> {
    return mockProductDb.getLowStockProducts(supplierId);
  }

  async updateStock(id: string, supplierId: string, newStock: number): Promise<Product> {
    if (newStock < 0) {
      throw new AppError('Stock cannot be negative', 400, 'VALIDATION_ERROR');
    }

    return this.updateProduct(id, supplierId, { stock: newStock });
  }
}