import { ProductRepository } from '@repositories/product.repository';
import { pool } from '@database/connection';
import { AppError } from '@middleware/error.middleware';
import { Product } from '@vendor-supplier/shared/src/types';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository(pool);
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    if (!productData.name || !productData.price || !productData.supplierId) {
      throw new AppError('Missing required product fields', 400, 'VALIDATION_ERROR');
    }
    return this.productRepository.create(productData);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    return this.productRepository.findBySupplierId(supplierId);
  }

  async updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null> {
    return this.productRepository.update(id, updateData);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }

  async searchProducts(query: string, category?: string): Promise<Product[]> {
    // This is a basic example; you might implement more sophisticated search in the repository
    return this.productRepository.search(query, category);
  }
}