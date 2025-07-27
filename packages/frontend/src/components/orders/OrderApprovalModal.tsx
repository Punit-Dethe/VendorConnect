import React, { useState } from 'react';

interface OrderApprovalModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: { estimatedDeliveryTime: string; paymentTerms: number; notes: string }) => void;
  onReject: (reason: string) => void;
  isLoading?: boolean;
}

const OrderApprovalModal: React.FC<OrderApprovalModalProps> = ({
  order,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('2-4 hours');
  const [paymentTerms, setPaymentTerms] = useState(15);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen || !order) return null;

  const handleApprove = () => {
    if (!estimatedDeliveryTime || paymentTerms < 1) {
      alert('Please fill all required fields');
      return;
    }

    onApprove({
      estimatedDeliveryTime,
      paymentTerms,
      notes
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    onReject(rejectionReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Order Approval - {order.orderNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Order Details */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-3">Order Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Vendor</p>
              <p className="font-medium">{order.vendor?.name}</p>
              <p className="text-sm text-gray-500">{order.vendor?.businessType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trust Score</p>
              <div className="flex items-center">
                <span className="font-medium text-lg">{order.vendor?.trustScore}</span>
                <span className="text-sm text-gray-500 ml-1">/100</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-bold text-lg text-green-600">₹{order.totalAmount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Items</p>
              <p className="font-medium">{order.items?.length} items</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Items Ordered:</h4>
            <div className="space-y-2">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × ₹{item.unitPrice}
                    </p>
                  </div>
                  <p className="font-medium">₹{item.totalPrice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <p className="text-sm text-gray-600">Delivery Address</p>
            <p className="font-medium">{order.deliveryAddress}</p>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">Order Notes</p>
              <p className="font-medium">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Action Selection */}
        {!action && (
          <div className="flex space-x-4">
            <button
              onClick={() => setAction('approve')}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium"
              disabled={isLoading}
            >
              Approve Order
            </button>
            <button
              onClick={() => setAction('reject')}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-medium"
              disabled={isLoading}
            >
              Reject Order
            </button>
          </div>
        )}

        {/* Approval Form */}
        {action === 'approve' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Approval Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Delivery Time *
              </label>
              <select
                value={estimatedDeliveryTime}
                onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="1-2 hours">1-2 hours</option>
                <option value="2-4 hours">2-4 hours</option>
                <option value="4-6 hours">4-6 hours</option>
                <option value="6-8 hours">6-8 hours</option>
                <option value="1 day">1 day</option>
                <option value="2 days">2 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms (Days) *
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value={7}>7 days</option>
                <option value={15}>15 days</option>
                <option value={30}>30 days</option>
                <option value={45}>45 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or notes for the vendor..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleApprove}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Approving...' : 'Confirm Approval'}
              </button>
              <button
                onClick={() => setAction(null)}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 font-medium"
                disabled={isLoading}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Rejection Form */}
        {action === 'reject' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Rejection Reason</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Please provide a reason for rejecting this order *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Out of stock, Unable to deliver to location, Pricing issue..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => setAction(null)}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 font-medium"
                disabled={isLoading}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderApprovalModal;