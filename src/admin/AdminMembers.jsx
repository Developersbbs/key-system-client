import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMembers, fetchAllAdmins, updateUserRole, updateUserLevels } from '../redux/features/members/memberSlice';
import { fetchAllBatches, createBatch, updateBatch, addMembersToBatch, removeMemberFromBatch, deleteBatch } from '../redux/features/batches/batchSlice';
import { fetchAllLevels } from '../redux/features/level/levelSlice';
import { Users, ShieldCheck, Phone, Key, X, Plus, Edit, Trash2, UserPlus, Package } from 'lucide-react';
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

// Modal for managing individual level access
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
          <h3 className="text-lg font-semibold">Manage Individual Levels for {user.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {user.batch && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This user is in batch "{user.batch.name}". Individual level settings will override batch settings.
              </p>
            </div>
          )}
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

// Modal for creating/editing batch
const BatchModal = ({ batch, levels, members, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: batch?.name || '',
    description: batch?.description || '',
    accessibleLevels: batch?.accessibleLevels || [1],
    startDate: batch?.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
    endDate: batch?.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : ''
  });

  const handleLevelToggle = (levelNumber) => {
    const newLevels = formData.accessibleLevels.includes(levelNumber)
      ? formData.accessibleLevels.filter(l => l !== levelNumber)
      : [...formData.accessibleLevels, levelNumber];
    setFormData({ ...formData, accessibleLevels: newLevels });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure at least one level is selected
    if (formData.accessibleLevels.length === 0) {
      toast.error('Please select at least one accessible level');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">{batch ? 'Edit Batch' : 'Create New Batch'}</h3>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Spring 2025 Batch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Accessible Levels {formData.accessibleLevels.length === 0 && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {levels.map(level => (
                <label key={level._id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-teal-600"
                    checked={formData.accessibleLevels.includes(level.levelNumber)}
                    onChange={() => handleLevelToggle(level.levelNumber)}
                  />
                  <span className="text-sm font-medium">Level {level.levelNumber}: {level.name}</span>
                </label>
              ))}
            </div>
            {formData.accessibleLevels.length === 0 && (
              <p className="text-red-500 text-sm mt-1">Please select at least one accessible level</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="bg-gray-200 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
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
          <h3 className="text-lg font-semibold">Add Members to {batch.name}</h3>
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
                      className="w-4 h-4 accent-teal-600"
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
              className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [levelModalUser, setLevelModalUser] = useState(null);
  const [batchModal, setBatchModal] = useState({ show: false, batch: null });
  const [addMembersModal, setAddMembersModal] = useState({ show: false, batch: null });
  const dispatch = useDispatch();
  
  const { members, admins, error } = useSelector((state) => state.members);
  const { batches } = useSelector((state) => state.batches);
  const { levels } = useSelector((state) => state.levels);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllMembers());
    dispatch(fetchAllAdmins());
    dispatch(fetchAllLevels());
    dispatch(fetchAllBatches());
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

  const handleBatchSave = (batchData) => {
    const action = batchModal.batch 
      ? updateBatch({ id: batchModal.batch._id, data: batchData })
      : createBatch(batchData);

    dispatch(action)
      .unwrap()
      .then(() => {
        toast.success(`Batch ${batchModal.batch ? 'updated' : 'created'} successfully.`);
        setBatchModal({ show: false, batch: null });
        // Refresh data after batch operations
        dispatch(fetchAllBatches());
        dispatch(fetchAllMembers());
      })
      .catch((err) => toast.error(err));
  };

  const handleAddMembers = (batchId, memberIds) => {
    dispatch(addMembersToBatch({ batchId, memberIds }))
      .unwrap()
      .then(() => {
        toast.success("Members added to batch successfully.");
        setAddMembersModal({ show: false, batch: null });
        // Refresh members and batches data
        dispatch(fetchAllMembers());
        dispatch(fetchAllBatches());
      })
      .catch((err) => toast.error(err));
  };

  const handleRemoveMemberFromBatch = (batchId, memberId, memberName) => {
    if (window.confirm(`Remove ${memberName} from this batch?`)) {
      dispatch(removeMemberFromBatch({ batchId, memberId }))
        .unwrap()
        .then(() => {
          toast.success("Member removed from batch.");
          dispatch(fetchAllMembers());
          dispatch(fetchAllBatches());
        })
        .catch((err) => toast.error(err));
    }
  };

  const handleDeleteBatch = (batchId, batchName) => {
    if (window.confirm(`Delete batch "${batchName}"? All members will be removed from this batch.`)) {
      dispatch(deleteBatch(batchId))
        .unwrap()
        .then(() => {
          toast.success("Batch deleted successfully.");
          dispatch(fetchAllMembers());
          dispatch(fetchAllBatches());
        })
        .catch((err) => toast.error(err));
    }
  };

  // Fixed: Get members not in any batch for the add members modal
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
          <TabButton tabName="batches" label="Batches" count={batches.length} icon={Package} />
        </div>
      </div>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">Error: {error}</div>}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access Control</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Phone size={14} />{user.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.batch ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                    <button onClick={() => setLevelModalUser(user)} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-semibold">
                      <Key size={16} /> Manage Levels
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admins Tab */}
      {activeTab === 'admins' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((user) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Batches Tab */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Batch Management</h2>
            <button 
              onClick={() => setBatchModal({ show: true, batch: null })}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-teal-700 transition"
            >
              <Plus size={16} /> Create Batch
            </button>
          </div>

          <div className="grid gap-6">
            {batches.map(batch => (
              <div key={batch._id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{batch.name}</h3>
                      {batch.description && (
                        <p className="text-gray-600 text-sm mt-1">{batch.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{batch.members?.length || 0} members</span>
                        <span>Levels: {batch.accessibleLevels?.join(', ') || 'None'}</span>
                        {batch.startDate && (
                          <span>Started: {new Date(batch.startDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setAddMembersModal({ show: true, batch })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
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
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No batches created yet</h3>
                <p className="text-gray-500 mb-4">Create your first batch to organize members by cohort or program.</p>
                <button 
                  onClick={() => setBatchModal({ show: true, batch: null })}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Create First Batch
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {levelModalUser && (
        <LevelAccessModal 
          user={levelModalUser}
          levels={levels}
          onClose={() => setLevelModalUser(null)}
          onSave={handleLevelSave}
        />
      )}

      {batchModal.show && (
        <BatchModal 
          batch={batchModal.batch}
          levels={levels}
          members={members}
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