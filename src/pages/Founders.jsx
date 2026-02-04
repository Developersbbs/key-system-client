import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFounders } from '../redux/features/founders/founderSlice';

import { Linkedin, Twitter, Facebook, Instagram, User } from 'lucide-react';

const Founders = () => {
    const dispatch = useDispatch();
    const { founders, loading, error } = useSelector((state) => state.founders);

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
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Leadership</span> Team
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Meet the visionaries and leaders who drive our mission forward.
                    </p>
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                        {designationFounders.map((founder) => (
                                            <div key={founder._id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-100">
                                                <div className="relative h-64 overflow-hidden bg-gray-100">
                                                    {founder.imageUrl ? (
                                                        <img
                                                            src={founder.imageUrl}
                                                            alt={founder.name}
                                                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <User size={64} />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                                        <div className="flex space-x-4">
                                                            {founder.socialLinks?.linkedin && (
                                                                <a href={founder.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                                                    <Linkedin size={20} />
                                                                </a>
                                                            )}
                                                            {founder.socialLinks?.twitter && (
                                                                <a href={founder.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                                                    <Twitter size={20} />
                                                                </a>
                                                            )}
                                                            {founder.socialLinks?.facebook && (
                                                                <a href={founder.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-600 transition-colors bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                                                    <Facebook size={20} />
                                                                </a>
                                                            )}
                                                            {founder.socialLinks?.instagram && (
                                                                <a href={founder.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-500 transition-colors bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                                                    <Instagram size={20} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{founder.name}</h3>
                                                    <p className="text-sm font-medium text-emerald-600 mb-3">{founder.designation}</p>
                                                    <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                                                        {founder.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default Founders;
