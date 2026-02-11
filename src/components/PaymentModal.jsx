import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle, Clock, Copy, AlertCircle, Image as ImageIcon } from 'lucide-react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Payment Info, 2: Upload Proof, 3: Status
    const [subscriptionId, setSubscriptionId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('pending'); // pending, approved, rejected
    const fileInputRef = useRef(null);

    // Payment details (you can make these configurable)
    const paymentDetails = {
        amount: '$10',
        upiId: 'keysystem@upi', // Replace with actual UPI ID
        accountNumber: '1234567890', // Replace with actual account
        ifscCode: 'ABCD0123456', // Replace with actual IFSC
        accountName: 'Key System'
    };

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const createSubscription = async () => {
        try {
            const response = await apiClient.post('/subscriptions/create', {
                amount: 10,
                currency: 'USD'
            });
            setSubscriptionId(response.data.subscription._id);
            setStep(2);
            toast.success('Subscription request created!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create subscription');
        }
    };

    const uploadPaymentProof = async () => {
        if (!selectedFile || !subscriptionId) return;

        setUploading(true);
        try {
            // Create FormData and upload to backend (NO CORS issues)
            const formData = new FormData();
            formData.append('paymentProof', selectedFile);
            formData.append('subscriptionId', subscriptionId);

            // Backend uploads to Firebase Storage
            await apiClient.post('/subscriptions/upload-proof', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            setStep(3);
            toast.success('Payment proof uploaded successfully!');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload payment proof');
        } finally {
            setUploading(false);
        }
    };

    const handleProceedToUpload = () => {
        createSubscription();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Subscribe to Key System</h2>
                        <p className="text-emerald-100 text-sm mt-1">Annual Subscription - {paymentDetails.amount}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        {step > s ? <CheckCircle size={20} /> : s}
                                    </div>
                                    <span className="text-xs mt-1 font-medium">
                                        {s === 1 ? 'Payment' : s === 2 ? 'Upload' : 'Status'}
                                    </span>
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-1 mx-2 rounded ${step > s ? 'bg-emerald-600' : 'bg-gray-300'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Payment Information */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Payment</h3>
                                <p className="text-gray-600">Scan the QR code or use the payment details below</p>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center">
                                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-200">
                                    <img
                                        src="/payment-qr.png"
                                        alt="Payment QR Code"
                                        className="w-64 h-64 object-contain"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="16">QR Code</text></svg>';
                                        }}
                                    />
                                    <p className="text-center mt-3 font-semibold text-emerald-700">Scan to Pay {paymentDetails.amount}</p>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 space-y-4">
                                <h4 className="font-bold text-gray-900 mb-3">Or use these payment details:</h4>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500">UPI ID</p>
                                            <p className="font-semibold text-gray-900">{paymentDetails.upiId}</p>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(paymentDetails.upiId, 'UPI ID')}
                                            className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                                        >
                                            <Copy size={18} className="text-emerald-600" />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500">Account Number</p>
                                            <p className="font-semibold text-gray-900">{paymentDetails.accountNumber}</p>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(paymentDetails.accountNumber, 'Account Number')}
                                            className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                                        >
                                            <Copy size={18} className="text-emerald-600" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">IFSC Code</p>
                                            <p className="font-semibold text-gray-900">{paymentDetails.ifscCode}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Account Name</p>
                                            <p className="font-semibold text-gray-900">{paymentDetails.accountName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleProceedToUpload}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-[1.02] shadow-lg"
                            >
                                I've Made the Payment →
                            </button>
                        </div>
                    )}

                    {/* Step 2: Upload Payment Proof */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Payment Screenshot</h3>
                                <p className="text-gray-600">Please upload a clear screenshot of your payment confirmation</p>
                            </div>

                            {/* Upload Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all"
                            >
                                {previewUrl ? (
                                    <div className="space-y-4">
                                        <img
                                            src={previewUrl}
                                            alt="Payment proof preview"
                                            className="max-h-64 mx-auto rounded-lg shadow-md"
                                        />
                                        <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                            }}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                            <Upload size={32} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900">Drop your screenshot here</p>
                                            <p className="text-sm text-gray-500">or click to browse</p>
                                        </div>
                                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            <button
                                onClick={uploadPaymentProof}
                                disabled={!selectedFile || uploading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {uploading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </span>
                                ) : (
                                    'Submit Payment Proof'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 3: Status */}
                    {step === 3 && (
                        <div className="space-y-6 text-center py-8">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                <Clock size={40} className="text-emerald-600" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Under Review</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Your payment proof has been submitted successfully. Our admin team will verify and activate your account within 24 hours.
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
                                <p className="text-sm text-blue-800">
                                    <strong>What's next?</strong><br />
                                    You'll receive a notification once your payment is verified. You can check your subscription status anytime from your dashboard.
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
