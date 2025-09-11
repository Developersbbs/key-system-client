// components/BuyModal.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { createTransaction } from '../redux/features/transactions/transactionSlice';
import toast from 'react-hot-toast';

const BuyModal = ({ isOpen, onClose, listing }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.transactions);
  
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('details'); // 'details', 'upload', 'confirm'

  // Mock seller payment details - in real app, fetch from seller info
  const sellerPaymentDetails = {
    upiId: 'seller@paytm',
    accountHolderName: 'John Seller',
    accountNumber: '**** **** 1234',
    ifscCode: 'HDFC0001234'
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
      setProofFile(file);
   
  };

  const uploadToS3 = async (file) => {
    try {
      // Step 1: Get presigned URL from your backend
      const presignedResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileUrl } = await presignedResponse.json();

      // Step 2: Upload file directly to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      return fileUrl;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('Failed to upload image');
    }
  };

  // Alternative method using FormData (if your backend handles multipart upload)
  const uploadToS3Alternative = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'payment-proofs'); // Optional: organize files in folders
    
    try {
      const response = await fetch('/api/upload/s3', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.fileUrl; // or data.Location depending on your backend response
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmitTransaction = async () => {
    if (!proofFile) {
      toast.error('Please upload payment proof');
      return;
    }

    try {
      setUploading(true);
      
      // Use the presigned URL method (recommended for security)
      const proofUrl = await uploadToS3(proofFile);
      
      // Alternative: use the FormData method
      // const proofUrl = await uploadToS3Alternative(proofFile);
      
      await dispatch(createTransaction({
        listingId: listing._id,
        proofOfPaymentUrl: proofUrl
      })).unwrap();

      toast.success('Transaction submitted for approval!');
      onClose();
      setStep('details');
      setProofFile(null);
    } catch (error) {
      toast.error(error.message || 'Failed to submit transaction');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">
            Buy: {listing?.title}
          </h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Progress */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === 'details' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step === 'details' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm">Payment Details</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step === 'upload' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm">Upload Proof</span>
            </div>
          </div>

          {/* Step 1: Payment Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Item Details</h4>
                <div className="text-sm text-blue-800">
                  <p><strong>Price:</strong> ${listing?.price}</p>
                  <p><strong>Seller:</strong> {listing?.postedBy?.name}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Instructions</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>UPI ID:</strong> {sellerPaymentDetails.upiId}</p>
                  <p><strong>Account Holder:</strong> {sellerPaymentDetails.accountHolderName}</p>
                  <p><strong>Account Number:</strong> {sellerPaymentDetails.accountNumber}</p>
                  <p><strong>IFSC Code:</strong> {sellerPaymentDetails.ifscCode}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="text-yellow-600 mt-0.5 mr-2" size={16} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Pay exactly ${listing?.price}</li>
                      <li>Take a screenshot after payment</li>
                      <li>Upload the proof in the next step</li>
                      <li>Wait for admin approval</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep('upload')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                I've Made the Payment
              </button>
            </div>
          )}

          {/* Step 2: Upload Proof */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-semibold mb-2">Upload Payment Proof</h4>
                <p className="text-sm text-gray-600">
                  Please upload a screenshot of your payment confirmation
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {proofFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <Check className="text-green-500" size={48} />
                    </div>
                    <p className="text-sm font-medium">{proofFile.name}</p>
                    <button 
                      onClick={() => setProofFile(null)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="mx-auto text-gray-400" size={48} />
                    <div>
                      <label htmlFor="proof-upload" className="cursor-pointer">
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Choose File
                        </span>
                        <input 
                          id="proof-upload" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setStep('details')}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmitTransaction}
                  disabled={!proofFile || uploading || loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading || loading ? 'Submitting...' : 'Submit Transaction'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyModal;