import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPendingTransactions, 
  approveTransaction, 
  rejectTransaction,
  fetchAllTransactions 
} from '../../src/redux/features/transactions/transactionSlice';
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
    tx.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-emerald-800">Transaction Management</h1>
        <div className="flex gap-4">
          {/* Filter Buttons */}
          <div className="flex bg-emerald-50 rounded-lg p-1 border border-emerald-100">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md capitalize transition-colors ${
                  filter === status 
                    ? 'bg-emerald-500 text-white shadow-sm font-medium' 
                    : 'text-emerald-700 hover:bg-emerald-100'
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
        <input
          type="text"
          placeholder="Search by item, buyer, or seller..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-emerald-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-100">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Item & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Buyer & Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Payment Proof
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-emerald-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-emerald-900">{tx.listing?.title || 'N/A'}</div>
                        <div className="text-sm text-emerald-600">${tx.amount}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-emerald-900">
                        <span className="text-emerald-600">Buyer:</span> {tx.buyer?.name || 'N/A'}
                      </div>
                      <div className="text-emerald-500">{tx.buyer?.email || 'N/A'}</div>
                      <div className="font-medium text-emerald-900 mt-1">
                        <span className="text-emerald-600">Seller:</span> {tx.seller?.name || 'N/A'}
                      </div>
                      <div className="text-emerald-500">{tx.seller?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openProofModal(tx)}
                      className="inline-flex items-center px-3 py-2 border border-emerald-300 shadow-sm text-sm font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-600">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {tx.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(tx._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      <div className="text-sm text-emerald-600">
                        <span className="capitalize">{tx.status}</span>
                        {tx.processedBy && (
                          <div className="text-xs">by {tx.processedBy.name}</div>
                        )}
                        {tx.processedAt && (
                          <div className="text-xs">{new Date(tx.processedAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-emerald-500">No transactions found</p>
          </div>
        )}
      </div>

      {/* Payment Proof Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto border border-emerald-200">
            <div className="p-4 border-b border-emerald-100 flex justify-between items-center bg-emerald-50">
              <h3 className="text-lg font-semibold text-emerald-800">Payment Proof</h3>
              <button 
                onClick={closeProofModal}
                className="p-1 hover:bg-emerald-100 rounded text-emerald-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-medium text-emerald-900">{selectedTransaction.listing?.title}</h4>
                <p className="text-sm text-emerald-600">
                  Amount: ${selectedTransaction.amount} • 
                  Buyer: {selectedTransaction.buyer?.name} • 
                  Date: {new Date(selectedTransaction.createdAt).toLocaleDateString()}
                </p>
                {selectedTransaction.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {selectedTransaction.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <img 
                  src={selectedTransaction.proofOfPaymentUrl} 
                  alt="Payment Proof" 
                  className="max-w-full max-h-96 object-contain mx-auto border rounded-lg border-emerald-200"
                />
              </div>
              {selectedTransaction.status === 'pending' && (
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={() => {
                      handleApprove(selectedTransaction._id);
                      closeProofModal();
                    }}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
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