// components/ListingFormModal.jsx - Fixed version
import React, { useState } from 'react';
import { X, Coins } from 'lucide-react';

const ListingFormModal = ({ isOpen, onClose, onSubmit, cryptoTypes }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Cryptocurrency', // Default category since it's required
    cryptoType: 'BTC',
    availableQuantity: '',
    minPurchase: '',
    maxPurchase: '',
    paymentMethods: [],
    terms: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (parseFloat(formData.availableQuantity) <= 0) {
      alert('Available quantity must be greater than 0');
      return;
    }
    
    if (formData.minPurchase && parseFloat(formData.minPurchase) <= 0) {
      alert('Minimum purchase must be greater than 0');
      return;
    }
    
    if (formData.maxPurchase && parseFloat(formData.maxPurchase) < parseFloat(formData.minPurchase || 0)) {
      alert('Maximum purchase must be greater than minimum purchase');
      return;
    }
    
    // Call onSubmit first, then reset form on success
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const updatedMethods = checked 
        ? [...formData.paymentMethods, value]
        : formData.paymentMethods.filter(method => method !== value);
      
      setFormData(prev => ({ ...prev, paymentMethods: updatedMethods }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'Cryptocurrency',
      cryptoType: 'BTC',
      availableQuantity: '',
      minPurchase: '',
      maxPurchase: '',
      paymentMethods: [],
      terms: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto px-4 py-10">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">Sell Cryptocurrency</h3>
          <button type="button" onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crypto Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cryptocurrency Type *
              </label>
              <select
                name="cryptoType"
                value={formData.cryptoType}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {cryptoTypes.map(crypto => (
                  <option key={crypto} value={crypto}>{crypto}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per coin (USD) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Available Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Quantity *
              </label>
              <input
                type="number"
                name="availableQuantity"
                value={formData.availableQuantity}
                onChange={handleChange}
                step="0.00000001"
                min="0.00000001"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00000000"
              />
            </div>

            {/* Minimum Purchase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Purchase (optional)
              </label>
              <input
                type="number"
                name="minPurchase"
                value={formData.minPurchase}
                onChange={handleChange}
                step="0.00000001"
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00000000"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Selling BTC at competitive rates"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your offer, payment methods, and terms..."
            />
          </div>

          {/* Payment Methods
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accepted Payment Methods
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Bank Transfer', 'UPI', 'PayPal', 'Cash', 'Other'].map(method => (
                <label key={method} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={method}
                    checked={formData.paymentMethods.includes(method)}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{method}</span>
                </label>
              ))}
            </div>
          </div> */}

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions (optional)
            </label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any specific terms for the transaction..."
            />
          </div>

          {/* Hidden category field */}
          <input type="hidden" name="category" value={formData.category} />

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Coins size={16} />
              Create Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingFormModal;