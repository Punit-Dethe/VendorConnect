import { query } from '../../config/database';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price_per_unit: number;
  stock_quantity: number;
  minimum_stock: number;
  supplier_id: string;
  supplier_name?: string;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductData {
  name: string;
  description: string;
  category: string;
  unit: string;
  price_per_unit: number;
  stock_quantity: number;
  minimum_stock: number;
  image_url?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  category?: string;
  unit?: string;
  price_per_unit?: number;
  stock_quantity?: number;
  minimum_stock?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface ProductFilters {
  category?: string;
  supplierId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export class EnhancedProductService {
  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    let whereClause = 'WHERE p.is_active = true';
    const params: any[] = [];
    let paramCount = 0;

    if (filters) {
      if (filters.category) {
        paramCount++;
        whereClause += ` AND p.category ILIKE $${paramCount}`;
        params.push(`%${filters.category}%`);
      }

      if (filters.supplierId) {
        paramCount++;
        whereClause += ` AND p.supplier_id = $${paramCount}`;
        params.push(filters.supplierId);
      }

      if (filters.minPrice !== undefined) {
        paramCount++;
        whereClause += ` AND p.price_per_unit >= $${paramCount}`;
        params.push(filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        paramCount++;
        whereClause += ` AND p.price_per_unit <= $${paramCount}`;
        params.push(filters.maxPrice);
      }

      if (filters.inStock) {
        whereClause += ' AND p.stock_quantity > 0';
      }

      if (filters.search) {
        paramCount++;
        whereClause += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR p.category ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }
    }

    const result = await query(`
      SELECT p.*, u.name as supplier_name, sp.business_name as supplier_business_name
      FROM products p
      JOIN users u ON p.supplier_id = u.id
      LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
      ${whereClause}
      ORDER BY p.created_at DESC
    `, params);

    return result.rows;
  }

  async getProductById(id: string): Promise<Product | null> {
    const result = await query(`
      SELECT p.*, u.name as supplier_name, sp.business_name as supplier_business_name
      FROM products p
      JOIN users u ON p.supplier_id = u.id
      LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
      WHERE p.id = $1 AND p.is_active = true
    `, [id]);

    return result.rows[0] || null;
  }

  async getProductsBySupplierId(supplierId: string): Promise<Product[]> {
    const result = await query(`
      SELECT p.*, u.name as supplier_name, sp.business_name as supplier_business_name
      FROM products p
      JOIN users u ON p.supplier_id = u.id
      LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
      WHERE p.supplier_id = $1 AND p.is_active = true
      ORDER BY p.created_at DESC
    `, [supplierId]);

    return result.rows;
  }

  async createProduct(supplierId: string, productData: CreateProductData): Promise<Product> {
    // Validate product data
    if (!productData.name || !productData.category || !productData.unit || productData.price_per_unit <= 0) {
      throw new Error('Invalid product data');
    }

    const result = await query(`
      INSERT INTO products (supplier_id, name, description, category, unit, price_per_unit, 
                           stock_quantity, minimum_stock, image_url, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      supplierId,
      productData.name,
      productData.description,
      productData.category,
      productData.unit,
      productData.price_per_unit,
      productData.stock_quantity,
      productData.minimum_stock,
      productData.image_url,
      true
    ]);

    // Send notification about new product
    await this.sendProductNotification(supplierId, 'product_added', `New product "${productData.name}" added to inventory`);

    return result.rows[0];
  }

  async updateProduct(productId: string, supplierId: string, updateData: UpdateProductData): Promise<Product> {
    // Check if product exists and belongs to supplier
    const existingProduct = await query(`
      SELECT * FROM products WHERE id = $1 AND supplier_id = $2
    `, [productId, supplierId]);

    if (existingProduct.rows.length === 0) {
      throw new Error('Product not found or unauthorized');
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        params.push(value);
      }
    });

    if (updateFields.length === 0) {
      return existingProduct.rows[0];
    }

    paramCount++;
    params.push(productId);
    paramCount++;
    params.push(supplierId);

    const result = await query(`
      UPDATE products 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount - 1} AND supplier_id = $${paramCount}
      RETURNING *
    `, params);

    return result.rows[0];
  }

  async deleteProduct(productId: string, supplierId: string): Promise<void> {
    const result = await query(`
      UPDATE products 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND supplier_id = $2
    `, [productId, supplierId]);

    if (result.rowCount === 0) {
      throw new Error('Product not found or unauthorized');
    }
  }

  async updateStock(productId: string, supplierId: string, newStock: number): Promise<Product> {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const result = await query(`
      UPDATE products 
      SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND supplier_id = $3
      RETURNING *
    `, [newStock, productId, supplierId]);

    if (result.rows.length === 0) {
      throw new Error('Product not found or unauthorized');
    }

    return result.rows[0];
  }

  async restockProduct(productId: string, supplierId: string, additionalStock: number): Promise<Product> {
    if (additionalStock <= 0) {
      throw new Error('Additional stock must be positive');
    }

    const result = await query(`
      UPDATE products 
      SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND supplier_id = $3
      RETURNING *
    `, [additionalStock, productId, supplierId]);

    if (result.rows.length === 0) {
      throw new Error('Product not found or unauthorized');
    }

    const product = result.rows[0];

    // Send notification about restock
    await this.sendProductNotification(
      supplierId,
      'product_restocked',
      `Product "${product.name}" restocked with ${additionalStock} ${product.unit}. New stock: ${product.stock_quantity}`
    );

    // Notify vendors who might be interested (those who have ordered this product before)
    await this.notifyVendorsAboutRestock(productId, product);

    return product;
  }

  async getLowStockProducts(supplierId?: string): Promise<Product[]> {
    let whereClause = 'WHERE p.is_active = true AND p.stock_quantity <= p.minimum_stock';
    const params: any[] = [];

    if (supplierId) {
      whereClause += ' AND p.supplier_id = $1';
      params.push(supplierId);
    }

    const result = await query(`
      SELECT p.*, u.name as supplier_name, sp.business_name as supplier_business_name
      FROM products p
      JOIN users u ON p.supplier_id = u.id
      LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
      ${whereClause}
      ORDER BY p.stock_quantity ASC
    `, params);

    return result.rows;
  }

  async getCategories(): Promise<string[]> {
    const result = await query(`
      SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category
    `);

    return result.rows.map(row => row.category);
  }

  async getProductAnalytics(supplierId: string) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
        COUNT(CASE WHEN stock_quantity <= minimum_stock THEN 1 END) as low_stock_count,
        SUM(price_per_unit * stock_quantity) as total_value,
        AVG(price_per_unit) as avg_price,
        COUNT(DISTINCT category) as category_count
      FROM products 
      WHERE supplier_id = $1
    `, [supplierId]);

    const categoriesResult = await query(`
      SELECT DISTINCT category FROM products WHERE supplier_id = $1 AND is_active = true
    `, [supplierId]);

    const analytics = result.rows[0];
    analytics.categories = categoriesResult.rows.map(row => row.category);

    return analytics;
  }

  private async sendProductNotification(supplierId: string, type: string, message: string) {
    await query(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES ($1, $2, $3, $4)
    `, [supplierId, type, 'Product Update', message]);
  }

  private async notifyVendorsAboutRestock(productId: string, product: any) {
    // Find vendors who have ordered this product before
    const vendorsResult = await query(`
      SELECT DISTINCT o.vendor_id, u.name as vendor_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN users u ON o.vendor_id = u.id
      WHERE oi.product_id = $1
    `, [productId]);

    // Send notifications to these vendors
    for (const vendor of vendorsResult.rows) {
      await query(`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        vendor.vendor_id,
        'product_restocked',
        'Product Back in Stock!',
        `"${product.name}" is now back in stock with ${product.stock_quantity} ${product.unit} available.`,
        JSON.stringify({ productId, supplierId: product.supplier_id })
      ]);
    }
  }

  // Get products for a specific vendor (with supplier info)
  async getProductsForVendor(vendorId: string, filters?: ProductFilters): Promise<Product[]> {
    // Get vendor's preferred suppliers or all suppliers
    const vendorResult = await query(`
      SELECT preferred_suppliers FROM vendor_profiles WHERE user_id = $1
    `, [vendorId]);

    let supplierFilter = '';
    const params: any[] = [];
    let paramCount = 0;

    if (vendorResult.rows[0]?.preferred_suppliers?.length > 0) {
      paramCount++;
      supplierFilter = ` AND p.supplier_id = ANY($${paramCount})`;
      params.push(vendorResult.rows[0].preferred_suppliers);
    }

    let whereClause = `WHERE p.is_active = true AND p.stock_quantity > 0${supplierFilter}`;

    if (filters) {
      if (filters.category) {
        paramCount++;
        whereClause += ` AND p.category ILIKE $${paramCount}`;
        params.push(`%${filters.category}%`);
      }

      if (filters.search) {
        paramCount++;
        whereClause += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }
    }

    const result = await query(`
      SELECT p.*, u.name as supplier_name, sp.business_name as supplier_business_name,
             sp.delivery_time, sp.minimum_order_amount, u.trust_score as supplier_trust_score
      FROM products p
      JOIN users u ON p.supplier_id = u.id
      LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
      ${whereClause}
      ORDER BY u.trust_score DESC, p.created_at DESC
    `, params);

    return result.rows;
  }
}

export default new EnhancedProductService();