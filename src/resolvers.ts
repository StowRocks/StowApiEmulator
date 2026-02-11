import { getConfig } from './config';
import { fetchVideos, fetchCredits, fetchShowDetails, fetchImages } from './tmdb-service';
import { mapVideoToScene, mapCastToPerformer, mapShowToStudio, mapGenreToTag } from './mappers';
import {
  getSceneData,
  updateSceneData,
  getPerformerData,
  updatePerformerData,
} from './persistence';

export const resolvers = {
  Query: {
    systemStatus: () => ({
      databasePath: '/emulator/tmdb',
      databaseSchema: 1,
      appSchema: 1,
    }),

    findScenes: async (
      _: unknown,
      args: {
        filter?: { q?: string; page?: number; per_page?: number };
        scene_filter?: {
          performers?: { value?: string[] };
          tags?: { value?: string[] };
          studios?: { value?: string[] };
        };
      }
    ) => {
      const { allowedTmdbIds } = getConfig();
      const page = args.filter?.page || 1;
      const perPage = args.filter?.per_page || 20;
      const query = args.filter?.q?.toLowerCase();

      const results = await Promise.all(
        allowedTmdbIds.map(async (id) => {
          try {
            const [videos, credits, details] = await Promise.all([
              fetchVideos(id),
              fetchCredits(id),
              fetchShowDetails(id),
            ]);
            const performers = credits.map(mapCastToPerformer);
            const studio = mapShowToStudio(details);
            const tags = details.genres?.map(mapGenreToTag) || [];
            return videos.map((v) => ({
              ...mapVideoToScene(v, id),
              performers,
              studio,
              tags,
            }));
          } catch (error) {
            console.error(`Error fetching scenes for TMDB ID ${id}:`, error);
            return [];
          }
        })
      );

      let scenes = results.flat();

      // Text search
      if (query) {
        scenes = scenes.filter(
          (scene) =>
            scene.title?.toLowerCase().includes(query) ||
            scene.details?.toLowerCase().includes(query) ||
            scene.performers?.some((p: { name?: string | null }) =>
              p.name?.toLowerCase().includes(query)
            )
        );
      }

      // Filter by performers
      if (args.scene_filter?.performers?.value?.length) {
        const performerIds = new Set(args.scene_filter.performers.value);
        scenes = scenes.filter((scene) =>
          scene.performers?.some((p: { id: string }) => performerIds.has(p.id))
        );
      }

      // Filter by tags
      if (args.scene_filter?.tags?.value?.length) {
        const tagIds = new Set(args.scene_filter.tags.value);
        scenes = scenes.filter((scene) =>
          scene.tags?.some((t: { id: string }) => tagIds.has(t.id))
        );
      }

      // Filter by studios
      if (args.scene_filter?.studios?.value?.length) {
        const studioIds = new Set(args.scene_filter.studios.value);
        scenes = scenes.filter((scene) => scene.studio && studioIds.has(scene.studio.id));
      }

      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginated = scenes.slice(start, end);

      return {
        count: scenes.length,
        duration: 0,
        filesize: 0,
        scenes: paginated,
      };
    },

    findPerformers: async (
      _: unknown,
      args: {
        filter?: { q?: string; page?: number; per_page?: number };
        performer_filter?: { name?: { value?: string }; favorite?: boolean };
      }
    ) => {
      const { allowedTmdbIds } = getConfig();
      const page = args.filter?.page || 1;
      const perPage = args.filter?.per_page || 20;
      const query =
        args.filter?.q?.toLowerCase() || args.performer_filter?.name?.value?.toLowerCase();

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
      let performers = results.flat().filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      // Text search
      if (query) {
        performers = performers.filter((p) => p.name?.toLowerCase().includes(query));
      }

      // Filter by favorite
      if (args.performer_filter?.favorite !== undefined) {
        const favoriteFilter = args.performer_filter.favorite;
        const filtered = [];
        for (const p of performers) {
          const data = await getPerformerData(p.id);
          if ((data.favorite ?? false) === favoriteFilter) {
            filtered.push(p);
          }
        }
        performers = filtered;
      }

      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginated = performers.slice(start, end);

      return { count: performers.length, performers: paginated };
    },

    findStudios: async (
      _: unknown,
      args: {
        filter?: { q?: string; page?: number; per_page?: number };
        studio_filter?: { name?: { value?: string } };
      }
    ) => {
      const { allowedTmdbIds } = getConfig();
      const page = args.filter?.page || 1;
      const perPage = args.filter?.per_page || 20;
      const query = args.filter?.q?.toLowerCase() || args.studio_filter?.name?.value?.toLowerCase();

      const results = await Promise.all(
        allowedTmdbIds.map(async (id) => {
          try {
            const details = await fetchShowDetails(id);
            return mapShowToStudio(details);
          } catch {
            return null;
          }
        })
      );

      const seen = new Set<string>();
      let studios = results.filter((s): s is NonNullable<typeof s> => {
        if (!s || seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });

      if (query) {
        studios = studios.filter((s) => s.name?.toLowerCase().includes(query));
      }

      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginated = studios.slice(start, end);

      return { count: studios.length, studios: paginated };
    },

    findTags: async (
      _: unknown,
      args: {
        filter?: { q?: string; page?: number; per_page?: number };
        tag_filter?: { name?: { value?: string } };
      }
    ) => {
      const { allowedTmdbIds } = getConfig();
      const page = args.filter?.page || 1;
      const perPage = args.filter?.per_page || 40;
      const query = args.filter?.q?.toLowerCase() || args.tag_filter?.name?.value?.toLowerCase();

      const results = await Promise.all(
        allowedTmdbIds.map(async (id) => {
          try {
            const details = await fetchShowDetails(id);
            return details.genres?.map(mapGenreToTag) || [];
          } catch {
            return [];
          }
        })
      );

      const seen = new Set<string>();
      let tags = results.flat().filter((t) => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });

      if (query) {
        tags = tags.filter((t) => t.name?.toLowerCase().includes(query));
      }

      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginated = tags.slice(start, end);

      return { count: tags.length, tags: paginated };
    },

    findGalleries: async () => {
      return { count: 0, galleries: [] };
    },

    findGroups: async () => {
      return { count: 0, groups: [] };
    },

    findImages: async () => {
      return { count: 0, images: [] };
    },
  },

  Mutation: {
    sceneUpdate: async (
      _: unknown,
      {
        input,
      }: { input: { id: string; rating100?: number; organized?: boolean; o_counter?: number } }
    ) => {
      const { id, rating100, organized, o_counter } = input;
      await updateSceneData(id, { rating100, organized, o_counter });
      const data = await getSceneData(id);
      return { id, ...data };
    },

    performerUpdate: async (
      _: unknown,
      { input }: { input: { id: string; favorite?: boolean; rating100?: number } }
    ) => {
      const { id, favorite, rating100 } = input;
      await updatePerformerData(id, { favorite, rating100 });
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
    o_counter: async (scene: { id: string }) => {
      const data = await getSceneData(scene.id);
      return data.o_counter ?? 0;
    },
  },

  Performer: {
    favorite: async (performer: { id: string }) => {
      const data = await getPerformerData(performer.id);
      return data.favorite ?? false;
    },
    rating100: async (performer: { id: string }) => {
      const data = await getPerformerData(performer.id);
      return data.rating100 ?? null;
    },
  },
};
