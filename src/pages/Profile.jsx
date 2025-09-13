// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Upload, QrCode, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';
import { updatePaymentDetails, fetchUserProfile } from '../redux/features/userProfileSlice/userProfileSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { profile, loading } = useSelector(state => state.userProfile);

  const [qrFile, setQrFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    }
  }, [profile]);

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

  // Test auth endpoints
  const testAuth = async () => {
    try {
      console.log('Testing profile endpoint...');
      const profileResponse = await apiClient.get('/users/profile');
      console.log('Profile:', profileResponse.data);

      console.log('Testing upload endpoint...');
      const uploadResponse = await apiClient.get('/uploads/test');
      console.log('Upload:', uploadResponse.data);

      toast.success('Auth works for both profile & upload endpoints!');
    } catch (err) {
      console.error('Auth test failed:', err);
      toast.error('Auth test failed – check console.');
    }
  };

  // Upload QR Code
  const handleUploadQR = async () => {
    if (!qrFile) {
      toast.error('Please select a QR code image');
      return;
    }

    try {
      setIsUploading(true);

      // 1. Get presigned URL
      const { data } = await apiClient.post('/uploads/qr-code', {
        fileName: qrFile.name,
        fileType: qrFile.type,
        fileSize: qrFile.size,
      });

      const { uploadUrl, finalUrl } = data;

      if (!uploadUrl || !finalUrl) {
        throw new Error('Invalid response from server');
      }

      // 2. Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': qrFile.type },
        body: qrFile,
      });

      // 3. Update profile
      await dispatch(updatePaymentDetails({ qrCodeUrl: finalUrl })).unwrap();

      toast.success('QR code uploaded successfully!');
      setQrFile(null);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('QR Upload Error:', err);
      toast.error(err.message || 'Failed to upload QR code');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete QR Code
  const handleDeleteQR = async () => {
    if (!paymentDetails.qrCodeUrl) return;

    if (!window.confirm("Remove this QR code?")) return;

    try {
      setIsDeleting(true);
      await dispatch(updatePaymentDetails({ qrCodeUrl: "" })).unwrap();
      toast.success('QR code removed successfully!');
    } catch (err) {
      toast.error(err || 'Failed to remove QR code');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Debug Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info</h3>
        <div className="space-y-1 text-xs text-yellow-700">
          <p>User logged in: {user ? 'Yes' : 'No'}</p>
          <p>QR in profile: {paymentDetails.qrCodeUrl ? 'Yes' : 'No'}</p>
        </div>
        <div className="mt-3 space-x-2">
          <button 
            onClick={testAuth}
            className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
          >
            Test Auth
          </button>
        </div>
      </div>

      {/* Payment QR Code Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <QrCode className="mr-2" size={20} />
            Payment QR Code
          </h2>
        </div>
        <div className="p-6">
          {paymentDetails.qrCodeUrl ? (
            <div className="flex flex-col items-start space-y-4">
              <img
                src={paymentDetails.qrCodeUrl}
                alt="Payment QR Code"
                className="w-32 h-32 border rounded"
              />
              <button
                onClick={handleDeleteQR}
                disabled={isDeleting}
                className="flex items-center text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                <Trash2 size={16} className="mr-1" />
                {isDeleting ? 'Removing...' : 'Remove QR Code'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
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
                          hover:file:bg-blue-100"
              />

              {qrFile && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <p><strong>Selected:</strong> {qrFile.name}</p>
                  <p><strong>Size:</strong> {(qrFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p><strong>Type:</strong> {qrFile.type}</p>
                </div>
              )}
              
              {qrFile && (
                <button
                  onClick={handleUploadQR}
                  disabled={isUploading || loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Uploading...
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
                <p className="text-sm text-gray-500">Select an image (max 5MB) to upload your QR code.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
