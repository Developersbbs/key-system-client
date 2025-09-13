import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Upload, Check, AlertCircle, CreditCard, QrCode } from 'lucide-react';
import { createTransaction } from '../redux/features/transactions/transactionSlice';
import { fetchSellerPaymentDetails } from '../redux/features/userProfileSlice/userProfileSlice';
import apiClient from '../api/apiClient'; // Use your existing API client
import toast from 'react-hot-toast';

const BuyModal = ({ isOpen, onClose, listing }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.transactions);
  const { sellerPayment, loading: paymentLoading } = useSelector(state => state.userProfile);
  
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('details'); // 'details', 'upload', 'confirm'

  // Fetch seller payment details when modal opens
  useEffect(() => {
    if (isOpen && listing?.postedBy?._id) {
      dispatch(fetchSellerPaymentDetails(listing.postedBy._id))
        .unwrap()
        .catch((error) => {
          console.error('Error fetching seller payment details:', error);
          toast.error(`Could not load seller payment details: ${error}`);
          onClose();
        });
    }
  }, [isOpen, listing, dispatch, onClose]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size should be less than 5MB');
      return;
    }
    
    if (file && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    setProofFile(file);
  };

  const uploadToS3 = async (file) => {
    try {
      console.log('Starting S3 upload for file:', file.name);
      
      // Step 1: Get presigned URL from your backend using apiClient
      const presignedResponse = await apiClient.post('/uploads/payment-proof', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      console.log('Presigned response received:', presignedResponse.data);
      
      const { uploadUrl, finalUrl } = presignedResponse.data;

      if (!uploadUrl || !finalUrl) {
        throw new Error('Invalid response from server: missing upload URL or final URL');
      }

      console.log('Uploading to S3 URL:', uploadUrl);

      // Step 2: Upload file directly to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      console.log('S3 upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 upload failed:', errorText);
        throw new Error(`S3 upload failed with status ${uploadResponse.status}: ${errorText}`);
      }

      console.log('File uploaded successfully to:', finalUrl);
      return finalUrl;
    } catch (error) {
      console.error('S3 Upload Error Details:', error);
      
      // More specific error messages based on the error type
      if (error.response) {
        // API client error (axios)
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || 'Unknown server error';
        throw new Error(`Server error (${status}): ${message}`);
      } else if (error.request) {
        // Network error
        throw new Error('Network error: Please check your internet connection');
      } else {
        // Other errors
        throw new Error(error.message || 'Unknown error occurred during upload');
      }
    }
  };

  const handleSubmitTransaction = async () => {
    if (!proofFile) {
      toast.error('Please upload payment proof');
      return;
    }

    if (!listing?._id) {
      toast.error('Invalid listing information');
      return;
    }

    try {
      setUploading(true);
      
      console.log('Starting transaction submission...');
      const proofUrl = await uploadToS3(proofFile);
      console.log('Upload successful, creating transaction...');
      
      await dispatch(createTransaction({
        listingId: listing._id,
        proofOfPaymentUrl: proofUrl
      })).unwrap();

      toast.success('Transaction submitted for approval!');
      onClose();
      resetModal();
    } catch (error) {
      console.error('Transaction submission error:', error);
      toast.error(error.message || 'Failed to submit transaction');
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setStep('details');
    setProofFile(null);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  if (paymentLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">
            Buy: {listing?.title}
          </h3>
          <button type="button" onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
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
          {step === 'details' && sellerPayment && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Item Details</h4>
                <div className="text-sm text-blue-800">
                  <p>
                    <strong>Price:</strong> ₹{listing?.price || "N/A"}
                  </p>
                  <p><strong>Seller:</strong> {sellerPayment.sellerName || "Unknown"}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Instructions</h4>
                
                {/* UPI Payment Option */}
                {sellerPayment.paymentDetails?.upiId && (
                  <div className="mb-4 p-3 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center mb-2">
                      <CreditCard className="text-green-600 mr-2" size={16} />
                      <h5 className="font-medium text-green-800">UPI Payment</h5>
                    </div>
                    <p className="text-sm text-green-700">
                      <strong>UPI ID:</strong> {sellerPayment.paymentDetails.upiId}
                    </p>
                  </div>
                )}

                {/* QR Code Payment Option */}
                {sellerPayment.paymentDetails?.qrCodeUrl && (
                  <div className="mb-4 p-3 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="flex items-center mb-2">
                      <QrCode className="text-purple-600 mr-2" size={16} />
                      <h5 className="font-medium text-purple-800">Scan QR Code</h5>
                    </div>
                    <div className="text-center">
                      <img 
                        src={sellerPayment.paymentDetails.qrCodeUrl} 
                        alt="Payment QR Code" 
                        className="w-32 h-32 object-contain mx-auto border rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Bank Details if available */}
                {(sellerPayment.paymentDetails?.accountNumber || sellerPayment.paymentDetails?.ifscCode) && (
                  <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center mb-2">
                      <CreditCard className="text-blue-600 mr-2" size={16} />
                      <h5 className="font-medium text-blue-800">Bank Transfer</h5>
                    </div>
                    <div className="space-y-1 text-sm text-blue-700">
                      {sellerPayment.paymentDetails.accountHolderName && (
                        <p><strong>Account Holder:</strong> {sellerPayment.paymentDetails.accountHolderName}</p>
                      )}
                      {sellerPayment.paymentDetails.accountNumber && (
                        <p><strong>Account Number:</strong> {sellerPayment.paymentDetails.accountNumber}</p>
                      )}
                      {sellerPayment.paymentDetails.ifscCode && (
                        <p><strong>IFSC Code:</strong> {sellerPayment.paymentDetails.ifscCode}</p>
                      )}
                      {sellerPayment.paymentDetails.bankName && (
                        <p><strong>Bank:</strong> {sellerPayment.paymentDetails.bankName}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" size={16} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Pay exactly ₹{listing?.price || "N/A"}</li>
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

          {/* Error state when no payment details */}
          {step === 'details' && !sellerPayment && !paymentLoading && (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h4 className="text-lg font-semibold text-red-700 mb-2">Payment Details Not Available</h4>
              <p className="text-red-600 mb-4">The seller has not set up their payment details yet.</p>
              <button 
                onClick={handleClose}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
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
                    <p className="text-xs text-gray-500">
                      Size: {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
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
                    <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
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
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploading || loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Transaction'
                  )}
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