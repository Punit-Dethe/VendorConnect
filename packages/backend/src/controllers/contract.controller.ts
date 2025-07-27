import { Request, Response, NextFunction } from 'express';
import { ContractService } from '../services/contracts/contract.service';
import { AppError } from '../middleware/error.middleware';
import { ApiResponse, Contract } from '@vendor-supplier/shared/src/types';
import { validationResult } from 'express-validator';

export class ContractController {
  private contractService: ContractService;

  constructor() {
    this.contractService = new ContractService();
  }

  createContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR')); // Removed extra argument
      }

      const contractData: Partial<Contract> = req.body;
      const newContract = await this.contractService.createContract(contractData);
      const response: ApiResponse<Contract> = { success: true, data: newContract };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contracts = await this.contractService.getContracts();
      const response: ApiResponse<Contract[]> = { success: true, data: contracts };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getContractById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const contract = await this.contractService.getContractById(id);
      if (!contract) {
        return next(new AppError('Contract not found', 404, 'NOT_FOUND'));
      }
      const response: ApiResponse<Contract> = { success: true, data: contract };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR')); // Removed extra argument
      }

      const { id } = req.params;
      const updateData: Partial<Contract> = req.body;
      const updatedContract = await this.contractService.updateContract(id, updateData);
      if (!updatedContract) {
        return next(new AppError('Contract not found or update failed', 404, 'UPDATE_FAILED'));
      }
      const response: ApiResponse<Contract> = { success: true, data: updatedContract };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.contractService.deleteContract(id);
      // Changed to adhere to ApiResponse type, success messages go under data or are implied by success: true
      // As per shared/src/types, ApiResponse does not have a 'message' field on the root for success responses.
      const response: ApiResponse = { success: true, data: { message: 'Contract deleted successfully' } }; // Adjusted for type compliance
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}