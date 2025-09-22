import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

const EventFormModal = ({ isOpen, onClose, onSubmit }) => {
  // This component manages its own form data internally
  const [formData, setFormData] = useState({ description: '', eventDate: '', rate: '' });
  
  // Get the loading state from the Redux store to disable the button
  const { loading } = useSelector(state => state.events);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // If the modal is not set to be open, render nothing
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Post a New Event</h3>
            <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Description *</label>
                <textarea 
                    placeholder="Event Description" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full p-2 border border-gray-300 rounded-md" 
                    rows="4" 
                    required 
                />
            </div>
             <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Event Date *</label>
                <input 
                    type="date" 
                    value={formData.eventDate} 
                    onChange={(e) => setFormData({...formData, eventDate: e.target.value})} 
                    className="w-full p-2 border border-gray-300 rounded-md" 
                    required 
                />
            </div>
             <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Rate / Price ($) *</label>
                <input 
                    type="number" 
                    placeholder="0" 
                    value={formData.rate} 
                    onChange={(e) => setFormData({...formData, rate: e.target.value})} 
                    className="w-full p-2 border border-gray-300 rounded-md" 
                    required 
                    min="0" 
                />
            </div>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">
                Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50">
              {loading ? 'Posting...' : 'Post Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;