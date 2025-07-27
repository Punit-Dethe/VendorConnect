import { ContractRepository } from '@repositories/contract.repository';
import { pool } from '@database/connection';
import { AppError } from '@middleware/error.middleware';
import { Contract } from '@vendor-supplier/shared/src/types';

export class ContractService {
  private contractRepository: ContractRepository;

  constructor() {
    this.contractRepository = new ContractRepository(pool);
  }

  async createContract(contractData: Partial<Contract>): Promise<Contract> {
    if (!contractData.orderId || !contractData.vendorId || !contractData.supplierId || !contractData.terms || !contractData.status) {
      throw new AppError('Missing required contract fields', 400, 'VALIDATION_ERROR');
    }
    return this.contractRepository.create(contractData);
  }

  async getContractById(id: string): Promise<Contract | null> {
    return this.contractRepository.findById(id);
  }

  async getContracts(): Promise<Contract[]> {
    return this.contractRepository.findAll();
  }

  async updateContract(id: string, updateData: Partial<Contract>): Promise<Contract | null> {
    return this.contractRepository.update(id, updateData);
  }

  async deleteContract(id: string): Promise<void> {
    await this.contractRepository.delete(id);
  }
}