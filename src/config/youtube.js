
import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const YOUTUBE_API_URL =
  "https://www.googleapis.com/youtube/v3/search";


const searchVideo = async (topic) => {
  try {
    // Normalize topic to generate a consistent cache key
    const normalizedTopic = topic.trim().toLowerCase();

    // 2. Search video using YouTube API
    const { data } = await axios.get(YOUTUBE_API_URL, {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        part: "snippet",
        q: normalizedTopic,
        maxResults: 5,
        type: "video",
        order: "relevance",
      },
    });

    const videos = data.items || [];

    if (videos.length === 0) {
      return null;
    }

    // 3. Prefer FreeCodeCamp video
    const freeCodeCampVideo = videos.find((video) =>
      video.snippet.channelTitle
        .toLowerCase()
        .includes("freecodecamp")
    );

    // Otherwise, select the first available video
    const selectedVideo = freeCodeCampVideo || videos[0];

    const videoResult = {
      title: selectedVideo.snippet.title,
      channel: selectedVideo.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${selectedVideo.id.videoId}`,
      thumbnail:
        selectedVideo.snippet.thumbnails?.high?.url || "",
    };

  
    return videoResult;

  } catch (error) {
    console.error(
      "YouTube Search Error:",
      error.response?.data || error.message
    );

    return null;
  }
};

export default searchVideo;
