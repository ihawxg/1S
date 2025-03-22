import { useState, useEffect } from "react";
import movieService from "@/api/services/movieService";
import ClickAwayListener from "react-click-away-listener";
import { HiChevronDown, HiX } from "react-icons/hi";

interface Genre {
  id: number;
  name: string;
}

interface GenreFilterProps {
  onGenreSelect: (genreIds: number[]) => void;
  selectedGenres: number[];
  disabled?: boolean;
}

const GenreFilter = ({
  onGenreSelect,
  selectedGenres,
  disabled = false,
}: GenreFilterProps) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempSelectedGenres, setTempSelectedGenres] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoading(true);
      try {
        const genreData = await movieService.getGenres();
        setGenres(genreData.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    setTempSelectedGenres(selectedGenres);
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [selectedGenres, isOpen]);

  const handleGenreToggle = (genreId: number) => {
    setTempSelectedGenres((prevGenres) =>
      prevGenres.includes(genreId)
        ? prevGenres.filter((id) => id !== genreId)
        : [...prevGenres, genreId]
    );
  };

  const handleApplyFilters = () => {
    onGenreSelect(tempSelectedGenres);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setTempSelectedGenres([]);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tempSelectedGenreObjects = genres.filter((genre) =>
    tempSelectedGenres.includes(genre.id)
  );

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className="relative">
        <div className="inline-block">
          <button
            type="button"
            className="flex bg-white border border-gray-300 justify-between rounded-md shadow-sm text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium hover:bg-gray-50 items-center px-4 py-2"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled || isLoading}
          >
            <span className="mr-1">Genres</span>
            {selectedGenres.length > 0 && (
              <span className="bg-blue-100 justify-center rounded-full text-blue-800 text-xs font-medium inline-flex items-center ml-1 px-2 py-0.5">
                {selectedGenres.length}
              </span>
            )}
            <HiChevronDown className="h-5 w-5 ml-2" />
          </button>
        </div>

        {isOpen && (
          <div className="bg-white rounded-md shadow-lg w-72 absolute lg:left-0 mt-2 right-0 z-20">
            {tempSelectedGenreObjects.length > 0 && (
              <div className="border-b p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-500 text-xs font-medium">
                    Selected Genres
                  </span>
                  <button
                    type="button"
                    className="text-blue-600 text-xs focus:outline-none hover:text-blue-800"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tempSelectedGenreObjects.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-blue-100 rounded-full text-blue-800 text-xs font-medium inline-flex items-center px-2 py-0.5"
                    >
                      {genre.name}
                      <button
                        type="button"
                        className="flex-shrink-0 h-4 justify-center rounded-full text-blue-400 w-4 focus:outline-none hover:bg-blue-200 hover:text-blue-500 inline-flex items-center ml-1"
                        onClick={() => handleGenreToggle(genre.id)}
                      >
                        <HiX className="h-2 w-2" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="border-blue-500 border-solid border-t-2 h-6 rounded-full w-6 animate-spin"></div>
              </div>
            ) : (
              <div className="p-2">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search genres..."
                    className="border border-gray-300 rounded text-[#000000] text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-1.5"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredGenres.length > 0 ? (
                    filteredGenres.map((genre) => (
                      <div
                        key={genre.id}
                        className="flex p-2 rounded hover:bg-gray-100 items-center cursor-pointer"
                        onClick={() => handleGenreToggle(genre.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleGenreToggle(genre.id);
                          }
                        }}
                        tabIndex={0}
                      >
                        <input
                          type="checkbox"
                          checked={tempSelectedGenres.includes(genre.id)}
                          onChange={() => {}}
                          className="border-gray-300 h-4 rounded text-blue-600 w-4 focus:ring-blue-500 cursor-pointer"
                        />
                        <label className="text-gray-700 text-sm w-full ml-2 cursor-pointer">
                          {genre.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center text-sm py-4">
                      No genres found matching &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex border-t justify-end p-2">
              <button
                type="button"
                className="bg-blue-500 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-600 px-4 py-1.5"
                onClick={handleApplyFilters}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default GenreFilter;
