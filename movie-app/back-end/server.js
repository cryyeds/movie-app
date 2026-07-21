require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Movie App backend is running. Use the frontend deployment URL to open the app.");
});

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const GENRE_MAP = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  Horror: 27,
  Mystery: 9648,
  Romance: 10749,
  SciFi: 878,
  Thriller: 53,
};

mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error(err));

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  preferences: {
    genres: [String],
    mood: String,
    watchStyle: String,
    languages: [String],
  },

  favoriteMovies: [
    {
      type: Number,
    },
  ],
});

const User = mongoose.model("User", userSchema);

const tmdbOptions = {
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
  },
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

// Signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { username, password, preferences } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      preferences: {
        genres: preferences?.genres || [],
        mood: preferences?.mood || "",
        watchStyle: preferences?.watchStyle || "",
        languages: preferences?.languages || [],
      },
      favoriteMovies: [],
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        preferences: user.preferences,
        favoriteMovies: user.favoriteMovies,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        preferences: user.preferences,
        favoriteMovies: user.favoriteMovies,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get current user
app.get("/user/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update favorites
app.put("/user/favorites", authMiddleware, async (req, res) => {
  try {
    const { favoriteMovies } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        favoriteMovies,
      },
      {
        new: true,
      }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update user preferences
app.put("/user/preferences", authMiddleware, async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        preferences: {
          genres: preferences?.genres || [],
          mood: preferences?.mood || "",
          watchStyle: preferences?.watchStyle || "",
          languages: preferences?.languages || [],
        },
      },
      {
        new: true,
      }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get favorite movie details
app.get("/user/favorites/details", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.favoriteMovies || user.favoriteMovies.length === 0) {
      return res.json([]);
    }

    const favoriteDetails = await Promise.all(
      user.favoriteMovies.map(async (movieId) => {
        const response = await fetch(
          `${TMDB_BASE_URL}/movie/${movieId}`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
            },
          }
        );

        if (!response.ok) {
          return null;
        }

        return response.json();
      })
    );

    res.json(favoriteDetails.filter(Boolean));
  } catch (error) {
    console.error("Favorite details error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// Movie search and discover proxy
app.get("/movies", async (req, res) => {
  try {
    const query = req.query.query || "";

    const endpoint = query
      ? `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${TMDB_BASE_URL}/discover/movie?sort_by=popularity.desc`;

    const response = await fetch(endpoint, tmdbOptions);

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data.results || []);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// Trending movies
app.get("/trending", async (req, res) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week`,
      tmdbOptions
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data.results || []);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// Recommendations
app.get("/recommendations", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const genreIds =
      user.preferences?.genres
        ?.map((genre) => GENRE_MAP[genre])
        .filter(Boolean)
        .join(",") || "";

    const watchStyle = user.preferences?.watchStyle || "";
    const mood = user.preferences?.mood || "";

    let minVote = 5;

    if (mood === "Exciting" || mood === "Mind-Bending") {
      minVote = 7;
    }

    if (mood === "Emotional") {
      minVote = 6;
    }

    const queryParts = [
      "sort_by=popularity.desc",
      `vote_average.gte=${minVote}`,
      `page=${page}`,
    ];

    if (genreIds) {
      queryParts.push(`with_genres=${genreIds}`);
    }

    // Apply language filter on the TMDB discover query if languages are selected
    const languages = user.preferences?.languages || [];
    const languageMap = {
      "English": "en",
      "Spanish": "es",
      "French": "fr",
      "German": "de",
      "Hindi": "hi",
      "Portuguese": "pt",
      "Russian": "ru",
      "Japanese": "ja",
      "Korean": "ko",
      "Italian": "it",
    };

    const selectedLanguageCodes = (user.preferences?.languages || [])
      .map((lang) => languageMap[lang])
      .filter(Boolean);

    if (selectedLanguageCodes.length === 1) {
      queryParts.push(`with_original_language=${selectedLanguageCodes[0]}`);
    }

    if (watchStyle === "Family Night") {
      queryParts.push("certification_country=US", "certification.lte=PG-13");
    }

    if (watchStyle === "Quick Watch") {
      queryParts.push("with_runtime.lte=100");
    }

    if (watchStyle === "Movie Marathon") {
      queryParts.push("with_runtime.gte=100");
    }

    if (watchStyle === "Weekend Movie") {
      queryParts.push("sort_by=popularity.desc");
    }

    const queryString = queryParts.join("&");

    console.log("Recommendations query:", queryString);
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?${queryString}`,
      tmdbOptions
    );

    const data = await response.json();
    console.log(
      "TMDB discover status:",
      response.status,
      "results count:",
      data.results?.length || 0,
      "page:",
      page
    );

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    let results = data.results || [];
    if (selectedLanguageCodes.length > 1) {
      results = results.filter((movie) =>
        selectedLanguageCodes.includes(movie.original_language)
      );
    }

    if (user.preferences?.mood) {
      const mood = user.preferences.mood;
      if (mood === "Exciting") {
        results = results.filter((movie) => movie.vote_average >= 7);
      } else if (mood === "Mind-Bending") {
        results = results.filter((movie) => movie.vote_average >= 6.5);
      } else if (mood === "Emotional") {
        results = results.filter((movie) => movie.vote_average >= 6);
      }
    }

    res.json({
      results,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete current user account
app.delete("/user", authMiddleware, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.userId);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Movie details + credits
app.get("/movie/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [detailsRes, creditsRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${id}`, tmdbOptions),
      fetch(`${TMDB_BASE_URL}/movie/${id}/credits`, tmdbOptions),
    ]);

    const details = detailsRes.ok ? await detailsRes.json() : null;
    const credits = creditsRes.ok ? await creditsRes.json() : null;

    res.json({ details, credits });
  } catch (error) {
    console.error('Movie details error:', error);
    res.status(500).json({ message: error.message });
  }
});