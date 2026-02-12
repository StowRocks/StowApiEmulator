import ytdl from '@distube/ytdl-core';

interface StreamFormat {
  url: string;
  quality: string;
  hasAudio: boolean;
  hasVideo: boolean;
}

const cache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 60 * 1000; // 5 hours (URLs expire in 6)

export async function getStreamUrl(videoKey: string): Promise<string | null> {
  // Check cache
  const cached = cache.get(videoKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoKey}`;
    const info = await ytdl.getInfo(videoUrl);

    // Get formats with both audio and video (720p preferred)
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

    // Prefer 720p, fallback to highest quality
    const format =
      formats.find((f) => f.qualityLabel === '720p') ||
      formats.find((f) => f.qualityLabel === '1080p') ||
      formats[0];

    if (format?.url) {
      // Cache the URL
      cache.set(videoKey, {
        url: format.url,
        expiresAt: Date.now() + CACHE_TTL,
      });
      return format.url;
    }
  } catch (error) {
    console.error(`ytdl-core failed for ${videoKey}:`, error);
  }

  return null;
}
