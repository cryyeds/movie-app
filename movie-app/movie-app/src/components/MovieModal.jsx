import React from "react";

const MovieModal = ({ open, onClose, details, credits, isFavorite, onToggleFavorite }) => {
  if (!open) return null;

  const posterUrl = details?.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : "/no-movie.png";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[28px] border border-white/10 bg-dark-100/95 p-6 shadow-[0_20px_80px_rgba(3,0,20,0.6)] relative">
        {/* Close button at top-right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg transition hover:opacity-90 hover:scale-105"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="relative w-full shrink-0 lg:w-72">
            <img src={posterUrl} alt={details?.title} className="h-[420px] w-full rounded-[20px] object-cover shadow-inner shadow-light-100/10" />
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Favorite button over poster, top-left, smaller */}
            <button
              type="button"
              onClick={() => onToggleFavorite(details?.id)}
              className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg transition hover:scale-105 ${
                isFavorite
                  ? "bg-gradient-to-r from-[#D6C7FF] to-[#EAE0FF] text-white shadow-purple-300/20"
                  : "bg-gradient-to-r from-[#AB8BFF] to-[#D6C7FF] text-white shadow-purple-500/20 hover:opacity-90"
              }`}
            >
              {isFavorite ? "★ Favorited" : "☆ Favorite"}
            </button>
          </div>

          <div className="flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">{details?.title}</h2>
                <p className="text-sm font-medium text-[#D6C7FF]">{details?.tagline || "A movie worth discovering"}</p>
                <p className="text-sm leading-6 text-light-200">{details?.overview || "No summary available yet."}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-white/10 bg-light-100/5 p-4">
                <p className="text-sm text-light-200"><span className="font-semibold text-white">Release:</span> {details?.release_date || "N/A"}</p>
                <p className="mt-2 text-sm text-light-200"><span className="font-semibold text-white">Runtime:</span> {details?.runtime ? `${details.runtime} min` : "N/A"}</p>
                <p className="mt-2 text-sm text-light-200"><span className="font-semibold text-white">Rating:</span> {details?.vote_average ? details.vote_average.toFixed(1) : "N/A"}</p>
              </div>

              <div className="rounded-[18px] border border-white/10 bg-light-100/5 p-4">
                <p className="text-sm text-light-200"><span className="font-semibold text-white">Genres:</span> {details?.genres?.map((g) => g.name).join(", ") || "N/A"}</p>
                <p className="mt-2 text-sm text-light-200"><span className="font-semibold text-white">Language:</span> {details?.original_language || "N/A"}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[18px] border border-white/10 bg-light-100/5 p-4">
              <h3 className="text-lg font-semibold text-white">Cast</h3>
              <p className="mt-2 text-sm leading-6 text-light-200">{credits?.cast?.slice(0, 8).map((c) => c.name).join(", ") || "No cast information available."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;