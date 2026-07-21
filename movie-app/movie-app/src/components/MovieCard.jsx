import React, { useState } from "react";

const MovieCard = ({
  movie,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  index,
  compact = false,
}) => {
  const {
    title,
    id,
    vote_average,
    poster_path,
    release_date,
    original_language,
  } = movie;

  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : "/No-Poster.png";

  const [imageSrc, setImageSrc] = useState(posterUrl);

  const handleImageError = () => {
    setImageSrc("/No-Poster.png");
  };

  return (
    <div
      onClick={() => onClick && onClick(movie.id)}
      className={`group relative cursor-pointer overflow-hidden rounded-[20px] border border-white/10 bg-dark-100/90 shadow-inner shadow-light-100/10 transition duration-300 hover:-translate-y-1 hover:border-purple-400/50 hover:shadow-[0_0_0_1px_rgba(171,139,255,0.25),0_20px_45px_rgba(3,0,20,0.45)] ${compact ? "p-2" : "p-3"}`}
    >
      {index && (
        <div className="absolute left-3 top-3 z-20 flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-[#AB8BFF] to-[#D6C7FF] text-white font-bold text-sm">
          {index}
        </div>
      )}
      {onToggleFavorite && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(id);
          }}
          className={`absolute right-2 top-2 z-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur transition hover:bg-gradient-to-r hover:from-[#AB8BFF] hover:to-[#D6C7FF] whitespace-nowrap ${compact ? "min-w-[72px] px-2 py-1 text-[10px]" : "min-w-[110px] px-3 py-2 text-sm"}`}
        >
          {isFavorite ? "Remove" : "Favorite"}
        </button>
      )}

      <div className="relative overflow-hidden rounded-[18px]">
        <img
          src={imageSrc}
          alt={title}
          onError={handleImageError}
          className={`${compact ? "h-16" : "h-72"} w-full rounded-[18px] object-cover transition duration-300 group-hover:scale-105`}
        />
        <div className="absolute inset-0 rounded-[18px] bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      <div className={`mt-2 flex flex-col gap-1 ${compact ? "text-[10px]" : "text-base"}`}>
        <h3 className={`line-clamp-2 font-semibold text-white ${compact ? "text-sm" : "text-base"}`}>{title}</h3>

        <div className="flex flex-wrap items-center gap-2 text-sm text-light-200">
          <div className="flex items-center gap-1 rounded-full bg-light-100/10 px-2.5 py-1">
            <span>⭐</span>
            <span>{vote_average ? vote_average.toFixed(1) : "N/A"}</span>
          </div>

          <span className="rounded-full bg-light-100/10 px-2.5 py-1">
            {original_language || "N/A"}
          </span>

          <span className="rounded-full bg-light-100/10 px-2.5 py-1">
            {release_date ? release_date.split("-")[0] : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard