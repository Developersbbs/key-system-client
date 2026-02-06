import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTools, addTool, updateTool, removeTool } from '../redux/features/tool/toolSlice';
import { Plus, Edit, Trash, X, FileText, Image, Video, Link as LinkIcon, Search, Download, ExternalLink, Eye } from 'lucide-react';
import { uploadFile } from '../utils/fileUpload';
import toast from 'react-hot-toast';

const VideoPreviewModal = ({ isOpen, onClose, videoUrl, title }) => {
    if (!isOpen || !videoUrl) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-black rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden relative">
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/50 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="relative pt-[56.25%] bg-black">
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
                <div className="p-4 bg-gray-900 border-t border-gray-800">
                    <h3 className="text-white font-medium text-lg truncate">{title}</h3>
                </div>
            </div>
        </div>
    );
};

const ToolFormModal = ({ isOpen, onClose, onSubmit, toolData }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'document',
        url: '',
        thumbnail: ''
    });

    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (toolData) {
            setFormData({
                title: toolData.title || '',
                description: toolData.description || '',
                type: toolData.type || 'document',
                url: toolData.url || '',
                thumbnail: toolData.thumbnail || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                type: 'document',
                url: '',
                thumbnail: ''
            });
        }
    }, [toolData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        // Determine path based on type
        const path = `tools/${formData.type}s`;

        uploadFile(
            file,
            path,
            (progress) => setUploadProgress(progress),
            (error) => {
                toast.error(error);
                setIsUploading(false);
            }
        ).then((url) => {
            setFormData(prev => ({ ...prev, url: url }));
            setIsUploading(false);
            toast.success('File uploaded successfully!');
        }).catch(err => {
            console.error(err);
            setIsUploading(false);
        });
    };

    const handleRemoveFile = async () => {
        if (!formData.url) return;

        if (window.confirm("Are you sure you want to remove this file?")) {
            // Optional: Delete from storage if it's a new upload or user confirms
            // For now, just clear the URL from form
            setFormData(prev => ({ ...prev, url: '' }));
        }
    };

    const getAcceptTypes = () => {
        switch (formData.type) {
            case 'document': return '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt';
            case 'image': return 'image/*';
            case 'video': return 'video/*';
            case 'tutorial': return '.pdf,.mp4,video/*'; // Tutorials can be docs or videos
            default: return '*/*';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="text-xl font-semibold text-gray-800">{toolData ? 'Edit Tool' : 'Add New Tool'}</h3>
                        <button type="button" onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                placeholder="Enter tool title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="document">Document</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="tutorial">Tutorial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resource</label>
                            {formData.url ? (
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                            {formData.type === 'image' ? <Image size={20} /> :
                                                formData.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-medium text-gray-700 truncate">File Uploaded</p>
                                            <a href={formData.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                                                View File
                                            </a>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors relative">
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        accept={getAcceptTypes()}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        disabled={isUploading}
                                    />
                                    <div className="text-center">
                                        {isUploading ? (
                                            <div className="space-y-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                                <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                                    <Download size={24} className="text-gray-400 transform rotate-180" />
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">Click to upload {formData.type}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Max size 100MB. Supported: {formData.type === 'image' ? 'JPG, PNG, GIF' :
                                                        formData.type === 'video' ? 'MP4, WebM' : 'PDF, DOC, XLS'}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    {isUploading && (
                                        <div className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                    )}
                                </div>
                            )}
                            {/* Hidden input to ensure HTML5 validation still works if we wanted to rely on it, but we can't strictly use 'required' on a hidden input easily interacting with a visual component. We'll validate manually or rely on formData.url check in submit. */}
                        </div>

                        {(formData.type === 'video' || formData.type === 'tutorial') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/thumbnail.jpg"
                                    value={formData.thumbnail}
                                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Useful to display a custom cover for the video.</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                placeholder="Enter a brief description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[100px]"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading || !formData.url}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={18} />
                            {toolData ? 'Update Tool' : 'Add Tool'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminTools = () => {
    const dispatch = useDispatch();
    const { tools, loading, error } = useSelector(state => state.tools);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTool, setEditingTool] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(null); // { url, title }
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchAllTools());
    }, [dispatch]);

    const handleOpenModal = (tool = null) => {
        setEditingTool(tool);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingTool(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingTool) {
                await dispatch(updateTool({ id: editingTool._id, updatedData: formData })).unwrap();
                toast.success("Tool updated successfully");
            } else {
                await dispatch(addTool(formData)).unwrap();
                toast.success("Tool added successfully");
            }
            handleCloseModal();
            dispatch(fetchAllTools());
        } catch (err) {
            toast.error(err || "An error occurred");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this tool?")) {
            try {
                await dispatch(removeTool(id)).unwrap();
                toast.success("Tool deleted successfully");
            } catch (err) {
                toast.error(err || "Failed to delete tool");
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'document': return <FileText size={20} className="text-blue-500" />;
            case 'image': return <Image size={20} className="text-purple-500" />;
            case 'video': return <Video size={20} className="text-red-500" />;
            case 'tutorial': return <LinkIcon size={20} className="text-green-500" />;
            default: return <FileText size={20} className="text-gray-500" />;
        }
    };

    const filteredTools = Array.isArray(tools) ? tools.filter(tool => {
        const matchesType = filterType === 'all' || tool.type === filterType;
        const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    }) : [];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tools Management</h1>
                        <p className="text-gray-500 mt-1">Manage documents, videos, and resources for members</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-green-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} /> Add New Tool
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="w-full md:w-auto flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['all', 'document', 'image', 'video', 'tutorial'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filterType === type
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <div className="w-full md:w-72 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                    </div>
                </div>

                {/* Tools List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading tools...</p>
                    </div>
                ) : filteredTools.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No tools found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your filters or add a new tool.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTools.map(tool => (
                            <div key={tool._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
                                {tool.thumbnail && (
                                    <div className="h-40 bg-gray-100 relative">
                                        <img src={tool.thumbnail} alt={tool.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold uppercase text-gray-700 shadow-sm">
                                            {tool.type}
                                        </div>
                                    </div>
                                )}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                            {getIcon(tool.type)}
                                        </div>
                                        {!tool.thumbnail && (
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold uppercase text-gray-600">
                                                {tool.type}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{tool.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{tool.description || 'No description provided.'}</p>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                        {(tool.type === 'video' || tool.type === 'tutorial') ? (
                                            <button
                                                onClick={() => setPreviewVideo({ url: tool.url, title: tool.title })}
                                                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                                            >
                                                <Eye size={16} /> Preview
                                            </button>
                                        ) : (
                                            <a
                                                href={tool.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                                            >
                                                <ExternalLink size={14} /> View Resource
                                            </a>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(tool)}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tool._id)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <ToolFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                    toolData={editingTool}
                />

                <VideoPreviewModal
                    isOpen={!!previewVideo}
                    onClose={() => setPreviewVideo(null)}
                    videoUrl={previewVideo?.url}
                    title={previewVideo?.title}
                />
            </div>
        </div>
    );
};

export default AdminTools;
