/* =========================================
   DΛMZΞΞ NEWS — SEARCH ENGINE
========================================= */

document.addEventListener("DOMContentLoaded", async function () {

    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();

    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    const pageSearchForm = document.getElementById("pageSearchForm");
    const pageSearchInput = document.getElementById("pageSearchInput");

    const resultsGrid = document.getElementById("searchResultsGrid");
    const searchTitle = document.getElementById("searchTitle");
    const emptyState = document.getElementById("searchEmpty");


    /* =========================================
       LOCAL FALLBACK IMAGE
    ========================================= */

    const fallbackImage =
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="800"
                 height="450"
                 viewBox="0 0 800 450">
                <rect width="800" height="450" fill="#07152f"/>
                <text x="400"
                      y="225"
                      text-anchor="middle"
                      dominant-baseline="middle"
                      fill="white"
                      font-family="Arial"
                      font-size="42"
                      font-weight="bold">
                    DΛMZΞΞ NEWS
                </text>
            </svg>
        `);


    /* =========================================
       PUT QUERY IN SEARCH BOXES
    ========================================= */

    if (searchInput) {
        searchInput.value = query;
    }

    if (pageSearchInput) {
        pageSearchInput.value = query;
    }


    /* =========================================
       SEARCH FORM — HEADER
    ========================================= */

    if (searchForm && searchInput) {

        searchForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const searchTerm = searchInput.value.trim();

            if (!searchTerm) {
                return;
            }

            window.location.href =
                "search.html?q=" +
                encodeURIComponent(searchTerm);

        });

    }


    /* =========================================
       SEARCH FORM — PAGE
    ========================================= */

    if (pageSearchForm && pageSearchInput) {

        pageSearchForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const searchTerm =
                pageSearchInput.value.trim();

            if (!searchTerm) {
                return;
            }

            window.location.href =
                "search.html?q=" +
                encodeURIComponent(searchTerm);

        });

    }


    /* =========================================
       CHECK SUPABASE
    ========================================= */

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "DΛMZΞΞ NEWS: Supabase client not found."
        );

        if (searchTitle) {
            searchTitle.textContent =
                "Search Results";
        }

        if (emptyState) {

            emptyState.style.display = "block";

            emptyState.innerHTML = `
                <h2>Search is unavailable</h2>
                <p>
                    The news database could not be connected.
                    Please refresh the page and try again.
                </p>
            `;

        }

        return;
    }


    /* =========================================
       NO SEARCH QUERY
    ========================================= */

    if (!query) {

        if (searchTitle) {
            searchTitle.textContent =
                "Search Results";
        }

        if (emptyState) {

            emptyState.style.display = "block";

            emptyState.innerHTML = `
                <h2>Search DΛMZΞΞ NEWS</h2>

                <p>
                    Enter a keyword above to find
                    news stories and updates.
                </p>
            `;

        }

        return;
    }


    /* =========================================
       LOAD PUBLISHED ARTICLES FROM SUPABASE
    ========================================= */

    let articles = [];

    try {

        const { data, error } = await supabaseClient
            .from("articles")
            .select("*")
            .eq("status", "published")
            .order("date", { ascending: false });

        if (error) {
            throw error;
        }

        articles = data || [];

    } catch (error) {

        console.error(
            "DΛMZΞΞ NEWS: Search error:",
            error
        );

        if (searchTitle) {
            searchTitle.textContent =
                "Search Results";
        }

        if (emptyState) {

            emptyState.style.display = "block";

            emptyState.innerHTML = `
                <h2>Something went wrong</h2>

                <p>
                    We couldn't load the news stories.
                    Please refresh the page and try again.
                </p>

            `;

        }

        return;
    }


    /* =========================================
       SEARCH ARTICLES
    ========================================= */

    const searchWords =
        query.toLowerCase().split(/\s+/).filter(Boolean);


    const results = articles
        .map(function (article) {

            const title =
                String(article.title || "").toLowerCase();

            const summary =
                String(article.summary || "").toLowerCase();

            const category =
                String(article.category || "").toLowerCase();

            const author =
                String(article.author || "").toLowerCase();

            const content =
                String(article.content || "").toLowerCase();


            let score = 0;


            searchWords.forEach(function (word) {

                if (title.includes(word)) {
                    score += 10;
                }

                if (summary.includes(word)) {
                    score += 5;
                }

                if (category.includes(word)) {
                    score += 4;
                }

                if (author.includes(word)) {
                    score += 3;
                }

                if (content.includes(word)) {
                    score += 1;
                }

            });


            return {
                article: article,
                score: score
            };

        })
        .filter(function (item) {

            return item.score > 0;

        })
        .sort(function (a, b) {

            if (b.score !== a.score) {
                return b.score - a.score;
            }

            const dateA = new Date(
                a.article.date ||
                a.article.created_at ||
                0
            ).getTime();

            const dateB = new Date(
                b.article.date ||
                b.article.created_at ||
                0
            ).getTime();

            return dateB - dateA;

        })
        .map(function (item) {

            return item.article;

        });


    /* =========================================
       UPDATE SEARCH TITLE
    ========================================= */

    if (searchTitle) {

        searchTitle.textContent =
            results.length +
            " result" +
            (results.length === 1 ? "" : "s") +
            ' for "' +
            query +
            '"';

    }


    /* =========================================
       NO RESULTS
    ========================================= */

    if (results.length === 0) {

        if (resultsGrid) {
            resultsGrid.innerHTML = "";
        }

        if (emptyState) {

            emptyState.style.display = "block";

            emptyState.innerHTML = `
                <h2>No stories found</h2>

                <p>
                    We couldn't find any articles
                    matching "<strong>${escapeHTML(query)}</strong>".
                </p>

                <a
                    href="index.html"
                    class="read-more"
                >
                    ← Back to Home
                </a>
            `;

        }

        return;
    }


    /* =========================================
       HIDE EMPTY STATE
    ========================================= */

    if (emptyState) {
        emptyState.style.display = "none";
    }

    if (resultsGrid) {
        resultsGrid.innerHTML = "";
    }


    /* =========================================
       CREATE SEARCH CARDS
    ========================================= */

    results.forEach(function (article) {

        const card =
            document.createElement("article");

        card.className = "news-card";


        /* =====================================
           IMAGE
        ===================================== */

        const image =
            document.createElement("img");

        image.src =
            article.image ||
            fallbackImage;

        image.alt =
            article.title ||
            "DΛMZΞΞ NEWS";

        image.loading = "lazy";

        image.onerror = function () {
            this.onerror = null;
            this.src = fallbackImage;
        };


        /* =====================================
           CONTENT
        ===================================== */

        const content =
            document.createElement("div");

        content.className =
            "news-card-content";


        /* =====================================
           CATEGORY
        ===================================== */

        const category =
            document.createElement("span");

        category.className =
            "category";

        category.textContent =
            article.category ||
            "NEWS";


        /* =====================================
           TITLE
        ===================================== */

        const title =
            document.createElement("h3");

        const link =
            document.createElement("a");

        link.href =
            "article.html?id=" +
            encodeURIComponent(article.id);

        link.textContent =
            article.title ||
            "Untitled Article";

        title.appendChild(link);


        /* =====================================
           SUMMARY
        ===================================== */

        const summary =
            document.createElement("p");

        summary.textContent =
            article.summary || "";


        /* =====================================
           META
        ===================================== */

        const meta =
            document.createElement("div");

        meta.className =
            "article-meta";

        meta.textContent =
            "By " +
            (article.author || "DΛMZΞΞ NEWS") +
            (
                article.date
                    ? " · " + article.date
                    : ""
            );


        /* =====================================
           VIEWS
        ===================================== */

        const views =
            document.createElement("span");

        views.className =
            "article-views";

        views.textContent =
            (Number(article.views) || 0) +
            " views";


        /* =====================================
           READ MORE
        ===================================== */

        const readMore =
            document.createElement("a");

        readMore.href =
            "article.html?id=" +
            encodeURIComponent(article.id);

        readMore.className =
            "read-more";

        readMore.textContent =
            "Read Full Story →";


        /* =====================================
           BUILD CARD
        ===================================== */

        content.appendChild(category);
        content.appendChild(title);

        if (article.summary) {
            content.appendChild(summary);
        }

        content.appendChild(meta);

        const footer =
            document.createElement("div");

        footer.className =
            "search-card-footer";

        footer.appendChild(views);
        footer.appendChild(readMore);

        content.appendChild(footer);

        card.appendChild(image);
        card.appendChild(content);


        if (resultsGrid) {
            resultsGrid.appendChild(card);
        }

    });


    /* =========================================
       BROWSER TITLE
    ========================================= */

    document.title =
        "Search: " +
        query +
        " — DΛMZΞΞ NEWS";

});

/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}