import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMembers, fetchAllAdmins, updateUserRole, updateUserStatus } from '../redux/features/members/memberSlice';
import { fetchAllBatches, createBatch, updateBatch, addMembersToBatch, removeMemberFromBatch, deleteBatch } from '../redux/features/batches/batchSlice';
import { Users, ShieldCheck, Phone, X, Plus, Edit, Trash2, UserPlus, Package, ToggleLeft, ToggleRight, BarChart3, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';

// Reusable Toggle Switch Component for Role
const RoleToggle = ({ user, currentUser, onToggle }) => {
  const isCurrentUser = user._id === currentUser?._id;
  const isSuperAdmin = currentUser?.isSuperadmin === true;
  
  // Only show role toggle if current user is super admin
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.role === 'admin' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.role === 'admin' ? 'Admin' : 'Member'}
        </span>
      </div>
    );
  }

  return (
    <label htmlFor={`role-toggle-${user._id}`} className="flex items-center cursor-pointer">
      <div className="relative">
        <input 
          id={`role-toggle-${user._id}`} 
          type="checkbox" 
          className="sr-only" 
          checked={user.role === 'admin'}
          disabled={isCurrentUser}
          onChange={() => onToggle(user, user.role === 'admin' ? 'member' : 'admin')}
        />
        <div className={`block w-14 h-8 rounded-full transition ${user.role === 'admin' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${user.role === 'admin' ? 'transform translate-x-6' : ''}`}></div>
      </div>
      <div className={`ml-3 font-medium text-sm ${isCurrentUser ? 'text-gray-400' : 'text-gray-700'}`}>
        Admin
      </div>
    </label>
  );
};

// Reusable Toggle Switch Component for Active Status
const StatusToggle = ({ user, onToggle }) => {
  const isActive = user.isActive !== false; // Default to true if undefined
  
  return (
    <label htmlFor={`status-toggle-${user._id}`} className="flex items-center cursor-pointer">
      <div className="relative">
        <input 
          id={`status-toggle-${user._id}`} 
          type="checkbox" 
          className="sr-only" 
          checked={isActive}
          onChange={() => onToggle(user, !isActive)}
        />
        <div className={`block w-14 h-8 rounded-full transition ${isActive ? 'bg-green-600' : 'bg-gray-200'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isActive ? 'transform translate-x-6' : ''}`}></div>
      </div>
      <div className={`ml-3 font-medium text-sm ${isActive ? 'text-green-700' : 'text-gray-500'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </div>
    </label>
  );
};

// Modal for creating/editing batch
const BatchModal = ({ batch, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: batch?.name || '',
    description: batch?.description || '',
    startDate: batch?.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
    endDate: batch?.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{batch ? 'Edit Batch' : 'Create New Batch'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Spring 2025 Batch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="3"
              placeholder="Batch description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> All courses will be unlocked progressively for batch members. No level restrictions.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="bg-gray-200 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              {batch ? 'Update Batch' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for adding members to batch
const AddMembersToBatchModal = ({ batch, availableMembers, onClose, onSave }) => {
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(batch._id, selectedMembers);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Add Members to {batch.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 max-h-[50vh] overflow-y-auto">
            {availableMembers.length > 0 ? (
              <div className="space-y-2">
                {availableMembers.map(member => (
                  <label key={member._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-green-600"
                      checked={selectedMembers.includes(member._id)}
                      onChange={() => handleMemberToggle(member._id)}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.phoneNumber}</div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No available members to add</p>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={selectedMembers.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminMembers = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [batchModal, setBatchModal] = useState({ show: false, batch: null });
  const [addMembersModal, setAddMembersModal] = useState({ show: false, batch: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false); // Add loading state
  const dispatch = useDispatch();
  
  const { members, admins, error } = useSelector((state) => state.members);
  const { batches } = useSelector((state) => state.batches);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllMembers());
    dispatch(fetchAllAdmins());
    dispatch(fetchAllBatches());
  }, [dispatch]);

  // Filter members and admins based on search term
  const filteredMembers = members.filter(member => 
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phoneNumber?.includes(searchTerm)
  );
  
  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.phoneNumber?.includes(searchTerm)
  );

  const handleRoleChange = async (user, newRole) => {
    // Only allow super admins to change roles
    if (currentUser?.isSuperadmin !== true) {
      toast.error("Only super admins can change user roles.");
      return;
    }

    if (window.confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      setIsUpdating(true);
      try {
        await dispatch(updateUserRole({ userId: user._id, role: newRole })).unwrap();
        toast.success(`${user.name}'s role updated.`);
        
        // Refresh data immediately after successful update
        await Promise.all([
          dispatch(fetchAllMembers()),
          dispatch(fetchAllAdmins())
        ]);
      } catch (err) {
        toast.error(err?.message || 'Failed to update user role');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleStatusChange = async (user, newStatus) => {
    const statusText = newStatus ? 'activate' : 'deactivate';
    if (window.confirm(`${statusText.charAt(0).toUpperCase() + statusText.slice(1)} ${user.name}?`)) {
      setIsUpdating(true);
      try {
        await dispatch(updateUserStatus({ userId: user._id, isActive: newStatus })).unwrap();
        toast.success(`${user.name} has been ${statusText}d.`);
        
        // Refresh data immediately after successful update
        await Promise.all([
          dispatch(fetchAllMembers()),
          dispatch(fetchAllAdmins())
        ]);
      } catch (err) {
        toast.error(err?.message || 'Failed to update user status');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleBatchSave = async (batchData) => {
    try {
      const action = batchModal.batch 
        ? updateBatch({ id: batchModal.batch._id, data: batchData })
        : createBatch(batchData);

      await dispatch(action).unwrap();
      toast.success(`Batch ${batchModal.batch ? 'updated' : 'created'} successfully.`);
      setBatchModal({ show: false, batch: null });
      
      // Refresh data after batch operations
      await Promise.all([
        dispatch(fetchAllBatches()),
        dispatch(fetchAllMembers())
      ]);
    } catch (err) {
      toast.error(err?.message || 'Failed to save batch');
    }
  };

  const handleAddMembers = async (batchId, memberIds) => {
    try {
      await dispatch(addMembersToBatch({ batchId, memberIds })).unwrap();
      toast.success("Members added to batch successfully.");
      setAddMembersModal({ show: false, batch: null });
      
      // Refresh members and batches data
      await Promise.all([
        dispatch(fetchAllMembers()),
        dispatch(fetchAllBatches())
      ]);
    } catch (err) {
      toast.error(err?.message || 'Failed to add members to batch');
    }
  };

  const handleRemoveMemberFromBatch = async (batchId, memberId, memberName) => {
    if (window.confirm(`Remove ${memberName} from this batch?`)) {
      try {
        await dispatch(removeMemberFromBatch({ batchId, memberId })).unwrap();
        toast.success("Member removed from batch.");
        
        // Refresh data immediately
        await Promise.all([
          dispatch(fetchAllMembers()),
          dispatch(fetchAllBatches())
        ]);
      } catch (err) {
        toast.error(err?.message || 'Failed to remove member from batch');
      }
    }
  };

  const handleDeleteBatch = async (batchId, batchName) => {
    if (window.confirm(`Delete batch "${batchName}"? All members will be removed from this batch.`)) {
      try {
        await dispatch(deleteBatch(batchId)).unwrap();
        toast.success("Batch deleted successfully.");
        
        // Refresh data immediately
        await Promise.all([
          dispatch(fetchAllMembers()),
          dispatch(fetchAllBatches())
        ]);
      } catch (err) {
        toast.error(err?.message || 'Failed to delete batch');
      }
    }
  };

  // Get members not in any batch for the add members modal
  const getAvailableMembers = (currentBatch) => {
    if (!currentBatch) {
      // For new batch creation, show all members without a batch
      return members.filter(member => !member.batch);
    }
    
    // For existing batch editing, show members without a batch OR members already in this batch
    return members.filter(member => 
      !member.batch || 
      (member.batch && member.batch._id === currentBatch._id)
    );
  };
  
  const TabButton = ({ tabName, label, count, icon: Icon }) => (
    <button onClick={() => setActiveTab(tabName)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === tabName ? 'bg-green-100 text-green-800 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
      <Icon size={16} />{label}<span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tabName ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{count}</span>
    </button>
  );

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.isSuperadmin === true;

  // Stats for dashboard
  const totalUsers = members.length + admins.length;
  const activeUsers = [...members, ...admins].filter(user => user.isActive !== false).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-md p-6 mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">User Management Dashboard</h1>
            <p className="mt-2 opacity-90">Manage all users, roles, and batches in one place</p>
          </div>
          {isSuperAdmin && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
              <span className="flex items-center text-sm font-medium">
                <ShieldCheck size={14} className="mr-1" />
                Super Admin Access
              </span>
            </div>
          )}
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <Users className="mr-2" size={20} />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold mt-2">{totalUsers}</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <ToggleRight className="mr-2" size={20} />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold mt-2">{activeUsers}</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <Package className="mr-2" size={20} />
              <span className="text-sm font-medium">Batches</span>
            </div>
            <div className="text-2xl font-bold mt-2">{batches.length}</div>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TabButton tabName="members" label="Members" count={members.length} icon={Users} />
            <TabButton tabName="admins" label="Admins" count={admins.length} icon={ShieldCheck} />
            {/* <TabButton tabName="batches" label="Batches" count={batches.length} icon={Package} /> */}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">Error: {error}</div>}

        {isUpdating && (
          <div className="p-4 mb-4 bg-blue-100 text-blue-700 rounded-lg flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Updating...
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((user) => (
                  <tr key={user._id} className={user.isActive === false ? 'opacity-70 bg-gray-50' : 'hover:bg-green-50'}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Phone size={14} />{user.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.batch ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {user.batch.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">No batch</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <RoleToggle user={user} currentUser={currentUser} onToggle={handleRoleChange} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusToggle user={user} onToggle={handleStatusChange} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No members match your search' : 'No members found'}
              </div>
            )}
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((user) => (
                  <tr key={user._id} className={user.isActive === false ? 'opacity-70 bg-gray-50' : 'hover:bg-green-50'}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {user.name}
                        {user.isSuperadmin && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Super
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Phone size={14} />{user.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleToggle user={user} currentUser={currentUser} onToggle={handleRoleChange} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusToggle user={user} onToggle={handleStatusChange} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAdmins.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No admins match your search' : 'No admins found'}
              </div>
            )}
          </div>
        )}

        {/* Batches Tab */}
        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Batch Management</h2>
              <button 
                onClick={() => setBatchModal({ show: true, batch: null })}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition"
              >
                <Plus size={16} /> Create Batch
              </button>
            </div>

            <div className="grid gap-6">
              {batches.map(batch => (
                <div key={batch._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{batch.name}</h3>
                        {batch.description && (
                          <p className="text-gray-600 text-sm mt-1">{batch.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users size={14} /> {batch.members?.length || 0} members
                          </span>
                          {batch.startDate && (
                            <span>Started: {new Date(batch.startDate).toLocaleDateString()}</span>
                          )}
                          {batch.endDate && (
                            <span>Ends: {new Date(batch.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setAddMembersModal({ show: true, batch })}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Add Members"
                        >
                          <UserPlus size={16} />
                        </button>
                        <button 
                          onClick={() => setBatchModal({ show: true, batch })}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                          title="Edit Batch"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBatch(batch._id, batch.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Batch"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Batch Members */}
                    {batch.members && batch.members.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Members:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {batch.members.map(member => (
                            <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-sm text-gray-900">{member.name}</div>
                                <div className="text-xs text-gray-500">{member.phoneNumber}</div>
                              </div>
                              <button 
                                onClick={() => handleRemoveMemberFromBatch(batch._id, member._id, member.name)}
                                className="p-1 text-red-500 hover:bg-red-100 rounded-full transition"
                                title="Remove from batch"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {batches.length === 0 && (
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No batches created yet</h3>
                  <p className="text-gray-500 mb-4">Create your first batch to organize members by cohort or program.</p>
                  <button 
                    onClick={() => setBatchModal({ show: true, batch: null })}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Create First Batch
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {batchModal.show && (
        <BatchModal 
          batch={batchModal.batch}
          onClose={() => setBatchModal({ show: false, batch: null })}
          onSave={handleBatchSave}
        />
      )}

      {addMembersModal.show && (
        <AddMembersToBatchModal 
          batch={addMembersModal.batch}
          availableMembers={getAvailableMembers(addMembersModal.batch)}
          onClose={() => setAddMembersModal({ show: false, batch: null })}
          onSave={handleAddMembers}
        />
      )}
    </div>
  );
};

export default AdminMembers;