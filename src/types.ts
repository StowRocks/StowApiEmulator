// TMDB Response Types (internal, from TMDB API)

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
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

export interface TMDBShowDetails {
  id: number;
  name?: string;
  title?: string;
  overview: string;
  first_air_date?: string;
  release_date?: string;
}

// Stash Schema Types (output, served via GraphQL)

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
}

export interface Performer {
  id: string;
  name: string | null;
  image_path: string | null;
  galleries: Gallery[];
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
