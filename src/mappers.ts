import type {
  TMDBVideo,
  TMDBCastMember,
  TMDBImage,
  TMDBShowDetails,
  TMDBGenre,
  Scene,
  Performer,
  Gallery,
  Movie,
  Studio,
  Tag,
  Group,
} from './types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

export function mapVideoToScene(
  video: TMDBVideo,
  showId: number,
  showDetails?: TMDBShowDetails
): Scene {
  const airDate = video.published_at || showDetails?.first_air_date || null;
  return {
    id: `scene-${showId}-${video.id}`,
    title: video.name,
    details: null,
    date: airDate,
    urls: [`https://www.youtube.com/watch?v=${video.key}`],
    paths: {
      screenshot: `https://img.youtube.com/vi/${video.key}/0.jpg`,
      preview: `https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`,
      stream: `https://www.youtube.com/watch?v=${video.key}`,
    },
    performers: [],
    movies: [],
    stash_ids: [
      {
        endpoint: 'https://api.themoviedb.org',
        stash_id: `${showId}-${video.id}`,
      },
    ],
    created_at: airDate,
    updated_at: airDate,
  };
}

export function mapCastToPerformer(cast: TMDBCastMember): Performer {
  return {
    id: String(cast.id),
    name: cast.name,
    image_path: cast.profile_path ? `${TMDB_IMAGE_BASE}${cast.profile_path}` : null,
    galleries: [],
    stash_ids: [
      {
        endpoint: 'https://api.themoviedb.org',
        stash_id: String(cast.id),
      },
    ],
  };
}

export function mapImagesToGallery(personId: number, images: TMDBImage[]): Gallery {
  return {
    id: `gallery-${personId}`,
    title: null,
    files: images.map((img) => ({
      path: `${TMDB_IMAGE_BASE}${img.file_path}`,
    })),
  };
}

export function mapShowToGroup(show: TMDBShowDetails): Group {
  const network = show.networks?.[0];
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';
  return {
    id: `group-${show.id}`,
    name: show.name || show.title || 'Unknown',
    aliases: [],
    duration: null,
    date: show.first_air_date || show.release_date || null,
    rating100: null,
    director: null,
    synopsis: show.overview || null,
    urls: show.homepage ? [show.homepage] : [],
    scene_count: show.number_of_episodes || 0,
    front_image_path: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : null,
    back_image_path: show.backdrop_path ? `${TMDB_IMAGE_BASE}${show.backdrop_path}` : null,
    studio: network ? mapShowToStudio(show) : null,
    tags: show.genres?.map(mapGenreToTag) || [],
  };
}

export function mapShowToMovie(show: TMDBShowDetails): Movie {
  return {
    id: String(show.id),
    name: show.name || show.title || null,
    synopsis: show.overview || null,
    scenes: [],
  };
}

export function mapShowToStudio(show: TMDBShowDetails): Studio {
  const network = show.networks?.[0];
  const studioId = network ? String(network.id) : String(show.id);
  return {
    id: studioId,
    name: network?.name || show.name || show.title || null,
    url: show.homepage || null,
    parent_studio: null,
    child_studios: [],
    image_path: network?.logo_path ? `${TMDB_IMAGE_BASE}${network.logo_path}` : null,
    scene_count: 0,
    rating100: null,
    details: show.overview || null,
    aliases: [],
    stash_ids: [
      {
        endpoint: 'https://api.themoviedb.org',
        stash_id: studioId,
      },
    ],
  };
}

export function mapGenreToTag(genre: TMDBGenre): Tag {
  return {
    id: String(genre.id),
    name: genre.name,
    description: null,
    sort_name: genre.name,
    favorite: false,
    aliases: [],
    ignore_auto_tag: false,
    scene_count: 0,
    performer_count: 0,
    scene_marker_count: 0,
    image_path: null,
    stash_ids: [
      {
        endpoint: 'https://api.themoviedb.org',
        stash_id: String(genre.id),
      },
    ],
    image_count: 0,
    gallery_count: 0,
    parent_count: 0,
    child_count: 0,
    created_at: null,
    updated_at: null,
    parents: [],
    children: [],
  };
}
