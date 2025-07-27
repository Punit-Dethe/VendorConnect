export interface Payment {
  id: string;
  orderId: string;
  vendorId: string;
  supplierId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paymentGatewayResponse?: any;
  dueDate: Date;
  paidAt?: Date;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface InitiatePaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod: 'upi' | 'invoice' | 'pay_later';
}

export interface UPIPaymentRequest {
  orderId: string;
  amount: number;
  upiId: string;
}

export interface InvoiceUploadRequest {
  orderId: string;
  invoiceFile: File;
}

export interface MarkPaidRequest {
  paymentId: string;
  transactionId?: string;
  notes?: string;
}