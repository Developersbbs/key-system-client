import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Trophy, Plus, Calendar, CheckCircle, Clock, Activity, Trash2, Award, Camera, Image as ImageIcon, Layout } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { uploadFile } from '../utils/fileUpload';

const Achievers = () => {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const { user } = useSelector((state) => state.auth);

    // View State for Mobile (Slider)
    const [activeTab, setActiveTab] = useState('achievers');

    // Activity Form State
    const [activityForm, setActivityForm] = useState({
        title: '',
        description: '',
        type: 'Task',
        photo: ''
    });

    const [uploading, setUploading] = useState(false);

    const fetchLeaderboard = async () => {
        try {
            setLoadingLeaderboard(true);
            const response = await apiClient.get('/meetings/leaderboard');
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            toast.error('Failed to load leaderboard');
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const fetchActivities = async () => {
        try {
            setLoadingActivities(true);
            const response = await apiClient.get('/activities');
            setActivities(response.data);
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error('Failed to load activities');
        } finally {
            setLoadingActivities(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        fetchActivities();
    }, []);

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const handleActivityChange = (e) => {
        setActivityForm({ ...activityForm, [e.target.name]: e.target.value });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const path = `activity_photos/${user._id}`;

        uploadFile(
            file,
            path,
            null,
            (error) => {
                toast.error(error);
                setUploading(false);
            }
        ).then((url) => {
            setActivityForm(prev => ({ ...prev, photo: url }));
            setUploading(false);
            toast.success('Photo uploaded!');
        }).catch(err => {
            console.error(err);
            setUploading(false);
        });
    };

    const handleActivitySubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/activities', activityForm);

            // Gamification: Trigger success effects
            toast.success('Activity Logged! +5 Points');
            triggerConfetti();

            setActivityForm({ title: '', description: '', type: 'Task', photo: '' });
            fetchActivities();
            fetchLeaderboard(); // Refresh scores
        } catch (error) {
            console.error('Error adding activity:', error);
            toast.error('Failed to add activity');
        }
    };

    const handleDeleteActivity = async (id) => {
        try {
            await apiClient.delete(`/activities/${id}`);
            toast.success('Activity deleted');
            fetchActivities();
            fetchLeaderboard(); // Refresh scores
        } catch (error) {
            console.error('Error deleting activity:', error);
            toast.error('Failed to delete activity');
        }
    };

    const getRankStyle = (index) => {
        switch (index) {
            case 0: return 'bg-yellow-50 border-yellow-300 text-yellow-800 shadow-yellow-100'; // Gold
            case 1: return 'bg-gray-50 border-gray-300 text-gray-800 shadow-gray-100'; // Silver
            case 2: return 'bg-orange-50 border-orange-300 text-orange-800 shadow-orange-100'; // Bronze
            default: return 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50';
        }
    };

    const getTrophyColor = (index) => {
        switch (index) {
            case 0: return 'text-yellow-500 drop-shadow-md';
            case 1: return 'text-slate-400 drop-shadow-md';
            case 2: return 'text-amber-600 drop-shadow-md';
            default: return 'text-gray-300';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-gray-800 flex items-center gap-3"
                >
                    <Trophy className="text-yellow-500" size={32} />
                    Achievers & Activities
                </motion.h1>

                {/* Slider / Segmented Control (Visible on Mobile, Hidden on LG) */}
                <div className="lg:hidden bg-gray-100 p-1 rounded-xl flex w-full md:w-auto relative">
                    <motion.div
                        className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm z-0"
                        initial={false}
                        animate={{
                            left: activeTab === 'achievers' ? '4px' : '50%',
                            width: 'calc(50% - 4px)'
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                    <button
                        onClick={() => setActiveTab('achievers')}
                        className={`flex-1 px-6 py-2 rounded-lg text-sm font-semibold z-10 transition-colors ${activeTab === 'achievers' ? 'text-gray-800' : 'text-gray-500'}`}
                    >
                        Achievers
                    </button>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`flex-1 px-6 py-2 rounded-lg text-sm font-semibold z-10 transition-colors ${activeTab === 'activities' ? 'text-gray-800' : 'text-gray-500'}`}
                    >
                        Activities
                    </button>
                </div>
            </div>

            {/* Main Content Grid: 1 Col on Mobile (Toggle), 2 Cols on Desktop (50/50 Split) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* --- LEADERBOARD SECTION --- */}
                <div className={`${activeTab === 'achievers' ? 'block' : 'hidden'} lg:block space-y-6`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-6 h-full"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <Award className="text-emerald-500" />
                            Top Performers
                        </h2>
                        {/* <p className="text-sm text-gray-500 mb-6">Ranked by total performance score.</p> */}

                        {loadingLeaderboard ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                            </div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {leaderboard.length > 0 ? (
                                    leaderboard.map((user, index) => (
                                        <motion.div
                                            key={user._id}
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.02 }}
                                            className={`relative flex items-center justify-between p-4 rounded-xl border border-transparent transition-all shadow-sm hover:shadow-md cursor-pointer ${getRankStyle(index)}`}
                                            onClick={() => navigate(`/achievers/${user._id}`)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold">
                                                    {index < 3 ? <Trophy className={getTrophyColor(index)} size={28} /> : <span className="text-gray-400 font-mono text-lg">#{index + 1}</span>}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-sm truncate">{user.name}</h3>
                                                    <p className="text-xs opacity-75 truncate max-w-[100px]">{user.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 px-4 min-w-[120px]">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Score</span>
                                                    <span className="font-bold text-emerald-600">{user.totalScore}</span>
                                                </div>
                                                <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden flex">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(user.meetingCount * 20 / (user.totalScore || 1)) * 100}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className="bg-emerald-500 h-full"
                                                        title="Meetings"
                                                    />
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(user.activityCount * 5 / (user.totalScore || 1)) * 100}%` }}
                                                        transition={{ duration: 1, delay: 0.7 }}
                                                        className="bg-teal-500 h-full"
                                                        title="Activities"
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{user.meetingCount} M</span>
                                                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>{user.activityCount} A</span>
                                                </div>
                                            </div>

                                            {/* Rank Badge for Top 3 */}
                                            {index < 3 && (
                                                <div className="absolute -top-2 -right-2 bg-white border border-gray-100 shadow-sm rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {index + 1}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No achievements yet.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* --- ACTIVITIES SECTION --- */}
                <div className={`${activeTab === 'activities' ? 'block' : 'hidden'} lg:block space-y-6`}>
                    {/* Add Activity Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <Activity className="text-emerald-500" />
                            Log Key Activity
                        </h2>
                        <form onSubmit={handleActivitySubmit} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="title"
                                    value={activityForm.title}
                                    onChange={handleActivityChange}
                                    placeholder="Title (e.g. Client Call)"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    required
                                />
                                <div className="w-full">
                                    <select
                                        name="type"
                                        value={activityForm.type}
                                        onChange={handleActivityChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                                    >
                                        <option value="Task">Task</option>
                                        <option value="Call">Call</option>
                                        <option value="Meeting">Meeting</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <textarea
                                name="description"
                                value={activityForm.description}
                                onChange={handleActivityChange}
                                placeholder="Description..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none"
                                required
                            />


                            <div className="flex gap-4 items-center">
                                {/* Photo Upload Button */}
                                <div className="relative flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        disabled={uploading}
                                        id="photo-upload"
                                    />
                                    <div
                                        className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${activityForm.photo
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                            : 'border-gray-300 hover:bg-gray-50 text-gray-500'
                                            }`}
                                    >
                                        {uploading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                                        ) : activityForm.photo ? (
                                            <>
                                                <ImageIcon size={20} />
                                                <span className="text-sm font-medium">Photo Attached</span>
                                            </>
                                        ) : (
                                            <>
                                                <Camera size={20} />
                                                <span className="text-sm font-medium">Upload Proof</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <Plus size={20} />
                                    Add Activity
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Activities List */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 min-h-[400px]">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <Clock className="text-gray-500" />
                            Recent Activities
                        </h2>

                        {loadingActivities ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                            </div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2"
                            >
                                <AnimatePresence>
                                    {activities.length > 0 ? (
                                        activities.map((activity) => (
                                            <motion.div
                                                key={activity._id}
                                                variants={itemVariants}
                                                exit={{ opacity: 0, x: -20 }}
                                                layout
                                                className="group flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-emerald-100"
                                            >
                                                <div className="flex gap-4">
                                                    <div className={`mt-1 p-2 rounded-lg transform transition-transform group-hover:scale-110 flex-shrink-0 ${activity.type === 'Call' ? 'bg-lime-100 text-lime-600' :
                                                        activity.type === 'Meeting' ? 'bg-teal-100 text-teal-600' :
                                                            'bg-emerald-100 text-emerald-600'
                                                        }`}>
                                                        <CheckCircle size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 text-sm md:text-base">{activity.title}</h3>
                                                        <p className="text-gray-600 text-xs md:text-sm mt-1 line-clamp-2">{activity.description}</p>
                                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                                                            <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600 font-medium">{activity.type}</span>
                                                            <span>{new Date(activity.date).toLocaleDateString()}</span>
                                                        </div>
                                                        {activity.photo && (
                                                            <div className="mt-3">
                                                                <img
                                                                    src={activity.photo}
                                                                    alt="Activity proof"
                                                                    className="h-20 w-auto object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer shadow-sm"
                                                                    onClick={() => window.open(activity.photo, '_blank')}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteActivity(activity._id)}
                                                    className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all p-2"
                                                    title="Delete Activity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="text-center py-12 text-gray-500"
                                        >
                                            <Activity className="mx-auto text-gray-300 mb-4" size={48} />
                                            <p>No activities logged yet.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Achievers;
