// components/CryptoBuyModal.jsx - Complete with proof upload
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Upload, Check, AlertCircle, CreditCard, QrCode, Calculator, ImageIcon } from 'lucide-react';
import { createTransaction } from '../redux/features/transactions/transactionSlice';
import { fetchSellerPaymentDetails } from '../redux/features/userProfileSlice/userProfileSlice';
import { updateListingQuantity } from '../redux/features/listings/listingSlice'; 
import CryptoQuantitySelector from './CryptoQuantitySelector';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { uploadFile } from '../utils/fileUpload';

const CryptoBuyModal = ({ isOpen, onClose, listing }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.transactions);
  const { sellerPayment, loading: paymentLoading } = useSelector(state => state.userProfile);
  
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('quantity'); // 'quantity', 'details', 'upload', 'confirm'
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(listing?.price || 0);
  const [proofUrl, setProofUrl] = useState(null);
  const [qrImageError, setQrImageError] = useState(false);
  const [qrImageLoading, setQrImageLoading] = useState(false);

  // Fetch current crypto price
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      const mockPrice = listing?.price * (0.95 + Math.random() * 0.1);
      setCurrentPrice(parseFloat(mockPrice.toFixed(2)));
    };

    if (listing) {
      fetchCurrentPrice();
      const interval = setInterval(fetchCurrentPrice, 30000);
      return () => clearInterval(interval);
    }
  }, [listing]);

  // Fetch seller payment details
  useEffect(() => {
    if (isOpen && listing?.postedBy?._id && step === 'details') {
      dispatch(fetchSellerPaymentDetails(listing.postedBy._id))
        .unwrap()
        .catch((error) => {
          console.error('Error fetching seller payment details:', error);
          toast.error(`Could not load seller payment details: ${error}`);
        });
    }
  }, [isOpen, listing, dispatch, step]);

  // Reset QR image error state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQrImageError(false);
      setQrImageLoading(false);
    }
  }, [isOpen]);

  const handleQrImageError = () => {
    setQrImageError(true);
    setQrImageLoading(false);
  };

  const handleQrImageLoad = () => {
    setQrImageLoading(false);
  };

  const handleQuantityChange = (quantity, amount) => {
    setSelectedQuantity(quantity);
    setTotalAmount(amount);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    
    if (file && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    setProofFile(file);
    handleProofUpload(file);
  };

  const handleProofUpload = async (file) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const downloadURL = await uploadFile(file, `transactions/${listing._id}/proofs`);
      setProofUrl(downloadURL);
      toast.success('Proof uploaded successfully!');
    } catch (error) {
      console.error('Proof upload error:', error);
      toast.error('Failed to upload proof: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!proofUrl) {
      toast.error('Please upload a payment proof');
      return;
    }

    if (selectedQuantity <= 0) {
      toast.error('Please select a valid quantity');
      return;
    }

    try {
      setUploading(true);
      
      const resultAction = await dispatch(createTransaction({
        listingId: listing._id,
        quantity: selectedQuantity,
        totalAmount: totalAmount,
        proofOfPaymentUrl: proofUrl,
        cryptoType: listing.cryptoType
      }));

      if (createTransaction.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || 'Failed to submit transaction');
      }

      // Note: Quantity will be updated when admin approves the transaction
      // No immediate quantity update here

      toast.success(`Transaction submitted for ${selectedQuantity} ${listing.cryptoType}!`);
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
    setStep('quantity');
    setSelectedQuantity(0);
    setTotalAmount(0);
    setProofFile(null);
    setProofUrl(null);
    setQrImageError(false);
    setQrImageLoading(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  if (paymentLoading && step === 'details') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">
            Buy {listing?.cryptoType}: {listing?.title}
          </h3>
          <button type="button" onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Progress */}
          <div className="flex items-center justify-between">
            {['quantity', 'details', 'upload'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`flex items-center ${step === stepName ? 'text-green-600' : 
                  index < ['quantity', 'details', 'upload'].indexOf(step) ? 'text-green-700' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    step === stepName ? 'border-green-600 bg-green-50' : 
                    index < ['quantity', 'details', 'upload'].indexOf(step) ? 'border-green-700 bg-green-100' : 'border-gray-300'
                  }`}>
                    {index < ['quantity', 'details', 'upload'].indexOf(step) ? <Check size={16} /> : index + 1}
                  </div>
                  <span className="ml-2 text-sm capitalize">{stepName}</span>
                </div>
                {index < 2 && <div className="w-8 h-0.5 bg-green-300 mx-2"></div>}
              </div>
            ))}
          </div>

          {/* Step 1: Quantity Selection */}
          {step === 'quantity' && listing && (
            <div className="space-y-4">
              <CryptoQuantitySelector 
                listing={listing}
                onQuantityChange={handleQuantityChange}
                currentPrice={currentPrice}
              />
              
              <div className="flex justify-between">
                <button
                  onClick={handleClose}
                  className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('details')}
                  disabled={selectedQuantity <= 0 || selectedQuantity > listing.availableQuantity}
                  className="bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {step === 'details' && sellerPayment && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Order Summary</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Quantity:</strong> {selectedQuantity} {listing.cryptoType}</p>
                  <p><strong>Unit Price:</strong> ${currentPrice.toFixed(2)}</p>
                  <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</p>
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
                      <strong>UPI ID:</strong> 
                      <span className="ml-2 font-mono bg-white px-2 py-1 rounded border">
                        {sellerPayment.paymentDetails.upiId}
                      </span>
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Send exactly ${totalAmount.toFixed(2)} to this UPI ID
                    </p>
                  </div>
                )}

                {/* QR Code Payment Option */}
                {sellerPayment.paymentDetails?.qrCodeUrl && (
                  <div className="mb-4 p-3 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center mb-2">
                      <QrCode className="text-green-600 mr-2" size={16} />
                      <h5 className="font-medium text-green-800">Scan QR Code</h5>
                    </div>
                    <div className="text-center">
                      {qrImageError ? (
                        <div className="w-32 h-32 mx-auto bg-gray-100 border rounded-lg flex flex-col items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500">QR Code</span>
                          <span className="text-xs text-gray-500">Unavailable</span>
                          <button 
                            onClick={() => {
                              setQrImageError(false);
                              setQrImageLoading(true);
                            }}
                            className="text-xs text-green-600 hover:underline mt-1"
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          {qrImageLoading && (
                            <div className="absolute inset-0 w-32 h-32 mx-auto bg-gray-100 border rounded-lg flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                            </div>
                          )}
                          <img 
                            src={sellerPayment.paymentDetails.qrCodeUrl} 
                            alt="Payment QR Code" 
                            className="w-32 h-32 object-contain mx-auto border rounded-lg"
                            onError={handleQrImageError}
                            onLoad={handleQrImageLoad}
                            onLoadStart={() => setQrImageLoading(true)}
                            style={{ display: qrImageLoading ? 'none' : 'block' }}
                          />
                        </div>
                      )}
                      <p className="text-xs text-green-600 mt-2">
                        Scan with any UPI app to pay ${totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bank Details if available */}
                {(sellerPayment.paymentDetails?.accountNumber || sellerPayment.paymentDetails?.ifscCode) && (
                  <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center mb-2">
                      <CreditCard className="text-green-600 mr-2" size={16} />
                      <h5 className="font-medium text-green-800">Bank Transfer</h5>
                    </div>
                    <div className="space-y-1 text-sm text-green-700">
                      {sellerPayment.paymentDetails.accountHolderName && (
                        <p>
                          <strong>Account Holder:</strong> 
                          <span className="ml-2 font-mono bg-white px-2 py-1 rounded border">
                            {sellerPayment.paymentDetails.accountHolderName}
                          </span>
                        </p>
                      )}
                      {sellerPayment.paymentDetails.accountNumber && (
                        <p>
                          <strong>Account Number:</strong> 
                          <span className="ml-2 font-mono bg-white px-2 py-1 rounded border">
                            {sellerPayment.paymentDetails.accountNumber}
                          </span>
                        </p>
                      )}
                      {sellerPayment.paymentDetails.ifscCode && (
                        <p>
                          <strong>IFSC Code:</strong> 
                          <span className="ml-2 font-mono bg-white px-2 py-1 rounded border">
                            {sellerPayment.paymentDetails.ifscCode}
                          </span>
                        </p>
                      )}
                      {sellerPayment.paymentDetails.bankName && (
                        <p>
                          <strong>Bank:</strong> 
                          <span className="ml-2 bg-white px-2 py-1 rounded border">
                            {sellerPayment.paymentDetails.bankName}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Show message if no payment methods available */}
                {!sellerPayment.paymentDetails?.upiId && 
                 !sellerPayment.paymentDetails?.qrCodeUrl && 
                 !sellerPayment.paymentDetails?.accountNumber && (
                  <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div className="flex items-center">
                      <AlertCircle className="text-yellow-600 mr-2" size={16} />
                      <p className="text-sm text-yellow-800">
                        Seller has not set up payment details yet. Please contact the seller directly.
                      </p>
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
                      <li>Pay exactly ${totalAmount.toFixed(2)}</li>
                      <li>Take a screenshot after payment</li>
                      <li>Upload the proof in the next step</li>
                      <li>Wait for admin approval</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('quantity')}
                  className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('upload')}
                  disabled={!sellerPayment.paymentDetails?.upiId && 
                           !sellerPayment.paymentDetails?.qrCodeUrl && 
                           !sellerPayment.paymentDetails?.accountNumber}
                  className="bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  I've Made the Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Proof */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-semibold mb-2">Upload Payment Proof</h4>
                <p className="text-sm text-gray-600">
                  Please upload a screenshot of your payment confirmation for {selectedQuantity} {listing.cryptoType}
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
                      onClick={() => {
                        setProofFile(null);
                        setProofUrl(null);
                      }}
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
                        <span className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
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

              {uploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Uploading proof...</p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('details')}
                  className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitTransaction}
                  disabled={!proofUrl || uploading || loading}
                  className="bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploading || loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Complete Transaction'
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

export default CryptoBuyModal;