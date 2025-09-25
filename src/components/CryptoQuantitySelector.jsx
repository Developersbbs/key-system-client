// components/CryptoQuantitySelector.jsx
import React, { useState, useEffect } from 'react';
import { Calculator, Minus, Plus, AlertCircle } from 'lucide-react';

const CryptoQuantitySelector = ({ 
  listing, 
  onQuantityChange, 
  currentPrice 
}) => {
  const [quantity, setQuantity] = useState(listing.minPurchase || 0.01);
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  useEffect(() => {
    if (listing) {
      const min = listing.minPurchase || 0.01;
      setQuantity(min);
      calculateAmount(min);
    }
  }, [listing]);

  useEffect(() => {
    calculateAmount(quantity);
  }, [quantity, currentPrice]);

  const calculateAmount = (qty) => {
    const amount = qty * currentPrice;
    setCalculatedAmount(amount);
    onQuantityChange(qty, amount);
  };

  const handleQuantityChange = (value) => {
    let newQuantity = parseFloat(value) || 0;
    
    // Validate against min purchase
    if (listing.minPurchase && newQuantity < listing.minPurchase) {
      newQuantity = listing.minPurchase;
    }
    
    // Validate against max purchase
    if (listing.maxPurchase && newQuantity > listing.maxPurchase) {
      newQuantity = listing.maxPurchase;
    }
    
    // Validate against available quantity
    if (newQuantity > listing.availableQuantity) {
      newQuantity = listing.availableQuantity;
    }
    
    setQuantity(newQuantity);
  };

  const incrementQuantity = (step = 0.01) => {
    const newQuantity = Math.min(
      quantity + step,
      listing.maxPurchase || listing.availableQuantity,
      listing.availableQuantity
    );
    setQuantity(parseFloat(newQuantity.toFixed(8)));
  };

  const decrementQuantity = (step = 0.01) => {
    const newQuantity = Math.max(
      quantity - step,
      listing.minPurchase || 0.01
    );
    setQuantity(parseFloat(newQuantity.toFixed(8)));
  };

  const getStepSize = () => {
    if (quantity >= 100) return 1;
    if (quantity >= 10) return 0.1;
    if (quantity >= 1) return 0.01;
    return 0.001;
  };

  if (!listing) return null;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Select Quantity</h3>
        <Calculator className="text-blue-600" size={20} />
      </div>

      {/* Available Quantity Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex justify-between text-sm">
          <span className="text-blue-700">Available:</span>
          <span className="font-medium text-blue-900">
            {listing.availableQuantity} {listing.cryptoType}
          </span>
        </div>
        {listing.minPurchase && (
          <div className="flex justify-between text-sm mt-1">
            <span className="text-blue-700">Min Purchase:</span>
            <span className="font-medium text-blue-900">
              {listing.minPurchase} {listing.cryptoType}
            </span>
          </div>
        )}
        {listing.maxPurchase && (
          <div className="flex justify-between text-sm mt-1">
            <span className="text-blue-700">Max Purchase:</span>
            <span className="font-medium text-blue-900">
              {listing.maxPurchase} {listing.cryptoType}
            </span>
          </div>
        )}
      </div>

      {/* Quantity Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Quantity ({listing.cryptoType})
        </label>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => decrementQuantity(getStepSize())}
            disabled={quantity <= (listing.minPurchase || 0.01)}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <Minus size={16} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              min={listing.minPurchase || 0.01}
              max={Math.min(listing.maxPurchase || Infinity, listing.availableQuantity)}
              step={getStepSize()}
              className="w-full p-3 border border-gray-300 rounded-lg text-center font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {listing.cryptoType}
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => incrementQuantity(getStepSize())}
            disabled={quantity >= Math.min(listing.maxPurchase || listing.availableQuantity, listing.availableQuantity)}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Quick Selection Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[0.1, 0.5, 1, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleQuantityChange(value)}
              disabled={value > listing.availableQuantity || (listing.maxPurchase && value > listing.maxPurchase)}
              className="p-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {value} {listing.cryptoType}
            </button>
          ))}
        </div>
      </div>

      {/* Calculation Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Unit Price:</span>
          <span className="font-medium">${currentPrice}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-mono font-medium">
            {quantity} {listing.cryptoType}
          </span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900">Total Amount:</span>
            <span className="text-green-600">${calculatedAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {quantity < (listing.minPurchase || 0.01) && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle size={16} className="mr-1" />
          Minimum purchase is {listing.minPurchase} {listing.cryptoType}
        </div>
      )}
      
      {listing.maxPurchase && quantity > listing.maxPurchase && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle size={16} className="mr-1" />
          Maximum purchase is {listing.maxPurchase} {listing.cryptoType}
        </div>
      )}
      
      {quantity > listing.availableQuantity && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle size={16} className="mr-1" />
          Only {listing.availableQuantity} {listing.cryptoType} available
        </div>
      )}
    </div>
  );
};

export default CryptoQuantitySelector;