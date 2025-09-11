import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPendingTransactions, 
  approveTransaction, 
  fetchAllTransactions 
} from '../redux/features/transactions/transactionSlice';
import { Check, X, Eye, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTransactions = () => {
  const dispatch = useDispatch();
  const { pending, loading, error } = useSelector(state => state.transactions);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (filter === 'pending') {
      dispatch(fetchPendingTransactions());
    } else {
      dispatch(fetchAllTransactions({ status: filter }));
    }
  }, [dispatch, filter]);

  const handleApprove = async (txId) => {
    if (window.confirm('Are you sure you want to approve this transaction?')) {
      try {
        await dispatch(approveTransaction(txId)).unwrap();
        toast.success("Transaction approved successfully!");
      } catch (err) {
        toast.error(err || 'Failed to approve transaction');
      }
    }
  };

  const handleReject = async (txId, reason = '') => {
    const rejectionReason = reason || prompt('Enter rejection reason (optional):');
    if (window.confirm('Are you sure you want to reject this transaction?')) {
      try {
        // You'll need to create rejectTransaction action
        await dispatch(rejectTransaction({ id: txId, reason: rejectionReason })).unwrap();
        toast.success("Transaction rejected!");
      } catch (err) {
        toast.error(err || 'Failed to reject transaction');
      }
    }
  };

  const openProofModal = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeProofModal = () => {
    setSelectedTransaction(null);
  };

  const filteredTransactions = pending.filter(tx => 
    tx.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transaction Management</h1>
        <div className="flex gap-4">
          {/* Filter Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md capitalize transition-colors ${
                  filter === status 
                    ? 'bg-white shadow-sm text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by item, buyer, or seller..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer & Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Proof
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img 
                        src={tx.listing.imageUrl} 
                        alt={tx.listing.title}
                        className="h-12 w-12 object-cover rounded-lg mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{tx.listing.title}</div>
                        <div className="text-sm text-gray-500">${tx.amount}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        <span className="text-green-600">Buyer:</span> {tx.buyer.name}
                      </div>
                      <div className="text-gray-500">{tx.buyer.email}</div>
                      <div className="font-medium text-gray-900 mt-1">
                        <span className="text-blue-600">Seller:</span> {tx.seller.name}
                      </div>
                      <div className="text-gray-500">{tx.seller.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openProofModal(tx)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Eye size={16} className="mr-1" />
                      View Proof
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      tx.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : tx.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {tx.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(tx._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <Check size={16} className="mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(tx._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <X size={16} className="mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                    {tx.status !== 'pending' && (
                      <span className="text-sm text-gray-500">
                        {tx.status === 'approved' ? 'Completed' : 'Rejected'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>

      {/* Payment Proof Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payment Proof</h3>
              <button 
                onClick={closeProofModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{selectedTransaction.listing.title}</h4>
                <p className="text-sm text-gray-500">
                  Amount: ${selectedTransaction.amount} • 
                  Buyer: {selectedTransaction.buyer.name} • 
                  Date: {new Date(selectedTransaction.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-center">
                <img 
                  src={selectedTransaction.proofOfPaymentUrl} 
                  alt="Payment Proof" 
                  className="max-w-full max-h-96 object-contain mx-auto border rounded-lg"
                />
              </div>
              {selectedTransaction.status === 'pending' && (
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={() => {
                      handleApprove(selectedTransaction._id);
                      closeProofModal();
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Check size={16} />
                    Approve Transaction
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedTransaction._id);
                      closeProofModal();
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <X size={16} />
                    Reject Transaction
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;