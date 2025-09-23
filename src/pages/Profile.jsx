// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Upload, QrCode, Trash2, ImageIcon, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { updatePaymentDetails, fetchUserProfile } from '../redux/features/userProfileSlice/userProfileSlice';
import { uploadQRCode, deleteFileFromFirebase } from '../utils/uploadUtils';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { profile, loading } = useSelector(state => state.userProfile);

  const [qrFile, setQrFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [qrImageError, setQrImageError] = useState(false);
  const [qrImageLoading, setQrImageLoading] = useState(false);
  const qrImageRetryCount = useRef(0);

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    qrCodeUrl: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: ''
  });

  // Load profile on mount
  useEffect(() => {
    if (user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  // Sync local state when profile changes
  useEffect(() => {
    if (profile) {
      setPaymentDetails({
        upiId: profile.paymentDetails?.upiId || '',
        qrCodeUrl: profile.paymentDetails?.qrCodeUrl || '',
        accountHolderName: profile.paymentDetails?.accountHolderName || '',
        accountNumber: profile.paymentDetails?.accountNumber || '',
        ifscCode: profile.paymentDetails?.ifscCode || '',
        bankName: profile.paymentDetails?.bankName || ''
      });
      // Reset image error state and retry count when new QR URL is loaded
      setQrImageError(false);
      qrImageRetryCount.current = 0;
    }
  }, [profile]);

  // Handle QR image error
  const handleQrImageError = () => {
    if (qrImageRetryCount.current < 3) {
      // Retry loading the image with a cache-busting parameter
      setTimeout(() => {
        qrImageRetryCount.current += 1;
        setQrImageError(false);
        setQrImageLoading(true);
      }, 1000 * qrImageRetryCount.current);
    } else {
      setQrImageError(true);
      setQrImageLoading(false);
    }
  };

  // Handle QR image load success
  const handleQrImageLoad = () => {
    setQrImageLoading(false);
    setQrImageError(false);
    qrImageRetryCount.current = 0;
  };

  // Retry loading QR image
  const retryQrImage = () => {
    qrImageRetryCount.current = 0;
    setQrImageError(false);
    setQrImageLoading(true);
  };

  // Get QR URL with cache busting
  const getQrUrlWithCacheBusting = () => {
    if (!paymentDetails.qrCodeUrl) return '';
    return `${paymentDetails.qrCodeUrl}${paymentDetails.qrCodeUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  };

  // Handle QR file selection
  const handleQRFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    setQrFile(file);
  };

  // Upload QR Code to Firebase
  const handleUploadQR = async () => {
    if (!qrFile) {
      toast.error('Please select a QR code image');
      return;
    }

    if (!user?._id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsUploading(true);

      // Delete old QR code from Firebase if exists
      if (paymentDetails.qrCodeUrl) {
        try {
          await deleteFileFromFirebase(paymentDetails.qrCodeUrl);
        } catch (deleteError) {
          console.warn('Could not delete old QR code:', deleteError.message);
          // Continue with upload even if delete fails
        }
      }

      // Upload new QR code to Firebase
      const qrCodeUrl = await uploadQRCode(qrFile, user._id);

      // Update profile with new QR code URL
      await dispatch(updatePaymentDetails({ 
        ...paymentDetails,
        qrCodeUrl 
      })).unwrap();

      toast.success('QR code uploaded successfully!');
      setQrFile(null);
      setQrImageError(false);
      qrImageRetryCount.current = 0;

      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('QR Upload Error:', error);
      toast.error(error.message || 'Failed to upload QR code');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete QR Code from Firebase
  const handleDeleteQR = async () => {
    if (!paymentDetails.qrCodeUrl) return;

    if (!window.confirm("Remove this QR code? This will permanently delete the image.")) {
      return;
    }

    try {
      setIsDeleting(true);

      // Delete from Firebase Storage
      await deleteFileFromFirebase(paymentDetails.qrCodeUrl);

      // Update profile to remove QR code URL
      await dispatch(updatePaymentDetails({ 
        ...paymentDetails,
        qrCodeUrl: "" 
      })).unwrap();

      toast.success('QR code removed successfully!');
      setQrImageError(false);
      qrImageRetryCount.current = 0;

    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to remove QR code');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save other payment details
  const handleSavePaymentDetails = async () => {
    try {
      await dispatch(updatePaymentDetails(paymentDetails)).unwrap();
      toast.success('Payment details saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save payment details');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Debug Section
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info</h3>
        <div className="space-y-1 text-xs text-yellow-700">
          <p>User logged in: {user ? 'Yes' : 'No'}</p>
          <p>User ID: {user?._id || 'Not available'}</p>
          <p>QR in profile: {paymentDetails.qrCodeUrl ? 'Yes' : 'No'}</p>
          <p>QR image error: {qrImageError ? 'Yes' : 'No'}</p>
          <p>QR retry count: {qrImageRetryCount.current}</p>
          <p>Storage: Firebase</p>
        </div>
        <div className="mt-3 space-x-2">
          <button 
            onClick={retryQrImage}
            className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
          >
            Retry QR Load
          </button>
        </div>
      </div> */}

      {/* Payment QR Code Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <QrCode className="mr-2" size={20} />
            Payment QR Code
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload a QR code that buyers can scan to pay you directly (stored in Firebase)
          </p>
        </div>
        <div className="p-6">
          {paymentDetails.qrCodeUrl ? (
            <div className="flex flex-col items-start space-y-4">
              {/* QR Code Display with Error Handling */}
              <div className="relative">
                {qrImageError ? (
                  <div className="w-32 h-32 bg-gray-100 border rounded-lg flex flex-col items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 text-center mb-2">
                      QR Code<br />Unavailable
                    </span>
                    <button 
                      onClick={retryQrImage}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <RefreshCw size={10} />
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {qrImageLoading && (
                      <div className="absolute inset-0 w-32 h-32 bg-gray-100 border rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    <img
                      src={getQrUrlWithCacheBusting()}
                      alt="Payment QR Code"
                      className="w-32 h-32 border rounded-lg object-contain"
                      onError={handleQrImageError}
                      onLoad={handleQrImageLoad}
                      onLoadStart={() => setQrImageLoading(true)}
                      style={{ display: qrImageLoading ? 'none' : 'block' }}
                    />
                  </div>
                )}
              </div>

              {/* QR Code Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full max-w-md">
                <p className="text-sm text-green-800">
                  <strong>QR Code Active:</strong> Buyers can scan this to pay you directly
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Stored securely in Firebase Storage
                </p>
              </div>

              {/* Error Message for Failed QR */}
              {qrImageError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full max-w-md">
                  <p className="text-sm text-red-800">
                    <strong>QR Code Error:</strong> Unable to display your QR code
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    The image may be corrupted or the link expired. Consider uploading a new one.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteQR}
                  disabled={isDeleting}
                  className="flex items-center text-red-600 hover:text-red-800 disabled:opacity-50 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} className="mr-1" />
                  {isDeleting ? 'Removing...' : 'Remove QR Code'}
                </button>
                
                {qrImageError && (
                  <button
                    onClick={() => {
                      setPaymentDetails(prev => ({ ...prev, qrCodeUrl: '' }));
                      setQrImageError(false);
                    }}
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Upload size={16} className="mr-1" />
                    Upload New QR
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Why upload a QR code?</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Buyers can pay you instantly by scanning</li>
                  <li>• No need to share UPI ID manually</li>
                  <li>• Faster and more convenient transactions</li>
                  <li>• Works with all UPI apps (PhonePe, Paytm, GPay, etc.)</li>
                  <li>• Securely stored in Firebase Storage</li>
                </ul>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleQRFileSelect}
                disabled={isUploading}
                className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          disabled:opacity-50"
              />

              {qrFile && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p><strong>Selected:</strong> {qrFile.name}</p>
                      <p><strong>Size:</strong> {(qrFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p><strong>Type:</strong> {qrFile.type}</p>
                    </div>
                    <button
                      onClick={() => {
                        setQrFile(null);
                        const fileInput = document.querySelector('input[type="file"]');
                        if (fileInput) fileInput.value = '';
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
              
              {qrFile && (
                <button
                  onClick={handleUploadQR}
                  disabled={isUploading || loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Uploading to Firebase...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Upload QR Code
                    </>
                  )}
                </button>
              )}
              
              {!qrFile && (
                <div className="text-sm text-gray-500 space-y-2">
                  <p>Select an image (max 5MB) to upload your QR code to Firebase.</p>
                  <p className="text-xs">
                    <strong>Tip:</strong> Generate your QR code from your UPI app (PhonePe, GPay, etc.) 
                    and take a screenshot to upload here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Additional Payment Methods Section
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Other Payment Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add UPI ID and bank details as backup payment methods
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                value={paymentDetails.upiId}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
                placeholder="yourname@upi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                value={paymentDetails.accountHolderName}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                placeholder="Full name as per bank"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={paymentDetails.accountNumber}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Bank account number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                value={paymentDetails.ifscCode}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, ifscCode: e.target.value }))}
                placeholder="Bank IFSC code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={paymentDetails.bankName}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, bankName: e.target.value }))}
                placeholder="Name of your bank"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={handleSavePaymentDetails}
            disabled={loading}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Payment Details'}
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default Profile;