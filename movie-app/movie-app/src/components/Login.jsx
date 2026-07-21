import React, { useEffect, useState } from "react";

const Login = ({
  preferences,
  setToken,
  setUser,
  initialMode = "login",
  onBackToSurvey,
}) => {
  const [isSignup, setIsSignup] = useState(
    initialMode === "signup"
  );

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const handleTextInput = (setter) => (event) => {
    setter(event.target.value);
  };

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setIsSignup(initialMode === "signup");
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    if (isSignup && !preferences) {
      setError("Please complete the survey before signing up.");
      return;
    }

    try {
      setIsLoading(true);

      const endpoint = isSignup
        ? `${API_URL}/auth/signup`
        : `${API_URL}/auth/login`;

      const body = isSignup
        ? {
            username,
            password,
            preferences,
          }
        : {
            username,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong."
        );
      }

      localStorage.setItem("token", data.token);

      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.error(error);

      if (error.message === "Failed to fetch") {
        setError(
          "Could not connect to the backend. Make sure server.js is running on port 5000."
        );
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="pattern">
        <div className="wrapper flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md rounded-3xl bg-dark-100 p-8 shadow-inner shadow-light-100/10">
            <h1 className="mb-4 text-center">
              <span className="text-gradient">
                {isSignup ? "Create Account" : "Welcome Back"}
              </span>
            </h1>

            <p className="mb-8 text-center text-light-200">
              {isSignup
                ? "Sign up to save your preferences and get better recommendations."
                : "Sign in and go straight to your dashboard."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-white">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={handleTextInput(setUsername)}
                  onInput={handleTextInput(setUsername)}
                  placeholder="Username"
                  autoCapitalize="none"
                  autoComplete="username"
                  spellCheck="false"
                  className="w-full rounded-xl border border-light-100/10 bg-light-100/5 px-4 py-3 text-white placeholder-light-200 outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-white">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handleTextInput(setPassword)}
                    onInput={handleTextInput(setPassword)}
                    placeholder="Password"
                    autoComplete="current-password"
                    spellCheck="false"
                    className="w-full rounded-xl border border-light-100/10 bg-light-100/5 px-4 py-3 pr-20 text-white placeholder-light-200 outline-none focus:border-purple-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-light-200 transition hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-[#AB8BFF] to-[#D6C7FF] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading
                  ? "Please wait..."
                  : isSignup
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                }}
                className="text-light-200 transition hover:text-white"
              >
                {isSignup
                  ? "Already have an account? Login here"
                  : "Need an account? Take the survey and sign up"}
              </button>

              {isSignup && onBackToSurvey && (
                <button
                  type="button"
                  onClick={onBackToSurvey}
                  className="block w-full text-sm text-light-200 transition hover:text-white"
                >
                  Go back to survey
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login