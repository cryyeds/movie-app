import { useState } from "react";

const Survey = ({ onSubmit, onLoginClick }) => {
  const [genres, setGenres] = useState([]);

  const [mood, setMood] = useState("");

  const [watchStyle, setWatchStyle] =
    useState("");

  const genreOptions = [
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

  const moodOptions = [
    "Exciting",
    "Funny",
    "Relaxing",
    "Emotional",
    "Mind-Bending",
    "Dark",
  ];

  const watchOptions = [
    "Quick Watch",
    "Weekend Movie",
    "Movie Marathon",
    "Family Night",
  ];

  const handleGenreChange = (genre) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
      return;
    }

    if (genres.length >= 3) {
      alert("You can choose up to 3 genres.");
      return;
    }

    setGenres([...genres, genre]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (genres.length === 0 || !mood || !watchStyle) {
      alert("Please complete all questions.");
      return;
    }

    onSubmit({
      genres,
      mood,
      watchStyle,
    });
  };

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <div className="mx-auto w-full max-w-4xl">
            <h1>
              Find your{" "}
              <span className="text-gradient">
                perfect movie
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-light-200">
              Answer a few quick questions and we'll build a
              movie feed that fits your taste.
            </p>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onLoginClick}
                className="rounded-xl bg-light-100/10 px-5 py-3 text-light-200 transition hover:bg-light-100/20 hover:text-white"
              >
                Already have an account? Login here
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-10 space-y-10 rounded-3xl bg-dark-100 p-8 shadow-inner shadow-light-100/10"
            >
              <div>
                <h2 className="mb-4">Pick up to 3 genres</h2>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {genreOptions.map((genre) => {
                    const selected = genres.includes(genre);

                    return (
                      <button
                        type="button"
                        key={genre}
                        onClick={() => handleGenreChange(genre)}
                        className={`rounded-xl border p-3 text-sm font-medium transition ${
                          selected
                            ? "border-purple-400 bg-purple-500 text-white"
                            : "border-light-100/10 bg-light-100/5 text-light-200 hover:bg-light-100/10"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-light-200">
                  {genres.length}/3 selected
                </p>
              </div>

              <div>
                <h2 className="mb-4">How are you feeling today?</h2>

                <div className="grid gap-3 md:grid-cols-3">
                  {moodOptions.map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setMood(option)}
                      className={`rounded-xl border p-4 transition ${
                        mood === option
                          ? "border-purple-400 bg-purple-500 text-white"
                          : "border-light-100/10 bg-light-100/5 text-light-200 hover:bg-light-100/10"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-4">How do you usually watch?</h2>

                <div className="grid gap-3 md:grid-cols-2">
                  {watchOptions.map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setWatchStyle(option)}
                      className={`rounded-xl border p-4 transition ${
                        watchStyle === option
                          ? "border-purple-400 bg-purple-500 text-white"
                          : "border-light-100/10 bg-light-100/5 text-light-200 hover:bg-light-100/10"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#AB8BFF] to-[#D6C7FF] py-4 text-lg font-semibold text-white transition hover:opacity-90"
              >
                Continue to Signup →
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Survey