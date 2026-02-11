import React, { useState, useEffect } from 'react';
import { Settings, Save, Lock, Video, AlertCircle, CreditCard, Upload } from 'lucide-react';
import axios from 'axios';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        zoomAccountId: '',
        zoomClientId: '',
        zoomClientSecret: '',
        zoomHostEmail: '', // New Field
        // Bank Details
        upiId: '',
        accountNumber: '',
        ifscCode: '',
        accountName: '',
        qrCodeUrl: ''
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/system-config');
            if (res.data.success) {
                // Only populate fields that exist
                setConfig(prev => ({
                    ...prev,
                    ...res.data.config
                }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validations
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB');
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return;
        }

        try {
            setSaving(true);
            const uploadToast = toast.loading('Uploading QR Code...');

            // 1. Get presigned URL
            const presignRes = await apiClient.post('/upload/system-config', {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size
            });

            if (!presignRes.data.success) {
                throw new Error('Failed to get upload URL');
            }

            const { uploadUrl, finalUrl } = presignRes.data;

            // 2. Upload to Firebase
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type }
            });

            // 3. Update config state with new URL
            setConfig(prev => ({
                ...prev,
                qrCodeUrl: finalUrl
            }));

            toast.success('QR Code uploaded successfully', { id: uploadToast });
        } catch (error) {
            console.error('QR upload error:', error);
            toast.error('Failed to upload QR code');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await apiClient.put('/system-config', config);
            if (res.data.success) {
                toast.success('Settings updated successfully');
                // Update local state with returned config to ensure sync
                setConfig(prev => ({
                    ...prev,
                    ...res.data.config
                }));
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error(error.response?.data?.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-8">
                <div className="bg-emerald-100 p-3 rounded-xl">
                    <Settings className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-500">Manage global configuration and integrations</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Zoom Integration Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Video className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Zoom Integration</h2>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Meeting Automation
                        </span>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Server-to-Server OAuth Required</p>
                                <p>
                                    To enable automated meeting creation, you need to create a Server-to-Server OAuth app in the <a href="https://marketplace.zoom.us/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Zoom Marketplace</a>.
                                    Copy the credentials below.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account ID
                                </label>
                                <input
                                    type="text"
                                    name="zoomAccountId"
                                    value={config.zoomAccountId}
                                    onChange={handleChange}
                                    placeholder="Enter Zoom Account ID"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client ID
                                </label>
                                <input
                                    type="text"
                                    name="zoomClientId"
                                    value={config.zoomClientId}
                                    onChange={handleChange}
                                    placeholder="Enter Client ID"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Secret
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="zoomClientSecret"
                                        value={config.zoomClientSecret}
                                        onChange={handleChange}
                                        placeholder="Enter Client Secret"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all outline-none pr-10"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default Host Email <span className="text-gray-400 font-normal">(Optional Override)</span>
                                </label>
                                <input
                                    type="email"
                                    name="zoomHostEmail"
                                    value={config.zoomHostEmail || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. your-zoom-account-email@example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">If set, ALL meetings will be created under this Zoom user, ignoring the currently logged-in admin's email.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bank Details Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <CreditCard className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Bank Details & Payment</h2>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                            For Subscriptions
                        </span>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* UPI ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    UPI ID
                                </label>
                                <input
                                    type="text"
                                    name="upiId"
                                    value={config.upiId || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. user@okhdfcbank"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all outline-none"
                                />
                            </div>

                            {/* Account Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Holder Name
                                </label>
                                <input
                                    type="text"
                                    name="accountName"
                                    value={config.accountName || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all outline-none"
                                />
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={config.accountNumber || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. 1234567890"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all outline-none"
                                />
                            </div>

                            {/* IFSC Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    name="ifscCode"
                                    value={config.ifscCode || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. HDFC0001234"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all outline-none"
                                />
                            </div>

                            {/* QR Code Upload */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment QR Code
                                </label>
                                <div className="flex items-center space-x-4">
                                    {config.qrCodeUrl && (
                                        <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                            <img src={config.qrCodeUrl} alt="QR Code" className="object-contain w-full h-full" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors">
                                                <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-500">
                                                    {config.qrCodeUrl ? 'Change QR Code Image' : 'Upload QR Code Image'}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Supported formats: PNG, JPG, JPEG (Max 5MB)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`
              flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium shadow-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all
              ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}
            `}
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
