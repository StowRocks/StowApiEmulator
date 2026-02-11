import { getConfig } from './config';
import { fetchVideos, fetchCredits, fetchShowDetails, fetchImages } from './tmdb-service';
import { mapVideoToScene, mapCastToPerformer, mapImagesToGallery, mapShowToMovie } from './mappers';
import {
  getSceneData,
  updateSceneData,
  getPerformerData,
  updatePerformerData,
} from './persistence';
import type { Performer, Movie } from './types';

export const resolvers = {
  Query: {
    systemStatus: () => ({
      databasePath: '/emulator/tmdb',
      databaseSchema: 1,
      appSchema: 1,
      status: 'OK',
    }),

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

  Mutation: {
    sceneUpdate: async (
      _: unknown,
      { input }: { input: { id: string; rating100?: number; organized?: boolean } }
    ) => {
      const { id, rating100, organized } = input;
      await updateSceneData(id, { rating100, organized });
      const data = await getSceneData(id);
      return { id, ...data };
    },

    performerUpdate: async (
      _: unknown,
      { input }: { input: { id: string; favorite?: boolean } }
    ) => {
      const { id, favorite } = input;
      await updatePerformerData(id, { favorite });
      const data = await getPerformerData(id);
      return { id, ...data };
    },
  },

  Scene: {
    rating100: async (scene: { id: string }) => {
      const data = await getSceneData(scene.id);
      return data.rating100 ?? null;
    },
    organized: async (scene: { id: string }) => {
      const data = await getSceneData(scene.id);
      return data.organized ?? false;
    },
  },

  Performer: {
    favorite: async (performer: Performer) => {
      const data = await getPerformerData(performer.id);
      return data.favorite ?? false;
    },
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
