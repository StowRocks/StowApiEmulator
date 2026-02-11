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
} from './types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

export function mapVideoToScene(video: TMDBVideo, showId: number): Scene {
  return {
    id: `scene-${showId}-${video.id}`,
    title: video.name,
    details: null,
    date: null,
    urls: [`https://www.youtube.com/watch?v=${video.key}`],
    paths: {
      screenshot: `https://img.youtube.com/vi/${video.key}/0.jpg`,
    },
    performers: [],
    movies: [],
  };
}

export function mapCastToPerformer(cast: TMDBCastMember): Performer {
  return {
    id: String(cast.id),
    name: cast.name,
    image_path: cast.profile_path ? `${TMDB_IMAGE_BASE}${cast.profile_path}` : null,
    galleries: [],
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
  return {
    id: network ? String(network.id) : String(show.id),
    name: network?.name || show.name || show.title || null,
    url: show.homepage || null,
    parent_studio: null,
    child_studios: [],
    image_path: network?.logo_path ? `${TMDB_IMAGE_BASE}${network.logo_path}` : null,
    scene_count: 0,
    rating100: null,
    details: show.overview || null,
    aliases: [],
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
