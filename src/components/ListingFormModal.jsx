import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const ListingFormModal = ({ isOpen, onClose, onSubmit }) => {
  const { loading } = useSelector(state => state.listings);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'Used - Good',
    imageUrl: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
        return toast.error("Please provide an image URL for the listing.");
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Create New Listing</h3>
            <button type="button" onClick={onClose}><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <input type="text" name="title" placeholder="Item Title" onChange={handleInputChange} className="w-full p-2 border rounded" required />
            <textarea name="description" placeholder="Item Description" onChange={handleInputChange} className="w-full p-2 border rounded" rows="3" required />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" name="price" placeholder="Price ($)" onChange={handleInputChange} className="w-full p-2 border rounded" required min="0" />
              <input type="text" name="category" placeholder="Category" onChange={handleInputChange} className="w-full p-2 border rounded" required />
            </div>
            <select name="condition" onChange={handleInputChange} defaultValue="Used - Good" className="w-full p-2 border rounded bg-white">
              <option>New</option>
              <option>Used - Like New</option>
              <option>Used - Good</option>
              <option>Used - Fair</option>
            </select>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
              <input 
                type="url" 
                name="imageUrl" 
                id="imageUrl" 
                className="w-full p-2 border rounded" 
                placeholder="https://example.com/image.png"
                value={formData.imageUrl} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end">
            <button type="submit"  className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
              {loading ? 'Posting...' : 'Post Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingFormModal;