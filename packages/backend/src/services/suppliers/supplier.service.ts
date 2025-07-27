import { SupplierRepository } from '@repositories/supplier.repository';
import { pool } from '@database/connection';
import { AppError } from '@middleware/error.middleware';
import { Supplier, SupplierProfileUpdate } from '@vendor-supplier/shared/src/types';

export class SupplierService {
  private supplierRepository: SupplierRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository(pool);
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    return this.supplierRepository.findById(id);
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return this.supplierRepository.findAll();
  }

  async updateSupplierProfile(id: string, updateData: SupplierProfileUpdate): Promise<Supplier | null> {
    const updatedSupplier = await this.supplierRepository.update(id, updateData);
    if (!updatedSupplier) {
      throw new AppError('Supplier not found or update failed', 404, 'UPDATE_FAILED');
    }
    return updatedSupplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    await this.supplierRepository.delete(id);
  }

  async getSupplierProducts(supplierId: string): Promise<any[]> {
    // Assuming you have a method in ProductRepository or a join to get products by supplier
    // For now, this is a placeholder.
    // return this.productRepository.findBySupplierId(supplierId);
    return [];
  }

  async getSupplierOrders(supplierId: string): Promise<any[]> {
    // Assuming you have a method in OrderRepository to get orders by supplier
    // For now, this is a placeholder.
    // return this.orderRepository.findBySupplierId(supplierId);
    return [];
  }
}