import React, { useState, useEffect } from 'react';
import MovieCard from './components/MovieCard';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  //Api calls for the list of movies
  const API_BASE_URL = 'https://api.themoviedb.org/3';
  
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const API_OPTIONS = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  }

  const fetchMovies = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error('Failed to fetch movies :(');
      }

      const data = await response.json();
      if (data.response === 'False'){
        setErrorMessage(data.error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

    } catch (error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later :(');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
    return () => {
      
    }
  }, [])
  

    return (
        <div className="App">
            <h1>Movie App</h1>
            <div className="search-filter-container">
                <Search searchTerm={searchTerm} onSearchChange={handleSearch} />
                <div className="filter-dropdown">
                    <label htmlFor="genre-filter">Filter by Genre: </label>
                    <select id="genre-filter" value={filter} onChange={handleFilterChange}>
                        <option value="">All Genres</option>
                        {/* Genre options would ideally come from an API or a predefined list */}
                        <option value="28">Action</option>
                        <option value="12">Adventure</option>
                        <option value="16">Animation</option>
                        <option value="35">Comedy</option>
                        <option value="80">Crime</option>
                        <option value="99">Documentary</option>
                        <option value="18">Drama</option>
                        <option value="10751">Family</option>
                        <option value="14">Fantasy</option>
                        <option value="36">History</option>
                        <option value="27">Horror</option>
                        <option value="10402">Music</option>
                        <option value="9648">Mystery</option>
                        <option value="10749">Romance</option>
                        <option value="878">Science Fiction</option>
                        <option value="10770">TV Movie</option>
                        <option value="53">Thriller</option>
                        <option value="10752">War</option>
                        <option value="37">Western</option>
                    </select>
                </div>
                <div className="language-selector">
                    <label htmlFor="language-select">Preferred Language: </label>
                    <select id="language-select" value={preferredLanguage} onChange={handlePreferredLanguageChange}>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                    </select>
                </div>
            </div>

            <h2>Recommended Movies</h2>
            <div className="movie-grid">
                {recommendedMovies.length > 0 ? (
                    recommendedMovies.map(movie => (
                        <MovieCard key={movie.id} movie={movie} onMovieClick={openMovieModal} />
                    ))
                ) : (
                    <p>No recommendations available right now.</p>
                )}
            </div>

            <h2>All Movies</h2>
            <div className="movie-grid">
                {displayedMovies.length > 0 ? (
                    displayedMovies.map(movie => (
                        <MovieCard key={movie.id} movie={movie} onMovieClick={openMovieModal} />
                    ))
                ) : (
                    <p>No movies found.</p>
                )}
            </div>

            <h2>Favorite Movies</h2>
            <div className="movie-grid favorite-movies">
                {favorites.length > 0 ? (
                    favorites.map(movie => (
                        <MovieCard key={movie.id} movie={movie} onMovieClick={openMovieModal} isFavorite={true} onRemoveFavorite={openConfirmModal} />
                    ))
                ) : (
                    <p>You have no favorite movies yet.</p>
                )}
            </div>

            {selectedMovie && (
                <MovieModal movie={selectedMovie} onClose={closeMovieModal} onAddToFavorites={handleAddToFavorites} isFavorite={favorites.some(fav => fav.id === selectedMovie.id)} />
            )}

            {confirmModalOpen && (
                <ConfirmModal 
                    message="Are you sure you want to remove this movie from your favorites?" 
                    onConfirm={() => handleRemoveFromFavorites(favorites.find(fav => fav.id === selectedMovie.id) || selectedMovie)} 
                    onCancel={closeConfirmModal} 
                />
            )}
        </div>
    );
}

export default App;
