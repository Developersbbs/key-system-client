import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMembers, fetchAllAdmins, updateUserRole, updateUserLevels } from '../redux/features/members/memberSlice';
import { fetchAllLevels } from '../redux/features/level/levelSlice';
import { Users, ShieldCheck, Phone, Key, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Reusable Toggle Switch Component for Role
const RoleToggle = ({ user, currentUser, onToggle }) => {
  const isCurrentUser = user._id === currentUser?._id;
  return (
    <label htmlFor={`toggle-${user._id}`} className="flex items-center cursor-pointer">
      <div className="relative">
        <input 
          id={`toggle-${user._id}`} 
          type="checkbox" 
          className="sr-only" 
          checked={user.role === 'admin'}
          disabled={isCurrentUser}
          onChange={() => onToggle(user, user.role === 'admin' ? 'member' : 'admin')}
        />
        <div className={`block w-14 h-8 rounded-full transition ${user.role === 'admin' ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${user.role === 'admin' ? 'transform translate-x-6' : ''}`}></div>
      </div>
      <div className={`ml-3 font-medium text-sm ${isCurrentUser ? 'text-gray-400' : 'text-gray-700'}`}>
        Admin
      </div>
    </label>
  );
};

// Modal for managing multiple level access with checkboxes
const LevelAccessModal = ({ user, levels, onClose, onSave }) => {
  const [selectedLevels, setSelectedLevels] = useState(user.accessibleLevels || [1]);

  const handleToggle = (levelNumber) => {
    const newLevels = selectedLevels.includes(levelNumber)
      ? selectedLevels.filter(l => l !== levelNumber)
      : [...selectedLevels, levelNumber];
    setSelectedLevels(newLevels);
  };

  const handleSaveChanges = () => {
    onSave(user._id, selectedLevels);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Manage Levels for {user.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {levels.map(level => (
              <label key={level._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-teal-600"
                  checked={selectedLevels.includes(level.levelNumber)}
                  onChange={() => handleToggle(level.levelNumber)}
                />
                <span className="font-medium text-gray-800">Level {level.levelNumber}: {level.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Cancel</button>
          <button onClick={handleSaveChanges} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const AdminMembers = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [levelModalUser, setLevelModalUser] = useState(null);
  const dispatch = useDispatch();
  
  const { members, admins, error } = useSelector((state) => state.members);
  const { levels } = useSelector((state) => state.levels);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllMembers());
    dispatch(fetchAllAdmins());
    dispatch(fetchAllLevels());
  }, [dispatch]);

  const handleRoleChange = (user, newRole) => {
    if (window.confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      dispatch(updateUserRole({ userId: user._id, role: newRole }))
        .unwrap()
        .then(() => toast.success(`${user.name}'s role updated.`))
        .catch((err) => toast.error(err));
    }
  };

  const handleLevelSave = (userId, newLevels) => {
    dispatch(updateUserLevels({ userId, levels: newLevels }))
      .unwrap()
      .then(() => {
        toast.success("User's accessible levels updated.");
        setLevelModalUser(null);
      })
      .catch((err) => toast.error(err));
  };
  
  const TabButton = ({ tabName, label, count, icon: Icon }) => (
    <button onClick={() => setActiveTab(tabName)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === tabName ? 'bg-teal-100 text-teal-700' : 'text-gray-500 hover:bg-gray-100'}`}>
      <Icon size={16} />{label}<span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tabName ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{count}</span>
    </button>
  );

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center gap-2 mt-4 border-t pt-4">
          <TabButton tabName="members" label="Members" count={members.length} icon={Users} />
          <TabButton tabName="admins" label="Admins" count={admins.length} icon={ShieldCheck} />
        </div>
      </div>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">Error: {error}</div>}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
     
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access Control</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(activeTab === 'members' ? members : admins).map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Phone size={14} />{user.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleToggle user={user} currentUser={currentUser} onToggle={handleRoleChange} />
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'member' && (
                      <button onClick={() => setLevelModalUser(user)} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-semibold">
                        <Key size={16} /> Manage Levels
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        
      </div>

      {levelModalUser && (
        <LevelAccessModal 
          user={levelModalUser}
          levels={levels}
          onClose={() => setLevelModalUser(null)}
          onSave={handleLevelSave}
        />
      )}
    </div>
  );
};

export default AdminMembers;