import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { ArrowLeft, User, Activity, Calendar, Award, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const UserActivities = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                // Fetch basic user profile
                const userRes = await apiClient.get(`/users/${userId}/public-profile`);
                setUser(userRes.data);

                // Fetch user activities
                const activitiesRes = await apiClient.get(`/activities/user/${userId}`);
                setActivities(activitiesRes.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                <p className="mb-4">{error || 'User not found'}</p>
                <button
                    onClick={() => navigate('/achievers')}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                >
                    <ArrowLeft size={20} /> Back to Leaderboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <button
                onClick={() => navigate('/achievers')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 transition-colors"
            >
                <ArrowLeft size={20} /> Back to Leaderboard
            </button>

            {/* User Header Profile */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-10"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-8 z-10">
                    <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {user.imageUrl ? (
                            <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                        <p className="text-emerald-600 font-medium text-lg mb-2">{user.designation || 'Member'}</p>
                        {(user.state || user.district) && (
                            <p className="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-1">
                                {user.district ? `${user.district}, ` : ''}{user.state}
                            </p>
                        )}
                        {user.chapter && (
                            <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
                                Chapter: {user.chapter}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activities Timeline */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <Activity className="text-emerald-500" />
                    Activity History
                </h2>

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {activities.length > 0 ? (
                        activities.map((activity, index) => (
                            <motion.div
                                key={activity._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                            >
                                {/* Icon */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-emerald-500 group-[.is-active]:text-emerald-50 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <CheckCircle size={18} />
                                </div>

                                {/* Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row justify-between mb-2">
                                        <h3 className="font-bold text-gray-800 text-lg">{activity.title}</h3>
                                        <time className="font-caveat font-medium text-sm text-emerald-500 mb-1 sm:mb-0">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </time>
                                    </div>
                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{activity.description}</p>

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide
                                            ${activity.type === 'Call' ? 'bg-lime-100 text-lime-700' :
                                                activity.type === 'Meeting' ? 'bg-teal-100 text-teal-700' :
                                                    'bg-blue-100 text-blue-700'}`}>
                                            {activity.type}
                                        </span>
                                    </div>

                                    {activity.photo && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-gray-100">
                                            <img
                                                src={activity.photo}
                                                alt="Activity Proof"
                                                className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer"
                                                onClick={() => window.open(activity.photo, '_blank')}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 ml-12 md:ml-0 md:mx-auto w-full md:w-2/3">
                            <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500">No activities recorded for this user.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserActivities;
