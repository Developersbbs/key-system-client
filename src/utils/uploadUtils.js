// src/utils/uploadUtils.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path (e.g., 'qr-codes/user123')
 * @param {string} fileName - Custom file name (optional)
 * @returns {Promise<string>} - Download URL
 */
export const uploadFileToFirebase = async (file, path, fileName = null) => {
  try {
    // Generate unique filename if not provided
    const finalFileName = fileName || `${Date.now()}_${file.name}`;
    
    // Create storage reference
    const storageRef = ref(storage, `${path}/${finalFileName}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Firebase Storage
 * @param {string} downloadURL - Firebase download URL
 * @returns {Promise<void>}
 */
export const deleteFileFromFirebase = async (downloadURL) => {
  try {
    // Create reference from download URL
    const storageRef = ref(storage, downloadURL);
    
    // Delete file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Firebase delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Upload QR Code specifically
 * @param {File} qrFile - QR code image file
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<string>} - Download URL
 */
export const uploadQRCode = async (qrFile, userId) => {
  // Validate file
  if (!qrFile.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }
  
  if (qrFile.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('File size should be less than 5MB');
  }
  
  const path = `qr-codes/${userId}`;
  const fileName = `qr_${Date.now()}.${qrFile.name.split('.').pop()}`;
  
  return await uploadFileToFirebase(qrFile, path, fileName);
};