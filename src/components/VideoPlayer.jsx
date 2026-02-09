import React, { useEffect, useState, useRef } from 'react';
import { Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';

const VideoPlayer = ({ videoUrl, chapterId, courseId }) => {
    const videoRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [maxWatched, setMaxWatched] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [playableUrl, setPlayableUrl] = useState(null);

    // Clean the URL by trimming whitespace
    const cleanUrl = videoUrl?.trim();

    // Determine URL type and fetch signed URL if needed
    useEffect(() => {
        const initializeVideo = async () => {
            if (!cleanUrl) return;

            try {
                const urlObject = new URL(cleanUrl);
                const isYouTube = urlObject.hostname.includes('youtube.com') || urlObject.hostname.includes('youtu.be');

                if (isYouTube) {
                    // For YouTube, we'd need an iframe - for now just use direct
                    setPlayableUrl(cleanUrl);
                } else {
                    // Fetch video URL from API (returns Firebase URL as-is)
                    const res = await apiClient.get(`/courses/${courseId}/chapters/${chapterId}/video-url`);
                    setPlayableUrl(res.data.videoUrl);
                }
            } catch (error) {
                console.error("Error initializing video:", error);
                setPlayableUrl(cleanUrl);
            }
        };

        initializeVideo();
    }, [cleanUrl, courseId, chapterId]);

    // Load saved progress on mount
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await apiClient.get(`/courses/${courseId}/chapters/${chapterId}/progress`);
                if (res.data) {
                    const savedTime = res.data.watchedDuration || 0;

                    // Only set saved time if it's significant (> 5 seconds)
                    if (savedTime > 5) {
                        setMaxWatched(savedTime);
                    }

                    if (res.data.completed) setIsCompleted(true);
                }
            } catch (error) {
                console.error("Error fetching video progress:", error);
            }
        };

        if (chapterId && courseId) {
            fetchProgress();
        }
    }, [chapterId, courseId]);

    // Handle video loaded metadata
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const videoDuration = videoRef.current.duration;
            setDuration(videoDuration);
            setIsReady(true);

            // Resume from saved progress
            if (maxWatched > 0) {
                videoRef.current.currentTime = maxWatched;
            }
        }
    };

    // Handle time update
    const handleTimeUpdate = () => {
        if (!videoRef.current || !isReady) return;

        const currentSecond = videoRef.current.currentTime;

        // Detect if user is seeking forward beyond allowed time
        if (currentSecond > maxWatched + 5 && !isCompleted) {
            // User tried to skip ahead, revert to maxWatched
            videoRef.current.currentTime = maxWatched;

            toast((t) => (
                <span className="flex items-center gap-2">
                    <Clock size={16} />
                    Fast forwarding is disabled. Please watch the video.
                </span>
            ), { icon: '🚫' });
            return;
        }

        // Update progress bar width
        if (duration > 0) {
            const percentage = (currentSecond / duration) * 100;
            setProgress(percentage);

            // Mark as completed if > 90%
            if (percentage >= 90 && !isCompleted) {
                setIsCompleted(true);
            }
        }

        // Update max watched time
        if (currentSecond > maxWatched) {
            setMaxWatched(currentSecond);

            // Auto-save every 10 seconds approx
            if (Math.floor(currentSecond) % 10 === 0) {
                saveProgress(currentSecond);
            }
        }
    };

    const saveProgress = async (currentTime) => {
        try {
            await apiClient.post(`/courses/${courseId}/chapters/${chapterId}/progress`, {
                watchedDuration: currentTime,
                totalDuration: duration
            });
        } catch (error) {
            // Silent fail for background save
        }
    };

    // Check if URL is valid
    if (!cleanUrl) {
        return (
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-red-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <XCircle className="mx-auto h-10 w-10 mb-2 text-red-500" />
                    <p className="text-red-600 font-medium">No video URL provided</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden shadow-lg bg-black relative">
            {/* Wrapper for video */}
            <div className="aspect-video w-full relative">
                {playableUrl ? (
                    <video
                        ref={videoRef}
                        src={playableUrl}
                        controls
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        onLoadedMetadata={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        className="w-full h-full"
                        style={{ maxHeight: '100%', objectFit: 'contain' }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-white bg-gray-900">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                            <p className="text-sm text-gray-400">Loading video...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress bar overlay */}
            <div className="w-full bg-gray-200 h-1">
                <div
                    className={`h-1 transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-teal-600'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default VideoPlayer;
