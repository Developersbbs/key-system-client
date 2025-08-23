import { getYouTubeVideoId } from "../utils/getYouTubeVideoId";

const ChapterVideo = ({ videoUrl }) => {
  const videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Invalid YouTube URL provided.
      </div>
    );
  }

  return (
    <iframe
      className="w-full h-64 rounded-lg"
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      frameBorder="0"
      allowFullScreen
    ></iframe>
  );
};

export default ChapterVideo;
