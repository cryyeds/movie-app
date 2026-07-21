import React, { useEffect, useState } from "react";

const Search = ({
  searchTerm,
  setSearchTerm,
  onSubmit,
  placeholder = "Search through thousands of movies",
}) => {
  const [inputValue, setInputValue] = useState(searchTerm || "");

  useEffect(() => {
    setInputValue(searchTerm || "");
  }, [searchTerm]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchTerm(inputValue);

    if (onSubmit) {
      onSubmit(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue("");
    setSearchTerm("");
    if (onSubmit) {
      onSubmit("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search relative w-full">
      <div className="mx-auto w-full relative">
        <img src="/search-input.svg" alt="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-80" />

        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          autoCapitalize="sentences"
          autoComplete="off"
          spellCheck="true"
          aria-label="Search movies"
          className="w-full rounded-xl border border-light-100/10 bg-light-100/5 px-10 py-3 pr-10 text-white outline-none"
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-light-100/20 text-white/70 transition hover:bg-light-100/40 hover:text-white"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      <button
        type="submit"
        className="mt-3 w-full rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-600"
      >
        Search
      </button>
    </form>
  );
};

export default Search