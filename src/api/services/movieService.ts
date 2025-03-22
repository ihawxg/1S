import tmdbApi from '../tmdbApi';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  homepage: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

const movieService = {

  searchMovies: async (query: string, page = 1): Promise<MovieResponse> => {
    const response = await tmdbApi.get('/search/movie', {
      params: { query, page }
    });
    return response.data;
  },

  getMovieDetails: async (movieId: number, language: string = 'en-US'): Promise<MovieDetails> => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}`, {
        params: { language }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },

  getGenres: async (language: string = 'en-US'): Promise<{ genres: { id: number; name: string }[] }> => {
    try {
      const response = await tmdbApi.get('/genre/movie/list', {
        params: { language }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  },
};

export default movieService; 