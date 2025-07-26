import { OrderItem } from './order.types';

export interface DigitalContract {
  id: string;
  orderId: string;
  vendorId: string;
  supplierId: string;
  contractNumber: string;
  terms: ContractTerms;
  status: ContractStatus;
  vendorSignedAt?: Date;
  vendorSignatureData?: SignatureData;
  supplierSignedAt?: Date;
  supplierSignatureData?: SignatureData;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractTerms {
  deliveryTimeline: string;
  quantities: OrderItem[];
  totalCost: number;
  paymentDeadline: Date;
  qualityStandards: string;
  cancellationPolicy: string;
}

export interface SignatureData {
  signedAt: Date;
  ipAddress: string;
  deviceInfo: string;
}

export type ContractStatus =
  | 'draft'
  | 'pending_vendor_signature'
  | 'pending_supplier_signature'
  | 'signed'
  | 'cancelled';

export interface CreateContractRequest {
  orderId: string;
  deliveryTimeline: string;
  paymentDeadline: Date;
  qualityStandards: string;
  cancellationPolicy: string;
}

export interface SignContractRequest {
  contractId: string;
  signature: {
    ipAddress: string;
    deviceInfo: string;
  };
}