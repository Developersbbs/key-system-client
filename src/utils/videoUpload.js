// src/utils/videoUpload.js
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload video file to Firebase Storage
 * @param {File} file - Video file to upload
 * @param {string} courseId - Course ID for organizing files
 * @param {string} chapterId - Chapter ID for organizing files
 * @param {function} onProgress - Progress callback function
 * @param {function} onError - Error callback function
 * @returns {Promise<string>} - Download URL of uploaded video
 */
export const uploadVideo = (file, courseId, chapterId, onProgress, onError) => {
  return new Promise((resolve, reject) => {
    // Validate file
    if (!file) {
      const error = 'No file provided';
      onError?.(error);
      reject(new Error(error));
      return;
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      const error = 'Invalid file type. Please upload a video file.';
      onError?.(error);
      reject(new Error(error));
      return;
    }

    // Validate file size (max 1GB)
    const maxSize = 1000 * 1024 * 1024; // 1GB in bytes
    if (file.size > maxSize) {
      const error = 'File size too large. Maximum allowed size is 1GB.';
      onError?.(error);
      reject(new Error(error));
      return;
    }

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, `courses/${courseId}/chapters/${chapterId}/videos/${fileName}`);

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
          const errorMessage = 'Failed to get video URL after upload.';
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
 * Delete video from Firebase Storage
 * @param {string} videoUrl - Full URL of the video to delete
 * @returns {Promise<void>}
 */
export const deleteVideo = async (videoUrl) => {
  try {
    // Extract the path from the full URL
    const url = new URL(videoUrl);
    const pathname = decodeURIComponent(url.pathname);
    const path = pathname.split('/o/')[1]?.split('?')[0];
    
    if (!path) {
      throw new Error('Invalid video URL format');
    }

    const videoRef = ref(storage, path);
    await deleteObject(videoRef);
    console.log('Video deleted successfully');
  } catch (error) {
    console.error('Error deleting video:', error);
    throw new Error('Failed to delete video: ' + error.message);
  }
};

/**
 * Validate video file before upload
 * @param {File} file - Video file to validate
 * @returns {object} - Validation result
 */
export const validateVideoFile = (file) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!file) {
    result.isValid = false;
    result.errors.push('No file selected');
    return result;
  }

  // Check file type
  const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/quicktime'];
  if (!allowedTypes.includes(file.type)) {
    result.isValid = false;
    result.errors.push(`Unsupported file type: ${file.type}`);
  }

  // Check file size (max 1GB)
  const maxSize = 1000 * 1024 * 1024; // 1GB
  if (file.size > maxSize) {
    result.isValid = false;
    result.errors.push(`File size too large (${formatFileSize(file.size)}). Maximum allowed: 1GB`);
  }

  return result;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};