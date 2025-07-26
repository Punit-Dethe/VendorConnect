import { query } from '../../config/database';
import crypto from 'crypto';

export interface ContractData {
  vendorId: number;
  supplierId: number;
  orderId?: number;
  contractType: 'order' | 'recurring';
  totalAmount: number;
  paymentTerms: number;
  startDate: string;
  endDate?: string;
  orderItems?: any[];
}

class ContractService {
  async generateContract(contractData: ContractData): Promise<any> {
    try {
      const contractNumber = this.generateContractNumber();
      const termsAndConditions = await this.generateTermsAndConditions(contractData);

      const result = await query(`
        INSERT INTO contracts (vendor_id, supplier_id, contract_number, contract_type, 
                              terms_and_conditions, payment_terms, total_amount, start_date, end_date, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        contractData.vendorId,
        contractData.supplierId,
        contractNumber,
        contractData.contractType,
        termsAndConditions,
        contractData.paymentTerms,
        contractData.totalAmount,
        contractData.startDate,
        contractData.endDate,
        'sent'
      ]);

      const contract = result.rows[0];

      // Update order with contract ID if provided
      if (contractData.orderId) {
        await query(`
          UPDATE orders SET contract_id = $1 WHERE id = $2
        `, [contract.id, contractData.orderId]);
      }

      // Send notifications to both parties
      await this.sendContractNotifications(contract);

      return contract;
    } catch (error) {
      console.error('Contract generation error:', error);
      throw error;
    }
  }

  private generateContractNumber(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `VC-${timestamp.slice(-6)}-${random}`;
  }

  private async generateTermsAndConditions(contractData: ContractData): Promise<string> {
    // Get vendor and supplier details
    const vendorResult = await query(`
      SELECT u.name, vp.business_name, vp.address, u.trust_score
      FROM users u
      LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
      WHERE u.id = $1
    `, [contractData.vendorId]);

    const supplierResult = await query(`
      SELECT u.name, sp.business_name, sp.address, sp.payment_terms
      FROM users u
      LEFT JOIN supplier_profiles sp ON u.id = sp.user_id
      WHERE u.id = $1
    `, [contractData.supplierId]);

    const vendor = vendorResult.rows[0];
    const supplier = supplierResult.rows[0];

    const terms = `
DIGITAL SUPPLY AGREEMENT

This agreement is entered into between:

SUPPLIER: ${supplier.business_name || supplier.name}
Address: ${supplier.address || 'Not specified'}

VENDOR: ${vendor.business_name || vendor.name}
Address: ${vendor.address || 'Not specified'}
Trust Score: ${vendor.trust_score}/100

AGREEMENT DETAILS:
- Contract Type: ${contractData.contractType.toUpperCase()}
- Total Amount: ₹${contractData.totalAmount.toFixed(2)}
- Payment Terms: ${contractData.paymentTerms} days from delivery
- Start Date: ${contractData.startDate}
${contractData.endDate ? `- End Date: ${contractData.endDate}` : ''}

TERMS AND CONDITIONS:

1. PAYMENT TERMS
   - Payment due within ${contractData.paymentTerms} days of delivery
   - Late payment may incur additional charges
   - Payment methods: UPI, Bank Transfer, Digital Wallet

2. QUALITY ASSURANCE
   - All products must meet agreed quality standards
   - Supplier guarantees freshness and quality of goods
   - Vendor has right to reject substandard products

3. DELIVERY TERMS
   - Timely delivery as per agreed schedule
   - Supplier responsible for safe packaging
   - Delivery confirmation required

4. TRUST SCORE IMPACT
   - Successful completion improves trust scores
   - Defaults or disputes may negatively impact scores
   - Trust scores affect future business opportunities

5. DISPUTE RESOLUTION
   - Any disputes to be resolved through platform mediation
   - Both parties agree to platform terms and conditions

6. CANCELLATION POLICY
   - 24-hour notice required for order cancellation
   - Cancellation fees may apply for last-minute changes

7. DIGITAL SIGNATURES
   - Both parties must digitally sign this agreement
   - Agreement becomes binding upon both signatures
   - Electronic signatures have same legal validity

By signing below, both parties agree to all terms and conditions stated above.

Generated on: ${new Date().toLocaleString('en-IN')}
Platform: VendorConnect India
`;

    return terms;
  }

  private async sendContractNotifications(contract: any) {
    // Notify vendor
    await query(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      contract.vendor_id,
      'contract_received',
      'New Contract Received',
      `Please review and sign contract ${contract.contract_number}`,
      JSON.stringify({ contractId: contract.id })
    ]);

    // Notify supplier
    await query(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      contract.supplier_id,
      'contract_sent',
      'Contract Sent for Signature',
      `Contract ${contract.contract_number} sent to vendor for signature`,
      JSON.stringify({ contractId: contract.id })
    ]);
  }

  async signContract(contractId: number, userId: number, userRole: 'vendor' | 'supplier'): Promise<any> {
    const signatureField = userRole === 'vendor' ? 'vendor_signature' : 'supplier_signature';
    const timestampField = userRole === 'vendor' ? 'vendor_signed_at' : 'supplier_signed_at';

    await query(`
      UPDATE contracts 
      SET ${signatureField} = true, ${timestampField} = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [contractId]);

    // Check if both parties have signed
    const contractResult = await query(`
      SELECT * FROM contracts WHERE id = $1
    `, [contractId]);

    const contract = contractResult.rows[0];

    if (contract.vendor_signature && contract.supplier_signature) {
      // Both signed - activate contract
      await query(`
        UPDATE contracts SET status = 'signed' WHERE id = $1
      `, [contractId]);

      // Notify both parties
      await this.sendContractCompletionNotifications(contract);
    }

    return contract;
  }

  private async sendContractCompletionNotifications(contract: any) {
    const message = `Contract ${contract.contract_number} has been fully executed. Both parties have signed.`;

    // Notify vendor
    await query(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      contract.vendor_id,
      'contract_completed',
      'Contract Fully Executed',
      message,
      JSON.stringify({ contractId: contract.id })
    ]);

    // Notify supplier
    await query(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      contract.supplier_id,
      'contract_completed',
      'Contract Fully Executed',
      message,
      JSON.stringify({ contractId: contract.id })
    ]);
  }

  async getContractsByUser(userId: number, role: 'vendor' | 'supplier') {
    const column = role === 'vendor' ? 'vendor_id' : 'supplier_id';

    const result = await query(`
      SELECT c.*, 
             v.name as vendor_name, vp.business_name as vendor_business,
             s.name as supplier_name, sp.business_name as supplier_business
      FROM contracts c
      JOIN users v ON c.vendor_id = v.id
      JOIN users s ON c.supplier_id = s.id
      LEFT JOIN vendor_profiles vp ON v.id = vp.user_id
      LEFT JOIN supplier_profiles sp ON s.id = sp.user_id
      WHERE c.${column} = $1
      ORDER BY c.created_at DESC
    `, [userId]);

    return result.rows;
  }

  async getContractById(contractId: number) {
    const result = await query(`
      SELECT c.*, 
             v.name as vendor_name, vp.business_name as vendor_business, v.trust_score as vendor_trust_score,
             s.name as supplier_name, sp.business_name as supplier_business
      FROM contracts c
      JOIN users v ON c.vendor_id = v.id
      JOIN users s ON c.supplier_id = s.id
      LEFT JOIN vendor_profiles vp ON v.id = vp.user_id
      LEFT JOIN supplier_profiles sp ON s.id = sp.user_id
      WHERE c.id = $1
    `, [contractId]);

    return result.rows[0];
  }
}

export default new ContractService();