import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTools, addTool, updateTool, removeTool } from '../redux/features/tool/toolSlice';
import { Plus, Edit, Trash, X, FileText, Image, Video, Link as LinkIcon, Search, Download, ExternalLink, Eye, Headphones, Table2, Presentation, BookOpen, Tag } from 'lucide-react';
import { uploadFile } from '../utils/fileUpload';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

/* ─── Built-in types (always available) ─────────────────────────────── */
/* ─── Default tags to initialize with if empty ──────────────────────── */
const DEFAULT_TAG_VALUES = [
    'document', 'image', 'video', 'tutorial', 'audio',
    'spreadsheet', 'presentation', 'link', 'ebook'
];

/* ─── Icon lookup ───────────────────────────────────────────────────── */
const getIcon = (type, size = 20) => {
    switch (type) {
        case 'document': return <FileText size={size} className="text-blue-500" />;
        case 'image': return <Image size={size} className="text-purple-500" />;
        case 'video': return <Video size={size} className="text-red-500" />;
        case 'tutorial': return <LinkIcon size={size} className="text-green-500" />;
        case 'audio': return <Headphones size={size} className="text-orange-500" />;
        case 'spreadsheet': return <Table2 size={size} className="text-teal-500" />;
        case 'presentation': return <Presentation size={size} className="text-yellow-500" />;
        case 'link': return <LinkIcon size={size} className="text-sky-500" />;
        case 'ebook': return <BookOpen size={size} className="text-rose-500" />;
        default: return <Tag size={size} className="text-violet-500" />;
    }
};

/* ─── Video Preview Modal ────────────────────────────────────────────── */
const VideoPreviewModal = ({ isOpen, onClose, videoUrl, title }) => {
    if (!isOpen || !videoUrl) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-black rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden relative">
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="p-2 bg-black/50 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm">
                        <X size={24} />
                    </button>
                </div>
                <div className="relative pt-[56.25%] bg-black">
                    <video src={videoUrl} controls autoPlay className="absolute inset-0 w-full h-full" />
                </div>
                <div className="p-4 bg-gray-900 border-t border-gray-800">
                    <h3 className="text-white font-medium text-lg truncate">{title}</h3>
                </div>
            </div>
        </div>
    );
};

/* ─── Tool Form Modal ────────────────────────────────────────────────── */
const ToolFormModal = ({ isOpen, onClose, onSubmit, toolData, customTags, onSaveTags }) => {
    const [formData, setFormData] = useState({ title: '', description: '', type: 'document', url: '', thumbnail: '' });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    /* ── Tag management local state ── */
    const [newTagInput, setNewTagInput] = useState('');
    const [localCustomTags, setLocalCustomTags] = useState([]);
    const [savingTags, setSavingTags] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalCustomTags([...customTags]);
            setNewTagInput('');
        }
    }, [isOpen, customTags]);

    useEffect(() => {
        if (toolData) {
            setFormData({ title: toolData.title || '', description: toolData.description || '', type: toolData.type || 'document', url: toolData.url || '', thumbnail: toolData.thumbnail || '' });
        } else {
            setFormData({ title: '', description: '', type: 'document', url: '', thumbnail: '' });
        }
    }, [toolData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    /* ── Add a new custom tag ── */
    const handleAddTag = async () => {
        const tag = newTagInput.trim().toLowerCase().replace(/\s+/g, '-');
        if (!tag) return;
        if (localCustomTags.includes(tag)) {
            toast.error('Tag already exists');
            return;
        }
        const updated = [...localCustomTags, tag];
        setSavingTags(true);
        try {
            await apiClient.put('/system-config', { toolTags: updated });
            onSaveTags(updated);
            setLocalCustomTags(updated);
            setNewTagInput('');
            toast.success(`Tag "${tag}" added`);
        } catch {
            toast.error('Failed to save tag');
        } finally {
            setSavingTags(false);
        }
    };

    /* ── Delete a custom tag ── */
    const handleDeleteTag = async (e, tag) => {
        if (e) e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete the "${tag}" tag? This will not delete the tools, but they will lose this category.`)) return;

        const updated = localCustomTags.filter(t => t !== tag);
        setSavingTags(true);
        try {
            await apiClient.put('/system-config', { toolTags: updated });
            onSaveTags(updated);
            setLocalCustomTags(updated);
            // If the currently selected type is the deleted tag, reset to 'document'
            if (formData.type === tag) setFormData(prev => ({ ...prev, type: 'document' }));
            toast.success(`Tag "${tag}" deleted`);
        } catch {
            toast.error('Failed to delete tag');
        } finally {
            setSavingTags(false);
        }
    };

    const getAcceptTypes = () => {
        switch (formData.type) {
            case 'document': return '.pdf,.doc,.docx,.txt';
            case 'image': return 'image/*';
            case 'video': return 'video/*';
            case 'tutorial': return '.pdf,.mp4,video/*';
            case 'audio': return 'audio/*,.mp3,.wav,.aac,.ogg';
            case 'spreadsheet': return '.xls,.xlsx,.csv,.ods';
            case 'presentation': return '.ppt,.pptx,.key,.odp';
            case 'ebook': return '.pdf,.epub,.mobi';
            default: return '*/*';
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        setUploadProgress(0);
        const path = `tools/${formData.type}s`;
        uploadFile(file, path, (progress) => setUploadProgress(progress), (error) => { toast.error(error); setIsUploading(false); })
            .then((url) => { setFormData(prev => ({ ...prev, url })); setIsUploading(false); toast.success('File uploaded successfully!'); })
            .catch(() => setIsUploading(false));
    };

    const handleRemoveFile = () => {
        if (window.confirm('Remove this file?')) setFormData(prev => ({ ...prev, url: '' }));
    };

    const isMediaType = ['video', 'tutorial', 'audio'].includes(formData.type);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg sticky top-0 z-10">
                        <h3 className="text-xl font-semibold text-gray-800">{toolData ? 'Edit Tool' : 'Add New Tool'}</h3>
                        <button type="button" onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input type="text" placeholder="Enter tool title" value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
                        </div>

                        {/* Type Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                                {localCustomTags.map(tag => (
                                    <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
                                ))}
                                {localCustomTags.length === 0 && (
                                    <option value="document">No tags available - Add one below</option>
                                )}
                            </select>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resource</label>
                            {formData.url ? (
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="p-2 bg-green-100 rounded-lg text-green-600">{getIcon(formData.type)}</div>
                                        <div className="truncate">
                                            <p className="text-sm font-medium text-gray-700 truncate">File Uploaded</p>
                                            <a href={formData.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">View File</a>
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleRemoveFile} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                        <Trash size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors relative">
                                    <input type="file" onChange={handleFileUpload} accept={getAcceptTypes()}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" disabled={isUploading} />
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
                                                <p className="text-xs text-gray-400 mt-1">Max size 100MB</p>
                                            </>
                                        )}
                                    </div>
                                    {isUploading && (
                                        <div className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail — only for media types */}
                        {isMediaType && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input type="url" placeholder="https://example.com/thumbnail.jpg" value={formData.thumbnail}
                                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea placeholder="Enter a brief description..." value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[90px]" />
                        </div>

                        {/* ── Manage Tags Section ── */}
                        <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 space-y-3">
                            <div className="flex items-center gap-2">
                                <Tag size={15} className="text-violet-500" />
                                <p className="text-sm font-semibold text-gray-700">Manage Custom Tags</p>
                            </div>

                            {/* Existing custom tags */}
                            {localCustomTags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {localCustomTags.map(tag => (
                                        <div key={tag} className="flex items-center bg-violet-100 text-violet-700 rounded-full pl-3 pr-1 py-1 border border-violet-200 group/tag transition-all hover:bg-violet-200">
                                            <span className="text-xs font-bold mr-1">{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteTag(e, tag)}
                                                disabled={savingTags}
                                                className="p-1 text-violet-400 hover:text-red-500 hover:bg-white/50 rounded-full transition-all"
                                                title="Remove tag"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No custom tags yet.</p>
                            )}

                            {/* Add new tag */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="New tag name (e.g. checklist)"
                                    value={newTagInput}
                                    onChange={(e) => setNewTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none"
                                    disabled={savingTags}
                                />
                                <button type="button" onClick={handleAddTag} disabled={savingTags || !newTagInput.trim()}
                                    className="px-3 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1">
                                    {savingTags ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                                    Add
                                </button>
                            </div>
                            <p className="text-xs text-gray-400">Tags are saved globally and available across all tools. Spaces become hyphens.</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg sticky bottom-0 border-t border-gray-200">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isUploading || !formData.url}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <Plus size={18} />
                            {toolData ? 'Update Tool' : 'Add Tool'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─── Main AdminTools Component ─────────────────────────────────────── */
const AdminTools = () => {
    const dispatch = useDispatch();
    const { tools, loading } = useSelector(state => state.tools);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTool, setEditingTool] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [customTags, setCustomTags] = useState([]);

    /* Fetch tools + custom tags on mount */
    useEffect(() => {
        dispatch(fetchAllTools());
        fetchCustomTags();
    }, [dispatch]);

    const fetchCustomTags = async () => {
        try {
            const res = await apiClient.get('/system-config');
            if (res.data.success) {
                let tags = res.data.config.toolTags || [];
                // If no tags exist, initialize with defaults
                if (tags.length === 0) {
                    await apiClient.put('/system-config', { toolTags: DEFAULT_TAG_VALUES });
                    tags = DEFAULT_TAG_VALUES;
                }
                setCustomTags(tags);
            }
        } catch {
            // non-critical; silently ignore
        }
    };

    const handleOpenModal = (tool = null) => { setEditingTool(tool); setIsModalOpen(true); };
    const handleCloseModal = () => { setEditingTool(null); setIsModalOpen(false); };

    const handleSubmit = async (formData) => {
        try {
            if (editingTool) {
                await dispatch(updateTool({ id: editingTool._id, updatedData: formData })).unwrap();
                toast.success('Tool updated successfully');
            } else {
                await dispatch(addTool(formData)).unwrap();
                toast.success('Tool added successfully');
            }
            handleCloseModal();
            dispatch(fetchAllTools());
        } catch (err) {
            toast.error(err || 'An error occurred');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tool?')) {
            try {
                await dispatch(removeTool(id)).unwrap();
                toast.success('Tool deleted successfully');
            } catch (err) {
                toast.error(err || 'Failed to delete tool');
            }
        }
    };

    const handleDeleteTagGlobal = async (tag) => {
        if (!window.confirm(`Delete the "${tag}" tag globally?`)) return;
        const updated = customTags.filter(t => t !== tag);
        try {
            await apiClient.put('/system-config', { toolTags: updated });
            setCustomTags(updated);
            if (filterType === tag) setFilterType('all');
            toast.success(`Tag "${tag}" deleted`);
        } catch {
            toast.error('Failed to delete tag');
        }
    };

    /* All type tabs = All + Dynamic Tags */
    const allTypeTabs = [
        { value: 'all', label: 'All' },
        ...customTags.map(tag => ({ value: tag, label: tag.charAt(0).toUpperCase() + tag.slice(1) })),
    ];

    const filteredTools = Array.isArray(tools) ? tools.filter(tool => {
        const matchesType = filterType === 'all' || tool.type === filterType;
        const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    }) : [];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tools Management</h1>
                        <p className="text-gray-500 mt-1">Manage documents, videos, and resources for members</p>
                    </div>
                    <button onClick={() => handleOpenModal()}
                        className="bg-green-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm">
                        <Plus size={20} /> Add New Tool
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="w-full md:w-auto flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {allTypeTabs.map(tab => {
                            const isCustom = customTags.includes(tab.value);
                            return (
                                <div key={tab.value} className="relative group/filter">
                                    <button
                                        onClick={() => setFilterType(tab.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap flex items-center gap-2 ${filterType === tab.value
                                            ? 'bg-green-100 text-green-700 shadow-sm border border-green-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'}`}
                                    >
                                        {tab.label}
                                        {isCustom && filterType === tab.value && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTagGlobal(tab.value); }}
                                                className="p-1 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors ml-1"
                                                title="Delete this tag definition"
                                            >
                                                <Trash size={12} />
                                            </button>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="w-full md:w-72 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search tools..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
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
                                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">{getIcon(tool.type)}</div>
                                        {!tool.thumbnail && (
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold uppercase text-gray-600">{tool.type}</span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{tool.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{tool.description || 'No description provided.'}</p>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                        {['video', 'tutorial', 'audio'].includes(tool.type) ? (
                                            <button onClick={() => setPreviewVideo({ url: tool.url, title: tool.title })}
                                                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                                                <Eye size={16} /> Preview
                                            </button>
                                        ) : (
                                            <a href={tool.url} target="_blank" rel="noopener noreferrer"
                                                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                                                <ExternalLink size={14} /> View Resource
                                            </a>
                                        )}
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenModal(tool)}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(tool._id)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
                    customTags={customTags}
                    onSaveTags={setCustomTags}
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
