import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMembers, fetchAllAdmins, updateUserRole, updateCourseAccess } from '../redux/features/members/memberSlice';
import { fetchAllCourses } from '../redux/features/coures/courseSlice';
import { Users, ShieldCheck, Phone, Key, X, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

// Reusable Toggle Switch Component for Role (No changes needed)
const RoleToggle = ({ user, currentUser, onToggle }) => {
  const isCurrentUser = user._id === currentUser?._id;
  return (
    <label htmlFor={`toggle-${user._id}`} className="flex items-center cursor-pointer">
      <div className="relative"><input id={`toggle-${user._id}`} type="checkbox" className="sr-only" checked={user.role === 'admin'} disabled={isCurrentUser} onChange={() => onToggle(user, user.role === 'admin' ? 'member' : 'admin')} /><div className={`block w-14 h-8 rounded-full transition ${user.role === 'admin' ? 'bg-blue-600' : 'bg-gray-200'}`}></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${user.role === 'admin' ? 'transform translate-x-6' : ''}`}></div></div>
      <div className={`ml-3 font-medium text-sm ${isCurrentUser ? 'text-gray-400' : 'text-gray-700'}`}>Admin</div>
    </label>
  );
};

// Modal component for managing course access (No changes needed)
const AccessModal = ({ user, courses, onClose, onAccessChange }) => (
  <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">Manage Access for {user.name}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
      </div>
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        <div className="space-y-4">
          {courses.map(course => {
            const hasAccess = user.accessibleCourses?.includes(course._id);
            return (
              <div key={course._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">{course.title}</span>
                <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={!!hasAccess} onChange={(e) => onAccessChange(user._id, course._id, e.target.checked)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

const AdminMembers = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedUser, setSelectedUser] = useState(null);
  const dispatch = useDispatch();
  
  const { members, admins, loading, error } = useSelector((state) => state.members);
  const { courses } = useSelector((state) => state.courses);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllMembers());
    dispatch(fetchAllAdmins());
    dispatch(fetchAllCourses());
  }, [dispatch]);

  // ✅ FIX: This effect syncs the modal's user data with the main Redux state.
  // When a user's access is updated in Redux, this will update the modal's view.
  useEffect(() => {
    if (selectedUser) {
      const updatedUser = members.find(m => m._id === selectedUser._id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  }, [members, selectedUser]);

  const handleRoleChange = (user, newRole) => {
    if (window.confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      dispatch(updateUserRole({ userId: user._id, role: newRole }))
        .unwrap()
        .then(() => toast.success(`${user.name}'s role updated.`))
        .catch((err) => toast.error(err));
    }
  };

  const handleAccessChange = (userId, courseId, hasAccess) => {
    dispatch(updateCourseAccess({ userId, courseId, hasAccess }))
      .unwrap()
      .then(() => toast.success(`Access updated.`))
      .catch((err) => toast.error(err));
  };
  
  const TabButton = ({ tabName, label, count, icon: Icon }) => (
    <button onClick={() => setActiveTab(tabName)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === tabName ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
      <Icon size={16} />{label}<span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{count}</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(activeTab === 'members' ? members : admins).map((user) => {
                // ✅ FEATURE: Find the names of accessible courses
                const accessibleCourseTitles = courses
                  .filter(course => user.accessibleCourses?.includes(course._id))
                  .map(course => course.title);

                return (
                  <tr key={user._id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      {/* ✅ FEATURE: Display phone number, not email */}
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Phone size={14} />{user.phoneNumber}
                      </div>
                      {/* ✅ FEATURE: Display accessible courses as badges */}
                      {user.role === 'member' && accessibleCourseTitles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {accessibleCourseTitles.map(title => (
                            <span key={title} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">{title}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <RoleToggle user={user} currentUser={currentUser} onToggle={handleRoleChange} />
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'member' && (
                        <button 
                          onClick={() => setSelectedUser(user)} 
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <Key size={16} /> Course Access
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        
      </div>

      {selectedUser && (
        <AccessModal 
          user={selectedUser} 
          courses={courses} 
          onClose={() => setSelectedUser(null)}
          onAccessChange={handleAccessChange}
        />
      )}
    </div>
  );
};

export default AdminMembers;