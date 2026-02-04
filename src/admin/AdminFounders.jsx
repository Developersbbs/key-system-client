import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminFounders, createFounder, updateFounder, deleteFounder, fetchUsersToLink } from '../redux/features/founders/founderSlice';

import { Plus, Edit2, Trash2, X, Upload, Save, Search, Filter, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminFounders = () => {
    const dispatch = useDispatch();
    const { founders, users, loading, error } = useSelector((state) => state.founders);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDesignation, setFilterDesignation] = useState('All');

    const [formData, setFormData] = useState({
        name: '',
        designation: 'Key Leader', // Default
        user: '', // For linking to registered user
        imageUrl: '',
        description: '',
        socialLinks: {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: ''
        },
        order: 0,
        isActive: true
    });

    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        dispatch(fetchAdminFounders());
        dispatch(fetchUsersToLink());
    }, [dispatch]);

    const designations = ['Founder', 'Director', 'Senior Director', 'Key Leader'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };



    const openAddModal = () => {
        setFormData({
            name: '',
            designation: 'Key Leader',
            user: '',
            imageUrl: '',
            description: '',
            socialLinks: {
                linkedin: '',
                twitter: '',
                facebook: '',
                instagram: ''
            },
            order: 0,
            isActive: true
        });
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (founder) => {
        setFormData({
            name: founder.name,
            designation: founder.designation,
            user: founder.user?._id || founder.user || '',
            imageUrl: founder.imageUrl || '',
            description: founder.description || '',
            socialLinks: {
                linkedin: founder.socialLinks?.linkedin || '',
                twitter: founder.socialLinks?.twitter || '',
                facebook: founder.socialLinks?.facebook || '',
                instagram: founder.socialLinks?.instagram || ''
            },
            order: founder.order || 0,
            isActive: founder.isActive
        });
        setSelectedId(founder._id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.designation) {
            toast.error('Name and Designation are required');
            return;
        }

        try {
            if (isEditMode) {
                await dispatch(updateFounder({ id: selectedId, founderData: formData })).unwrap();
                toast.success('Founder updated successfully');
            } else {
                await dispatch(createFounder(formData)).unwrap();
                toast.success('Founder created successfully');
            }
            setIsModalOpen(false);
            dispatch(fetchAdminFounders());
        } catch (err) {
            toast.error(err || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this founder?')) {
            try {
                await dispatch(deleteFounder(id)).unwrap();
                toast.success('Founder deleted successfully');
            } catch (err) {
                toast.error(err || 'Delete failed');
            }
        }
    };

    const filteredFounders = founders.filter(founder => {
        const matchesSearch = founder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            founder.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterDesignation === 'All' || founder.designation === filterDesignation;
        return matchesSearch && matchesFilter;
    });

    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manage Founders & Leaders</h1>
                        <p className="text-gray-500 text-sm">Add, edit, or remove leadership team members</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        <span>Add Member</span>
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter size={20} className="text-gray-500" />
                        <select
                            value={filterDesignation}
                            onChange={(e) => setFilterDesignation(e.target.value)}
                            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                        >
                            <option value="All">All Designations</option>
                            {designations.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && !isModalOpen ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Member</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Designation</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Order</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredFounders.length > 0 ? (
                                        filteredFounders.map((founder) => (
                                            <tr key={founder._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                            {founder.imageUrl ? (
                                                                <img src={founder.imageUrl} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                                    <User size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{founder.name}</p>
                                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{founder.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border
                            ${founder.designation === 'Founder' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            founder.designation === 'Director' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                founder.designation === 'Senior Director' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                                                    'bg-orange-50 text-orange-700 border-orange-200'
                                                        }`}
                                                    >
                                                        {founder.designation}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${founder.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {founder.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{founder.order}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(founder)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(founder._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No founders found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {isEditMode ? 'Edit Team Member' : 'Add Team Member'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                            placeholder="e.g. John Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Registered Member (Optional)</label>
                                        <select
                                            name="user"
                                            value={formData.user}
                                            onChange={(e) => {
                                                const selectedUserId = e.target.value;
                                                const selectedUser = users.find(u => u._id === selectedUserId);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    user: selectedUserId,
                                                    name: selectedUserId && selectedUser ? selectedUser.name : prev.name
                                                }));
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                                        >
                                            <option value="">-- Select a member --</option>
                                            {users && users.length > 0 ? (
                                                users.map(user => (
                                                    <option key={user._id} value={user._id}>
                                                        {user.name} ({user.email}) - {user.role}
                                                    </option>
                                                ))
                                            ) : (
                                                <option disabled>No members available</option>
                                            )}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Select a registered member to link with this leader profile.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                                        <select
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                                        >
                                            {designations.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-grow">
                                                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    name="imageUrl"
                                                    value={formData.imageUrl}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                            {/* Placeholder for future file upload feature if needed */}
                                        </div>
                                        {formData.imageUrl && (
                                            <div className="mt-2 h-20 w-20 rounded-lg border border-gray-200 overflow-hidden">
                                                <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                                            placeholder="Short bio or description..."
                                        ></textarea>
                                    </div>

                                    {/* Social Links */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-sm font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">Social Links</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">LinkedIn</label>
                                                <input
                                                    type="text"
                                                    name="socialLinks.linkedin"
                                                    value={formData.socialLinks.linkedin}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    placeholder="LinkedIn URL"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Twitter (X)</label>
                                                <input
                                                    type="text"
                                                    name="socialLinks.twitter"
                                                    value={formData.socialLinks.twitter}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    placeholder="Twitter URL"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Facebook</label>
                                                <input
                                                    type="text"
                                                    name="socialLinks.facebook"
                                                    value={formData.socialLinks.facebook}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    placeholder="Facebook URL"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Instagram</label>
                                                <input
                                                    type="text"
                                                    name="socialLinks.instagram"
                                                    value={formData.socialLinks.instagram}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    placeholder="Instagram URL"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                        <input
                                            type="number"
                                            name="order"
                                            value={formData.order}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleInputChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium shadow-sm disabled:opacity-70"
                                        disabled={loading}
                                    >
                                        <Save size={18} />
                                        <span>{isEditMode ? 'Update Member' : 'Save Member'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminFounders;
