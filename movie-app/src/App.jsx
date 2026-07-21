import React, { useState, useEffect } from 'react';
import MovieCard from './components/MovieCard';
import Search from './components/Search';
import MovieModal from './components/MovieModal';
import ConfirmModal from './components/ConfirmModal';
import './index.css';

function App() {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const [preferredLanguage, setPreferredLanguage] = useState('en'); // Default to English

    // Fetch movies from API
    useEffect(() => {
        fetch('https://api.themoviedb.org/3/discover/movie?api_key=YOUR_API_KEY&language=en-US&sort_by=popularity.desc')
            .then(response => response.json())
                .then(data => {
                    setMovies(data.results);
                    generateRecommendations(data.results, preferredLanguage);
            })
            .catch(error => console.error('Error fetching movies:', error));
    }, []);

    // Load favorites from localStorage
    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    // Save favorites to localStorage
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const openMovieModal = (movie) => {
        setSelectedMovie(movie);
    };

    const closeMovieModal = () => {
        setSelectedMovie(null);
    };

    const openConfirmModal = () => {
        setConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setConfirmModalOpen(false);
    };

    const handleAddToFavorites = (movie) => {
        if (!favorites.some(fav => fav.id === movie.id)) {
            setFavorites([...favorites, movie]);
            closeMovieModal();
        } else {
            // Optionally show a message that the movie is already a favorite
            console.log('Movie already in favorites');
            closeMovieModal();
        }
    };

    const handleRemoveFromFavorites = (movie) => {
        setFavorites(favorites.filter(fav => fav.id !== movie.id));
        closeConfirmModal();
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        // In a real app, you would fetch search results here
        // For now, we filter the existing movies list
        const filteredMovies = movies.filter(movie =>
            movie.title.toLowerCase().includes(term.toLowerCase())
        );
        setMovies(filteredMovies);
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
        // In a real app, you would apply filters to your API call or data set
        console.log('Filter changed to:', event.target.value);
    };

    // Function to generate movie recommendations based on liked movies and preferred language
    const generateRecommendations = (likedMovies, language) => {
        // This is a placeholder for a more sophisticated recommendation algorithm.
        // In a real-world scenario, this would involve more complex logic, possibly using user history,
        // genre preferences, and potentially a machine learning model.
        
        // For demonstration, we'll fetch movies of genres present in likedMovies, in the preferred language.
        if (likedMovies.length === 0) return [];

        // Get unique genres from liked movies
        const likedGenres = new Set();
        likedMovies.forEach(movie => {
            if (movie.genre_ids) {
                movie.genre_ids.forEach(genreId => likedGenres.add(genreId));
            }
        });

        // Construct a query to find movies with similar genres in the preferred language
        // This is a simplified example. A real API might not support filtering by multiple genres directly like this.
        // You might need to make multiple calls or use a more advanced search endpoint.
        const genreParams = Array.from(likedGenres).join(',');
        const recommendationsUrl = `https://api.themoviedb.org/3/discover/movie?api_key=YOUR_API_KEY&language=${language}&sort_by=popularity.desc&with_genres=${genreParams}`;

        fetch(recommendationsUrl)
            .then(response => response.json())
            .then(data => {
                // Ensure we don't recommend movies already liked by the user
                const newRecommendations = data.results.filter(recMovie =>
                    !likedMovies.some(likedMovie => likedMovie.id === recMovie.id)
                );
                setRecommendedMovies(newRecommendations.slice(0, 10)); // Limit to 10 recommendations
            })
            .catch(error => {
                console.error('Error fetching recommendations:', error);
                setRecommendedMovies([]); // Clear recommendations on error
            });
    };

    // Update recommendations when favorites change or preferred language changes
    useEffect(() => {
        generateRecommendations(favorites, preferredLanguage);
    }, [favorites, preferredLanguage]);

    const handlePreferredLanguageChange = (event) => {
        setPreferredLanguage(event.target.value);
    };

    // Filtered movies for display (combining search and filter logic)
    const displayedMovies = searchTerm
        ? movies.filter(movie => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))
        : filter
            ? movies.filter(movie => movie.genre_ids && movie.genre_ids.includes(parseInt(filter)))
            : movies;

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
