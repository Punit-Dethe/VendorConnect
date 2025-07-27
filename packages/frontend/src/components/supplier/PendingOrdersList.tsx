import React from 'react';
import { Order } from '@vendor-supplier/shared/src/types'; // Assuming Order type is available

interface PendingOrdersListProps {
  pendingOrders: Order[];
  openApprovalModal: (order: Order) => void;
}

const PendingOrdersList: React.FC<PendingOrdersListProps> = ({
  pendingOrders,
  openApprovalModal,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Pending Orders ({pendingOrders.length})
        </h2>
        {pendingOrders.length > 0 && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
            Action Required
          </span>
        )}
      </div>

      {pendingOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No pending orders at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <div key={order.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                  {/* Temporarily removed order.vendor?.name and trustScore */}
                  <p className="text-gray-600">
                    Vendor ID: <span className="font-medium">{order.vendorId}</span>
                  </p>
                  {/* <p className="text-sm text-gray-500">
                    Trust Score: {order.vendor?.trustScore}/100
                  </p> */}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">₹{order.totalAmount}</p>
                  <p className="text-sm text-gray-500">
                    {order.items?.length} items
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">Items:</p>
                <div className="flex flex-wrap gap-2">
                  {order.items?.slice(0, 3).map((item: any, index: number) => (
                    <span key={index} className="bg-white px-2 py-1 rounded text-sm">
                      {item.productName} ({item.quantity})
                    </span>
                  ))}
                  {order.items?.length > 3 && (
                    <span className="text-sm text-gray-500">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Ordered: {new Date(order.createdAt).toLocaleString()}
                </p>
                <button
                  onClick={() => openApprovalModal(order)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Review Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingOrdersList; 