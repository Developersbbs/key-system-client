import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFounders } from '../redux/features/founders/founderSlice';
import {
    Linkedin, Twitter, Facebook, Instagram,
    User, ArrowLeft, MapPin, Phone, Mail,
    Play, ChevronLeft, ChevronRight, X, Images, ZoomIn
} from 'lucide-react';

/* ─── Lightbox Slider Component ─────────────────────────────────────── */
const GalleryLightbox = ({ images, startIndex, onClose }) => {
    const [current, setCurrent] = useState(startIndex);
    const total = images.length;

    const prev = useCallback(() => setCurrent(i => (i - 1 + total) % total), [total]);
    const next = useCallback(() => setCurrent(i => (i + 1) % total), [total]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [prev, next, onClose]);

    // lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <span className="text-white/60 text-sm font-medium tracking-wider">
                    {current + 1} <span className="text-white/30">/</span> {total}
                </span>
                <button
                    onClick={onClose}
                    className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Main image area */}
            <div className="flex-1 flex items-center justify-center relative px-12 min-h-0">

                {/* Prev */}
                <button onClick={prev}
                    className="absolute left-2 md:left-4 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all hover:scale-105 z-10 flex-shrink-0">
                    <ChevronLeft size={22} />
                </button>

                {/* Image */}
                <div className="w-full h-full flex items-center justify-center">
                    <img
                        key={current}
                        src={images[current].url}
                        alt={`Gallery ${current + 1}`}
                        className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
                        style={{ animation: 'fadeInScale 0.25s ease' }}
                    />
                </div>

                {/* Next */}
                <button onClick={next}
                    className="absolute right-2 md:right-4 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all hover:scale-105 z-10 flex-shrink-0">
                    <ChevronRight size={22} />
                </button>
            </div>

            {/* Thumbnail strip */}
            <div className="flex-shrink-0 px-4 py-4">
                <div className="flex gap-2 justify-center overflow-x-auto pb-1 scrollbar-hide">
                    {images.map((img, i) => (
                        <button key={i} onClick={() => setCurrent(i)}
                            className={`flex-shrink-0 h-14 w-14 md:h-16 md:w-16 rounded-lg overflow-hidden border-2 transition-all ${
                                i === current
                                    ? 'border-emerald-400 scale-105 shadow-lg shadow-emerald-500/30'
                                    : 'border-white/10 opacity-50 hover:opacity-80 hover:border-white/30'
                            }`}
                        >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.96); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

/* ─── Gallery Grid Component ─────────────────────────────────────────── */
const GallerySection = ({ images }) => {
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const sorted = [...images].sort((a, b) => a.order - b.order);

    if (!sorted.length) return null;

    const [first, second, third, ...rest] = sorted;

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Section header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Images size={13} className="text-emerald-500" /> Gallery
                    </h3>
                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                        {sorted.length} photo{sorted.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Mosaic layout */}
                <div className="px-4 pb-4">
                    {sorted.length === 1 && (
                        <GalleryThumb img={sorted[0]} idx={0} onClick={() => setLightboxIndex(0)}
                            className="w-full aspect-video" />
                    )}

                    {sorted.length === 2 && (
                        <div className="grid grid-cols-2 gap-2">
                            {sorted.map((img, i) => (
                                <GalleryThumb key={i} img={img} idx={i} onClick={() => setLightboxIndex(i)}
                                    className="aspect-square" />
                            ))}
                        </div>
                    )}

                    {sorted.length === 3 && (
                        <div className="grid grid-cols-2 gap-2">
                            <GalleryThumb img={first} idx={0} onClick={() => setLightboxIndex(0)}
                                className="aspect-square row-span-2" />
                            <GalleryThumb img={second} idx={1} onClick={() => setLightboxIndex(1)}
                                className="aspect-square" />
                            <GalleryThumb img={third} idx={2} onClick={() => setLightboxIndex(2)}
                                className="aspect-square" />
                        </div>
                    )}

                    {sorted.length >= 4 && (
                        <div className="grid grid-cols-3 gap-2">
                            {/* Big first photo */}
                            <div className="col-span-2 row-span-2">
                                <GalleryThumb img={first} idx={0} onClick={() => setLightboxIndex(0)}
                                    className="w-full h-full min-h-[180px]" />
                            </div>
                            <GalleryThumb img={second} idx={1} onClick={() => setLightboxIndex(1)}
                                className="aspect-square" />

                            {/* 3rd slot — if more than 4 show "+N" overlay */}https://docs.google.com/document/d/1atxGm1HD2fp5reboCJ_eL_t_UKkbWxsHwCHjps9ZSHA/edit?usp=sharing
                            {sorted.length === 4 ? (
                                <GalleryThumb img={third} idx={2} onClick={() => setLightboxIndex(2)}
                                    className="aspect-square" />
                            ) : (
                                <div className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                                    onClick={() => setLightboxIndex(2)}>
                                    <img src={third?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-1">
                                        <span className="text-white text-xl font-bold leading-none">+{sorted.length - 2}</span>
                                        <span className="text-white/70 text-[10px] font-medium tracking-wide uppercase">more</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* View all strip — only if more than 4 */}
                {sorted.length > 4 && (
                    <button onClick={() => setLightboxIndex(0)}
                        className="w-full py-3 border-t border-gray-100 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors tracking-wide uppercase flex items-center justify-center gap-2">
                        <Images size={13} /> View all {sorted.length} photos
                    </button>
                )}
            </div>

            {lightboxIndex !== null && (
                <GalleryLightbox
                    images={sorted}
                    startIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </>
    );
};

/* ── Reusable thumbnail ── */
const GalleryThumb = ({ img, idx, onClick, className = '' }) => (
    <div className={`relative rounded-xl overflow-hidden cursor-pointer group ${className}`}
        onClick={onClick}>
        <img src={img.url} alt={`Photo ${idx + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
    </div>
);

/* ─── Main FounderProfile Page ───────────────────────────────────────── */
const FounderProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { founders, loading } = useSelector((state) => state.founders);

    useEffect(() => {
        if (founders.length === 0) dispatch(fetchFounders());
    }, [dispatch, founders.length]);

    const founder = founders.find(f => f._id === id);

    const DESIGNATION_COLORS = {
        'Founder':         { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: '#9333ea' },
        'Director':        { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: '#2563eb' },
        'Senior Director': { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    dot: '#0d9488' },
        'Key Leader':      { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: '#ea580c' },
    };

    const dColor = DESIGNATION_COLORS[founder?.designation] ?? {
        bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: '#10b981'
    };

    const socialConfig = [
        { key: 'linkedin',  icon: Linkedin,  label: 'LinkedIn',  color: '#0077b5', bg: '#0077b510' },
        { key: 'twitter',   icon: Twitter,   label: 'Twitter',   color: '#1da1f2', bg: '#1da1f210' },
        { key: 'facebook',  icon: Facebook,  label: 'Facebook',  color: '#1877f2', bg: '#1877f210' },
        { key: 'instagram', icon: Instagram, label: 'Instagram', color: '#e4405f', bg: '#e4405f10' },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                <p className="text-sm text-gray-400">Loading profile…</p>
            </div>
        </div>
    );

    if (!founder) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Profile not found</p>
            <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                <ArrowLeft size={16} /> Go Back
            </button>
        </div>
    );

    const hasSocial = founder.socialLinks && Object.values(founder.socialLinks).some(Boolean);
    const hasGallery = founder.gallery && founder.gallery.length > 0;

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero banner ── */}
            <div className="relative h-48 md:h-64 bg-[#0F2027] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]" />
                {[...Array(18)].map((_, i) => (
                    <span key={i} className="absolute rounded-full bg-white animate-pulse"
                        style={{
                            width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
                            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.1,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${Math.random() * 2 + 2}s`,
                        }} />
                ))}
                <button onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-medium transition-all border border-white/15">
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            {/* ── Content ── */}
            <div className="max-w-4xl mx-auto px-4 pb-16">

                {/* Avatar + name */}
                <div className="relative -mt-16 md:-mt-20 mb-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                        <div className="mx-auto md:mx-0 h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white flex-shrink-0">
                            {founder.imageUrl
                                ? <img src={founder.imageUrl} alt={founder.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300"><User size={56} strokeWidth={1.5} /></div>}
                        </div>
                        <div className="text-center md:text-left pb-1 flex-grow">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{founder.name}</h1>
                            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${dColor.bg} ${dColor.text} ${dColor.border}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: dColor.dot }} />
                                    {founder.designation}
                                </span>
                                {(founder.state || founder.district) && (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
                                        <MapPin size={12} />
                                        {founder.district ? `${founder.district}, ` : ''}{founder.state}
                                    </span>
                                )}
                            </div>
                        </div>
                        {hasSocial && (
                            <div className="hidden md:flex items-center gap-2 pb-1">
                                {socialConfig.map(({ key, icon: Icon, label, color, bg }) =>
                                    founder.socialLinks?.[key] ? (
                                        <a key={key} href={founder.socialLinks[key]} target="_blank" rel="noopener noreferrer"
                                            title={label} className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
                                            style={{ background: bg, color }}>
                                            <Icon size={18} />
                                        </a>
                                    ) : null
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Grid layout ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 ">

                    {/* Left col */}
                    
                    <div className="md:col-span-2 flex flex-col gap-5">
                        {founder.description && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">About</h3>
                                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{founder.description}</p>
                            </div>
                        )}

                        {/* ── GALLERY ── */}

                        {founder.videoUrl && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                    <Play size={12} className="text-emerald-500" /> Video Introduction
                                </h3>
                                <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-gray-900">
                                    {(founder.videoUrl.includes('firebasestorage') || founder.videoUrl.endsWith('.mp4') || founder.videoUrl.endsWith('.webm'))
                                        ? <video src={founder.videoUrl} className="absolute inset-0 w-full h-full object-contain" controls playsInline />
                                        : <iframe src={founder.videoUrl} className="absolute inset-0 w-full h-full" title={founder.name}
                                            frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
                                </div>
                            </div>
                        )}

                        {hasGallery && <GallerySection images={founder.gallery} />}

                    </div>

                    {/* Right col */}

                    <div className="md:col-span-1 flex flex-col gap-5 md:sticky md:top-24 h-fit">
                        {(founder.mobile || founder.email || founder.address || founder.state) && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact</h3>
                                {founder.mobile && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0"><Phone size={14} className="text-emerald-600" /></div>
                                        <div><p className="text-[10px] text-gray-400 uppercase font-semibold">Phone</p><p className="text-sm text-gray-800 font-medium">{founder.mobile}</p></div>
                                    </div>
                                )}
                                {founder.email && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Mail size={14} className="text-blue-600" /></div>
                                        <div className="min-w-0"><p className="text-[10px] text-gray-400 uppercase font-semibold">Email</p><p className="text-sm text-gray-800 font-medium truncate">{founder.email}</p></div>
                                    </div>
                                )}
                                {(founder.state || founder.district) && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0"><MapPin size={14} className="text-orange-600" /></div>
                                        <div><p className="text-[10px] text-gray-400 uppercase font-semibold">Location</p><p className="text-sm text-gray-800 font-medium">{founder.district ? `${founder.district}, ` : ''}{founder.state}</p></div>
                                    </div>
                                )}
                                {founder.address && (
                                    <div className="pt-1 border-t border-gray-50">
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Address</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">{founder.address}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {hasSocial && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Connect</h3>
                                <div className="flex flex-wrap gap-2">
                                    {socialConfig.map(({ key, icon: Icon, label, color, bg }) =>
                                        founder.socialLinks?.[key] ? (
                                            <a key={key} href={founder.socialLinks[key]} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                                                style={{ background: bg, color }}>
                                                <Icon size={15} /> {label}
                                            </a>
                                        ) : null
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FounderProfile;