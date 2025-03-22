import tmdbApi from '../tmdbApi';
import { MovieResponse } from './movieService';

const searchService = {
  searchMovies: async (query: string, language: string = 'en-US', page = 1): Promise<MovieResponse> => {
    try {
      const response = await tmdbApi.get('/search/movie', {
        params: {
          language,
          query,
          page,
          include_adult: false
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },
};

export default searchService; 