// src/components/VideoUpload.jsx
import React, { useState, useRef } from 'react';
import { Upload, X, Play, Loader, AlertCircle, CheckCircle, Video } from 'lucide-react';
import { uploadVideo, validateVideoFile, formatFileSize } from '../utils/videoUpload';
import toast from 'react-hot-toast';

const VideoUpload = ({ 
  courseId, 
  chapterId, 
  onUploadSuccess, 
  onUploadError,
  existingVideoUrl = null,
  disabled = false 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(existingVideoUrl);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const uploadTaskRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      toast.error(validation.errors.join('. '));
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Upload video
  const handleUpload = async () => {
    if (!selectedFile || !courseId || !chapterId) {
      toast.error('Missing required information for upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadTask = uploadVideo(
        selectedFile,
        courseId,
        chapterId,
        (progress) => {
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error(error);
          onUploadError?.(error);
        }
      );

      uploadTaskRef.current = uploadTask;

      const videoUrl = await uploadTask;
      
      setUploading(false);
      setUploadProgress(100);
      
      toast.success('Video uploaded successfully!');
      onUploadSuccess?.(videoUrl);
      
      // Update preview URL to the uploaded video
      setPreviewUrl(videoUrl);

    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      console.error('Upload failed:', error);
    }
  };

  // Cancel upload
  const cancelUpload = () => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
      uploadTaskRef.current = null;
    }
    setUploading(false);
    setUploadProgress(0);
    toast.info('Upload canceled');
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(existingVideoUrl);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open file selector
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-600" />
          Video Upload
        </h3>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {!selectedFile && !previewUrl && (
          <div className="py-8">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop your video here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <button
              type="button"
              onClick={openFileSelector}
              disabled={disabled || uploading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Video
            </button>
            <p className="text-xs text-gray-400 mt-3">
              Supported formats: MP4, AVI, MOV, WMV, FLV, WebM (Max: 500MB)
            </p>
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="relative">
            <video
              src={previewUrl}
              controls
              className="w-full max-h-64 rounded-lg"
              style={{ maxHeight: '256px' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            {!uploading ? (
              <>
                <button
                  onClick={handleUpload}
                  disabled={disabled || !selectedFile}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={cancelUpload}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Upload
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Status */}
      {uploadProgress === 100 && !uploading && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-700">Video uploaded successfully!</span>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;