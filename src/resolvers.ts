import { getConfig } from './config';
import { fetchVideos, fetchCredits, fetchShowDetails, fetchSeasonImages } from './tmdb-service';
import {
  mapVideoToScene,
  mapCastToPerformer,
  mapShowToStudio,
  mapGenreToTag,
  mapShowToGroup,
} from './mappers';
import {
  getSceneData,
  updateSceneData,
  getPerformerData,
  updatePerformerData,
} from './persistence';
import { GraphQLScalarType, Kind } from 'graphql';

const TimeScalar = new GraphQLScalarType({
  name: 'Time',
  description: 'ISO 8601 timestamp',
  serialize(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return null;
  },
  parseValue(value: unknown) {
    if (typeof value === 'string') return new Date(value);
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

const MapScalar = new GraphQLScalarType({
  name: 'Map',
  description: 'String -> Any map',
  serialize: (value) => value || {},
  parseValue: (value) => value || {},
  parseLiteral: () => ({}),
});

async function getAllScenes() {
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
        const studio = mapShowToStudio(details);
        const tags = details.genres?.map(mapGenreToTag) || [];
        return videos.map((v) => ({
          ...mapVideoToScene(v, id, details),
          performers,
          studio,
          tags,
        }));
      } catch {
        return [];
      }
    })
  );
  return results.flat();
}

async function getAllPerformers() {
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
  return results.flat().filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

async function getAllStudios() {
  const { allowedTmdbIds } = getConfig();
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
  return results.filter((s): s is NonNullable<typeof s> => {
    if (!s || seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

async function getAllTags() {
  const { allowedTmdbIds } = getConfig();
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
  return results.flat().filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

export const resolvers = {
  Time: TimeScalar,
  Map: MapScalar,

  Query: {
    systemStatus: () => ({
      databasePath: '/emulator/tmdb',
      databaseSchema: 1,
      appSchema: 1,
    }),

    findScene: async (_: unknown, args: { id: string }) => {
      const scenes = await getAllScenes();
      return scenes.find((s) => s.id === args.id) || null;
    },

    findScenes: async (
      _: unknown,
      args: {
        filter?: { q?: string; page?: number; per_page?: number };
        scene_filter?: {
          performers?: { value?: string[]; modifier?: string };
          tags?: { value?: string[]; modifier?: string };
          studios?: { value?: string[]; modifier?: string };
        };
        ids?: string[];
      }
    ) => {
      let scenes = await getAllScenes();
      const page = args.filter?.page || 1;
      const perPage = args.filter?.per_page || 20;
      const query = args.filter?.q?.toLowerCase();

      if (args.ids?.length) {
        const idSet = new Set(args.ids);
        scenes = scenes.filter((s) => idSet.has(s.id));
      }

      if (query) {
        scenes = scenes.filter(
          (s) =>
            s.title?.toLowerCase().includes(query) ||
            s.details?.toLowerCase().includes(query) ||
            s.performers?.some((p: { name?: string | null }) =>
              p.name?.toLowerCase().includes(query)
            )
        );
      }

      if (args.scene_filter?.performers?.value?.length) {
        const ids = new Set(args.scene_filter.performers.value);
        const mod = args.scene_filter.performers.modifier || 'INCLUDES';
        scenes = scenes.filter((s) => {
          const has = s.performers?.some((p: { id: string }) => ids.has(p.id));
          return mod === 'EXCLUDES' ? !has : has;
        });
      }

      if (args.scene_filter?.tags?.value?.length) {
        const ids = new Set(args.scene_filter.tags.value);
        const mod = args.scene_filter.tags.modifier || 'INCLUDES';
        scenes = scenes.filter((s) => {
          const has = s.tags?.some((t: { id: string }) => ids.has(t.id));
          return mod === 'EXCLUDES' ? !has : has;
        });
      }

      if (args.scene_filter?.studios?.value?.length) {
        const ids = new Set(args.scene_filter.studios.value);
        const mod = args.scene_filter.studios.modifier || 'INCLUDES';
        scenes = scenes.filter((s) => {
          const has = s.studio && ids.has(s.studio.id);
          return mod === 'EXCLUDES' ? !has : has;
        });
      }

      const start = (page - 1) * perPage;
      const paginated = scenes.slice(start, start + perPage);

      return { count: scenes.length, duration: 0, filesize: 0, scenes: paginated };
    },

    findPerformer: async (_: unknown, args: { id: string }) => {
      const performers = await getAllPerformers();
      return performers.find((p) => p.id === args.id) || null;
    },

    findPerformers: async (
      _: unknown,
      args: {
        filter?: { q?: string; page?: number; per_page?: number };
        performer_filter?: { name?: { value?: string; modifier?: string }; favorite?: boolean };
        ids?: string[];
      }
    ) => {
      let performers = await getAllPerformers();
      const page = args.filter?.page || 1;
      const perPage = args.filter?.per_page || 20;
      const query =
        args.filter?.q?.toLowerCase() || args.performer_filter?.name?.value?.toLowerCase();

      if (args.ids?.length) {
        const idSet = new Set(args.ids);
        performers = performers.filter((p) => idSet.has(p.id));
      }

      if (query) {
        const mod = args.performer_filter?.name?.modifier || 'INCLUDES';
        performers = performers.filter((p) => {
          const matches = p.name?.toLowerCase().includes(query);
          if (mod === 'MATCHES_REGEX') {
            try {
              return new RegExp(query, 'i').test(p.name || '');
            } catch {
              return matches;
            }
          }
          return mod === 'EXCLUDES' ? !matches : matches;
        });
      }

      if (args.performer_filter?.favorite !== undefined) {
        const fav = args.performer_filter.favorite;
        const filtered = [];
        for (const p of performers) {
          const data = await getPerformerData(p.id);
          if ((data.favorite ?? false) === fav) filtered.push(p);
        }
        performers = filtered;
      }

      const start = (page - 1) * perPage;
      const paginated = performers.slice(start, start + perPage);

      return { count: performers.length, performers: paginated };
    },

    findStudio: async (_: unknown, args: { id: string }) => {
      const studios = await getAllStudios();
      return studios.find((s) => s.id === args.id) || null;
    },

    findStudios: async (
      _: unknown,
      args: {
        filter?: { q?: string; page?: number; per_page?: number };
        studio_filter?: { name?: { value?: string; modifier?: string } };
        ids?: string[];
      }
    ) => {
      let studios = await getAllStudios();
      const page = args.filter?.page || 1;
      const perPage = args.filter?.per_page || 20;
      const query = args.filter?.q?.toLowerCase() || args.studio_filter?.name?.value?.toLowerCase();

      if (args.ids?.length) {
        const idSet = new Set(args.ids);
        studios = studios.filter((s) => idSet.has(s.id));
      }

      if (query) {
        const mod = args.studio_filter?.name?.modifier || 'INCLUDES';
        studios = studios.filter((s) => {
          const matches = s.name?.toLowerCase().includes(query);
          return mod === 'EXCLUDES' ? !matches : matches;
        });
      }

      const start = (page - 1) * perPage;
      const paginated = studios.slice(start, start + perPage);

      return { count: studios.length, studios: paginated };
    },

    findTag: async (_: unknown, args: { id: string }) => {
      const tags = await getAllTags();
      return tags.find((t) => t.id === args.id) || null;
    },

    findTags: async (
      _: unknown,
      args: {
        filter?: { q?: string; page?: number; per_page?: number };
        tag_filter?: { name?: { value?: string; modifier?: string } };
        ids?: string[];
      }
    ) => {
      let tags = await getAllTags();
      const page = args.filter?.page || 1;
      const perPage = args.filter?.per_page || 40;
      const query = args.filter?.q?.toLowerCase() || args.tag_filter?.name?.value?.toLowerCase();

      if (args.ids?.length) {
        const idSet = new Set(args.ids);
        tags = tags.filter((t) => idSet.has(t.id));
      }

      if (query) {
        const mod = args.tag_filter?.name?.modifier || 'INCLUDES';
        tags = tags.filter((t) => {
          const matches = t.name?.toLowerCase().includes(query);
          return mod === 'EXCLUDES' ? !matches : matches;
        });
      }

      const start = (page - 1) * perPage;
      const paginated = tags.slice(start, start + perPage);

      return { count: tags.length, tags: paginated };
    },

    findGalleries: async (_: unknown, args: { ids?: string[] }) => {
      const { allowedTmdbIds } = getConfig();
      const galleries = await Promise.all(
        allowedTmdbIds.map(async (showId) => {
          try {
            const images = await fetchSeasonImages(showId, 1);
            if (!images.length) return null;
            return {
              id: `gallery-${showId}`,
              title: `Season 1 Posters`,
              date: null,
              image_count: images.length,
              cover: images[0]
                ? {
                    id: `image-${showId}-0`,
                    title: null,
                    paths: {
                      thumbnail: `https://image.tmdb.org/t/p/w200${images[0].file_path}`,
                      image: `https://image.tmdb.org/t/p/original${images[0].file_path}`,
                    },
                  }
                : null,
            };
          } catch {
            return null;
          }
        })
      );
      const filtered = galleries.filter((g): g is NonNullable<typeof g> => g !== null);
      if (args.ids?.length) {
        const idSet = new Set(args.ids);
        return { count: filtered.length, galleries: filtered.filter((g) => idSet.has(g.id)) };
      }
      return { count: filtered.length, galleries: filtered };
    },

    findGroups: async (_: unknown, args: { ids?: string[] }) => {
      const { allowedTmdbIds } = getConfig();
      const groups = await Promise.all(
        allowedTmdbIds.map(async (id) => {
          try {
            const details = await fetchShowDetails(id);
            return mapShowToGroup(details);
          } catch {
            return null;
          }
        })
      );
      const filtered = groups.filter((g): g is NonNullable<typeof g> => g !== null);
      if (args.ids?.length) {
        const idSet = new Set(args.ids);
        return { count: filtered.length, groups: filtered.filter((g) => idSet.has(g.id)) };
      }
      return { count: filtered.length, groups: filtered };
    },

    findImages: async (_: unknown, args: { ids?: string[] }) => {
      const { allowedTmdbIds } = getConfig();
      const allImages = await Promise.all(
        allowedTmdbIds.map(async (showId) => {
          try {
            const images = await fetchSeasonImages(showId, 1);
            return images.map((img, idx) => ({
              id: `image-${showId}-${idx}`,
              title: `Season 1 Poster ${idx + 1}`,
              paths: {
                thumbnail: `https://image.tmdb.org/t/p/w200${img.file_path}`,
                image: `https://image.tmdb.org/t/p/original${img.file_path}`,
              },
            }));
          } catch {
            return [];
          }
        })
      );
      const images = allImages.flat();
      if (args.ids?.length) {
        const idSet = new Set(args.ids);
        return { count: images.length, images: images.filter((i) => idSet.has(i.id)) };
      }
      return { count: images.length, images };
    },

    findSceneMarkers: () => ({ count: 0, scene_markers: [] }),
  },

  Mutation: {
    sceneUpdate: async (
      _: unknown,
      {
        input,
      }: { input: { id: string; rating100?: number; organized?: boolean; o_counter?: number } }
    ) => {
      await updateSceneData(input.id, {
        rating100: input.rating100,
        organized: input.organized,
        o_counter: input.o_counter,
      });
      return { id: input.id };
    },

    performerUpdate: async (
      _: unknown,
      { input }: { input: { id: string; favorite?: boolean; rating100?: number } }
    ) => {
      await updatePerformerData(input.id, { favorite: input.favorite, rating100: input.rating100 });
      return { id: input.id };
    },
  },

  Scene: {
    urls: (p: { urls?: string[] }) => p.urls || [],
    organized: async (p: { id: string }) => (await getSceneData(p.id)).organized ?? false,
    interactive: () => false,
    interactive_speed: () => null,
    last_played_at: () => null,
    play_history: () => [],
    o_history: () => [],
    paths: (p: { paths?: unknown }) => p.paths || {},
    files: (p: { files?: unknown[] }) => p.files || [],
    performers: (p: { performers?: unknown[] }) => p.performers || [],
    tags: (p: { tags?: unknown[] }) => p.tags || [],
    galleries: () => [],
    groups: () => [],
    movies: () => [],
    scene_markers: () => [],
    stash_ids: (p: { stash_ids?: unknown[] }) => p.stash_ids || [],
    captions: () => [],
    rating100: async (p: { id: string }) => (await getSceneData(p.id)).rating100 ?? null,
    o_counter: async (p: { id: string }) => (await getSceneData(p.id)).o_counter ?? 0,
    created_at: (p: { created_at?: string | null }) => p.created_at || null,
    updated_at: (p: { updated_at?: string | null }) => p.updated_at || null,
  },

  Performer: {
    name: (p: { name?: string | null }) => p.name || '',
    urls: (p: { urls?: string[] }) => p.urls || [],
    alias_list: (p: { alias_list?: string[] }) => p.alias_list || [],
    favorite: async (p: { id: string }) => (await getPerformerData(p.id)).favorite ?? false,
    ignore_auto_tag: () => false,
    scene_count: async (p: { id: string }) => {
      const scenes = await getAllScenes();
      return scenes.filter((s) => s.performers?.some((perf: { id: string }) => perf.id === p.id))
        .length;
    },
    image_count: () => 0,
    gallery_count: () => 0,
    group_count: () => 0,
    performer_count: () => 0,
    tags: () => [],
    stash_ids: () => [],
    custom_fields: () => ({}),
    rating100: async (p: { id: string }) => (await getPerformerData(p.id)).rating100 ?? null,
    created_at: () => null,
    updated_at: () => null,
  },

  Studio: {
    name: (p: { name?: string | null }) => p.name || '',
    urls: (p: { urls?: string[] }) => p.urls || [],
    child_studios: () => [],
    image_count: () => 0,
    gallery_count: () => 0,
    performer_count: () => 0,
    group_count: () => 0,
    tags: (p: { tags?: unknown[] }) => p.tags || [],
    ignore_auto_tag: () => false,
    stash_ids: (p: { stash_ids?: unknown[] }) => p.stash_ids || [],
    custom_fields: () => ({}),
    aliases: (p: { aliases?: string[] }) => p.aliases || [],
    favorite: () => false,
    scene_count: async (p: { id: string }) => {
      const scenes = await getAllScenes();
      return scenes.filter((s) => s.studio?.id === p.id).length;
    },
    created_at: () => null,
    updated_at: () => null,
  },

  Tag: {
    name: (p: { name?: string | null }) => p.name || '',
    favorite: () => false,
    aliases: (p: { aliases?: string[] }) => p.aliases || [],
    ignore_auto_tag: () => false,
    scene_count: async (p: { id: string }) => {
      const scenes = await getAllScenes();
      return scenes.filter((s) => s.tags?.some((tag: { id: string }) => tag.id === p.id)).length;
    },
    performer_count: () => 0,
    scene_marker_count: () => 0,
    image_count: () => 0,
    gallery_count: () => 0,
    studio_count: () => 0,
    group_count: () => 0,
    parent_count: () => 0,
    child_count: () => 0,
    parents: () => [],
    children: () => [],
    custom_fields: () => ({}),
    created_at: () => null,
    updated_at: () => null,
  },

  Gallery: {
    image_count: () => 0,
  },

  Group: {
    name: (p: { name?: string | null }) => p.name || '',
    aliases: (p: { aliases?: string[] }) => p.aliases || [],
    urls: (p: { urls?: string[] }) => p.urls || [],
    tags: () => [],
    scene_count: () => 0,
  },

  StashImage: {
    paths: (p: { paths?: unknown }) => p.paths || {},
  },
};
