import React, { useState, useEffect } from 'react';
import { Settings, Save, Lock, Video, AlertCircle, CreditCard, Upload, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

/* ─── Empty bank entry template ─────────────────────────────────────── */
const emptyBank = () => ({
  id: Date.now() + Math.random(),
  label: '',
  upiId: '',
  accountNumber: '',
  ifscCode: '',
  accountName: '',
  qrCodeUrl: '',
  bankImage1: '',
  bankImage2: '',
  collapsed: false,
});

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null); // tracks which field is uploading

  const [config, setConfig] = useState({
    zoomAccountId: '',
    zoomClientId: '',
    zoomClientSecret: '',
    zoomHostEmail: '',
    worksheetSettings: {
      startHour: 6,
      endHour: 24,
      editWindowDays: 0,
    },
  });

  // Array of bank payment entries
  const [banks, setBanks] = useState([emptyBank()]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/system-config');
      if (res.data.success) {
        const { payments, payment, ...rest } = res.data.config;
        setConfig(prev => ({ ...prev, ...rest }));
        // backend returns either payments or payment (singular) — handle both
        const savedBanks = payments || payment;
        if (savedBanks && savedBanks.length > 0) {
          setBanks(savedBanks.map(b => ({ ...b, id: b.id || Date.now() + Math.random(), collapsed: false })));
        }
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
    if (name.startsWith('worksheet_')) {
      const field = name.replace('worksheet_', '');
      setConfig(prev => ({
        ...prev,
        worksheetSettings: {
          ...prev.worksheetSettings,
          [field]: value
        }
      }));
    } else {
      setConfig(prev => ({ ...prev, [name]: value }));
    }
  };

  /* ── Bank entry handlers ── */
  const handleBankChange = (id, field, value) => {
    setBanks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const addBank = () => {
    setBanks(prev => [...prev, emptyBank()]);
  };

  const removeBank = (id) => {
    if (banks.length === 1) {
      toast.error('At least one payment entry is required');
      return;
    }
    if (!window.confirm('Remove this payment entry?')) return;
    setBanks(prev => prev.filter(b => b.id !== id));
  };

  const toggleCollapse = (id) => {
    setBanks(prev => prev.map(b => b.id === id ? { ...b, collapsed: !b.collapsed } : b));
  };

  /* ── Image upload for a specific bank entry + field ── */
  const handleBankFileChange = async (e, bankId, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File size exceeds 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Only image files are allowed'); return; }

    const uploadKey = `${bankId}-${fieldName}`;
    try {
      setUploadingField(uploadKey);
      const uploadToast = toast.loading('Uploading image...');

      const presignRes = await apiClient.post('/upload/system-config', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      if (!presignRes.data.success) throw new Error('Failed to get upload URL');

      const { uploadUrl, finalUrl } = presignRes.data;
      await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });

      setBanks(prev => prev.map(b => b.id === bankId ? { ...b, [fieldName]: finalUrl } : b));
      toast.success('Image uploaded successfully', { id: uploadToast });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...config,
        // send as 'payments' — matches backend controller key
        payments: banks.map(({ collapsed, ...rest }) => ({
          upiId: rest.upiId || '',
          accountNumber: rest.accountNumber || '',
          ifscCode: rest.ifscCode || '',
          accountName: rest.accountName || '',
          qrCodeUrl: rest.qrCodeUrl || '',
          bankImage1: rest.bankImage1 || '',
          bankImage2: rest.bankImage2 || '',
          label: rest.label || '',
          id: rest.id,
        })),
      };
      const res = await apiClient.put('/system-config', payload);
      if (res.data.success) {
        toast.success('Settings updated successfully');
        const { payments, payment, ...rest } = res.data.config;
        setConfig(prev => ({ ...prev, ...rest }));
        const saved = payments || payment;
        if (saved) setBanks(saved.map(b => ({ ...b, collapsed: false })));
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
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
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

        {/* ── Zoom Integration ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg"><Video className="w-5 h-5 text-blue-600" /></div>
              <h2 className="text-lg font-bold text-gray-800">Zoom Integration</h2>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Meeting Automation</span>
          </div>

          <div className="p-6 space-y-5">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Server-to-Server OAuth Required</p>
                <p>Create a Server-to-Server OAuth app in the <a href="https://marketplace.zoom.us/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Zoom Marketplace</a> and copy the credentials below.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account ID</label>
                <input type="text" name="zoomAccountId" value={config.zoomAccountId} onChange={handleChange}
                  placeholder="Enter Zoom Account ID"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client ID</label>
                <input type="text" name="zoomClientId" value={config.zoomClientId} onChange={handleChange}
                  placeholder="Enter Client ID"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Secret</label>
                <div className="relative">
                  <input type="password" name="zoomClientSecret" value={config.zoomClientSecret} onChange={handleChange}
                    placeholder="Enter Client Secret"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all outline-none pr-10" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Default Host Email <span className="text-gray-400 font-normal">(Optional Override)</span>
                </label>
                <input type="email" name="zoomHostEmail" value={config.zoomHostEmail || ''} onChange={handleChange}
                  placeholder="e.g. your-zoom-account-email@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all outline-none" />
                <p className="text-xs text-gray-500 mt-1">If set, ALL meetings will be created under this Zoom user.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Worksheet Settings ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-teal-100 p-2 rounded-lg"><Clock className="w-5 h-5 text-teal-600" /></div>
              <h2 className="text-lg font-bold text-gray-800">Worksheet Timing Settings</h2>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-teal-100 text-teal-700 rounded-full">Submission & Edits</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Submission Start Hour (0-23)</label>
                <input
                  type="number"
                  name="worksheet_startHour"
                  min="0" max="23"
                  value={config.worksheetSettings?.startHour ?? 6}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring focus:ring-teal-200 transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Example: 6 for 6:00 AM</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Submission End Hour (1-24)</label>
                <input
                  type="number"
                  name="worksheet_endHour"
                  min="1" max="24"
                  value={config.worksheetSettings?.endHour ?? 24}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring focus:ring-teal-200 transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Example: 24 for 12:00 AM Midnight</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Edit/Delete Window (Days)</label>
                <input
                  type="number"
                  name="worksheet_editWindowDays"
                  min="0"
                  value={config.worksheetSettings?.editWindowDays ?? 0}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring focus:ring-teal-200 transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">0 = Only Same Day, 1 = Until tomorrow, etc.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bank Details — Multiple Entries ───────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-lg"><CreditCard className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Bank Details & Payment</h2>
                <p className="text-xs text-gray-500 mt-0.5">{banks.length} payment method{banks.length !== 1 ? 's' : ''} configured</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">For Subscriptions</span>
          </div>

          <div className="p-5 space-y-4">
            {banks.map((bank, index) => (
              <BankEntry
                key={bank.id}
                bank={bank}
                index={index}
                total={banks.length}
                uploadingField={uploadingField}
                onChange={handleBankChange}
                onRemove={removeBank}
                onToggle={toggleCollapse}
                onFileChange={handleBankFileChange}
              />
            ))}

            {/* Add Payment Method button */}
            <button
              type="button"
              onClick={addBank}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-emerald-200 rounded-xl text-emerald-600 font-semibold text-sm hover:bg-emerald-50 hover:border-emerald-400 transition-all"
            >
              <Plus size={18} />
              Add Another Payment Method
            </button>
          </div>
        </div>

        {/* ── Save Button ───────────────────────────────────────── */}
        <div className="flex justify-end pt-2 pb-6">
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center px-7 py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
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
              <><Save className="w-5 h-5 mr-2" />Save Settings</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ─── Individual Bank Entry Card ─────────────────────────────────────── */
const BankEntry = ({ bank, index, total, uploadingField, onChange, onRemove, onToggle, onFileChange }) => {
  const isUploading = (field) => uploadingField === `${bank.id}-${field}`;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">

      {/* Entry header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-gray-700 truncate">
            {bank.label || `Payment Method ${index + 1}`}
          </span>
          {bank.upiId && (
            <span className="hidden sm:inline text-xs text-gray-400 truncate">· {bank.upiId}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Delete — disabled if only 1 */}
          <button
            type="button"
            onClick={() => onRemove(bank.id)}
            disabled={total === 1}
            title="Remove this entry"
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 size={15} />
          </button>
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => onToggle(bank.id)}
            title={bank.collapsed ? 'Expand' : 'Collapse'}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors"
          >
            {bank.collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {/* Entry body */}
      {!bank.collapsed && (
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Label / Nickname — full width */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Label / Nickname
              </label>
              <input
                type="text"
                value={bank.label}
                onChange={e => onChange(bank.id, 'label', e.target.value)}
                placeholder="e.g. HDFC Bank, PhonePe UPI, Main Account…"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring focus:ring-emerald-100 transition-all outline-none text-sm"
              />
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">UPI ID</label>
              <input
                type="text"
                value={bank.upiId}
                onChange={e => onChange(bank.id, 'upiId', e.target.value)}
                placeholder="e.g. user@okhdfcbank"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring focus:ring-emerald-100 transition-all outline-none text-sm"
              />
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Account Holder Name</label>
              <input
                type="text"
                value={bank.accountName}
                onChange={e => onChange(bank.id, 'accountName', e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring focus:ring-emerald-100 transition-all outline-none text-sm"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Account Number</label>
              <input
                type="text"
                value={bank.accountNumber}
                onChange={e => onChange(bank.id, 'accountNumber', e.target.value)}
                placeholder="e.g. 1234567890"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring focus:ring-emerald-100 transition-all outline-none text-sm"
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">IFSC Code</label>
              <input
                type="text"
                value={bank.ifscCode}
                onChange={e => onChange(bank.id, 'ifscCode', e.target.value)}
                placeholder="e.g. HDFC0001234"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring focus:ring-emerald-100 transition-all outline-none text-sm"
              />
            </div>

            {/* QR Code / Image 1 */}
            <ImageUploadField
              label="Payment QR Code / Slider Image 1"
              fieldName="qrCodeUrl"
              currentUrl={bank.qrCodeUrl}
              isUploading={isUploading('qrCodeUrl')}
              onChange={(e) => onFileChange(e, bank.id, 'qrCodeUrl')}
            />

            {/* Bank Image 1 / Slider 2 */}
            <ImageUploadField
              label="Slider Image 2 (Bank Details)"
              fieldName="bankImage1"
              currentUrl={bank.bankImage1}
              isUploading={isUploading('bankImage1')}
              onChange={(e) => onFileChange(e, bank.id, 'bankImage1')}
            />

            {/* Bank Image 2 / Slider 3 */}
            <ImageUploadField
              label="Slider Image 3 (Optional)"
              fieldName="bankImage2"
              currentUrl={bank.bankImage2}
              isUploading={isUploading('bankImage2')}
              onChange={(e) => onFileChange(e, bank.id, 'bankImage2')}
              hint="Supported formats: PNG, JPG, JPEG (Max 5MB)"
            />
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Reusable image upload field ────────────────────────────────────── */
const ImageUploadField = ({ label, fieldName, currentUrl, isUploading, onChange, hint }) => (
  <div className="md:col-span-2">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="flex items-center gap-4">
      {currentUrl && (
        <div className="flex-shrink-0 w-20 h-20 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
          <img src={currentUrl} alt={label} className="object-contain w-full h-full" />
        </div>
      )}
      <div className="flex-1">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-xl transition-colors ${isUploading
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
            }`}>
            {isUploading
              ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600-600 mr-2"></div><span className="text-sm text-emerald-600 font-medium">Uploading…</span></>
              : <><Upload className="w-4 h-4 text-gray-400 mr-2" /><span className="text-sm text-gray-500">{currentUrl ? 'Change Image' : `Upload ${label}`}</span></>
            }
          </div>
        </div>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
    </div>
  </div>
);

export default AdminSettings;