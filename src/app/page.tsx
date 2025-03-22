"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { movieService } from "@/api";
import type { Movie } from "@/types/movie";
import MovieSearch from "@/components/MovieSearch";
import LanguageSelector from "@/components/LanguageSelector";
import GenreFilter from "@/components/GenreFilter";
import MovieReorder from "@/components/MovieReorder";
import MovieEditor from "@/components/MovieEditor";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdEdit, MdTranslate } from "react-icons/md";
import { BsTrash } from "react-icons/bs";

type MovieTitle = {
  id: number;
  title: string;
  selected: boolean;
};

export default function Home() {
  const [movieTitles, setMovieTitles] = useState<MovieTitle[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);

  const [searchedMovies, setSearchedMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchComplete, setSearchComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<string>("en");
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const [searchProgress, setSearchProgress] = useState<number>(0);
  const [totalSearchItems, setTotalSearchItems] = useState<number>(0);
  const [isChangingLanguage, setIsChangingLanguage] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
  ];

  const retryFetch = async <T,>(
    fetchFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 2000
  ): Promise<T> => {
    let lastError: Error | unknown;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fetchFn();
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5;
      }
    }
    
    throw lastError;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setIsFileUploaded(false);
      setSearchComplete(false);
      setSearchedMovies([]);
      setFilteredMovies([]);
    }
  };

  const processFile = async () => {
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim() !== "");

      const titles = lines.map((title, index) => ({
        id: index,
        title: title.trim(),
        selected: true,
      }));

      setMovieTitles(titles);
      setIsFileUploaded(true);
    } catch (err) {
      console.error("Error reading file:", err);
      setError("Failed to read the file. Please try again.");
    }
  };

  const handleCheckboxChange = (id: number) => {
    setMovieTitles((prev) =>
      prev.map((movie) =>
        movie.id === id ? { ...movie, selected: !movie.selected } : movie
      )
    );
  };

  const handleSelectAll = (select: boolean) => {
    setMovieTitles((prev) =>
      prev.map((movie) => ({ ...movie, selected: select }))
    );
  };

  const handleSearch = async () => {
    const selectedTitles = movieTitles.filter((movie) => movie.selected);

    if (selectedTitles.length === 0) {
      setError("Please select at least one movie to search.");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchProgress(0);
    setTotalSearchItems(selectedTitles.length);

    try {
      const batchSize = 100;
      let allMovieDetails: Movie[] = [];
      const processedMovieIds = new Set<number>();
      
      for (let i = 0; i < selectedTitles.length; i += batchSize) {
        const batch = selectedTitles.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async ({ title }) => {
          try {
            return await retryFetch(async () => {
              const searchResults = await movieService.searchMovies(title);
              
              if (searchResults.results.length === 0) {
                return null;
              }
              
              const movieId = searchResults.results[0].id;
              
              if (processedMovieIds.has(movieId)) {
                return null;
              }
              
              const details = await movieService.getMovieDetails(
                movieId,
                `${language}-US`
              );
              
              processedMovieIds.add(movieId);
              
              return details as unknown as Movie;
            });
          } catch (err) {
            console.error(`Error fetching details for ${title} after retries:`, err);
            return null;
          }
        });
        
        const batchResults = (await Promise.all(batchPromises)).filter(
          (movie) => movie !== null
        ) as Movie[];
        
        allMovieDetails = [...allMovieDetails, ...batchResults];
        
        setSearchProgress(i + batch.length);
      }

      const uniqueMovies = Array.from(
        new Map(allMovieDetails.map(movie => [movie.id, movie])).values()
      );

      setSearchedMovies(uniqueMovies);
      setFilteredMovies(uniqueMovies);
      setSearchComplete(true);
    } catch (err) {
      console.error("Error searching for movies:", err);
      setError("Failed to search for movies. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMovie = async (movie: Movie) => {
    try {
      if (searchedMovies.some(m => m.id === movie.id)) {
        setError(`"${movie.title}" is already in your list.`);
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      const fullMovieDetails = await retryFetch(async () => {
        return await movieService.getMovieDetails(
          movie.id,
          `${language}-US`
        ) as unknown as Movie;
      });

      if (!searchedMovies.some((m) => m.id === fullMovieDetails.id)) {
        const updatedMovies = [
          ...searchedMovies,
          fullMovieDetails,
        ];
        setSearchedMovies(updatedMovies);
        applyFilters(updatedMovies);
      }
    } catch (error) {
      console.error("Error adding movie:", error);
      setError("Failed to add movie. Please try again.");
    }
  };

  const handleRemoveMovie = (id: number) => {
    const updatedMovies = searchedMovies.filter((movie) => movie.id !== id);
    setSearchedMovies(updatedMovies);
    applyFilters(updatedMovies);
  };

  const handleLanguageChange = async (languageCode: string) => {
    setLanguage(languageCode);

    if (searchedMovies.length === 0) {
      return;
    }

    try {
      setIsChangingLanguage(true);
      setIsSearching(true);
      setError(null);
      setSearchProgress(0);
      setTotalSearchItems(searchedMovies.length);
      
      const batchSize = 100;
      
      const movieMap = new Map<number, Movie>();
      
      searchedMovies.forEach(movie => movieMap.set(movie.id, movie));
      
      const lazyLoadMovies = async () => {
        for (let i = 0; i < searchedMovies.length; i += batchSize) {
          const batch = searchedMovies.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (movie) => {
            try {
              return await retryFetch(async () => {
                const updatedMovie = await movieService.getMovieDetails(movie.id, `${languageCode}-US`);
                return updatedMovie as unknown as Movie;
              });
            } catch (err) {
              console.error(`Error refreshing details for ${movie.title} after retries:`, err);
              return movie;
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          
          batchResults.forEach(movie => {
            movieMap.set(movie.id, movie);
          });
          
          setSearchProgress(i + batch.length);
          
          const partialResults = Array.from(movieMap.values());
          setSearchedMovies(partialResults);
          applyFilters(partialResults);
        }
      };
      
      await lazyLoadMovies();
      
      setIsSearching(false);
      setIsChangingLanguage(false);
      
    } catch (error) {
      console.error("Error refreshing movies with new language:", error);
      setError("Failed to update language. Please try again.");
      setIsSearching(false);
      setIsChangingLanguage(false);
    }
  };

  const handleGenreSelect = (genreIds: number[]) => {
    setSelectedGenres(genreIds);
  };

  const applyFilters = (movies: Movie[] = searchedMovies) => {
    if (selectedGenres.length === 0) {
      setFilteredMovies(movies);
      return;
    }

    const filtered = movies.filter((movie) => {
      return (
        movie.genre_ids?.some((genreId) => selectedGenres.includes(genreId)) ||
        movie.genres?.some((genre) => selectedGenres.includes(genre.id))
      );
    });

    setFilteredMovies(filtered);
  };

  const handleReorderMovies = (reorderedMovies: Movie[]) => {
    setSearchedMovies(reorderedMovies);
    applyFilters(reorderedMovies);
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
  };

  const handleSaveEdit = (updatedMovie: Movie) => {
    const updatedMovies = searchedMovies.map((movie) =>
      movie.id === updatedMovie.id ? updatedMovie : movie
    );
    setSearchedMovies(updatedMovies);
    applyFilters(updatedMovies);
    setEditingMovie(null);
  };

  const handleSave = async () => {
    try {
      await fetch("/api/movies/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchedMovies),
      });

      alert("Movies saved successfully!");
    } catch (err) {
      console.error("Error saving movies:", err);
      setError("Failed to save movies. Please try again.");
    }
  };

  useEffect(() => {
    applyFilters();
  }, [selectedGenres]);

  useEffect(() => {
    if (file) {
      processFile();
    }
  }, [file]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Movie Search Tool</h1>

      <section className="mb-8">
        <div className="flex flex-col justify-center w-full items-center">
          <label
            className="flex flex-col bg-gray-50 border-2 border-dashed border-gray-300 h-64 justify-center rounded-lg w-full cursor-pointer hover:bg-gray-100 items-center"
          >
            <div className="flex flex-col justify-center items-center pb-6 pt-5">
              <FaCloudUploadAlt className="h-10 text-gray-400 w-10 mb-3" />
              <p className="text-gray-500 text-sm mb-2">
                <span className="font-semibold">Click to upload</span>
              </p>
              <p className="text-gray-500 text-xs">
                TXT file with movie titles (one per line)
              </p>
            </div>
            <input
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
        </div>

        {file && (
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <p className="text-blue-800">
              <span className="font-semibold">File uploaded:</span> {file.name}
            </p>
          </div>
        )}
      </section>

      {error && (
        <div className="bg-red-100 border border-red-400 rounded text-red-700 mb-6 px-4 py-3">
          {error}
        </div>
      )}

      {isFileUploaded && !searchComplete && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Movie Titles</h2>
            <div className="space-x-2">
              <button
                onClick={() => handleSelectAll(true)}
                className="bg-blue-500 rounded text-sm text-white hover:bg-blue-600 px-3 py-1"
              >
                Select All
              </button>
              <button
                onClick={() => handleSelectAll(false)}
                className="bg-gray-500 rounded text-sm text-white hover:bg-gray-600 px-3 py-1"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            {movieTitles.length > 0 ? (
              <ul className="divide-gray-200 divide-y">
                {movieTitles.map((movie) => (
                  <li key={movie.id} className="flex items-center py-3">
                    <input
                      type="checkbox"
                      checked={movie.selected}
                      onChange={() => handleCheckboxChange(movie.id)}
                      className="h-5 rounded text-blue-600 w-5 focus:ring-blue-500"
                    />
                    <label
                      className="text-gray-700 cursor-pointer ml-3"
                    >
                      {movie.title}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No movie titles found in the file.
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-blue-600 rounded-lg text-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-700 px-6 py-2"
            >
              {isSearching ? (
                <>
                  <span className="border-2 border-b-blue-200 border-l-transparent border-r-blue-200 border-t-blue-200 h-4 rounded-full w-4 animate-spin inline-block mr-2"></span>
                  Searching... {searchProgress > 0 ? `(${searchProgress}/${totalSearchItems})` : ''}
                </>
              ) : (
                "Search Movies"
              )}
            </button>
          </div>
          
          {isSearching && totalSearchItems > 10 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(searchProgress / totalSearchItems) * 100}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Processing {searchProgress} of {totalSearchItems} movies
              </p>
            </div>
          )}
        </section>
      )}

      {searchComplete && (
        <section className="mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add More Movies</h3>
            <MovieSearch onMovieSelect={handleAddMovie} />
          </div>

          <h2 className="text-xl font-semibold mb-2">Search Results</h2>

          <div className="flex flex-col justify-between gap-4 items-start mb-6 md:flex-row md:items-center">
            <div className="flex flex-wrap w-full gap-3">
              <LanguageSelector
                onLanguageChange={handleLanguageChange}
                currentLanguage={language}
                isLoading={isChangingLanguage}
                progress={0}
                total={0}
              />

              <GenreFilter
                onGenreSelect={handleGenreSelect}
                selectedGenres={selectedGenres}
                disabled={isChangingLanguage}
              />

              <MovieReorder
                movies={searchedMovies}
                onReorder={handleReorderMovies}
                disabled={isChangingLanguage}
              />
            </div>
          </div>

          {isChangingLanguage ? (
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <MdTranslate className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-medium text-center text-[#000]">
                  Changing Language to {languages.find(lang => lang.code === language)?.name || language}
                </h3>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300" 
                  style={{ width: `${(searchProgress / totalSearchItems) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mb-6">
                <span>{searchProgress} of {totalSearchItems} movies</span>
                <span>{Math.round((searchProgress / totalSearchItems) * 100)}% complete</span>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>This may take a few moments depending on the number of movies.</p>
                <p className="mt-1">The movie data is being updated with the new language.</p>
              </div>
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:grid-cols-2">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative"
                >
                  <div className="flex">
                    <div className="w-1/3">
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex bg-gray-200 h-full justify-center w-full items-center">
                          <span className="text-gray-500 text-sm">
                            No image
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 w-2/3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[#000] text-lg font-semibold pr-2">
                          {movie.title}
                        </h3>
                        
                        <div className="flex shrink-0 space-x-2">
                          <button
                            onClick={() => handleEditMovie(movie)}
                            className="bg-blue-500 p-1.5 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-600"
                          >
                            <MdEdit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleRemoveMovie(movie.id)}
                            className="bg-red-500 p-1.5 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:bg-red-600"
                          >
                            <BsTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center mb-2">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-[#000]">
                          {movie.vote_average?.toFixed(1) || "N/A"}
                        </span>
                        <span className="text-gray-800 mx-2">•</span>
                        <span className="text-[#000]">
                          {movie.release_date?.split("-")[0] || "Unknown"}
                        </span>
                      </div>

                      <div className="mb-2">
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {movie.overview}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {movie.genres?.map((genre) => (
                          <span
                            key={genre.id}
                            className="bg-blue-100 rounded-full text-blue-800 text-xs px-2 py-1"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="bg-white rounded-lg shadow-md text-center text-gray-500 py-4">
              {isSearching
                ? "Loading movies..."
                : "No movies found. Please try different titles or adjust your filters."}
            </p>
          )}

          <div className="flex justify-center mt-6">
            <button
              onClick={handleSave}
              className="bg-green-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 hover:bg-green-700 px-6 py-2"
            >
              Save Movies
            </button>
          </div>
        </section>
      )}

      {editingMovie && (
        <MovieEditor
          movie={editingMovie}
          onSave={handleSaveEdit}
          onCancel={() => setEditingMovie(null)}
        />
      )}
    </main>
  );
}
