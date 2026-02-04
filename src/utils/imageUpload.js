import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload image file to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} path - Path to store the file
 * @param {function} onProgress - Progress callback function
 * @param {function} onError - Error callback function
 * @returns {Promise<string>} - Download URL of uploaded image
 */
export const uploadImage = (file, path = 'founders', onProgress, onError) => {
    return new Promise((resolve, reject) => {
        // Validate file
        if (!file) {
            const error = 'No file provided';
            onError?.(error);
            reject(new Error(error));
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            const error = 'Invalid file type. Please upload an image file (JPEG, PNG, WEBP, GIF).';
            onError?.(error);
            reject(new Error(error));
            return;
        }

        // Validate file size (e.g., max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            const error = 'File size too large. Maximum size is 5MB.';
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
                    const errorMessage = 'Failed to get image URL after upload.';
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
 * Delete image from Firebase Storage
 * @param {string} imageUrl - Full URL of the image to delete
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageUrl) => {
    try {
        // Extract the path from the full URL
        // Firebase URLs: https://firebasestorage.googleapis.com/.../o/<path>?...
        const url = new URL(imageUrl);
        const pathname = decodeURIComponent(url.pathname);
        const path = pathname.split('/o/')[1]?.split('?')[0];

        if (!path) {
            throw new Error('Invalid image URL format');
        }

        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
        console.log('Image deleted successfully');
    } catch (error) {
        console.error('Error deleting image:', error);
        // Silent fail if image doesn't exist or already deleted
    }
};
