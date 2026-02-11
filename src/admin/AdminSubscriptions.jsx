import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Search, Filter, Download, Home, ChevronRight } from 'lucide-react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

const AdminSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // pending, all
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchSubscriptions();
    }, [activeTab]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'pending'
                ? '/subscriptions/admin/pending'
                : '/subscriptions/admin/all';

            const response = await apiClient.get(endpoint);
            setSubscriptions(response.data.subscriptions);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (subscriptionId, userName) => {
        if (!window.confirm(`Approve subscription for ${userName}? This will activate their account.`)) {
            return;
        }

        setProcessingId(subscriptionId);
        try {
            await apiClient.put(`/subscriptions/admin/${subscriptionId}/approve`);
            toast.success(`Subscription approved for ${userName}!`);
            fetchSubscriptions();
        } catch (error) {
            console.error('Failed to approve subscription:', error);
            toast.error(error.response?.data?.message || 'Failed to approve subscription');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (subscriptionId, userName) => {
        const reason = window.prompt(`Reject subscription for ${userName}?\n\nPlease provide a reason:`);
        if (!reason) return;

        setProcessingId(subscriptionId);
        try {
            await apiClient.put(`/subscriptions/admin/${subscriptionId}/reject`, { reason });
            toast.success(`Subscription rejected for ${userName}`);
            fetchSubscriptions();
        } catch (error) {
            console.error('Failed to reject subscription:', error);
            toast.error(error.response?.data?.message || 'Failed to reject subscription');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        const userName = sub.user?.name?.toLowerCase() || '';
        const userEmail = sub.user?.email?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return userName.includes(search) || userEmail.includes(search);
    });

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200'
        };
        const icons = {
            pending: <Clock size={14} />,
            approved: <CheckCircle size={14} />,
            rejected: <XCircle size={14} />
        };

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <div className="flex items-center">
                                <Home size={16} className="text-gray-400" />
                                <a href="#" className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700">Dashboard</a>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight size={16} className="text-gray-400" />
                                <span className="ml-2 text-sm font-medium text-green-700">Subscription Management</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {/* Page Header */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
                    <p className="text-green-100 mt-1">Review and approve user subscription payments</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Clock size={18} />
                                    Pending Requests
                                    {subscriptions.filter(s => s.status === 'pending').length > 0 && (
                                        <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                                            {subscriptions.filter(s => s.status === 'pending').length}
                                        </span>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                All Subscriptions
                            </button>
                        </nav>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 border-b bg-gray-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    {/* Subscriptions List */}
                    <div className="divide-y divide-gray-200">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading subscriptions...</p>
                            </div>
                        ) : filteredSubscriptions.length === 0 ? (
                            <div className="p-12 text-center">
                                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                                <p className="text-gray-500">
                                    {searchTerm ? 'Try adjusting your search' : 'No subscription requests at this time'}
                                </p>
                            </div>
                        ) : (
                            filteredSubscriptions.map((subscription) => (
                                <div key={subscription._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        {/* User Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {subscription.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{subscription.user?.name || 'Unknown User'}</h3>
                                                    <p className="text-sm text-gray-500">{subscription.user?.email}</p>
                                                </div>
                                            </div>

                                            <div className="ml-15 space-y-2">
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-gray-600">
                                                        <strong>Amount:</strong> ${subscription.amount} {subscription.currency}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        <strong>Submitted:</strong> {new Date(subscription.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {getStatusBadge(subscription.status)}
                                                </div>

                                                {subscription.status === 'rejected' && subscription.rejectionReason && (
                                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                                                        <strong className="text-red-900">Rejection Reason:</strong>
                                                        <p className="text-red-700 mt-1">{subscription.rejectionReason}</p>
                                                    </div>
                                                )}

                                                {subscription.processedBy && (
                                                    <p className="text-xs text-gray-500">
                                                        Processed by: {subscription.processedBy.name} on {new Date(subscription.processedAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-end gap-3 ml-4">
                                            {/* Payment Screenshot */}
                                            {subscription.paymentScreenshot && (
                                                <button
                                                    onClick={() => setSelectedImage(subscription.paymentScreenshot)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                                >
                                                    <Eye size={18} />
                                                    View Screenshot
                                                </button>
                                            )}

                                            {/* Approve/Reject Buttons */}
                                            {subscription.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(subscription._id, subscription.user?.name)}
                                                        disabled={processingId === subscription._id}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <CheckCircle size={18} />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(subscription._id, subscription.user?.name)}
                                                        disabled={processingId === subscription._id}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <XCircle size={18} />
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <XCircle size={32} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Payment proof"
                            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSubscriptions;
