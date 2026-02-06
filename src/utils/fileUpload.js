import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Path to store the file (default: 'uploads')
 * @param {function} onProgress - Progress callback function
 * @param {function} onError - Error callback function
 * @returns {Promise<string>} - Download URL of uploaded file
 */
export const uploadFile = (file, path = 'uploads', onProgress, onError) => {
  return new Promise((resolve, reject) => {
    // Validate file
    if (!file) {
      const error = 'No file provided';
      onError?.(error);
      reject(new Error(error));
      return;
    }

    // Validate file size (e.g., max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      const error = 'File size too large. Maximum size is 100MB.';
      onError?.(error);
      reject(new Error(error));
      return;
    }

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;

    // Create storage reference
    const storageRef = ref(storage, `${path}/${fileName}`);

    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress tracking
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => {
        // Handle error
        console.error('Upload error:', error);
        let errorMessage = 'Upload failed. Please try again.';

        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = 'Unauthorized. Please check your permissions.';
            break;
          case 'storage/canceled':
            errorMessage = 'Upload was canceled.';
            break;
          case 'storage/quota-exceeded':
            errorMessage = 'Storage quota exceeded.';
            break;
          case 'storage/invalid-format':
            errorMessage = 'Invalid file format.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }

        onError?.(errorMessage);
        reject(new Error(errorMessage));
      },
      async () => {
        // Upload completed successfully
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          console.error('Error getting download URL:', error);
          const errorMessage = 'Failed to get file URL after upload.';
          onError?.(errorMessage);
          reject(new Error(errorMessage));
        }
      }
    );

    // Return the upload task so it can be canceled if needed
    return uploadTask;
  });
};

/**
 * Delete file from Firebase Storage
 * @param {string} fileUrl - Full URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileUrl) => {
  try {
    // Extract the path from the full URL
    // Firebase URLs: https://firebasestorage.googleapis.com/.../o/<path>?...
    const url = new URL(fileUrl);
    const pathname = decodeURIComponent(url.pathname);
    const path = pathname.split('/o/')[1]?.split('?')[0];

    if (!path) {
      throw new Error('Invalid file URL format');
    }

    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    // Silent fail if file doesn't exist or already deleted
  }
};
