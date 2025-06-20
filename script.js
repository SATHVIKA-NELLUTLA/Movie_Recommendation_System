let debounceTimer;
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const languageFilter = document.getElementById("languageFilter");
const sortBy = document.getElementById("sortBy");
const clearBtn = document.getElementById("clearBtn");
const movieList = document.getElementById("movieList");

let topRatedMovies = [];
let currentSearch = "";
let allGenres = new Set();

// Load top-rated and populate dropdowns
document.addEventListener("DOMContentLoaded", () => {
  topRatedMovies = movieData.slice(0, 70);
  populateGenres(movieData);
  populateLanguages(movieData);
  renderMovieList(topRatedMovies);
});

// Populate genre dropdown
function populateGenres(data) {
  data.forEach(movie => {
    movie.genre.split(",").forEach(g => allGenres.add(g.trim()));
  });

  Array.from(allGenres).sort().forEach(genre => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

// Populate language dropdown
function populateLanguages(data) {
  const langSet = new Set();
  data.forEach(movie => {
    if (movie.language) {
      langSet.add(movie.language);
    }
  });

  const langNames = {
    ar: "Arabic", bn: "Bengali", ca: "Catalan", cn: "Chinese",
    cs: "Czech", da: "Danish", de: "German", el: "Greek", en: "English",
    es: "Spanish", et: "Estonian", eu: "Basque", fa: "Persian",
    fi: "Finnish", fr: "French", he: "Hebrew", hi: "Hindi",
    hu: "Hungarian", id: "Indonesian", is: "Icelandic", it: "Italian",
    ja: "Japanese", ko: "Korean", la: "Latin", lv: "Latvian", ml: "Malayalam",
    ms: "Malay", nb: "Norwegian Bokmål", nl: "Dutch", no: "Norwegian",
    pl: "Polish", pt: "Portuguese", ro: "Romanian", ru: "Russian",
    sr: "Serbian", sv: "Swedish", ta: "Tamil", te: "Telugu",
    th: "Thai", tl: "Tagalog", tr: "Turkish", uk: "Ukrainian", zh: "Chinese"
  };

  Array.from(langSet).sort().forEach(lang => {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = langNames[lang] || lang.toUpperCase();
    languageFilter.appendChild(option);
  });
}
// Search input
searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.trim().toLowerCase();
  triggerSearch();
});

// Dropdown events
genreFilter.addEventListener("change", triggerSearch);
languageFilter.addEventListener("change", triggerSearch);
sortBy.addEventListener("change", triggerSearch);

// Clear Filters button
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  genreFilter.value = "All";
  languageFilter.value = "All";
  sortBy.value = "default";
  currentSearch = "";
  renderMovieList(topRatedMovies);
});

// Main filtering + sorting logic
function triggerSearch() {
  const selectedGenre = genreFilter.value;
  const selectedLanguage = languageFilter.value;
  const selectedSort = sortBy.value;
  currentSearch = searchInput.value.trim().toLowerCase();

  const showHomepage =
    currentSearch.length === 0 &&
    selectedGenre === "All" &&
    selectedLanguage === "All" &&
    selectedSort === "default";

  let results = showHomepage ? topRatedMovies : movieData;

  // Filter by search
  if (currentSearch.length >= 2) {
    results = results.filter(movie =>
      movie.title.toLowerCase().includes(currentSearch)
    );
  }

  // Filter by genre
  if (selectedGenre !== "All") {
    results = results.filter(movie =>
      movie.genre.toLowerCase().includes(selectedGenre.toLowerCase())
    );
  }

  // Filter by language
  if (selectedLanguage !== "All") {
    results = results.filter(movie =>
      movie.language.toLowerCase() === selectedLanguage.toLowerCase()
    );
  }

  // Sort results
  if (selectedSort === "alphabetical") {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (selectedSort === "popularity") {
    results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  } else if (selectedSort === "rating") {
    results.sort((a, b) => (b.vote_avg || 0) - (a.vote_avg || 0));
  }

  renderMovieList(results);
}

// Render movies in grid
function renderMovieList(movies) {
  movieList.innerHTML = "";

  if (movies.length === 0) {
    movieList.innerHTML = "<p>No movies found.</p>";
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie";
    card.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}">
      <h3>${movie.title}</h3>
    `;

    card.addEventListener("click", () => showMovieDetails(movie));
    movieList.appendChild(card);
  });
}

// Show modal with full details
function showMovieDetails(movie) {
  const modal = document.getElementById("modalContent");

  // Scroll to top & fade-in animation
  modal.scrollTo({ top: 0, behavior: "smooth" });
  modal.classList.remove("fade-out");
  modal.classList.add("fade-in");

  document.title = movie.title + " | Movie Info";

  document.getElementById("modalTitle").textContent = movie.title;
  document.getElementById("modalOverview").textContent = movie.overview;
  document.getElementById("modalGenre").textContent = movie.genre;
  document.getElementById("modalPoster").src = movie.poster;

  const recList = document.getElementById("modalRecommendations");
  recList.innerHTML = "";

  movie.recommendations.forEach(recTitle => {
    const recMovie = movieData.find(m => m.title === recTitle);
    if (!recMovie) return;

    const card = document.createElement("div");
    card.className = "recommendation-card";
    card.innerHTML = `
      <img src="${recMovie.poster}" alt="${recMovie.title}">
      <h4>${recMovie.title}</h4>
    `;

    // Fade transition when navigating to another movie
    card.addEventListener("click", () => {
      modal.classList.add("fade-out");
      modal.classList.remove("fade-in");

      setTimeout(() => {
        showMovieDetails(recMovie);
        modal.classList.remove("fade-out");
        modal.classList.add("fade-in");
      }, 300);
    });

    recList.appendChild(card);
  });

  document.getElementById("movieModal").classList.remove("hidden");
}

// Modal close behavior
document.getElementById("closeBtn").addEventListener("click", () => {
  document.getElementById("movieModal").classList.add("hidden");
});

document.getElementById("movieModal").addEventListener("click", (e) => {
  if (!document.getElementById("modalContent").contains(e.target)) {
    document.getElementById("movieModal").classList.add("hidden");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("movieModal").classList.add("hidden");
  }
});
