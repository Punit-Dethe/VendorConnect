import { Request, Response } from 'express';
import contractService from '../services/contracts/contract.service';

export const getContracts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const contracts = await contractService.getContractsByUser(userId, userRole);
    res.json(contracts);
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Failed to get contracts' });
  }
};

export const getContractById = async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const contract = await contractService.getContractById(parseInt(contractId));

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if user is authorized to view this contract
    if (contract.vendor_id !== userId && contract.supplier_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view this contract' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: 'Failed to get contract' });
  }
};

export const signContract = async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const contract = await contractService.signContract(parseInt(contractId), userId, userRole);
    res.json(contract);
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ error: 'Failed to sign contract' });
  }
};

export const generateContract = async (req: Request, res: Response) => {
  try {
    const contractData = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify user is authorized to create this contract
    if (contractData.vendorId !== userId && contractData.supplierId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to create this contract' });
    }

    const contract = await contractService.generateContract(contractData);
    res.json(contract);
  } catch (error) {
    console.error('Generate contract error:', error);
    res.status(500).json({ error: 'Failed to generate contract' });
  }
};