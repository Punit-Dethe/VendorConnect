import { BaseRepository } from './base.repository';
import { pool } from '../connection';
import { Product, CreateProductRequest } from '@vendor-supplier/shared/types';

export class ProductRepository extends BaseRepository {
  constructor(pool: any) { // Explicitly accept pool
    super(pool);
  }

  async create(product: CreateProductRequest): Promise<Product> {
    const { supplierId, name, description, categoryId, unit, pricePerUnit, stockQuantity, minOrderQuantity, images, isAvailable } = product;
    const result = await this.query(
      `INSERT INTO products (supplier_id, name, description, category_id, unit, price_per_unit, stock_quantity, min_order_quantity, images, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [supplierId, name, description, categoryId, unit, pricePerUnit, stockQuantity, minOrderQuantity, images || [], isAvailable || true]
    );
    return this.mapProductRowToProduct(result.rows[0]);
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] ? this.mapProductRowToProduct(result.rows[0]) : null;
  }

  async findBySupplierId(supplierId: string): Promise<Product[]> {
    const result = await this.query('SELECT * FROM products WHERE supplier_id = $1 ORDER BY created_at DESC', [supplierId]);
    return result.rows.map(this.mapProductRowToProduct);
  }

  async update(productId: string, updates: Partial<Product>): Promise<Product | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        const value = (updates as any)[key];
        if (value !== undefined) {
          if (key === 'categoryId') {
            fields.push(`category_id = $${paramIndex++}`);
          } else {
            fields.push(`${this.toSnakeCase(key)} = $${paramIndex++}`);
          }
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return this.findById(productId);

    values.push(productId);
    const result = await this.query(
      `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] ? this.mapProductRowToProduct(result.rows[0]) : null;
  }

  async delete(productId: string): Promise<boolean> {
    const result = await this.query('DELETE FROM products WHERE id = $1', [productId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updateStock(productId: string, quantityChange: number): Promise<void> {
    await this.query(
      'UPDATE products SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantityChange, productId]
    );
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const result = await this.query('SELECT * FROM products WHERE category_id = $1 AND is_available = TRUE ORDER BY created_at DESC', [categoryId]);
    return result.rows.map(this.mapProductRowToProduct);
  }

  private mapProductRowToProduct(row: any): Product {
    return {
      id: row.id.toString(),
      supplierId: row.supplier_id.toString(),
      categoryId: row.category_id.toString(),
      name: row.name,
      description: row.description,
      unit: row.unit,
      pricePerUnit: parseFloat(row.price_per_unit),
      stockQuantity: parseInt(row.stock_quantity),
      minOrderQuantity: parseInt(row.min_order_quantity),
      maxOrderQuantity: row.max_order_quantity ? parseInt(row.max_order_quantity) : undefined,
      images: row.images || [],
      isAvailable: row.is_available,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private toSnakeCase(camelCase: string): string {
    return camelCase.replace(/([A-Z])/g, '_$1').toLowerCase();
  }
} 