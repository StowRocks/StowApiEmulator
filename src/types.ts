// TMDB Response Types (internal, from TMDB API)

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  published_at?: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
}

export interface TMDBImage {
  file_path: string;
  width: number;
  height: number;
}

export interface TMDBNetwork {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBShowDetails {
  id: number;
  name?: string;
  title?: string;
  overview: string;
  first_air_date?: string;
  release_date?: string;
  homepage?: string;
  networks?: TMDBNetwork[];
  genres?: TMDBGenre[];
  number_of_episodes?: number;
  number_of_seasons?: number;
}

// Stash Schema Types (output, served via GraphQL)

export interface StashID {
  endpoint: string;
  stash_id: string;
}

export interface ScenePaths {
  screenshot: string | null;
}

export interface Scene {
  id: string;
  title: string | null;
  details: string | null;
  date: string | null;
  urls: string[];
  paths: ScenePaths;
  performers: Performer[];
  movies: Movie[];
  stash_ids?: StashID[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Performer {
  id: string;
  name: string | null;
  image_path: string | null;
  galleries: Gallery[];
  stash_ids?: StashID[];
}

export interface Gallery {
  id: string;
  title: string | null;
  files: ImageFile[];
}

export interface ImageFile {
  path: string;
}

export interface Movie {
  id: string;
  name: string | null;
  synopsis: string | null;
  scenes: Scene[];
}

export interface Studio {
  id: string;
  name: string | null;
  url: string | null;
  parent_studio: Studio | null;
  child_studios: Studio[];
  image_path: string | null;
  scene_count: number;
  rating100: number | null;
  details: string | null;
  aliases: string[];
  stash_ids?: StashID[];
}

export interface Tag {
  id: string;
  name: string | null;
  description: string | null;
  sort_name: string | null;
  favorite: boolean;
  aliases: string[];
  ignore_auto_tag: boolean;
  scene_count: number;
  performer_count: number;
  scene_marker_count: number;
  image_path: string | null;
  image_count: number;
  gallery_count: number;
  parent_count: number;
  child_count: number;
  created_at: string | null;
  updated_at: string | null;
  parents: Tag[];
  children: Tag[];
  stash_ids?: StashID[];
}

export interface Group {
  id: string;
  name: string;
  aliases: string[];
  duration: number | null;
  date: string | null;
  rating100: number | null;
  director: string | null;
  synopsis: string | null;
  urls: string[];
  scene_count: number;
  front_image_path: string | null;
  back_image_path: string | null;
  studio: Studio | null;
  tags: Tag[];
}
