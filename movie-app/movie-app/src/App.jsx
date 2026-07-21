import React, { useState, useEffect, useRef } from "react";

import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import Login from "./components/Login";
import Survey from "./components/Survey";
import ConfirmModal from "./components/ConfirmModal";
import MovieModal from "./components/MovieModal";

const API_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const getAuthHeaders = () => {
    const storedToken = localStorage.getItem("token");
    return storedToken
      ? { Authorization: `Bearer ${storedToken}` }
      : {};
  };

  const isAuthenticated = () => Boolean(getAuthHeaders().Authorization);

  const [user, setUser] = useState(null);

  const [surveyCompleted, setSurveyCompleted] =
    useState(false);

  const [authMode, setAuthMode] = useState("signup");

  const [preferences, setPreferences] =
    useState(null);

  const [favorites, setFavorites] = useState([]);

  const [favoriteMovieDetails, setFavoriteMovieDetails] =
    useState([]);

  const [trendingMovies, setTrendingMovies] =
    useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingError, setTrendingError] = useState("");

  const [recommendedMovies, setRecommendedMovies] =
    useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [recommendationsInfo, setRecommendationsInfo] = useState("");
  const [recommendationsPage, setRecommendationsPage] = useState(1);
  const [recommendationsTotalPages, setRecommendationsTotalPages] = useState(1);
  const [hasMoreRecommendations, setHasMoreRecommendations] = useState(true);
  const recommendationsRef = useRef(null);
  const recommendationsSectionRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [searchExecuted, setSearchExecuted] = useState(false);
  const [movieList, setMovieList] = useState([]);
  const [searchDropdownStyle, setSearchDropdownStyle] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [activeSection, setActiveSection] =
    useState(
      () => localStorage.getItem("activeSection") || "home"
    );

  const [settingsPreferences, setSettingsPreferences] =
    useState({
      genres: [],
      mood: "",
      watchStyle: "",
      languages: [],
    });

  const [visibleRecommended, setVisibleRecommended] = useState(10);

  // Notification state for short toast messages
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const ITEMS_PER_PAGE = 10;

  // Remember which dashboard tab the user last had open
  useEffect(() => {
    if (token) {
      localStorage.setItem("activeSection", activeSection);
    }
  }, [activeSection, token]);

  // Keep the search dropdown closed when the user clicks elsewhere
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchExecuted(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateSearchDropdownStyle = () => {
    if (!searchRef.current) return;

    const rect = searchRef.current.getBoundingClientRect();

    setSearchDropdownStyle({
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.bottom + 12}px`,
      width: `${rect.width}px`,
      maxWidth: "1200px",
      minWidth: "360px",
      zIndex: 60,
      boxSizing: "border-box",
      maxHeight: "calc(100vh - 140px)",
      overflowX: "hidden",
      overflowY: "auto",
    });
  };

  useEffect(() => {
    if (!searchExecuted) return;

    updateSearchDropdownStyle();
    const handleResize = () => updateSearchDropdownStyle();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
      document.body.style.overflow = "";
    };
  }, [searchExecuted]);

  const handleSearchSubmit = async (value) => {
    const rawValue = typeof value === "string" ? value : "";
    const query = rawValue.trim();

    setSearchTerm(rawValue);
    setSearchQuery(query);
    setSearchExecuted(true);
    setErrorMessage("");
    setMovieList([]);
    updateSearchDropdownStyle();

    if (query.length >= 3) {
      await fetchMovies(query);
    } else {
      setMovieList([]);
      setErrorMessage("Please enter at least 3 characters to search.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeSection");

    setToken(null);
    setUser(null);
    setFavorites([]);
    setFavoriteMovieDetails([]);
    setRecommendedMovies([]);
    setTrendingMovies([]);
    setMovieList([]);
    setSearchTerm("");
    setSearchQuery("");
    setSearchExecuted(false);
    setSurveyCompleted(false);
    setPreferences(null);
    setAuthMode("signup");
    setActiveSection("home");
    setVisibleRecommended(10);
  };

  // State for the confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState("Are you sure?");
  const [confirmMessage, setConfirmMessage] = useState("Please confirm.");

  const openConfirm = (opts) => {
    setConfirmTitle(opts.title || "Are you sure?");
    setConfirmMessage(opts.message || "Please confirm.");
    setConfirmAction(() => opts.onConfirm);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  const confirmAndClose = async () => {
    try {
      if (confirmAction) await confirmAction();
    } finally {
      closeConfirm();
    }
  };

  const fetchUserProfile = async () => {
    if (!token) return;

    try {
      if (!isAuthenticated()) {
        throw new Error("Session token missing. Please sign in again.");
      }

      const response = await fetch(`${API_URL}/user/me`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Unable to load user profile.");
      }

      const data = await response.json();

      setUser(data);
      setFavorites(data.favoriteMovies || []);
      setPreferences(data.preferences || null);

      setSettingsPreferences({
        genres: data.preferences?.genres || [],
        mood: data.preferences?.mood || "",
        watchStyle: data.preferences?.watchStyle || "",
        languages: data.preferences?.languages || [],
      });

      await fetchRecommendations();
      await fetchFavoriteMovieDetails();
    } catch (error) {
      console.error(error);
      handleLogout();
    }
  };

  const fetchTrendingMovies = async () => {
    setTrendingLoading(true);
    setTrendingError("");

    try {
      const response = await fetch(`${API_URL}/trending`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Could not load trending movies.");
      }

      const data = await response.json();
      setTrendingMovies(data || []);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      setTrendingError(error.message || "Unable to load trending movies.");
      setTrendingMovies([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const appendUniqueMovies = (existing, incoming) => {
    const ids = new Set(existing.map((movie) => movie.id));
    return [...existing, ...incoming.filter((movie) => !ids.has(movie.id))];
  };

  const fetchRecommendations = async (page = 1, append = false) => {
    if (!token) return;
    if (recommendationsLoading) return;

    setRecommendationsLoading(true);
    if (!append) {
      setRecommendationsError("");
      setRecommendationsInfo("");
    }

    try {
      if (!isAuthenticated()) {
        setRecommendationsError("Session token missing. Please sign in again.");
        return;
      }

      const response = await fetch(`${API_URL}/recommendations?page=${page}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Unable to load recommendations.");
      }

      const data = await response.json();
      const results = data?.results || [];
      const responsePage = data?.page || page;
      const totalPages = data?.total_pages || page;
      const shuffled = shuffleArray(results);

      if (!append) {
        let allResults = shuffled;
        let currentPage = responsePage;
        let currentTotalPages = totalPages;

        while (
          allResults.length < ITEMS_PER_PAGE &&
          currentPage < currentTotalPages
        ) {
          const nextPage = currentPage + 1;
          const nextResponse = await fetch(
            `${API_URL}/recommendations?page=${nextPage}`,
            {
              headers: getAuthHeaders(),
            }
          );

          if (!nextResponse.ok) {
            break;
          }

          const nextData = await nextResponse.json();
          const nextResults = shuffleArray(nextData?.results || []);
          currentTotalPages = nextData?.total_pages || currentTotalPages;
          currentPage = nextPage;

          allResults = appendUniqueMovies(allResults, nextResults);
          if (nextResults.length === 0 && currentPage >= currentTotalPages) {
            break;
          }
        }

        if (allResults.length === 0) {
          const fallbackResponse = await fetch(`${API_URL}/trending`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const fallbackList = shuffleArray(fallbackData || []);
            setRecommendedMovies(fallbackList);
            setRecommendationsInfo(
              "No personalized recommendations found. Showing trending movies instead."
            );
            setRecommendationsError("");
            setRecommendationsPage(1);
            setRecommendationsTotalPages(1);
            setVisibleRecommended(Math.min(ITEMS_PER_PAGE, fallbackList.length));
            setHasMoreRecommendations(false);
          } else {
            setRecommendedMovies([]);
            setRecommendationsError(
              "Could not load recommendations. Please try again."
            );
            setVisibleRecommended(0);
            setHasMoreRecommendations(false);
          }
        } else {
          setRecommendedMovies(allResults);
          setRecommendationsPage(currentPage);
          setRecommendationsTotalPages(currentTotalPages);
          setVisibleRecommended(Math.min(ITEMS_PER_PAGE, allResults.length));
          setHasMoreRecommendations(
            currentPage < currentTotalPages || allResults.length > ITEMS_PER_PAGE
          );
        }
      } else {
        let accumulated = [...recommendedMovies];
        let currentPage = responsePage;
        let currentTotalPages = totalPages;

        const addUniqueMovies = (movies) => {
          const ids = new Set(accumulated.map((movie) => movie.id));
          const deduped = movies.filter((movie) => !ids.has(movie.id));
          if (deduped.length > 0) {
            accumulated = [...accumulated, ...deduped];
          }
          return deduped.length;
        };

        addUniqueMovies(shuffled);

        while (
          accumulated.length < visibleRecommended + ITEMS_PER_PAGE &&
          currentPage < currentTotalPages
        ) {
          const nextPage = currentPage + 1;
          const nextResponse = await fetch(
            `${API_URL}/recommendations?page=${nextPage}`,
            {
              headers: getAuthHeaders(),
            }
          );

          if (!nextResponse.ok) {
            break;
          }

          const nextData = await nextResponse.json();
          const nextResults = shuffleArray(nextData?.results || []);
          currentTotalPages = nextData?.total_pages || currentTotalPages;
          currentPage = nextPage;
          addUniqueMovies(nextResults);
        }

        const nextVisible = Math.min(
          visibleRecommended + ITEMS_PER_PAGE,
          accumulated.length
        );

        setRecommendedMovies(accumulated);
        setRecommendationsPage(currentPage);
        setRecommendationsTotalPages(currentTotalPages);
        setVisibleRecommended(nextVisible);
        setHasMoreRecommendations(
          currentPage < currentTotalPages || accumulated.length > nextVisible
        );
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendationsError(error.message || "Unable to load recommendations.");
      setRecommendationsInfo("");
      if (!append) {
        setRecommendedMovies([]);
        setVisibleRecommended(ITEMS_PER_PAGE);
        setHasMoreRecommendations(false);
      }
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const fetchFavoriteMovieDetails = async () => {
    if (!token) return;

    try {
      if (!isAuthenticated()) return;

      const response = await fetch(`${API_URL}/user/favorites/details`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Unable to load favorite movies.");
      }

      const data = await response.json();

      setFavoriteMovieDetails(data || []);
    } catch (error) {
      console.error("Error fetching favorite details:", error);
    }
  };

  const scoreSearchResult = (title, normalizedQuery) => {
    if (!title || !normalizedQuery) return 0;

    const normalizedTitle = title.toLowerCase().trim();

    if (normalizedTitle === normalizedQuery) return 100;
    if (normalizedTitle.startsWith(normalizedQuery)) return 80;
    if (normalizedTitle.includes(` ${normalizedQuery}`)) return 70;
    if (normalizedTitle.includes(normalizedQuery)) return 60;

    return 0;
  };

  const fetchMovies = async (query = "") => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setMovieList([]);
      setErrorMessage("");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_URL}/movies?query=${encodeURIComponent(trimmedQuery)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movies.");
      }

      const data = await response.json();
      const normalizedQuery = trimmedQuery.toLowerCase();
      const sortedResults = (data || [])
        .slice()
        .sort((a, b) => {
          const scoreA = scoreSearchResult(a.title, normalizedQuery);
          const scoreB = scoreSearchResult(b.title, normalizedQuery);

          if (scoreA !== scoreB) return scoreB - scoreA;
          return a.title.localeCompare(b.title);
        });

      setMovieList(sortedResults);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Error fetching movies. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateFavorites = async (newFavorites) => {
    if (!token) return;

    try {
      if (!isAuthenticated()) throw new Error("Session token missing. Please sign in again.");

      const response = await fetch(`${API_URL}/user/favorites`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          favoriteMovies: newFavorites,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update favorites.");
      }

      const data = await response.json();

      setFavorites(data.favoriteMovies || []);
      setUser(data);

      await fetchRecommendations();
      await fetchFavoriteMovieDetails();
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const handleToggleFavorite = async (movieId) => {
    const updatedFavorites = favorites.includes(movieId)
      ? favorites.filter((id) => id !== movieId)
      : [...favorites, movieId];

    setFavorites(updatedFavorites);

    await updateFavorites(updatedFavorites);
  };

  const updatePreferences = async () => {
    if (!token) return;

    try {
      if (!isAuthenticated()) throw new Error("Session token missing. Please sign in again.");

      const response = await fetch(`${API_URL}/user/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          preferences: settingsPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update preferences.");
      }

      const data = await response.json();

      setUser(data);
      setPreferences(data.preferences);

      await fetchRecommendations();

      showToast("Preferences updated successfully!", "success");
    } catch (error) {
      console.error(error);

      showToast("Could not update preferences.", "error");
    }
  };

  const toggleSettingsGenre = (genre) => {
    const selected =
      settingsPreferences.genres.includes(genre);

    if (selected) {
      setSettingsPreferences({
        ...settingsPreferences,
        genres: settingsPreferences.genres.filter(
          (g) => g !== genre
        ),
      });
      return;
    }

    if (settingsPreferences.genres.length >= 5) {
      showToast("Choose up to 5 genres.", "warning");
      return;
    }

    setSettingsPreferences({
      ...settingsPreferences,
      genres: [...settingsPreferences.genres, genre],
    });
  };

  const toggleSettingsLanguage = (language) => {
    const selected =
      settingsPreferences.languages.includes(language);

    if (selected) {
      setSettingsPreferences({
        ...settingsPreferences,
        languages: settingsPreferences.languages.filter(
          (l) => l !== language
        ),
      });

      return;
    }

    if (settingsPreferences.languages.length >= 5) {
      showToast("Choose up to 5 languages.", "warning");
      return;
    }

    setSettingsPreferences({
      ...settingsPreferences,
      languages: [...settingsPreferences.languages, language],
    });
  };

  useEffect(() => {
    fetchTrendingMovies();

    if (token) {
      fetchUserProfile();
    }
  }, [token]);


  const MiniMovieCard = ({ movie }) => {
    const posterUrl =
      movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : "/No-Poster.png";

    const [imageSrc, setImageSrc] = React.useState(posterUrl);

    const handleImageError = () => {
      setImageSrc("/No-Poster.png");
    };

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => openMovieModal(movie.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ")
            openMovieModal(movie.id);
        }}
        className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-dark-100 p-4 text-left shadow-inner shadow-light-100/10 transition duration-300 hover:-translate-y-1 hover:border hover:border-purple-400/50 hover:shadow-[0_0_0_1px_rgba(171,139,255,0.25),0_20px_45px_rgba(3,0,20,0.45)] cursor-pointer"
      >
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={imageSrc}
            alt={movie.title}
            onError={handleImageError}
            className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="mt-4 flex flex-1 flex-col justify-between gap-4">
          <div>
            <h3 className="line-clamp-1 text-lg font-bold text-white">
              {movie.title}
            </h3>

            <p className="mt-2 line-clamp-2 text-sm text-light-200">
              {movie.overview || "No overview available."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-light-200">
              <span className="rounded-full bg-light-100/10 px-2.5 py-1">
                ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
              </span>
              <span className="rounded-full bg-light-100/10 px-2.5 py-1">
                {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
              </span>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleToggleFavorite(movie.id);
              }}
              className="rounded-lg bg-light-100/10 px-3 py-2 text-sm text-white transition hover:bg-gradient-to-r hover:from-[#AB8BFF] hover:to-[#D6C7FF] hover:shadow-lg hover:shadow-purple-500/20"
            >
              {favorites.includes(movie.id)
                ? "Remove Favorite"
                : "Add Favorite"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // State for the movie details modal
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [movieModalData, setMovieModalData] = useState({ details: null, credits: null });

  const openMovieModal = async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/movie/${movieId}`);
      if (!response.ok) throw new Error("Could not load movie details");
      const data = await response.json();
      setMovieModalData(data);
      setMovieModalOpen(true);
    } catch (error) {
      console.error(error);
      showToast("Unable to load movie details.", "error");
    }
  };

  const closeMovieModal = () => {
    setMovieModalOpen(false);
    setMovieModalData({ details: null, credits: null });
  };

  const DashboardNav = () => (
    <nav className="mb-10 rounded-3xl bg-dark-100/90 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-purple-500/20 backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#AB8BFF] to-[#D6C7FF] text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
            {user?.username?.charAt(0)?.toUpperCase() || "M"}
          </div>
          <div >
            <p className="text-xs uppercase tracking-wider text-purple-300/70">Dashboard</p>
            <h2 className="text-2xl font-bold text-white">
              {user?.username || "Movie fan"}
            </h2>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 lg:items-center lg:justify-center">
          <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
            <Search
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSubmit={handleSearchSubmit}
              placeholder="Search movies..."
            />

            {searchExecuted && (
              <div
                className="flex flex-col rounded-3xl border border-white/10 bg-dark-100/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                style={{
                  ...searchDropdownStyle,
                  overflow: "auto",
                  overscrollBehavior: "contain",
                  touchAction: "pan-y",
                }}
                onWheel={(event) => event.stopPropagation()}
                onTouchMove={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <div
                  className="p-3 min-h-[20rem] max-h-[calc(80vh-6rem)] overflow-y-auto"
                  style={{
                    overscrollBehavior: "contain",
                    WebkitOverflowScrolling: "touch",
                  }}
                  onWheel={(event) => event.stopPropagation()}
                  onTouchMove={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onScroll={(event) => event.stopPropagation()}
                >
                  {isLoading ? (
                    <p className="text-sm text-light-200">Searching movies...</p>
                  ) : errorMessage ? (
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                      {errorMessage}
                    </div>
                  ) : movieList.length > 0 ? (
                    <ul className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {movieList.slice(0, 12).map((movie, index) => (
                        <li key={movie.id} className="w-full">
                          <MovieCard
                            movie={movie}
                            compact
                            isFavorite={favorites.includes(movie.id)}
                            onToggleFavorite={handleToggleFavorite}
                            onClick={openMovieModal}
                            index={index + 1}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : searchQuery.trim().length >= 3 ? (
                    <p className="text-sm text-light-200">No movies found for "{searchQuery.trim()}".</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection("home");
              }}
              className={`rounded-xl px-4 py-2 text-white transition ${  activeSection === "home"  ? "bg-purple-500"  : "bg-light-100/10 hover:bg-light-100/20"  }`}
            >
              Home
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection("account");
              }}
              className={`rounded-xl px-4 py-2 text-white transition ${  activeSection === "account"  ? "bg-purple-500"  : "bg-light-100/10 hover:bg-light-100/20"  }`}
            >
              Account
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                openConfirm({
                  title: "Sign out",
                  message: "Are you sure you want to sign out?",
                  onConfirm: () => handleLogout(),
                });
              }}
              className="rounded-xl bg-red-500/20 px-4 py-2 text-red-200 transition hover:bg-red-500/30"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const handleShowMoreRecommendations = async () => {
    if (recommendationsLoading) return;

    if (visibleRecommended < recommendedMovies.length) {
      setVisibleRecommended((prev) =>
        Math.min(prev + ITEMS_PER_PAGE, recommendedMovies.length)
      );
      return;
    }

    const nextPage = recommendationsPage + 1;
    if (nextPage > recommendationsTotalPages) return;

    console.log("Fetching recommendations page", nextPage);
    await fetchRecommendations(nextPage, true);
  };

  const HomeSection = () => (
    <>
      <header className="mb-10">
        <h1 >
          Welcome back, {" "}
          <span className="text-gradient">
            {user?.username || "movie fan"}
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-center text-light-200">
          Your home feed is ready. Check trending movies and
          personalized recommendations.
        </p>
      </header>

      <section className="mb-14 relative">
        <div className="mb-5">
          <h2 >Trending Movies</h2>
          <p className="text-light-200">Hot movies this week.</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1040] to-[#0f0d23] border border-purple-500/10 p-6">
          {trendingLoading ? (
            <p className="text-light-200">Looking for trending movies...</p>
          ) : trendingMovies.length > 0 ? (
            <ul className="grid gap-5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {trendingMovies.slice(0, 10).map((movie, index) => (
                <li key={movie.id}>
                  <MovieCard
                    movie={movie}
                    isFavorite={favorites.includes(movie.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={openMovieModal}
                    index={index + 1}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-light-200">
              {trendingError || "No trending movies available right now."}
            </p>
          )}
        </div>
      </section>

      <section className="mb-14 relative">
        <div className="mb-5">
          <h2 >Recommended For You</h2>
          <p className="text-light-200">
            Based on your survey answers and liked movies.
          </p>
        </div>

        <div ref={recommendationsSectionRef} className="relative rounded-2xl bg-gradient-to-br from-[#1a1040] to-[#0f0d23] border border-purple-500/10 p-6">
          {recommendationsLoading ? (
            <p className="text-light-200">Loading recommendations...</p>
          ) : recommendedMovies.length > 0 ? (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-dark-100/80 p-4" style={{ maxHeight: "calc(100vh - 360px)", overflowY: "auto" }}>
                <ul className="grid gap-5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {recommendedMovies.slice(0, visibleRecommended).map((movie) => (
                    <li key={movie.id}>
                      <MovieCard
                        movie={movie}
                        isFavorite={favorites.includes(movie.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onClick={openMovieModal}
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 text-sm text-light-200">
                Showing {Math.min(visibleRecommended, recommendedMovies.length)} of {recommendedMovies.length} recommendations
                {recommendationsTotalPages > 0 ? ` — page ${recommendationsPage} of ${recommendationsTotalPages}` : ""}
              </div>
              <div className="sticky bottom-0 z-10 bg-[#0f0d23] pt-4">
                <button
                  type="button"
                  onClick={handleShowMoreRecommendations}
                  disabled={recommendationsLoading || (!hasMoreRecommendations && visibleRecommended >= recommendedMovies.length)}
                  className={`rounded-xl px-8 py-3 font-semibold text-white transition ${
                    recommendationsLoading || (!hasMoreRecommendations && visibleRecommended >= recommendedMovies.length)
                      ? "cursor-not-allowed bg-purple-400/30"
                      : "bg-gradient-to-r from-[#AB8BFF] to-[#D6C7FF] hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/30"
                  }`}
                >
                  {recommendationsLoading
                    ? "Loading more..."
                    : hasMoreRecommendations || visibleRecommended < recommendedMovies.length
                    ? "Show More Movies"
                    : "No more movies"}
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
    </>
  );

  const AccountSection = () => {
    const genreOptions =
      [
      "Action",
      "Adventure",
      "Comedy",
      "Drama",
      "Fantasy",
      "Horror",
      "Mystery",
      "Romance",
      "SciFi",
      "Thriller",
    ];

    const moodOptions =
      [
      "Exciting",
      "Funny",
      "Relaxing",
      "Emotional",
      "Mind-Bending",
      "Dark",
    ];

    const watchOptions =
      [
      "Quick Watch",
      "Weekend Movie",
      "Movie Marathon",
      "Family Night",
    ];

    return (
      <section className="space-y-10">
        <div >
          <h1 >
            Your{" "}
          <span className="text-gradient">Account</span>
          </h1>

          <p className="mt-4 text-center text-light-200">
            Manage your preferences and favorite movies.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-stretch">
          <div className="rounded-3xl bg-dark-100 p-6 shadow-inner shadow-light-100/10 flex flex-col justify-between">
            <div >
              <h2 className="mb-4">User Settings</h2>

              <p className="mb-6 text-light-200">
                Logged in as{" "}
                <span className="font-bold text-white">
                  {user?.username}
                </span>
              </p>

              <div className="mb-6">
                <h3 className="mb-3 font-bold text-white">
                  Favorite Genres
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {genreOptions.map((genre) => {
                    const selected =
                      settingsPreferences.genres.includes(genre);

                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSettingsGenre(genre);
                        }}
                        className={`rounded-xl border p-3 text-sm transition ${  selected  ? "border-purple-400 bg-purple-500 text-white"  : "border-light-100/10 bg-light-100/5 text-light-200 hover:bg-light-100/10"  }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-sm text-light-200">
                  {settingsPreferences.genres.length}/5 selected
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 font-bold text-white">
                  Mood
                </h3>

                <select
                  value={settingsPreferences.mood}
                  onChange={(e) =>
                    setSettingsPreferences({
                      ...settingsPreferences,
                      mood: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-light-100/10 bg-light-100/5 p-3 text-white outline-none"
                >
                  <option value="">Select mood</option>

                  {moodOptions.map((mood) => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 font-bold text-white">
                  Watch Style
                </h3>

                <select
                  value={settingsPreferences.watchStyle}
                  onChange={(e) =>
                    setSettingsPreferences({
                      ...settingsPreferences,
                      watchStyle: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-light-100/10 bg-light-100/5 p-3 text-white outline-none"
                >
                  <option value="">Select watch style</option>

                  {watchOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 font-bold text-white">
                  Preferred Languages
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {[ "English", "Spanish", "French", "German", "Hindi", "Portuguese", "Russian", "Japanese", "Korean", "Italian",].map((language) => {
                    const selected =
                      settingsPreferences.languages.includes(language);

                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSettingsLanguage(language);
                        }}
                        className={`rounded-xl border p-3 text-sm transition ${  selected  ? "border-purple-400 bg-purple-500 text-white"  : "border-light-100/10 bg-light-100/5 text-light-200 hover:bg-light-100/10"  }`}
                      >
                        {language}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-sm text-light-200">
                  {settingsPreferences.languages.length}/5 selected
                </p>
              </div>
            </div>

            <div >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  updatePreferences();
                }}
                className="w-full rounded-xl bg-gradient-to-r from-[#AB8BFF] to-[#D6C7FF] py-3 font-semibold text-white transition hover:opacity-90"
              >
                Save Settings
              </button>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    openConfirm({
                      title: "Delete account",
                      message:
                        "This will permanently delete your account and favorites. Are you sure?",
                      onConfirm: async () => await deleteAccount(),
                    });
                  }}
                  className="w-full rounded-xl bg-red-600 px-4 py-3 text-white"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-dark-100 p-6 shadow-inner shadow-light-100/10">
            <h2 className="mb-4">Favorite Movies</h2>
            {favoriteMovieDetails.length > 0 ? (
              <ul className="grid gap-5 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 overflow-y-auto pr-1 favorite-scrollbar" style={{ maxHeight: "860px" }}>
                {favoriteMovieDetails.map((movie, index) => (
                  <li key={movie.id}>
                    <MovieCard
                      movie={movie}
                      compact
                      isFavorite={favorites.includes(movie.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onClick={openMovieModal}
                      index={index + 1}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-light-200 text-center">
                  You haven't added any favorites yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

    // Call the API to delete the current user account
    const deleteAccount = async () => {
      if (!isAuthenticated()) return;

      try {
        const response = await fetch(`${API_URL}/user`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Unable to delete account.");
        }

        // Clear auth info and reset the dashboard
        handleLogout();
        showToast("Your account has been deleted.", "info");
      } catch (error) {
        console.error(error);
        showToast("Could not delete account.", "error");
      }
    };

  if (!token && !surveyCompleted) {
    return (
      <Survey
        onSubmit={(surveyData) => {
          setPreferences(surveyData);
          setSurveyCompleted(true);
          setAuthMode("signup");
        }}
        onLoginClick={() => {
          setSurveyCompleted(true);
          setAuthMode("login");
        }}
      />
    );
  }

  if (!token) {
    return (
      <Login
        preferences={preferences}
        setToken={setToken}
        setUser={setUser}
        initialMode={authMode}
        onBackToSurvey={() => {
          setSurveyCompleted(false);
          setPreferences(null);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-primary">
      <DashboardNav />
      <main className="relative z-10 px-5 pb-12">
        {activeSection === "home" && <HomeSection />}
        {activeSection === "account" && <AccountSection />}
      </main>
      {toast.show && (
        <div
          className={`fixed bottom-5 right-5 z-[100] w-auto max-w-sm rounded-lg px-4 py-3 shadow-lg transition-opacity duration-300 ease-out animate-slide-up ${ 
            toast.type === "success" 
              ? "bg-green-500/80 text-white" 
              : toast.type === "error" 
              ? "bg-red-500/80 text-white" 
              : "bg-yellow-500/80 text-white" 
          }`}
        >
          {toast.message}
        </div>
      )}
      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={confirmAndClose}
        onCancel={closeConfirm}
      />
      <MovieModal
        open={movieModalOpen}
        details={movieModalData?.details}
        credits={movieModalData?.credits}
        onClose={closeMovieModal}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={favorites.includes(movieModalData?.details?.id)}
      />
    </div>
  );
};

export default App;
