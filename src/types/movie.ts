export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  
  runtime?: number;
  director?: string;
  genres?: Genre[];
  actors?: string[];
  trailer?: string;
  
  adult?: boolean;
  belongs_to_collection?: Collection;
  budget?: number;
  genre_ids?: number[];
  homepage?: string;
  imdb_id?: string;
  origin_country?: string[];
  original_language?: string;
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  revenue?: number;
  spoken_languages?: SpokenLanguage[];
  status?: string;
  tagline?: string;
  video?: boolean;
} 