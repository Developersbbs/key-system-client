// components/TransactionHistory.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserTransactions } from '../redux/features/transactions/transactionSlice';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

const TransactionHistory = () => {
  const dispatch = useDispatch();
  const { userTransactions, loading } = useSelector(state => state.transactions);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchUserTransactions());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'approved':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Transactions</h1>
      
      <div className="space-y-4">
        {userTransactions.map((transaction) => {
          const isBuyer = transaction.buyer._id === user._id;
          
          return (
            <div key={transaction._id} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <img 
                    src={transaction.listing.imageUrl} 
                    alt={transaction.listing.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{transaction.listing.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {isBuyer ? 'You bought this item' : 'You sold this item'}
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p><strong>Amount:</strong> ${transaction.amount}</p>
                      <p><strong>{isBuyer ? 'Seller' : 'Buyer'}:</strong> {isBuyer ? transaction.seller.name : transaction.buyer.name}</p>
                      <p><strong>Date:</strong> {new Date(transaction.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end mb-2">
                    {getStatusIcon(transaction.status)}
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                  
                  {isBuyer && (
                    <button
                      onClick={() => window.open(transaction.proofOfPaymentUrl, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View Proof
                    </button>
                  )}
                </div>
              </div>
              
              {transaction.status === 'rejected' && transaction.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">
                    <strong>Rejection Reason:</strong> {transaction.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        
        {userTransactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;