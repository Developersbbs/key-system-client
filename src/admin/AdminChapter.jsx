// src/pages/Admin/AdminChapter.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  createChapter,
  getAllChapters,
  updateChapter,
  deleteChapter,
  clearError
} from '../redux/features/chapters/chapterSlice';
import { uploadVideo, deleteVideo, validateVideoFile, formatFileSize } from '../../src/utils/videoUpload';
import {
  Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Clock, FileText, Video, Link as LinkIcon,
  CheckCircle, XCircle, Timer, PlayCircle, Upload, RefreshCw, AlertCircle, Loader
} from 'lucide-react';

const AdminChapter = () => {
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const { chapters, loading, error } = useSelector((state) => state.chapters);
  const fileInputRef = useRef(null);

  // --- State Management ---
  const initialFormState = {
    title: '',
    description: '',
    videoUrl: '',
    documentUrl: '',
    duration: 0,
    isUnlocked: false,
    timerEnabled: true,
    mcqs: [],
    tasks: [],
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState('details');
  const [expandedChapters, setExpandedChapters] = useState(new Set());

  // Video upload state for Firebase
  const [videoUpload, setVideoUpload] = useState({
    isUploading: false,
    progress: 0,
    fileName: '',
    fileSize: 0,
    uploadedUrl: '',
    error: null
  });

  // --- Effects ---
  useEffect(() => {
    if (courseId) {
      dispatch(getAllChapters(courseId));
    }
  }, [dispatch, courseId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // --- Firebase Video Upload ---
  const uploadVideoWithProgress = async (file) => {
    try {
      // Validate file before upload
      const validation = validateVideoFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('. '));
      }

      setVideoUpload(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
        fileName: file.name,
        fileSize: file.size
      }));

      // Upload to Firebase Storage
      const videoUrl = await uploadVideo(
        file,
        courseId,
        editingChapter?._id || 'temp',
        (progress) => {
          setVideoUpload(prev => ({ ...prev, progress }));
        },
        (error) => {
          console.error('Firebase upload error:', error);
          let errorMsg = 'Failed to upload video';
          if (error.code) {
            errorMsg += ` (${error.code})`;
          }
          if (error.message) {
            errorMsg += `: ${error.message}`;
          }
          if (error.stack) {
            console.error(error.stack);
          }
          setVideoUpload(prev => ({ 
            ...prev, 
            isUploading: false, 
            error: errorMsg, 
            progress: 0 
          }));
          toast.error(errorMsg);
          throw error;
        }
      );

      // Update form data and upload state
      setFormData(prev => ({ ...prev, videoUrl }));
      setVideoUpload(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedUrl: videoUrl,
        error: null
      }));

      // Auto-save if editing existing chapter
      if (editingChapter) {
        try {
          await dispatch(updateChapter({
            courseId,
            chapterId: editingChapter._id,
            updatedData: { ...formData, videoUrl }
          })).unwrap();
          toast.success('Video uploaded and chapter updated successfully!');
        } catch (saveError) {
          console.warn('Failed to auto-save video URL:', saveError);
          toast.success('Video uploaded! Remember to save the chapter.');
        }
      } else {
        toast.success('Video uploaded successfully! Save the chapter to complete.');
      }

      return videoUrl;
    } catch (error) {
      console.error('Video upload failed:', error);
      const errorMsg = error.message || 'Failed to upload video';
      if (error.stack) {
        console.error(error.stack);
      }
      setVideoUpload(prev => ({ 
        ...prev, 
        isUploading: false, 
        error: errorMsg, 
        progress: 0 
      }));
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleVideoFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await uploadVideoWithProgress(file);
    } catch (error) {
      // Error already handled in uploadVideoWithProgress
      console.error('Video upload failed:', error);
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = async () => {
    if (videoUpload.uploadedUrl) {
      try {
        await deleteVideo(videoUpload.uploadedUrl);
        toast.success('Video removed successfully');
      } catch (error) {
        console.warn('Failed to delete video from Firebase:', error);
        toast.warning('Video removed from form, but may still exist in storage');
      }
    }

    setVideoUpload({
      isUploading: false,
      progress: 0,
      fileName: '',
      fileSize: 0,
      uploadedUrl: '',
      error: null
    });
    setFormData(prev => ({ ...prev, videoUrl: '' }));
  };

  const handleRetryUpload = () => {
    setVideoUpload(prev => ({ ...prev, error: null }));
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- Form Handlers ---
  const handleOpenForm = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter);
      setFormData({
        title: chapter.title || '',
        description: chapter.description || '',
        videoUrl: chapter.videoUrl || '',
        documentUrl: chapter.documentUrl || '',
        duration: chapter.duration || 0,
        isUnlocked: chapter.isUnlocked || false,
        timerEnabled: chapter.timerEnabled !== undefined ? chapter.timerEnabled : true,
        mcqs: chapter.mcqs || [],
        tasks: chapter.tasks || [],
      });

      // Set video upload state if video exists
      if (chapter.videoUrl) {
        setVideoUpload(prev => ({
          ...prev,
          uploadedUrl: chapter.videoUrl,
          fileName: 'Existing video',
          progress: 100,
          isUploading: false,
          error: null
        }));
      }
    } else {
      setEditingChapter(null);
      setFormData(initialFormState);
      setVideoUpload({
        isUploading: false,
        progress: 0,
        fileName: '',
        fileSize: 0,
        uploadedUrl: '',
        error: null
      });
    }
    setActiveTab('details');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingChapter(null);
    setFormData(initialFormState);
    setVideoUpload({
      isUploading: false,
      progress: 0,
      fileName: '',
      fileSize: 0,
      uploadedUrl: '',
      error: null
    });
    setIsFormOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // MCQ Handlers
  const handleMcqChange = (mcqIndex, field, value) => {
    const newMcqs = [...formData.mcqs];
    newMcqs[mcqIndex][field] = value;
    setFormData(prev => ({ ...prev, mcqs: newMcqs }));
  };

  const handleMcqOptionChange = (mcqIndex, optionIndex, value) => {
    const newMcqs = [...formData.mcqs];
    newMcqs[mcqIndex].options[optionIndex] = value;
    setFormData(prev => ({ ...prev, mcqs: newMcqs }));
  };

  const addMcq = () => setFormData(prev => ({
    ...prev,
    mcqs: [...prev.mcqs, { 
      question: '', 
      options: ['', '', '', ''], 
      correctAnswerIndex: 0, 
      explanation: '' 
    }]
  }));

  const removeMcq = (mcqIndex) => setFormData(prev => ({
    ...prev,
    mcqs: prev.mcqs.filter((_, i) => i !== mcqIndex)
  }));

  // Task Handlers
  const handleTaskChange = (taskIndex, field, value) => {
    const newTasks = [...formData.tasks];
    newTasks[taskIndex][field] = value;
    setFormData(prev => ({ ...prev, tasks: newTasks }));
  };

  const addTask = () => setFormData(prev => ({
    ...prev,
    tasks: [...prev.tasks, { 
      type: 'online', 
      title: '', 
      description: '', 
      deadline: '' 
    }]
  }));

  const removeTask = (taskIndex) => setFormData(prev => ({
    ...prev,
    tasks: prev.tasks.filter((_, i) => i !== taskIndex)
  }));

  // --- Submit Chapter ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (videoUpload.isUploading) {
      toast.error('Please wait for video upload to complete');
      return;
    }

    if (!courseId) {
      toast.error('Course ID is missing.');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Chapter title is required.');
      return;
    }

    const chapterData = {
      ...formData,
      duration: Number(formData.duration) || 0,
      mcqs: formData.mcqs.map(mcq => ({ 
        ...mcq, 
        correctAnswerIndex: Number(mcq.correctAnswerIndex) 
      }))
    };

    try {
      if (editingChapter) {
        await dispatch(updateChapter({ 
          courseId, 
          chapterId: editingChapter._id, 
          updatedData: chapterData 
        })).unwrap();
        toast.success('Chapter updated successfully!');
      } else {
        await dispatch(createChapter({ courseId, chapterData })).unwrap();
        toast.success('Chapter created successfully!');
        dispatch(getAllChapters(courseId)); // Refetch chapters to update the list
      }
      handleCloseForm();
    } catch (err) {
      console.error('Chapter save error:', err);
      toast.error(err.message || 'Failed to save chapter');
    }
  };

  // --- Delete Chapter ---
  const handleDelete = async (chapterId, chapterTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${chapterTitle}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await dispatch(deleteChapter({ courseId, chapterId })).unwrap();
      toast.success('Chapter deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete chapter');
    }
  };

  const toggleChapterExpansion = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  // --- Components ---
  const TabButton = ({ tabName, label, count }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        activeTab === tabName
          ? 'bg-teal-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  );

  const VideoUploadSection = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Chapter Video</label>
      
      {/* Upload Area */}
      {!videoUpload.uploadedUrl && !videoUpload.isUploading && !videoUpload.error && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors duration-200">
          <div className="flex flex-col items-center">
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">Upload your video file</p>
            <p className="text-xs text-gray-500 mb-4">MP4, AVI, MOV, WMV, WebM (Max: 500MB)</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors duration-200"
            >
              <Upload size={16} />
              Choose Video File
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {videoUpload.isUploading && (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Loader className="h-5 w-5 text-teal-600 animate-spin" />
            <span className="font-medium text-gray-900">Uploading to Firebase...</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 truncate">{videoUpload.fileName}</span>
              <span className="text-gray-500">{formatFileSize(videoUpload.fileSize)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${videoUpload.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress: {videoUpload.progress}%</span>
              <span>{videoUpload.progress === 100 ? 'Processing...' : 'Uploading...'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {videoUpload.error && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Upload failed</p>
              <p className="text-sm text-red-700 mt-1">{videoUpload.error}</p>
            </div>
            <button
              type="button"
              onClick={handleRetryUpload}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Upload Success */}
      {videoUpload.uploadedUrl && !videoUpload.isUploading && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Video uploaded successfully</p>
              <p className="text-sm text-green-700 mt-1 truncate">{videoUpload.fileName}</p>
              {videoUpload.fileSize > 0 && (
                <p className="text-xs text-green-600 mt-1">{formatFileSize(videoUpload.fileSize)}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoFileSelect}
        className="hidden"
      />
    </div>
  );

 

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chapter Management</h1>
              <p className="text-gray-600">Create and organize course chapters with content, quizzes, and tasks</p>
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="bg-gradient-to-r from-teal-600 to-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              Add Chapter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-teal-100 mr-4">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
                <p className="text-gray-600">Total Chapters</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chapters.reduce((acc, ch) => acc + (ch.mcqs?.length || 0), 0)}
                </p>
                <p className="text-gray-600">Total MCQs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 mr-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chapters.reduce((acc, ch) => acc + (ch.tasks?.length || 0), 0)}
                </p>
                <p className="text-gray-600">Total Tasks</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100 mr-4">
                <Timer className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chapters.reduce((acc, ch) => acc + (ch.duration || 0), 0)}
                </p>
                <p className="text-gray-600">Total Duration (min)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
              <div className="sticky top-0 bg-white border-b p-6 z-10 rounded-t-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <TabButton tabName="details" label="Details" />
                  <TabButton tabName="mcqs" label="MCQs" count={formData.mcqs.length} />
                  <TabButton tabName="tasks" label="Tasks" count={formData.tasks.length} />
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter chapter title"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter chapter description"
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* Firebase Video Upload Section */}
                      <VideoUploadSection />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Document URL</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="url"
                            name="documentUrl"
                            value={formData.documentUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/document"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Settings</h4>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="isUnlocked"
                            checked={formData.isUnlocked}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                          />
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className={formData.isUnlocked ? 'text-green-600' : 'text-gray-400'} />
                            <span className="text-sm font-medium text-gray-700">Is Unlocked</span>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="timerEnabled"
                            checked={formData.timerEnabled}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                          />
                          <div className="flex items-center gap-2">
                            <Timer size={16} className={formData.timerEnabled ? 'text-orange-600' : 'text-gray-400'} />
                            <span className="text-sm font-medium text-gray-700">Timer Enabled</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* MCQs Tab */}
                {activeTab === 'mcqs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Multiple Choice Questions</h3>
                      <button
                        type="button"
                        onClick={addMcq}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add MCQ
                      </button>
                    </div>

                    {formData.mcqs.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No MCQs yet</h3>
                        <p className="text-gray-600 mb-4">Add questions to test student knowledge</p>
                        <button
                          type="button"
                          onClick={addMcq}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add First MCQ
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.mcqs.map((mcq, mcqIndex) => (
                          <div key={mcqIndex} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">MCQ {mcqIndex + 1}</span>
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeMcq(mcqIndex)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                <textarea
                                  value={mcq.question}
                                  onChange={(e) => handleMcqChange(mcqIndex, 'question', e.target.value)}
                                  placeholder="Enter your question here"
                                  rows="2"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Answer Options</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {mcq.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="relative">
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleMcqOptionChange(mcqIndex, optIndex, e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                        className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                      />
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">
                                        {String.fromCharCode(65 + optIndex)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                                <select
                                  value={mcq.correctAnswerIndex}
                                  onChange={(e) => handleMcqChange(mcqIndex, 'correctAnswerIndex', parseInt(e.target.value, 10))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                >
                                  {mcq.options.map((option, optIndex) => (
                                    <option key={optIndex} value={optIndex}>
                                      Option {String.fromCharCode(65 + optIndex)} - {option || `Option ${optIndex + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                                <textarea
                                  value={mcq.explanation || ''}
                                  onChange={(e) => handleMcqChange(mcqIndex, 'explanation', e.target.value)}
                                  placeholder="Explain why this is the correct answer"
                                  rows="2"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Chapter Tasks</h3>
                      <button
                        type="button"
                        onClick={addTask}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add Task
                      </button>
                    </div>

                    {formData.tasks.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                        <p className="text-gray-600 mb-4">Add tasks for students to complete</p>
                        <button
                          type="button"
                          onClick={addTask}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add First Task
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Task {taskIndex + 1}</span>
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeTask(taskIndex)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                                <input
                                  type="text"
                                  value={task.title}
                                  onChange={(e) => handleTaskChange(taskIndex, 'title', e.target.value)}
                                  placeholder="Enter task title"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Task Description</label>
                                <textarea
                                  value={task.description}
                                  onChange={(e) => handleTaskChange(taskIndex, 'description', e.target.value)}
                                  placeholder="Describe what students need to do"
                                  rows="3"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                                  <select
                                    value={task.type}
                                    onChange={(e) => handleTaskChange(taskIndex, 'type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  >
                                    <option value="online">Online Task</option>
                                    <option value="offline">Offline Task</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                                  <input
                                    type="date"
                                    value={task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleTaskChange(taskIndex, 'deadline', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Footer */}
              <div className="sticky bottom-0 bg-white border-t p-6">
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={videoUpload.isUploading}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 font-medium ${
                      videoUpload.isUploading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    <Save size={18} />
                    {videoUpload.isUploading ? 'Uploading...' : (editingChapter ? 'Update Chapter' : 'Create Chapter')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapters List */}
        <div className="bg-white rounded-xl shadow-sm">
          {chapters.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No chapters found</h3>
              <p className="text-gray-600 mb-6">Create your first chapter to get started!</p>
              <button
                onClick={() => handleOpenForm()}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors duration-200"
              >
                <Plus size={20} />
                Create First Chapter
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {chapters.map((chapter, index) => (
                <div key={chapter._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">
                          Chapter {index + 1}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900">{chapter.title}</h3>
                        <div className="flex items-center gap-2">
                          {chapter.isUnlocked ? (
                            <CheckCircle size={16} className="text-green-500" title="Unlocked" />
                          ) : (
                            <XCircle size={16} className="text-red-500" title="Locked" />
                          )}
                          {chapter.timerEnabled && (
                            <Timer size={16} className="text-orange-500" title="Timer Enabled" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                          <CheckCircle size={14} />
                          {chapter.mcqs?.length || 0} MCQs
                        </span>
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                          <Clock size={14} />
                          {chapter.tasks?.length || 0} Tasks
                        </span>
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                          <PlayCircle size={14} />
                          {chapter.duration || 0} min
                        </span>
                        {chapter.videoUrl && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            <Video size={14} />
                            Video
                          </span>
                        )}
                        <button
                          onClick={() => toggleChapterExpansion(chapter._id)}
                          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm px-2 py-1 rounded transition-colors duration-200"
                        >
                          {expandedChapters.has(chapter._id) ? (
                            <>
                              <EyeOff size={14} />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              Show Details
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{chapter.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => handleOpenForm(chapter)}
                        className="p-3 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(chapter._id, chapter.title)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {expandedChapters.has(chapter._id) && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {chapter.videoUrl && (
                          <div className="flex items-center gap-2">
                            <Video size={16} className="text-teal-500" />
                            <span className="text-sm font-medium text-gray-700">Video:</span>
                            <a
                              href={chapter.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-600 hover:text-teal-800 text-sm truncate flex-1"
                            >
                              View Video
                            </a>
                          </div>
                        )}
                        {chapter.documentUrl && (
                          <div className="flex items-center gap-2">
                            <LinkIcon size={16} className="text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Document:</span>
                            <a
                              href={chapter.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 text-sm truncate flex-1"
                            >
                              Download Document
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChapter;