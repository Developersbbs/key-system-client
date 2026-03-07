// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Upload, QrCode, Trash2, ImageIcon, RefreshCw, User, Camera,
  CheckCircle2, Circle, ChevronDown, Phone, MapPin, Calendar,
  UserCircle2, Save, Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  updatePaymentDetails, fetchUserProfile,
  updateProfileImage
} from '../redux/features/userProfileSlice/userProfileSlice';
import { uploadQRCode, deleteFileFromFirebase, uploadFileToFirebase } from '../utils/uploadUtils';
import { locationData } from '../utils/locationData';
import apiClient from '../api/apiClient';

/* ─── Profile completion fields & weights ──────────────────────────── */
const COMPLETION_FIELDS = [
  { key: 'name',                    label: 'Full Name',      weight: 20 },
  { key: 'phoneNumber',             label: 'Phone Number',   weight: 15 },
  { key: 'profileDetails.gender',   label: 'Gender',         weight: 10 },
  { key: 'profileDetails.dob',      label: 'Date of Birth',  weight: 10 },
  { key: 'profileDetails.state',    label: 'State',          weight: 15 },
  { key: 'profileDetails.district', label: 'District',       weight: 15 },
  { key: 'profileDetails.address',  label: 'Address',        weight: 15 },
];

const getNestedValue = (obj, key) => {
  if (!obj) return '';
  if (key.includes('.')) {
    const [parent, child] = key.split('.');
    return obj[parent]?.[child] ?? '';
  }
  return obj[key] ?? '';
};

const calcCompletion = (profile) => {
  if (!profile) return 0;
  let score = 0;
  COMPLETION_FIELDS.forEach(({ key, weight }) => {
    const val = getNestedValue(profile, key);
    if (val && String(val).trim() !== '') score += weight;
  });
  return Math.min(score, 100);
};

/* ─── Completion bar color ─────────────────────────────────────────── */
const barColor = (pct) => {
  if (pct < 40) return { bar: '#ef4444', text: 'text-red-500',   label: 'Incomplete' };
  if (pct < 70) return { bar: '#f59e0b', text: 'text-amber-500', label: 'Getting there' };
  if (pct < 100) return { bar: '#10b981', text: 'text-emerald-500', label: 'Almost done' };
  return { bar: '#059669', text: 'text-emerald-600', label: 'Complete!' };
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { profile, loading } = useSelector(state => state.userProfile);

  /* ── QR state (unchanged) ── */
  const [qrFile, setQrFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProfileUploading, setIsProfileUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [qrImageError, setQrImageError] = useState(false);
  const [qrImageLoading, setQrImageLoading] = useState(false);
  const qrImageRetryCount = useRef(0);

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '', qrCodeUrl: '', accountHolderName: '',
    accountNumber: '', ifscCode: '', bankName: ''
  });

  /* ── Profile form state ── */
  const [profileForm, setProfileForm] = useState({
    name: '',
    phoneNumber: '',
    profileDetails: {
      gender: '',
      dob: '',
      state: '',
      district: '',
      address: '',
    }
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isFormLocked, setIsFormLocked] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [completion, setCompletion] = useState(0);

  /* ── Load profile ── */
  useEffect(() => {
    if (user) dispatch(fetchUserProfile());
  }, [dispatch, user]);

  /* ── Sync profile form when profile loads ── */
  useEffect(() => {
    if (profile) {
      setPaymentDetails({
        upiId: profile.paymentDetails?.upiId || '',
        qrCodeUrl: profile.paymentDetails?.qrCodeUrl || '',
        accountHolderName: profile.paymentDetails?.accountHolderName || '',
        accountNumber: profile.paymentDetails?.accountNumber || '',
        ifscCode: profile.paymentDetails?.ifscCode || '',
        bankName: profile.paymentDetails?.bankName || ''
      });
      setProfileForm({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
        profileDetails: {
          gender:   profile.profileDetails?.gender   || '',
          dob:      profile.profileDetails?.dob
                      ? new Date(profile.profileDetails.dob).toISOString().split('T')[0]
                      : '',
          state:    profile.profileDetails?.state    || '',
          district: profile.profileDetails?.district || '',
          address:  profile.profileDetails?.address  || '',
        }
      });
      setCompletion(calcCompletion(profile));
      // Auto-lock if profile already has a name saved
      if (profile.name) setIsFormLocked(true);
      setQrImageError(false);
      qrImageRetryCount.current = 0;
    }
  }, [profile]);

  /* ── Districts update when state changes ── */
  useEffect(() => {
    if (profileForm.profileDetails.state) {
      setAvailableDistricts(locationData?.[profileForm.profileDetails.state] || []);
    } else {
      setAvailableDistricts([]);
    }
  }, [profileForm.profileDetails.state]);

  /* ── Recalculate completion live as form changes ── */
  useEffect(() => {
    // merge form into a profile-shaped object for calculation
    const merged = {
      name: profileForm.name,
      phoneNumber: profileForm.phoneNumber,
      profileDetails: profileForm.profileDetails,
    };
    setCompletion(calcCompletion(merged));
  }, [profileForm]);

  /* ── Handlers ── */
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profileDetails.')) {
      const field = name.replace('profileDetails.', '');
      setProfileForm(prev => ({
        ...prev,
        profileDetails: {
          ...prev.profileDetails,
          [field]: value,
          // Reset district if state changes
          ...(field === 'state' ? { district: '' } : {})
        }
      }));
    } else {
      setProfileForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setIsSavingProfile(true);
      const res = await apiClient.put('/users/profile', {
        name: profileForm.name,
        phoneNumber: profileForm.phoneNumber,
        profileDetails: profileForm.profileDetails,
      });
      toast.success('Profile updated successfully!');
      setIsFormLocked(true);
      dispatch(fetchUserProfile());
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  /* ── QR handlers (all unchanged) ── */
  const handleQrImageError = () => {
    if (qrImageRetryCount.current < 3) {
      setTimeout(() => { qrImageRetryCount.current += 1; setQrImageError(false); setQrImageLoading(true); }, 1000 * qrImageRetryCount.current);
    } else { setQrImageError(true); setQrImageLoading(false); }
  };
  const handleQrImageLoad = () => { setQrImageLoading(false); setQrImageError(false); qrImageRetryCount.current = 0; };
  const retryQrImage = () => { qrImageRetryCount.current = 0; setQrImageError(false); setQrImageLoading(true); };
  const getQrUrlWithCacheBusting = () => {
    if (!paymentDetails.qrCodeUrl) return '';
    return `${paymentDetails.qrCodeUrl}${paymentDetails.qrCodeUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  };
  const handleQRFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File size should be less than 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setQrFile(file);
  };
  const handleUploadQR = async () => {
    if (!qrFile) { toast.error('Please select a QR code image'); return; }
    if (!user?._id) { toast.error('User not authenticated'); return; }
    try {
      setIsUploading(true);
      if (paymentDetails.qrCodeUrl) {
        try { await deleteFileFromFirebase(paymentDetails.qrCodeUrl); } catch {}
      }
      const qrCodeUrl = await uploadQRCode(qrFile, user._id);
      await dispatch(updatePaymentDetails({ ...paymentDetails, qrCodeUrl })).unwrap();
      toast.success('QR code uploaded successfully!');
      setQrFile(null); setQrImageError(false); qrImageRetryCount.current = 0;
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) { toast.error(error.message || 'Failed to upload QR code'); }
    finally { setIsUploading(false); }
  };
  const handleDeleteQR = async () => {
    if (!paymentDetails.qrCodeUrl) return;
    if (!window.confirm("Remove this QR code? This will permanently delete the image.")) return;
    try {
      setIsDeleting(true);
      await deleteFileFromFirebase(paymentDetails.qrCodeUrl);
      await dispatch(updatePaymentDetails({ ...paymentDetails, qrCodeUrl: "" })).unwrap();
      toast.success('QR code removed successfully!');
      setQrImageError(false); qrImageRetryCount.current = 0;
    } catch (error) { toast.error(error.message || 'Failed to remove QR code'); }
    finally { setIsDeleting(false); }
  };
  const handleProfilePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
    try {
      setIsProfileUploading(true);
      const path = `profile-photos/${user._id}`;
      const fileName = `profile_${Date.now()}_${file.name}`;
      const downloadURL = await uploadFileToFirebase(file, path, fileName);
      await dispatch(updateProfileImage(downloadURL)).unwrap();
      toast.success('Profile photo updated successfully!');
      dispatch(fetchUserProfile());
    } catch (error) { toast.error(error.message || 'Failed to update profile photo'); }
    finally { setIsProfileUploading(false); }
  };

  const color = barColor(completion);

  /* ── Completion checklist items ── */
  const checklistItems = COMPLETION_FIELDS.map(({ key, label }) => {
    const val = key.includes('.')
      ? profileForm.profileDetails?.[key.split('.')[1]]
      : profileForm[key];
    return { label, done: !!(val && String(val).trim() !== '') };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5 p-4">

      {/* ══════════════════════════════════════════════════
          PROFILE COMPLETION PROGRESS BAR
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Profile Completion</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in all details to complete your profile</p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-extrabold ${color.text}`}>{completion}%</span>
            <p className={`text-xs font-semibold ${color.text}`}>{color.label}</p>
          </div>
        </div>

        {/* Bar */}
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completion}%`, background: color.bar }}
          />
        </div>

        {/* Checklist */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {checklistItems.map(({ label, done }) => (
            <div key={label} className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
              done ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'
            }`}>
              {done
                ? <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                : <Circle size={13} className="text-gray-300 flex-shrink-0" />}
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PROFILE HEADER & PHOTO
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative group flex-shrink-0">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md bg-gray-50 flex items-center justify-center relative">
            {profile?.imageUrl
              ? <img src={profile.imageUrl} alt={profile?.name} className="w-full h-full object-cover" />
              : <User size={56} className="text-gray-200" />}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-2xl"
              onClick={() => document.getElementById('profile-photo-input').click()}>
              <div className="text-white flex flex-col items-center text-xs font-medium gap-1">
                <Camera size={18} /><span>Change</span>
              </div>
            </div>
          </div>
          <input type="file" id="profile-photo-input" accept="image/*" className="hidden"
            onChange={handleProfilePhotoSelect} disabled={isProfileUploading} />
          {isProfileUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">{profile?.name || user?.name || 'Your Name'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{profile?.email || user?.email}</p>
          {profile?.chapter && (
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
              Chapter: {profile.chapter}
            </span>
          )}
          <p className="mt-3 text-xs text-gray-400">Click on the photo to update your profile picture.</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PROFILE DETAILS FORM
      ══════════════════════════════════════════════════ */}
      <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${isFormLocked ? 'border-gray-100' : 'border-emerald-200'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isFormLocked ? 'bg-gray-50' : 'bg-emerald-50'}`}>
              <Pencil size={15} className={isFormLocked ? 'text-gray-400' : 'text-emerald-600'} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Personal Details</h2>
              <p className="text-xs text-gray-400">
                {isFormLocked ? 'Your details are saved — click Edit to make changes' : 'Fill in your details and save'}
              </p>
            </div>
          </div>
          {/* Edit button — shown only when locked */}
          {isFormLocked && (
            <button
              onClick={() => setIsFormLocked(false)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>

        <div className={`p-6 transition-opacity ${isFormLocked ? 'opacity-70' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <UserCircle2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileFormChange}
                  disabled={isFormLocked}
                  placeholder="Enter your full name"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={handleProfileFormChange}
                  disabled={isFormLocked}
                  placeholder="Enter phone number"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Gender</label>
              <div className="relative">
                <select
                  name="profileDetails.gender"
                  value={profileForm.profileDetails.gender}
                  onChange={handleProfileFormChange}
                  disabled={isFormLocked}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="date"
                  name="profileDetails.dob"
                  value={profileForm.profileDetails.dob}
                  onChange={handleProfileFormChange}
                  disabled={isFormLocked}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
              <div className="relative">
                <select
                  name="profileDetails.state"
                  value={profileForm.profileDetails.state}
                  onChange={handleProfileFormChange}
                  disabled={isFormLocked}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select state</option>
                  {Object.keys(locationData || {}).sort().map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">District</label>
              <div className="relative">
                <select
                  name="profileDetails.district"
                  value={profileForm.profileDetails.district}
                  onChange={handleProfileFormChange}
                  disabled={isFormLocked || !profileForm.profileDetails.state}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select district</option>
                  {availableDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>

            {/* Address — full width */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-300" />
                <textarea
                  name="profileDetails.address"
                  value={profileForm.profileDetails.address}
                  onChange={handleProfileFormChange}
                  disabled={isFormLocked}
                  placeholder="Enter your full address"
                  rows={2}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none placeholder-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Footer — hidden when locked */}
          {!isFormLocked && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {completion === 100
                  ? '✅ Profile is 100% complete!'
                  : `${COMPLETION_FIELDS.filter(({ key }) => {
                      const val = key.includes('.') ? profileForm.profileDetails?.[key.split('.')[1]] : profileForm[key];
                      return !val || String(val).trim() === '';
                    }).length} field(s) remaining`}
              </p>
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile || loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSavingProfile
                  ? <><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span> Saving…</>
                  : <><Save size={15} /> {profile?.name ? 'Update Details' : 'Save Details'}</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PAYMENT QR CODE SECTION (unchanged)
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <QrCode size={15} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Payment QR Code</h2>
            <p className="text-xs text-gray-400">Upload a QR code that buyers can scan to pay you directly</p>
          </div>
        </div>
        <div className="p-6">
          {paymentDetails.qrCodeUrl ? (
            <div className="flex flex-col items-start space-y-4">
              <div className="relative">
                {qrImageError ? (
                  <div className="w-32 h-32 bg-gray-100 border rounded-xl flex flex-col items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 text-center mb-2">QR Code<br />Unavailable</span>
                    <button onClick={retryQrImage} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><RefreshCw size={10} />Retry</button>
                  </div>
                ) : (
                  <div className="relative">
                    {qrImageLoading && (
                      <div className="absolute inset-0 w-32 h-32 bg-gray-100 border rounded-xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    <img src={getQrUrlWithCacheBusting()} alt="Payment QR Code"
                      className="w-32 h-32 border rounded-xl object-contain"
                      onError={handleQrImageError} onLoad={handleQrImageLoad}
                      onLoadStart={() => setQrImageLoading(true)}
                      style={{ display: qrImageLoading ? 'none' : 'block' }} />
                  </div>
                )}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 w-full max-w-md">
                <p className="text-sm text-green-800"><strong>QR Code Active:</strong> Buyers can scan this to pay you directly</p>
                <p className="text-xs text-green-600 mt-1">Stored securely in Firebase Storage</p>
              </div>
              {qrImageError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 w-full max-w-md">
                  <p className="text-sm text-red-800"><strong>QR Code Error:</strong> Unable to display your QR code</p>
                  <p className="text-xs text-red-600 mt-1">The image may be corrupted or the link expired. Consider uploading a new one.</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={handleDeleteQR} disabled={isDeleting}
                  className="flex items-center text-red-600 hover:text-red-800 disabled:opacity-50 px-3 py-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium">
                  <Trash2 size={15} className="mr-1.5" />{isDeleting ? 'Removing...' : 'Remove QR Code'}
                </button>
                {qrImageError && (
                  <button onClick={() => { setPaymentDetails(prev => ({ ...prev, qrCodeUrl: '' })); setQrImageError(false); }}
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium">
                    <Upload size={15} className="mr-1.5" />Upload New QR
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Why upload a QR code?</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Buyers can pay you instantly by scanning</li>
                  <li>• No need to share UPI ID manually</li>
                  <li>• Works with all UPI apps (PhonePe, Paytm, GPay, etc.)</li>
                  <li>• Securely stored in Firebase Storage</li>
                </ul>
              </div>
              <input type="file" accept="image/*" onChange={handleQRFileSelect} disabled={isUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50" />
              {qrFile && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p><strong>Selected:</strong> {qrFile.name}</p>
                      <p><strong>Size:</strong> {(qrFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => { setQrFile(null); const fi = document.querySelector('input[type="file"]'); if (fi) fi.value = ''; }} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
              {qrFile && (
                <button onClick={handleUploadQR} disabled={isUploading || loading}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {isUploading ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Uploading…</> : <><Upload size={15} />Upload QR Code</>}
                </button>
              )}
              {!qrFile && (
                <p className="text-xs text-gray-400">Select an image (max 5MB). Generate your QR from your UPI app and screenshot it.</p>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Profile;