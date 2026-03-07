import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFounders } from '../redux/features/founders/founderSlice';

import { Linkedin, Twitter, Facebook, Instagram, User, MapPin, LayoutGrid, List } from 'lucide-react';

/* ─── Designation colour tokens ─────────────────── */
const DESIGNATION_META = {
    'Founder':         { pill: 'text-emerald-600 bg-emerald-50 border-emerald-200',  bar: '#10b981' },
    'Director':        { pill: 'text-emerald-600 bg-emerald-50 border-emerald-200',         bar: '#10b981' },
    'Senior Director': { pill: 'text-emerald-600 bg-emerald-50 border-emerald-200',         bar: '#10b981' },
    'Key Leader':      { pill: 'text-emerald-600 bg-emerald-50 border-emerald-200',   bar: '#10b981' },
};

const Founders = () => {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const { founders, loading, error } = useSelector((state) => state.founders);

    const [viewMode,  setViewMode]  = useState('list');
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => { dispatch(fetchFounders()); }, [dispatch]);

    const designations = ['Founder', 'Director', 'Senior Director', 'Key Leader'];

    useEffect(() => {
        if (founders.length > 0 && !activeTab) {
            const first = designations.find(d => founders.some(f => f.designation === d));
            if (first) setActiveTab(first);
        }
    }, [founders]);

    const getDesignationColor = (designation) =>
        DESIGNATION_META[designation]?.pill ?? 'text-gray-600 bg-gray-50 border-gray-200';

    const availableTabs       = designations.filter(d => founders.some(f => f.designation === d));
    const visibleDesignations = designations.filter(d => d === activeTab);

    const goToProfile = (founder) => navigate(`/founders/${founder._id}`);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Leadership</span> Team
                    </h1>
                    <p className="text-gray-600">Meet the visionaries and leaders who drive our mission forward.</p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg mt-4 md:mt-0">
                    <button onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Grid View"><LayoutGrid size={20} /></button>
                    <button onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        title="List View"><List size={20} /></button>
                </div>
            </div>

            {/* ── Designation Switch Bar ── */}
            {!loading && !error && founders.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide border-b border-gray-200">
                        {availableTabs.map((tab) => {
                            const isActive = activeTab === tab;
                            const accent   = DESIGNATION_META[tab]?.bar ?? '#10b981';
                            const count    = founders.filter(f => f.designation === tab).length;
                            return (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className="relative flex-shrink-0 flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none whitespace-nowrap"
                                    style={{ color: isActive ? accent : '#9ca3af' }}
                                >
                                    {`${tab}s`}
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full leading-none"
                                        style={{ background: isActive ? `${accent}18` : '#f3f4f6', color: isActive ? accent : '#9ca3af' }}>
                                        {count}
                                    </span>
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: accent }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">{error}</div>
            ) : (
                <div className="space-y-16">
                    {visibleDesignations.map((designation) => {
                        const designationFounders = founders.filter(f => f.designation === designation);
                        if (designationFounders.length === 0) return null;

                        return (
                            <div key={designation} className="relative">

                                {/* Grid View */}
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                        {designationFounders.map((founder) => (
                                            <div key={founder._id}
                                                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full mt-12 cursor-pointer"
                                                onClick={() => goToProfile(founder)}
                                            >
                                                <div className="h-32 relative overflow-hidden bg-[#0a192f]">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364]"></div>
                                                    <div className="absolute inset-0 opacity-40">
                                                        <div className="w-1 h-1 bg-white rounded-full absolute top-4 left-10 animate-pulse"></div>
                                                        <div className="w-1 h-1 bg-white rounded-full absolute top-12 left-1/4 animate-pulse delay-75"></div>
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-6 right-12 animate-pulse delay-150"></div>
                                                        <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-20 right-1/3 animate-pulse delay-300"></div>
                                                    </div>
                                                </div>

                                                <div className="relative mx-auto -mt-20 h-40 w-40 rounded-full border-[5px] border-white shadow-lg overflow-visible z-10 bg-white">
                                                    <div className="w-full h-full rounded-full overflow-hidden">
                                                        {founder.imageUrl
                                                            ? <img src={founder.imageUrl} alt={founder.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                            : <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><User size={64} strokeWidth={1.5} /></div>}
                                                    </div>
                                                </div>

                                                <div className="p-6 pt-4 flex-grow flex flex-col items-center text-center">
                                                    <h3 className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-[#2C5364] transition-colors">{founder.name}</h3>
                                                    {(founder.state || founder.district) && (
                                                        <p className="text-gray-400 text-sm mb-4 font-medium">{founder.district ? `${founder.district}, ` : ''}{founder.state}</p>
                                                    )}
                                                    <p className="text-lg text-gray-600 mb-6 font-normal">{founder.designation}</p>
                                                    <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-8 px-2 font-light">{founder.description}</p>
                                                    <div className="flex justify-center space-x-5 mt-auto pb-2">
                                                        {founder.socialLinks?.instagram && <a href={founder.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center bg-[#eae0f5] text-[#9b6bcc] rounded-full hover:bg-[#9b6bcc] hover:text-white transition-all transform hover:scale-110 shadow-sm" onClick={e => e.stopPropagation()}><Instagram size={20} /></a>}
                                                        {founder.socialLinks?.twitter   && <a href={founder.socialLinks.twitter}   target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center bg-[#dcf0fc] text-[#5DADE2] rounded-full hover:bg-[#5DADE2] hover:text-white transition-all transform hover:scale-110 shadow-sm" onClick={e => e.stopPropagation()}><Twitter size={20} /></a>}
                                                        {founder.socialLinks?.facebook  && <a href={founder.socialLinks.facebook}  target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center bg-[#dbeaf5] text-[#3498DB] rounded-full hover:bg-[#3498DB] hover:text-white transition-all transform hover:scale-110 shadow-sm" onClick={e => e.stopPropagation()}><Facebook size={20} /></a>}
                                                        {founder.socialLinks?.linkedin  && <a href={founder.socialLinks.linkedin}  target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center bg-[#d9eaf7] text-[#0077b5] rounded-full hover:bg-[#0077b5] hover:text-white transition-all transform hover:scale-110 shadow-sm" onClick={e => e.stopPropagation()}><Linkedin size={20} /></a>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* List View */
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {designationFounders.map((founder) => (
                                            <div key={founder._id}
                                                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex overflow-hidden cursor-pointer"
                                                onClick={() => goToProfile(founder)}
                                            >
                                                <div className="w-24 md:w-32 relative bg-[#0a192f] flex-shrink-0">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364]"></div>
                                                    <div className="absolute inset-0 opacity-40">
                                                        <div className="w-1 h-1 bg-white rounded-full absolute top-4 left-4 animate-pulse"></div>
                                                        <div className="w-1 h-1 bg-white rounded-full absolute bottom-8 left-8 animate-pulse delay-500"></div>
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center translate-x-1/2 z-10">
                                                        <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                                                            {founder.imageUrl
                                                                ? <img src={founder.imageUrl} alt={founder.name} className="w-full h-full object-cover" />
                                                                : <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><User size={32} /></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-grow p-4 md:p-6 pl-14 md:pl-16 flex flex-col justify-center">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-[#2C5364] transition-colors">{founder.name}</h3>
                                                    <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wider mb-2">{founder.designation}</p>
                                                    {(founder.state || founder.district) && (
                                                        <div className="flex items-center text-gray-400 text-xs mb-3">
                                                            <MapPin size={12} className="mr-1" />
                                                            {founder.district ? `${founder.district}, ` : ''}{founder.state}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2 mt-2">
                                                        {founder.socialLinks?.instagram && <a href={founder.socialLinks.instagram} className="text-gray-400 hover:text-[#e4405f] transform hover:scale-110 transition-all" onClick={e => e.stopPropagation()}><Instagram size={18} /></a>}
                                                        {founder.socialLinks?.linkedin  && <a href={founder.socialLinks.linkedin}  className="text-gray-400 hover:text-[#0077b5] transform hover:scale-110 transition-all" onClick={e => e.stopPropagation()}><Linkedin size={18} /></a>}
                                                        {founder.socialLinks?.twitter   && <a href={founder.socialLinks.twitter}   className="text-gray-400 hover:text-[#5DADE2] transform hover:scale-110 transition-all" onClick={e => e.stopPropagation()}><Twitter size={18} /></a>}
                                                        {founder.socialLinks?.facebook  && <a href={founder.socialLinks.facebook}  className="text-gray-400 hover:text-[#3498DB] transform hover:scale-110 transition-all" onClick={e => e.stopPropagation()}><Facebook size={18} /></a>}
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
    );
};

export default Founders;