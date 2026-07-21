import React from "react";
import MovieCard from "./MovieCard";

const Recommendations = ({
  recommendedMovies,
  visibleRecommended,
  recommendationsLoading,
  recommendationsError,
  recommendationsInfo,
  recommendationsButtonError,
  hasMoreRecommendations,
  handleShowMoreRecommendations,
  favorites,
  handleToggleFavorite,
  onMovieClick,
}) => {
  return (
    <section className="mb-14 relative">
      <div className="mb-5">
        <h2>Recommended For You</h2>
        <p className="text-light-200">
          Based on your survey answers and liked movies.
        </p>
      </div>

      <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1040] to-[#0f0d23] border border-purple-500/10 p-6">
        {recommendationsLoading ? (
          <p className="text-light-200">Loading recommendations...</p>
        ) : recommendedMovies.length > 0 ? (
          <div className="space-y-6">
            <div
              className="overflow-hidden rounded-3xl border border-white/10 bg-dark-100/80 p-4"
              style={{ maxHeight: "calc(100vh - 360px)", overflowY: "auto" }}
            >
              <ul className="grid gap-5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {recommendedMovies.slice(0, visibleRecommended).map((movie) => (
                  <li key={movie.id}>
                    <MovieCard
                      movie={movie}
                      isFavorite={favorites.includes(movie.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onClick={onMovieClick}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-sm text-light-200">
              {recommendationsInfo ||
                `Showing ${Math.min(visibleRecommended, recommendedMovies.length)} of ${recommendedMovies.length} recommendations`}
            </div>

            <div className="sticky bottom-0 z-10 bg-[#0f0d23] pt-4">
              <button
                type="button"
                onClick={handleShowMoreRecommendations}
                disabled={recommendationsLoading}
                className={`rounded-xl px-8 py-3 font-semibold text-white transition ${
                  recommendationsLoading
                    ? "cursor-not-allowed bg-purple-400/30"
                    : recommendationsButtonError
                    ? "bg-red-500/90"
                    : "bg-gradient-to-r from-[#AB8BFF] to-[#D6C7FF] hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/30"
                }`}
              >
                {recommendationsLoading
                  ? "Loading more..."
                  : recommendationsButtonError
                  ? "Error"
                  : "Show More Movies"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-light-200">
            {recommendationsError || "No recommendations yet. Try updating your preferences."}
          </p>
        )}
      </div>
    </section>
  );
};

export default Recommendations;
