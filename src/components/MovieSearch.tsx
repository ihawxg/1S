import { useState, useEffect } from 'react';
import searchService from '@/api/services/searchService';
import { Movie } from '@/types/movie';
import ClickAwayListener from 'react-click-away-listener';

interface MovieSearchProps {
  onMovieSelect: (movie: Movie) => void;
}

const MovieSearch = ({ onMovieSelect }: MovieSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchService.searchMovies(query);
        setResults(searchResults.results);
      } catch (error) {
        console.error('Error searching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(handleSearch, 500);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleMovieSelect = (movie: Movie) => {
    onMovieSelect(movie);
    setQuery('');
    setIsDropdownOpen(false);
  };

  const handleClickAway = () => {
    setIsDropdownOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className="w-full max-w-md relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search for a movie to add..."
            className="border border-gray-300 rounded-lg w-full focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2"
          />
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="border-blue-500 border-solid border-t-2 h-5 rounded-full w-5 animate-spin"></div>
            </div>
          )}
        </div>

        {isDropdownOpen && results.length > 0 && (
          <div className="bg-white rounded-md shadow-lg w-full absolute max-h-60 mt-1 overflow-y-auto z-10">
            <ul className="py-1">
              {results.map((movie) => (
                <li 
                  key={movie.id}
                  className="flex text-[#000] cursor-pointer hover:bg-gray-100 items-center px-4 py-2"
                  onClick={() => handleMovieSelect(movie)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleMovieSelect(movie)}
                >
                  {movie.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                      alt={movie.title}
                      className="h-14 rounded w-10 mr-3 object-cover"
                    />
                  ) : (
                    <div className="flex bg-gray-200 h-14 justify-center rounded w-10 items-center mr-3">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{movie.title}</p>
                    <p className="text-gray-500 text-sm">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default MovieSearch; 