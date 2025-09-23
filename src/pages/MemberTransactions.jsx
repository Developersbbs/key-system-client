// pages/MemberTransactions.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserTransactions } from '../redux/features/transactions/transactionSlice';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter,
  Calendar,
  DollarSign,
  User,
  Package,
  Search,
  Download,
  ArrowUpDown,
  ImageIcon,
  TrendingUp,
  BarChart3,
  CreditCard
} from 'lucide-react';

const MemberTransactions = () => {
  const dispatch = useDispatch();
  const { userTransactions, loading, error } = useSelector(state => state.transactions);
  const { user } = useSelector(state => state.auth);
  
  // Filter and search states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // all, bought, sold
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [dateRange, setDateRange] = useState('all');
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    if (user && user._id) {
      dispatch(fetchUserTransactions());
    }
  }, [dispatch, user]);

  // Safety checks
  const safeUserTransactions = Array.isArray(userTransactions) ? userTransactions : [];
  const safeUser = user || {};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-amber-500" size={16} />;
      case 'approved':
        return <CheckCircle className="text-emerald-500" size={16} />;
      case 'rejected':
        return <XCircle className="text-red-400" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleImageError = (transactionId) => {
    setImageErrors(prev => ({
      ...prev,
      [transactionId]: true
    }));
  };

  // Filter transactions based on selected filters
  const filteredTransactions = safeUserTransactions.filter(transaction => {
    if (!transaction || !safeUser._id) return false;
    
    const isBuyer = transaction.buyer?._id === safeUser._id;
    
    // Status filter
    if (statusFilter !== 'all' && transaction.status !== statusFilter) {
      return false;
    }
    
    // Type filter
    if (typeFilter === 'bought' && !isBuyer) return false;
    if (typeFilter === 'sold' && isBuyer) return false;
    
    // Search filter
    if (searchTerm && transaction.listing?.title && !transaction.listing.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Date range filter
    if (dateRange !== 'all' && transaction.createdAt) {
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case '7days':
          if (daysDiff > 7) return false;
          break;
        case '30days':
          if (daysDiff > 30) return false;
          break;
        case '90days':
          if (daysDiff > 90) return false;
          break;
      }
    }
    
    return true;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case 'amount_high':
        return (b.amount || 0) - (a.amount || 0);
      case 'amount_low':
        return (a.amount || 0) - (b.amount || 0);
      default:
        return 0;
    }
  });

  // Get statistics
  const stats = {
    total: safeUserTransactions.length,
    pending: safeUserTransactions.filter(t => t?.status === 'pending').length,
    approved: safeUserTransactions.filter(t => t?.status === 'approved').length,
    rejected: safeUserTransactions.filter(t => t?.status === 'rejected').length,
    bought: safeUserTransactions.filter(t => t?.buyer?._id === safeUser._id).length,
    sold: safeUserTransactions.filter(t => t?.seller?._id === safeUser._id).length,
    totalAmount: safeUserTransactions.reduce((sum, t) => sum + (t?.amount || 0), 0)
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-800">Loading your transactions...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Transactions</h2>
          <p className="text-red-700 mb-4">{error || 'Something went wrong while loading your transactions.'}</p>
          <button
            onClick={() => dispatch(fetchUserTransactions())}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle no user state
  if (!safeUser._id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-700">Please log in to view your transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">My Transactions</h1>
          <p className="text-emerald-700">Track all your buying and selling activities</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-semibold text-emerald-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-amber-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-emerald-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-emerald-100">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-semibold text-emerald-900">${stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md mb-6 border border-emerald-100">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-medium text-emerald-900">Filter Transactions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="bought">Items Bought</option>
                <option value="sold">Items Sold</option>
              </select>

              {/* Date Range */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Amount: High to Low</option>
                <option value="amount_low">Amount: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-md border border-emerald-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 text-emerald-600 mr-2" />
                <h2 className="text-xl font-semibold text-emerald-900">
                  Transaction History ({sortedTransactions.length})
                </h2>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 hover:text-emerald-900 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors">
                <Download size={16} />
                Export
              </button>
            </div>

            {sortedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-emerald-900 mb-2">No transactions found</p>
                <p className="text-emerald-700">No transactions match your current filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedTransactions.map((transaction) => {
                  if (!transaction || !transaction._id) return null;
                  
                  const isBuyer = transaction.buyer?._id === safeUser._id;
                  const hasImageError = imageErrors[transaction._id];
                  const imageUrl = transaction.listing?.imageUrl || transaction.listing?.images?.[0];
                  
                  return (
                    <div key={transaction._id} className="border border-emerald-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Item Image */}
                          <div className="flex-shrink-0">
                            {hasImageError || !imageUrl ? (
                              <div className="w-20 h-20 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-emerald-300" />
                              </div>
                            ) : (
                              <img 
                                src={imageUrl} 
                                alt={transaction.listing?.title || 'Product'}
                                className="w-20 h-20 object-cover rounded-lg border border-emerald-100"
                                onError={() => handleImageError(transaction._id)}
                                loading="lazy"
                              />
                            )}
                          </div>
                          
                          {/* Transaction Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-emerald-900 mb-1">
                              {transaction.listing?.title || 'Product Name Unavailable'}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${isBuyer ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-100 text-purple-800 border-purple-200'}`}>
                                {isBuyer ? 'Purchase' : 'Sale'}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(transaction.status || 'pending')}`}>
                                {getStatusIcon(transaction.status || 'pending')}
                                {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Pending'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-emerald-800">
                              <div>
                                <p className="font-medium text-emerald-900">Amount</p>
                                <p className="text-lg font-semibold text-emerald-600">
                                  ${typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : (transaction.amount || '0.00')}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-emerald-900">{isBuyer ? 'Seller' : 'Buyer'}</p>
                                <p className="flex items-center gap-1">
                                  <User size={14} className="text-emerald-600" />
                                  {isBuyer ? (transaction.seller?.name || 'Unknown Seller') : (transaction.buyer?.name || 'Unknown Buyer')}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-emerald-900">Date</p>
                                <p className="flex items-center gap-1">
                                  <Calendar size={14} className="text-emerald-600" />
                                  {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : 'Date unavailable'}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-emerald-900">Transaction ID</p>
                                <p className="font-mono text-xs bg-emerald-50 px-2 py-1 rounded text-emerald-700">
                                  {transaction._id ? transaction._id.slice(-8) : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex-shrink-0 ml-4 flex flex-col gap-2">
                          {transaction.proofOfPaymentUrl && (
                            <button
                              onClick={() => window.open(transaction.proofOfPaymentUrl, '_blank')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Eye size={16} />
                              View Proof
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Rejection Reason */}
                      {transaction.status === 'rejected' && transaction.rejectionReason && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <XCircle className="text-red-500 mt-0.5" size={16} />
                            <div>
                              <p className="font-medium text-red-800 mb-1">Transaction Rejected</p>
                              <p className="text-red-700 text-sm">{transaction.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Additional Details for Pending Transactions */}
                      {transaction.status === 'pending' && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Clock className="text-amber-600 mt-0.5" size={16} />
                            <div>
                              <p className="font-medium text-amber-800 mb-1">Pending Approval</p>
                              <p className="text-amber-700 text-sm">
                                Your transaction is being reviewed. You will be notified once it's approved or if additional information is needed.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Details for Approved Transactions */}
                      {transaction.status === 'approved' && (
                        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="text-emerald-600 mt-0.5" size={16} />
                            <div>
                              <p className="font-medium text-emerald-800 mb-1">Transaction Completed</p>
                              <p className="text-emerald-700 text-sm">
                                This transaction has been successfully approved and completed.
                                {transaction.approvedAt && (
                                  <span className="block mt-1">
                                    Approved on: {new Date(transaction.approvedAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberTransactions;