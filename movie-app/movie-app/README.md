# Movie App

This project is a movie recommendation web app built with a React frontend and an Express backend.

## What it does

The frontend is a React app created with Vite. It shows trending movies, allows users to search for films, and displays personalized recommendations based on a short survey and saved preferences.

The backend is an Express server that talks to the TMDB API. It handles user signup, login, saved preferences, favorites, and recommendation requests.

## How the parts work together

- The browser loads the React app from `movie-app/`.
- The app sends requests to the backend for authentication, user data, recommended movies, trending movies, and search results.
- The backend reads user preferences and builds a TMDB query to return recommendation pages.
- The frontend stores the login token locally and includes it in requests that need authentication.

## Key folders

- `movie-app/`: frontend app source code.
  - `src/App.jsx`: main app logic, navigation, recommendations, search, and layout.
  - `src/components/`: reusable UI pieces like `Login`, `Search`, `Survey`, `MovieCard`, and modals.
- `back-end/`: Express server.
  - `server.js`: backend routes, authentication, database connection, and TMDB API requests.

## Local development

1. Start the backend in `back-end/`.
2. Start the frontend in `movie-app/`.
3. Open the React app in the browser to sign in or sign up.

## Recommendation flow

- User sets preferences through the survey.
- If signed in, the app sends preferences to the backend.
- The backend uses these preferences to query TMDB and return recommendation results in pages.
- The frontend shows the first page of recommendations and loads more on demand.

## Deployment notes

- The frontend and backend are separate deployments.
- The frontend needs the backend URL in production so API calls go to the right server.
- The backend must allow requests from the frontend and accept the Authorization header for protected routes.

This README explains the full project in plain terms and how the frontend and backend communicate to deliver movie recommendations.