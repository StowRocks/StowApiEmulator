import { getConfig } from './config';
import { fetchVideos, fetchCredits, fetchShowDetails, fetchImages } from './tmdb-service';
import { mapVideoToScene, mapCastToPerformer, mapImagesToGallery, mapShowToMovie } from './mappers';
import type { Performer, Movie } from './types';

export const resolvers = {
  Query: {
    findScenes: async () => {
      const { allowedTmdbIds } = getConfig();

      const results = await Promise.all(
        allowedTmdbIds.map(async (id) => {
          try {
            const [videos, credits, details] = await Promise.all([
              fetchVideos(id),
              fetchCredits(id),
              fetchShowDetails(id),
            ]);
            const performers = credits.map(mapCastToPerformer);
            const movie = mapShowToMovie(details);
            return videos.map((v) => ({
              ...mapVideoToScene(v, id),
              performers,
              movies: [movie],
            }));
          } catch (error) {
            console.error(`Error fetching scenes for TMDB ID ${id}:`, error);
            return [];
          }
        })
      );

      const scenes = results.flat();
      return {
        count: scenes.length,
        duration: 0,
        filesize: 0,
        scenes,
      };
    },

    findPerformers: async () => {
      const { allowedTmdbIds } = getConfig();

      const results = await Promise.all(
        allowedTmdbIds.map(async (id) => {
          try {
            const credits = await fetchCredits(id);
            return credits.map(mapCastToPerformer);
          } catch {
            return [];
          }
        })
      );

      const seen = new Set<string>();
      const performers = results.flat().filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      return { count: performers.length, performers };
    },
  },

  Performer: {
    galleries: async (performer: Performer) => {
      try {
        const personId = Number(performer.id);
        const images = await fetchImages(personId);
        if (images.length === 0) return [];
        return [mapImagesToGallery(personId, images)];
      } catch {
        return [];
      }
    },
  },

  Movie: {
    scenes: async (movie: Movie) => {
      try {
        const showId = Number(movie.id);
        const videos = await fetchVideos(showId);
        return videos.map((v) => mapVideoToScene(v, showId));
      } catch {
        return [];
      }
    },
  },
};
