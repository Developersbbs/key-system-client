// AwsVideoPlayer.jsx
import React, { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

const AwsVideoPlayer = ({ chapterId }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!chapterId) return;

      try {
        setLoading(true);
        setError(null);

        console.log(`📡 Fetching video URL for chapter: ${chapterId}`);

        const response = await apiClient.get(`/chapters/${chapterId}/video-url`);

        console.log('✅ Received signed URL:', response.data.videoUrl);
        setVideoUrl(response.data.videoUrl);
      } catch (err) {
        console.error('❌ Error fetching video URL:', err);
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to load video. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVideoUrl();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="mx-auto h-10 w-10 mb-2 text-red-500" />
          <p className="text-red-600 font-medium">Failed to Load Video</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black">
      <video
        src={videoUrl}
        controls
        className="w-full h-full"
        onError={(e) => {
          console.error('Video playback error:', e);
          setError('Failed to play video. File may be corrupted or format unsupported.');
        }}
        preload="auto"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default AwsVideoPlayer;