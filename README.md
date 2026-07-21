# Movie App

This project is a movie recommendation web app built with a React frontend and an Express backend.

## What it does

The frontend is a React app created with Vite. It shows trending movies, allows users to search for films, and displays personalized recommendations based on a short survey and saved preferences.

The backend is an Express server that talks to the TMDB API. It handles user signup, login, saved preferences, favorites, and recommendation requests.

## How the parts work together

- The browser loads the React app from `movie-app/`.
- The app sends requests to the backend for authentication, user data, recommended movies, trending movies, and search results.
- The backend reads user preferences and builds a TMDB query to return recommendation results in pages.
- The frontend stores the login token locally and includes it in requests that need authentication.

## Key folders

- `movie-app/`: frontend app source code.
  - `src/App.jsx`: main app logic, navigation, recommendations, search, and layout.
  - `src/components/`: reusable UI pieces like `Login`, `Search`, `Survey`, `MovieCard`, and modals.
- `back-end/`: Express server.
  - `server.js`: backend routes, authentication, database connection, and TMDB API requests.

## Local development

1. Install dependencies.
   - `cd back-end && npm install`
   - `cd movie-app && npm install`
2. Start the backend from `back-end/`.
   - `node server.js`
3. Start the frontend from `movie-app/`.
   - `npm run dev`
4. Open the React app in the browser, sign in or sign up, and review recommendations.

## Recommendation flow

- User sets preferences through the survey.
- If signed in, the app sends preferences to the backend.
- The backend builds a TMDB discover query using the user preferences and returns a page of recommendation results.
- If a personalized recommendation page has fewer than 10 movies, the backend fills the list with trending movies so the feed stays full.
- The frontend shows the first recommendation batch and loads more pages as needed.
- The recommendation panel button stays active to load more movies, and if the next API page cannot be loaded it shows an error state instead of disabling the control.
- When personalized pages are exhausted, the app falls back to trending movies to keep new content flowing.
- The search dropdown now renders as a fixed, scrollable overlay with a visible custom scrollbar so results are accessible without clipping or disabling page scrolling.

## Deployment notes

- The frontend and backend are separate deployments.
- The frontend uses `VITE_API_BASE_URL` in production to point API calls to the deployed backend.
- The backend must allow CORS from the frontend and accept the Authorization header for authenticated requests.

This README explains the project structure, how to run the app locally, and how recommendation delivery works.