import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFounders } from '../redux/features/founders/founderSlice';

import { Linkedin, Twitter, Facebook, Instagram, User, X, MapPin, LayoutGrid, List } from 'lucide-react';

const Founders = () => {
    const dispatch = useDispatch();
    const { founders, loading, error } = useSelector((state) => state.founders);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

    useEffect(() => {
        dispatch(fetchFounders());
    }, [dispatch]);

    const designations = ['Founder', 'Director', 'Senior Director', 'Key Leader'];

    const getDesignationColor = (designation) => {
        switch (designation) {
            case 'Founder':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'Director':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'Senior Director':
                return 'text-teal-600 bg-teal-50 border-teal-200';
            case 'Key Leader':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Leadership</span> Team
                        </h1>
                        <p className="text-gray-600">
                            Meet the visionaries and leaders who drive our mission forward.
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg mt-4 md:mt-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            title="Grid View"
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-16">
                        {designations.map((designation) => {
                            const designationFounders = founders.filter(f => f.designation === designation);

                            if (designationFounders.length === 0) return null;

                            return (
                                <div key={designation} className="relative">
                                    <div className="flex items-center mb-8">
                                        <div className="h-px bg-gray-200 flex-grow"></div>
                                        <h2 className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mx-4 border ${getDesignationColor(designation)}`}>
                                            {designation}s
                                        </h2>
                                        <div className="h-px bg-gray-200 flex-grow"></div>
                                    </div>

                                    {/* Grid View Construction */}
                                    {viewMode === 'grid' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                            {designationFounders.map((founder) => (
                                                <div key={founder._id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full mt-12 bg-cover bg-center">
                                                    {/* Starry Night Header */}
                                                    <div className="h-32 relative overflow-hidden bg-[#0a192f]">
                                                        <div className="absolute inset-0 bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364]"></div>
                                                        <div className="absolute inset-0 opacity-40">
                                                            <div className="w-1 h-1 bg-white rounded-full absolute top-4 left-10 animate-pulse"></div>
                                                            <div className="w-1 h-1 bg-white rounded-full absolute top-12 left-1/4 animate-pulse delay-75"></div>
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-6 right-12 animate-pulse delay-150"></div>
                                                            <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-20 right-1/3 animate-pulse delay-300"></div>
                                                        </div>
                                                    </div>

                                                    {/* Circular Profile Image (Grid) */}
                                                    <div
                                                        className="relative mx-auto -mt-20 h-40 w-40 rounded-full border-[5px] border-white shadow-lg overflow-visible cursor-pointer z-10 bg-white"
                                                        onClick={() => {
                                                            setViewData(founder);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                    >
                                                        <div className="w-full h-full rounded-full overflow-hidden relative">
                                                            {founder.imageUrl ? (
                                                                <img src={founder.imageUrl} alt={founder.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><User size={64} strokeWidth={1.5} /></div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="p-6 pt-4 flex-grow flex flex-col items-center text-center cursor-pointer" onClick={() => { setViewData(founder); setIsViewModalOpen(true); }}>
                                                        <h3 className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-[#2C5364] transition-colors font-sans">{founder.name}</h3>

                                                        {(founder.state || founder.district) && (
                                                            <p className="text-gray-400 text-sm mb-4 font-medium">{founder.district ? `${founder.district}, ` : ''}{founder.state}</p>
                                                        )}

                                                        <p className="text-lg text-gray-600 mb-6 font-normal">{founder.designation}</p>

                                                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-8 px-2 font-light">{founder.description}</p>

                                                        <div className="flex justify-center space-x-5 mt-auto pb-2">
                                                            {founder.socialLinks?.instagram && <a href={founder.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center bg-[#eae0f5] text-[#9b6bcc] rounded-full hover:bg-[#9b6bcc] hover:text-white transition-all transform hover:scale-110 shadow-sm" onClick={(e) => e.stopPropagation()}><Instagram size={20} /></a>}
                                                            {founder.socialLinks?.twitter && <a href={founder.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center bg-[#dcf0fc] text-[#5DADE2] rounded-full hover:bg-[#5DADE2] hover:text-white transition-all transform hover:scale-110 shadow-sm" onClick={(e) => e.stopPropagation()}><Twitter size={20} /></a>}
                                                            {founder.socialLinks?.facebook && <a href={founder.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center bg-[#dbeaf5] text-[#3498DB] rounded-full hover:bg-[#3498DB] hover:text-white transition-all transform hover:scale-110 shadow-sm" onClick={(e) => e.stopPropagation()}><Facebook size={20} /></a>}
                                                            {founder.socialLinks?.linkedin && <a href={founder.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center bg-[#d9eaf7] text-[#0077b5] rounded-full hover:bg-[#0077b5] hover:text-white transition-all transform hover:scale-110 shadow-sm" onClick={(e) => e.stopPropagation()}><Linkedin size={20} /></a>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        /* List View Construction */
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {designationFounders.map((founder) => (
                                                <div key={founder._id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex overflow-hidden">

                                                    {/* Left Side Starry Vertical Banner */}
                                                    <div className="w-24 md:w-32 relative bg-[#0a192f] flex-shrink-0">
                                                        <div className="absolute inset-0 bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364]"></div>
                                                        <div className="absolute inset-0 opacity-40">
                                                            <div className="w-1 h-1 bg-white rounded-full absolute top-4 left-4 animate-pulse"></div>
                                                            <div className="w-1 h-1 bg-white rounded-full absolute bottom-8 left-8 animate-pulse delay-500"></div>
                                                        </div>

                                                        {/* Profile Image Centered Vertically overlapping right edge slightly */}
                                                        <div className="absolute inset-0 flex items-center justify-center translate-x-1/2 z-10">
                                                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                                                                {founder.imageUrl ? (
                                                                    <img src={founder.imageUrl} alt={founder.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><User size={32} /></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Side Content */}
                                                    <div className="flex-grow p-4 md:p-6 pl-14 md:pl-16 flex flex-col justify-center relative cursor-pointer" onClick={() => { setViewData(founder); setIsViewModalOpen(true); }}>
                                                        <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-[#2C5364] transition-colors">{founder.name}</h3>
                                                        <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wider mb-2">{founder.designation}</p>

                                                        {(founder.state || founder.district) && (
                                                            <div className="flex items-center text-gray-400 text-xs mb-3">
                                                                <MapPin size={12} className="mr-1" />
                                                                {founder.district ? `${founder.district}, ` : ''}{founder.state}
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2 mt-2">
                                                            {founder.socialLinks?.instagram && <a href={founder.socialLinks.instagram} className="text-gray-400 hover:text-[#e4405f] transform hover:scale-110 transition-all"><Instagram size={18} /></a>}
                                                            {founder.socialLinks?.linkedin && <a href={founder.socialLinks.linkedin} className="text-gray-400 hover:text-[#0077b5] transform hover:scale-110 transition-all"><Linkedin size={18} /></a>}
                                                            {founder.socialLinks?.twitter && <a href={founder.socialLinks.twitter} className="text-gray-400 hover:text-[#5DADE2] transform hover:scale-110 transition-all"><Twitter size={18} /></a>}
                                                            {founder.socialLinks?.facebook && <a href={founder.socialLinks.facebook} className="text-gray-400 hover:text-[#3498DB] transform hover:scale-110 transition-all"><Facebook size={18} /></a>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* View Modal */}
            {isViewModalOpen && viewData && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">Leader Profile</h2>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="h-40 w-40 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm mx-auto md:mx-0">
                                    {viewData.imageUrl ? (
                                        <img src={viewData.imageUrl} alt={viewData.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow space-y-4 w-full text-center md:text-left">
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900">{viewData.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                                {viewData.designation}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
                                        {viewData.mobile && (
                                            <div>
                                                <span className="block text-gray-500 text-xs uppercase font-semibold mb-1">Mobile</span>
                                                <span className="text-gray-900 font-medium">{viewData.mobile}</span>
                                            </div>
                                        )}
                                        {viewData.state && (
                                            <div>
                                                <span className="block text-gray-500 text-xs uppercase font-semibold mb-1">Location</span>
                                                <span className="text-gray-900 font-medium">{viewData.district}, {viewData.state}</span>
                                            </div>
                                        )}
                                        {viewData.address && (
                                            <div className="md:col-span-2">
                                                <span className="block text-gray-500 text-xs uppercase font-semibold mb-1">Address</span>
                                                <span className="text-gray-900 font-medium">{viewData.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {viewData.description && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">About</h4>
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {viewData.description}
                                    </div>
                                </div>
                            )}

                            {viewData.socialLinks && Object.values(viewData.socialLinks).some(link => link) && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">Connect</h4>
                                    <div className="flex gap-3">
                                        {viewData.socialLinks.linkedin && (
                                            <a href={viewData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#0077b5]/10 text-[#0077b5] rounded-lg hover:bg-[#0077b5]/20 transition-colors text-sm font-medium flex items-center gap-2">
                                                <Linkedin size={18} /> LinkedIn
                                            </a>
                                        )}
                                        {viewData.socialLinks.twitter && (
                                            <a href={viewData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-black/5 text-black rounded-lg hover:bg-black/10 transition-colors text-sm font-medium flex items-center gap-2">
                                                <Twitter size={18} /> Twitter
                                            </a>
                                        )}
                                        {viewData.socialLinks.facebook && (
                                            <a href={viewData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#1877f2]/10 text-[#1877f2] rounded-lg hover:bg-[#1877f2]/20 transition-colors text-sm font-medium flex items-center gap-2">
                                                <Facebook size={18} /> Facebook
                                            </a>
                                        )}
                                        {viewData.socialLinks.instagram && (
                                            <a href={viewData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#e4405f]/10 text-[#e4405f] rounded-lg hover:bg-[#e4405f]/20 transition-colors text-sm font-medium flex items-center gap-2">
                                                <Instagram size={18} /> Instagram
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Founders;
