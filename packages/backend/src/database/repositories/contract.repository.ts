import { BaseRepository } from './base.repository';
import { Pool } from 'pg';
import { DigitalContract, ContractStatus, SignatureData } from '@vendor-supplier/shared/types';

export class ContractRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async create(contract: Omit<DigitalContract, 'id' | 'createdAt' | 'updatedAt' | 'vendorSignedAt' | 'supplierSignedAt' | 'vendorSignatureData' | 'supplierSignatureData' | 'status'> & { contractNumber: string, terms: object }): Promise<DigitalContract> {
    const { orderId, vendorId, supplierId, contractNumber, terms } = contract;
    const result = await this.query(
      `INSERT INTO digital_contracts (order_id, vendor_id, supplier_id, contract_number, terms, status)
       VALUES ($1, $2, $3, $4, $5, 'draft') RETURNING *`,
      [orderId, vendorId, supplierId, contractNumber, terms]
    );
    return this.mapContractRowToContract(result.rows[0]);
  }

  async findById(id: string): Promise<DigitalContract | null> {
    const result = await this.query('SELECT * FROM digital_contracts WHERE id = $1', [id]);
    return result.rows[0] ? this.mapContractRowToContract(result.rows[0]) : null;
  }

  async findByOrderId(orderId: string): Promise<DigitalContract | null> {
    const result = await this.query('SELECT * FROM digital_contracts WHERE order_id = $1', [orderId]);
    return result.rows[0] ? this.mapContractRowToContract(result.rows[0]) : null;
  }

  async findByUserId(userId: string): Promise<DigitalContract[]> {
    const result = await this.query(
      `SELECT * FROM digital_contracts WHERE vendor_id = $1 OR supplier_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows.map(this.mapContractRowToContract);
  }

  async updateStatusAndSignatures(contractId: string, status: ContractStatus, vendorSignatureData?: SignatureData, supplierSignatureData?: SignatureData): Promise<DigitalContract | null> {
    const updates: string[] = [`status = $1`, `updated_at = CURRENT_TIMESTAMP`];
    const values: (string | Date | object | undefined)[] = [status];
    let paramIndex = 2;

    if (vendorSignatureData) {
      updates.push(`vendor_signed_at = CURRENT_TIMESTAMP`);
      updates.push(`vendor_signature_data = $${paramIndex++}::jsonb`);
      values.push(vendorSignatureData);
    }
    if (supplierSignatureData) {
      updates.push(`supplier_signed_at = CURRENT_TIMESTAMP`);
      updates.push(`supplier_signature_data = $${paramIndex++}::jsonb`);
      values.push(supplierSignatureData);
    }

    const result = await this.query(
      `UPDATE digital_contracts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      [...values, contractId]
    );
    return result.rows[0] ? this.mapContractRowToContract(result.rows[0]) : null;
  }

  private mapContractRowToContract(row: any): DigitalContract {
    return {
      id: row.id.toString(),
      orderId: row.order_id.toString(),
      vendorId: row.vendor_id.toString(),
      supplierId: row.supplier_id.toString(),
      contractNumber: row.contract_number,
      terms: row.terms,
      status: row.status,
      vendorSignedAt: row.vendor_signed_at ? new Date(row.vendor_signed_at) : undefined,
      vendorSignatureData: row.vendor_signature_data || undefined,
      supplierSignedAt: row.supplier_signed_at ? new Date(row.supplier_signed_at) : undefined,
      supplierSignatureData: row.supplier_signature_data || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
} 