import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTools } from '../redux/features/tool/toolSlice';
import { FileText, Image, Video, Link as LinkIcon, Search, ExternalLink, Download, FolderOpen, Play, X } from 'lucide-react';

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, title }) => {
    if (!isOpen || !videoUrl) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-black rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative border border-gray-800">
                <div className="absolute top-4 right-4 z-10 transition-opacity hover:opacity-100">
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/50 text-white hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-md"
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
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="p-6 bg-gradient-to-b from-gray-900 to-black border-t border-gray-800">
                    <h3 className="text-white font-semibold text-xl truncate tracking-tight">{title}</h3>
                </div>
            </div>
        </div>
    );
};

const Tools = () => {
    const dispatch = useDispatch();
    const { tools, loading, error } = useSelector(state => state.tools);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [previewVideo, setPreviewVideo] = useState(null); // { url, title }

    useEffect(() => {
        dispatch(fetchAllTools());
    }, [dispatch]);

    const getIcon = (type) => {
        switch (type) {
            case 'document': return <FileText size={24} className="text-blue-600" />;
            case 'image': return <Image size={24} className="text-purple-600" />;
            case 'video': return <Video size={24} className="text-red-600" />;
            case 'tutorial': return <LinkIcon size={24} className="text-green-600" />;
            default: return <FileText size={24} className="text-gray-600" />;
        }
    };

    const getActionLabel = (type) => {
        switch (type) {
            case 'document': return 'View Document';
            case 'image': return 'View Image';
            case 'video': return 'Watch Video';
            case 'tutorial': return 'Open Tutorial';
            default: return 'Open Resource';
        }
    };

    const filteredTools = Array.isArray(tools) ? tools.filter(tool => {
        const matchesType = filterType === 'all' || tool.type === filterType;
        const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    }) : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 py-12 px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Member Tools & Resources</h1>
                    <p className="text-green-100 text-lg">Access documents, tutorials, and helpful resources for your journey.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 justify-between items-center transform -translate-y-4 md:-translate-y-8 border border-gray-100">
                    <div className="w-full md:w-auto flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {[
                            { id: 'all', label: 'All Resources' },
                            { id: 'document', label: 'Documents' },
                            { id: 'video', label: 'Videos' },
                            { id: 'image', label: 'Images' },
                            { id: 'tutorial', label: 'Tutorials' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setFilterType(type.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterType === type.id
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                    <div className="w-full md:w-72 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading resources...</p>
                    </div>
                ) : filteredTools.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FolderOpen size={40} className="text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No resources found</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            We couldn't find any tools matching your filters. Try checking back later or adjust your search.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTools.map(tool => (
                            <div
                                key={tool._id}
                                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full transform hover:-translate-y-1"
                            >
                                {tool.thumbnail ? (
                                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                                        <img
                                            src={tool.thumbnail}
                                            alt={tool.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase text-gray-800 shadow-sm">
                                            {tool.type}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`h-3 bg-gradient-to-r ${tool.type === 'video' ? 'from-red-500 to-pink-500' :
                                        tool.type === 'document' ? 'from-blue-500 to-indigo-500' :
                                            tool.type === 'image' ? 'from-purple-500 to-violet-500' :
                                                'from-green-500 to-teal-500'
                                        }`}></div>
                                )}

                                <div className="p-6 flex-1 flex flex-col">
                                    {!tool.thumbnail && (
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                                {getIcon(tool.type)}
                                            </div>
                                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold uppercase text-gray-600">
                                                {tool.type}
                                            </span>
                                        </div>
                                    )}

                                    <h3 className="font-bold text-gray-900 text-xl mb-3 leading-tight group-hover:text-green-700 transition-colors">
                                        {tool.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                                        {tool.description || 'No description provided for this resource.'}
                                    </p>

                                    {(tool.type === 'video' || tool.type === 'tutorial') ? (
                                        <button
                                            onClick={() => setPreviewVideo({ url: tool.url, title: tool.title })}
                                            className="mt-auto w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-green-600 text-gray-700 hover:text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-100 hover:border-transparent group-hover:shadow-md"
                                        >
                                            <span>{getActionLabel(tool.type)}</span>
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                    ) : (
                                        <a
                                            href={tool.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-auto w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-green-600 text-gray-700 hover:text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-100 hover:border-transparent group-hover:shadow-md"
                                        >
                                            <span>{getActionLabel(tool.type)}</span>
                                            <ExternalLink size={16} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <VideoPlayerModal
                    isOpen={!!previewVideo}
                    onClose={() => setPreviewVideo(null)}
                    videoUrl={previewVideo?.url}
                    title={previewVideo?.title}
                />
            </div>
        </div>
    );
};

export default Tools;
