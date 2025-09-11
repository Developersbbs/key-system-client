import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
// You would need to create a Redux thunk to update user details
// import { updateUserDetails } from '../redux/features/auth/authSlice';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [upiId, setUpiId] = useState(user?.paymentDetails?.upiId || '');

  const handleSave = () => {
    // dispatch(updateUserDetails({ paymentDetails: { upiId } }))
    //  .unwrap()
    //  .then(() => toast.success("Payment details saved!"))
    //  .catch((err) => toast.error(err));
    toast.success("Payment details saved!"); // Placeholder
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4">My Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
        <label className="block text-sm font-medium text-gray-700">UPI ID</label>
        <input 
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="your-upi@oksbi"
          className="w-full p-2 border rounded mt-1"
        />
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4">
          Save Details
        </button>
      </div>
    </div>
  );
};

export default Profile;