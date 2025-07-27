import React, { useState } from 'react';

interface ContractViewerProps {
  contract: any;
  currentUserId: string;
  currentUserRole: 'vendor' | 'supplier';
  onSign: () => void;
  isLoading?: boolean;
}

const ContractViewer: React.FC<ContractViewerProps> = ({
  contract,
  currentUserId,
  currentUserRole,
  onSign,
  isLoading = false
}) => {
  const [showFullContract, setShowFullContract] = useState(false);

  if (!contract) return null;

  const canSign = () => {
    if (currentUserRole === 'vendor') {
      return contract.vendorId === currentUserId && !contract.vendorSigned;
    } else {
      return contract.supplierId === currentUserId && !contract.supplierSigned;
    }
  };

  const getSignatureStatus = () => {
    const vendorSigned = contract.vendorSigned;
    const supplierSigned = contract.supplierSigned;

    if (vendorSigned && supplierSigned) {
      return { status: 'fully_signed', color: 'text-green-600', text: 'Fully Signed' };
    } else if (vendorSigned || supplierSigned) {
      return { status: 'partially_signed', color: 'text-yellow-600', text: 'Partially Signed' };
    } else {
      return { status: 'unsigned', color: 'text-red-600', text: 'Awaiting Signatures' };
    }
  };

  const signatureStatus = getSignatureStatus();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Contract Header */}
      <div className="border-b pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Contract {contract.contractNumber}
            </h2>
            <p className="text-gray-600 mt-1">
              Generated on {new Date(contract.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <div className={`font-semibold ${signatureStatus.color}`}>
              {signatureStatus.text}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Order: {contract.orderDetails?.orderNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Contract Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Parties */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Parties</h3>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-blue-800">Vendor</h4>
              {contract.vendorSigned && (
                <span className="text-green-600 text-sm">✓ Signed</span>
              )}
            </div>
            <p className="font-medium">{contract.parties?.vendor?.name}</p>
            <p className="text-sm text-gray-600">{contract.parties?.vendor?.businessType}</p>
            <p className="text-sm text-gray-600">{contract.parties?.vendor?.address}</p>
            <p className="text-sm text-gray-600">{contract.parties?.vendor?.city}, {contract.parties?.vendor?.state}</p>
            <p className="text-sm text-gray-600">Mobile: {contract.parties?.vendor?.mobile}</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-green-800">Supplier</h4>
              {contract.supplierSigned && (
                <span className="text-green-600 text-sm">✓ Signed</span>
              )}
            </div>
            <p className="font-medium">{contract.parties?.supplier?.name}</p>
            <p className="text-sm text-gray-600">{contract.parties?.supplier?.businessType}</p>
            <p className="text-sm text-gray-600">{contract.parties?.supplier?.address}</p>
            <p className="text-sm text-gray-600">{contract.parties?.supplier?.city}, {contract.parties?.supplier?.state}</p>
            <p className="text-sm text-gray-600">Mobile: {contract.parties?.supplier?.mobile}</p>
          </div>
        </div>

        {/* Contract Terms */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Contract Terms</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg">₹{contract.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Terms:</span>
              <span className="font-medium">{contract.paymentTerms} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Due Date:</span>
              <span className="font-medium">
                {new Date(contract.terms?.paymentDueDate).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Terms:</span>
              <span className="font-medium">{contract.deliveryTerms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Date:</span>
              <span className="font-medium">
                {new Date(contract.terms?.deliveryDate).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {contract.orderDetails?.items?.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{item.productName}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{item.unitPrice}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">₹{item.totalPrice}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right">Total Amount:</td>
                <td className="border border-gray-300 px-4 py-2 text-right">₹{contract.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Terms */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Key Terms & Conditions</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
          <p><strong>Payment Terms:</strong> {contract.terms?.penaltyClause}</p>
          <p><strong>Cancellation Policy:</strong> {contract.terms?.cancellationPolicy}</p>
          <p><strong>Quality Assurance:</strong> {contract.terms?.qualityAssurance}</p>
          <p><strong>Dispute Resolution:</strong> {contract.terms?.disputeResolution}</p>
        </div>
      </div>

      {/* Full Legal Text */}
      <div className="mb-6">
        <button
          onClick={() => setShowFullContract(!showFullContract)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {showFullContract ? 'Hide' : 'Show'} Full Legal Contract
        </button>

        {showFullContract && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {contract.legalText}
            </pre>
          </div>
        )}
      </div>

      {/* Signature Section */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Digital Signatures</h3>
          <div className="text-sm text-gray-600">
            Contract Status: <span className={`font-medium ${signatureStatus.color}`}>
              {signatureStatus.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vendor Signature */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Vendor Signature</h4>
            {contract.vendorSigned ? (
              <div className="text-green-600">
                <p className="font-medium">✓ Signed by {contract.parties?.vendor?.name}</p>
                <p className="text-sm">
                  Signed on: {new Date(contract.vendorSignedAt).toLocaleString('en-IN')}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Awaiting vendor signature</p>
            )}
          </div>

          {/* Supplier Signature */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Supplier Signature</h4>
            {contract.supplierSigned ? (
              <div className="text-green-600">
                <p className="font-medium">✓ Signed by {contract.parties?.supplier?.name}</p>
                <p className="text-sm">
                  Signed on: {new Date(contract.supplierSignedAt).toLocaleString('en-IN')}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Awaiting supplier signature</p>
            )}
          </div>
        </div>

        {/* Sign Button */}
        {canSign() && (
          <div className="mt-6 text-center">
            <button
              onClick={onSign}
              disabled={isLoading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {isLoading ? 'Signing...' : 'Sign Contract'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              By clicking "Sign Contract", you agree to all terms and conditions stated above.
            </p>
          </div>
        )}

        {contract.status === 'signed' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-800 font-medium">
              ✓ Contract fully signed and legally binding
            </p>
            <p className="text-sm text-green-600 mt-1">
              Both parties have agreed to the terms. Order is now in progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractViewer;