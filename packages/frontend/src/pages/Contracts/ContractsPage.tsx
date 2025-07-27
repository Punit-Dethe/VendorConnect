import React, { useState, useEffect } from 'react';
import ContractViewer from '../../components/contracts/ContractViewer';
import { Navigation } from '../../components/common';

const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchContracts();
    getCurrentUser();
  }, []);

  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  };

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/contracts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setContracts(result.data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const handleSignContract = async () => {
    if (!selectedContract) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/contracts/${selectedContract.id}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();

        // Update contracts list
        setContracts(prev => prev.map(contract =>
          contract.id === selectedContract.id ? result.data.contract : contract
        ));

        // Update selected contract
        setSelectedContract(result.data.contract);

        alert(result.data.message);
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to sign contract');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      alert('Failed to sign contract');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'partially_signed':
        return 'bg-yellow-100 text-yellow-800';
      case 'generated':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (contract: any) => {
    if (contract.status === 'signed') {
      return 'Fully Signed';
    } else if (contract.status === 'partially_signed') {
      return 'Partially Signed';
    } else {
      return 'Awaiting Signatures';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole={currentUser?.role || 'vendor'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <div className="text-sm text-gray-600">
            Total Contracts: {contracts.length}
          </div>
        </div>

        {selectedContract ? (
          <div>
            <button
              onClick={() => setSelectedContract(null)}
              className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Contracts List
            </button>

            <ContractViewer
              contract={selectedContract}
              currentUserId={currentUser?.id}
              currentUserRole={currentUser?.role}
              onSign={handleSignContract}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {contracts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No contracts found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Contracts will appear here when orders are approved
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contract Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parties
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Terms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contract.contractNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contract.order?.orderNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <p className="font-medium">
                              Vendor: {contract.vendor?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              Supplier: {contract.supplier?.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="font-medium text-green-600">
                            ₹{contract.totalAmount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                            {getStatusText(contract)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contract.paymentTerms} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => setSelectedContract(contract)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;