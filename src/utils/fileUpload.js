import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path (e.g. 'users/user123/qr_codes')
 * @returns {Promise<string>} - Download URL of uploaded file
 */
export const uploadFile = async (file, path) => {
  try {
    // Create storage reference
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file: ' + error.message);
  }
};
