// Invidious public instances for YouTube stream extraction
// Updated: 2026-02-12
const INVIDIOUS_INSTANCES = [
  'https://yewtu.be',
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://inv.riverside.rocks',
  'https://invidious.snopyta.org',
  'https://vid.puffyan.us',
  'https://invidious.kavin.rocks',
];

interface InvidiousFormat {
  url: string;
  quality: string;
  type: string;
  container: string;
}

interface InvidiousVideo {
  videoId: string;
  title: string;
  formatStreams: InvidiousFormat[];
  adaptiveFormats: InvidiousFormat[];
}

const cache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 60 * 1000; // 5 hours (URLs expire in 6)

export async function getStreamUrl(videoKey: string): Promise<string | null> {
  // Check cache
  const cached = cache.get(videoKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  // Try each Invidious instance
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await fetch(`${instance}/api/v1/videos/${videoKey}`, {
        signal: AbortSignal.timeout(3000), // 3s timeout
      });

      if (!response.ok) continue;

      const data = (await response.json()) as InvidiousVideo;

      // Prefer 720p, fallback to highest quality
      const format =
        data.formatStreams.find((f) => f.quality === '720p') ||
        data.formatStreams.find((f) => f.quality === '1080p') ||
        data.formatStreams[0];

      if (format?.url) {
        // Cache the URL
        cache.set(videoKey, {
          url: format.url,
          expiresAt: Date.now() + CACHE_TTL,
        });
        return format.url;
      }
    } catch (error) {
      // Try next instance
      continue;
    }
  }

  // All instances failed, return null (caller will use YouTube URL)
  return null;
}
