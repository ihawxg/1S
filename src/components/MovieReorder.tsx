import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Movie } from '@/types/movie';
import { MdDragIndicator } from 'react-icons/md';

interface MovieReorderProps {
  movies: Movie[];
  onReorder: (reorderedMovies: Movie[]) => void;
  disabled?: boolean;
}

const MovieReorder = ({ movies, onReorder, disabled = false }: MovieReorderProps) => {
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [items, setItems] = useState<Movie[]>([]);

  useEffect(() => {
    setItems(movies);
  }, [movies]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    setItems(reorderedItems);
    onReorder(reorderedItems);
  };

  const toggleReorderMode = () => {
    setIsReorderMode(!isReorderMode);
  };

  if (!isReorderMode) {
    return (
      <button
        type="button"
        onClick={toggleReorderMode}
        className="bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium hover:bg-gray-50 px-4 py-2"
        disabled={disabled}
      >
        Reorder Movies
      </button>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Reorder Movies</h3>
        <button
          type="button"
          onClick={toggleReorderMode}
          className="bg-blue-500 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium hover:bg-blue-600 px-4 py-2"
        >
          Done
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="movies">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {items.map((movie, index) => (
                <Draggable key={movie.id} draggableId={String(movie.id)} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex bg-white border border-gray-200 p-3 rounded-md shadow-sm items-center"
                    >
                      <div className="flex items-center">
                        <MdDragIndicator className="h-6 w-6 text-gray-400 mr-3" />
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
                        <span className="text-[#000] font-medium">{movie.title}</span>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default MovieReorder; 