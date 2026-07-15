import React, { useState, useEffect } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import Login from './Login'; // 1. Import your new Login page

const App = () => {
// 2. Add a state to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
  
  
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <main>
      <div className='pattern'>
        <div className='wrapper'>
          <header>
            <img src='./hero-img.png' alt='Hero Banner' />
            <h1>
              Looking for <span className='text-gradient'>a movie?</span> Not anymore!
            </h1>
          </header>

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <h1 className='text-white'>{searchTerm}</h1>

          <section className='all-movies'>
            <h2 className='mt-[40px]'>All Movies</h2>

            {isLoading ? (
              <Spinner/>
            ) : errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie}/>
                ))}
              </ul>
            )}
          </section>
        </div>

      </div>
    </main>
  )
}

export default App