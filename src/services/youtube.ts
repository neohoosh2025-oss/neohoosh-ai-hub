const YOUTUBE_API_KEY = "AIzaSyCqjoczn4aFu-VWGXfGEATV4Qp1wA5ENwk";

export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

export const fetchYouTubeVideo = async (url: string) => {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("لینک یوتیوب معتبر نیست");
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`
  );

  if (!response.ok) {
    throw new Error("خطا در دریافت اطلاعات ویدیو از یوتیوب");
  }

  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    throw new Error("ویدیو پیدا نشد");
  }

  const video = data.items[0];
  
  return {
    url: `https://www.youtube.com/embed/${videoId}`,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.high.url,
    duration: parseDuration(video.contentDetails.duration),
  };
};

const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
};
