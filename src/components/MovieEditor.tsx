import { useState, useRef, KeyboardEvent } from "react";
import { Movie, Genre } from "@/types/movie";
import ClickAwayListener from "react-click-away-listener";
import { IoClose } from "react-icons/io5";

interface MovieEditorProps {
  movie: Movie;
  onSave: (updatedMovie: Movie) => void;
  onCancel: () => void;
}

const MovieEditor = ({ movie, onSave, onCancel }: MovieEditorProps) => {
  const [editedMovie, setEditedMovie] = useState<Movie>({ ...movie });
  const [newGenre, setNewGenre] = useState("");
  const genreInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedMovie((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddGenre = () => {
    if (!newGenre.trim()) return;

    const genreName = newGenre.trim();
    const newGenreObj: Genre = {
      id: Math.floor(Math.random() * -1000), // negative id to avoid conflicts with the tmdb api in real case won't be like this
      name: genreName,
    };

    setEditedMovie((prev) => ({
      ...prev,
      genres: [...(prev.genres || []), newGenreObj],
    }));

    setNewGenre("");
    genreInputRef.current?.focus();
  };

  const handleGenreKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddGenre();
    }
  };

  const handleRemoveGenre = (genreId: number) => {
    setEditedMovie((prev) => ({
      ...prev,
      genres: prev.genres?.filter((genre) => genre.id !== genreId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedMovie);
  };

  const handleClickAway = () => {
    onCancel();
  };

  return (
    <div className="flex bg-black bg-opacity-50 justify-center fixed inset-0 items-center z-50">
      <ClickAwayListener onClickAway={handleClickAway}>
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-h-[90vh] max-w-2xl overflow-y-auto">
          <h2 className="text-[#000] text-xl font-bold mb-4">
            Edit Movie Details
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
              <div>
                <label className="text-gray-700 text-sm block font-medium mb-1">
                  TMDB ID
                </label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={editedMovie.id || ""}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md text-[#000] w-full cursor-not-allowed focus:border-blue-500 focus:outline-none focus:ring-blue-500 opacity-50 px-3 py-2"
                  disabled
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-700 text-sm block font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editedMovie.title}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md text-[#000] w-full focus:border-blue-500 focus:outline-none focus:ring-blue-500 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="text-gray-700 text-sm block font-medium mb-1">
                  Release Date
                </label>
                <input
                  type="date"
                  id="release_date"
                  name="release_date"
                  value={editedMovie.release_date || ""}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md text-[#000] w-full focus:border-blue-500 focus:outline-none focus:ring-blue-500 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-gray-700 text-sm block font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="runtime"
                  name="runtime"
                  value={editedMovie.runtime || 0}
                  onChange={handleInputChange}
                  min="0"
                  className="border border-gray-300 rounded-md text-[#000] w-full focus:border-blue-500 focus:outline-none focus:ring-blue-500 px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className={`text-gray-700 text-sm block font-medium ${
                    editedMovie?.genres?.length &&
                    editedMovie?.genres?.length > 0 &&
                    "mb-1"
                  }`}
                >
                  Genres
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editedMovie.genres?.map((genre) => (
                    <div
                      key={genre.id}
                      className="flex bg-blue-100 rounded-md text-blue-800 items-center px-2 py-1"
                    >
                      <span>{genre.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGenre(genre.id)}
                        className="text-blue-600 focus:outline-none hover:text-blue-800 ml-1"
                      >
                        <IoClose className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    id="new-genre"
                    ref={genreInputRef}
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    onKeyDown={handleGenreKeyDown}
                    placeholder="Add a genre..."
                    className="border border-gray-300 rounded-l-md text-[#000] w-full focus:border-blue-500 focus:outline-none focus:ring-blue-500 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddGenre}
                    className="bg-blue-500 rounded-r-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-600 px-3 py-2"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-700 text-sm block font-medium mb-1">
                  Overview
                </label>
                <textarea
                  id="overview"
                  name="overview"
                  value={editedMovie.overview || ""}
                  onChange={handleInputChange}
                  rows={4}
                  className="border border-gray-300 rounded-md text-[#000] w-full focus:border-blue-500 focus:outline-none focus:ring-blue-500 px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium hover:bg-gray-50 px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium hover:bg-blue-600 px-4 py-2"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </ClickAwayListener>
    </div>
  );
};

export default MovieEditor;
