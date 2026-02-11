import type {
  TMDBVideo,
  TMDBCastMember,
  TMDBImage,
  TMDBShowDetails,
  Scene,
  Performer,
  Gallery,
  Movie,
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
    name: show.name ?? show.title ?? null,
    synopsis: show.overview,
    scenes: [],
  };
}
