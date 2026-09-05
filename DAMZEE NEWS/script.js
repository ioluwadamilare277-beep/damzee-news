document.addEventListener("DOMContentLoaded", () => {

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

const breakingNews = document.getElementById("breakingNews");
const topStoriesGrid = document.getElementById("topStoriesGrid");
const latestNewsGrid = document.getElementById("latestNewsGrid");
const trendingNewsGrid = document.getElementById("trendingNewsGrid");
const newsFeed = document.getElementById("newsFeed");

const newsletterForm = document.getElementById("newsletterForm");


/* =========================================
   SUPABASE CHECK
========================================= */

if (!window.supabase || typeof supabaseClient === "undefined") {
    console.error("DΛMZΞΞ NEWS: Supabase client is not available.");
    return;
}


/* =========================================
   LOAD PUBLISHED ARTICLES
========================================= */

async function getArticles() {

    try {

        const { data, error } = await supabaseClient
            .from("articles")
            .select("*")
            .eq("status", "published")
            .order("date", { ascending: false });

        if (error) {

            console.error(
                "DΛMZΞΞ NEWS: Unable to load articles:",
                error
            );

            return [];
        }

        return data || [];

    } catch (error) {

        console.error(
            "DΛMZΞΞ NEWS: Unexpected database error:",
            error
        );

        return [];
    }
}


/* =========================================
   ARTICLE LINK
========================================= */

function articleLink(article) {

    return `article.html?id=${encodeURIComponent(article.id)}`;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}


/* =========================================
   FORMAT PUBLICATION DATE
========================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return escapeHTML(dateValue);
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* =========================================
   IMAGE FALLBACK
========================================= */

function getArticleImage(article) {

    if (article.image && article.image.trim()) {
        return article.image.trim();
    }

    return "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="800"
                 height="450"
                 viewBox="0 0 800 450">
                <rect width="800" height="450" fill="#0b1736"/>
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
}


/* =========================================
   STANDARD NEWS CARD
========================================= */

function createNewsCard(article) {

    const card = document.createElement("article");

    card.className = "news-card";

    const image = getArticleImage(article);
    const date = formatDate(article.date);

    card.innerHTML = `

        <a href="${articleLink(article)}"
           class="news-image-link">

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(article.title || "DΛMZΞΞ NEWS")}"
                loading="lazy"
            >

        </a>

        <div class="news-card-content">

            <div class="news-category">
                ${escapeHTML(article.category || "News")}
            </div>

            <h3 class="news-title">

                <a href="${articleLink(article)}">
                    ${escapeHTML(article.title || "Untitled Article")}
                </a>

            </h3>

            ${
                date
                    ? `
                        <div class="news-date">
                            ${date}
                        </div>
                      `
                    : ""
            }

            ${
                article.summary
                    ? `
                        <p class="news-summary">
                            ${escapeHTML(article.summary)}
                        </p>
                      `
                    : ""
            }

        </div>
    `;

    return card;
}


/* =========================================
   TOP STORY CARD
========================================= */

function createTopStoryCard(article, position) {

    const card = document.createElement("article");

    card.className = "top-story-card";

    if (position === 0) {
        card.classList.add("top-story-lead");
    } else {
        card.classList.add("top-story-supporting");
    }

    const image = getArticleImage(article);

    const category = escapeHTML(
        article.category || "News"
    );

    const title = escapeHTML(
        article.title || "Untitled Article"
    );

    const summary = article.summary
        ? escapeHTML(article.summary)
        : "";

    const date = formatDate(article.date);

    card.innerHTML = `

        <a href="${articleLink(article)}"
           class="top-story-image-link">

            <img
                src="${escapeHTML(image)}"
                alt="${title}"
                loading="${position === 0 ? "eager" : "lazy"}"
            >

        </a>

        <div class="top-story-content">

            <div class="top-story-category">
                ${category}
            </div>

            <h2 class="top-story-title">

                <a href="${articleLink(article)}">
                    ${title}
                </a>

            </h2>

            ${
                date
                    ? `
                        <div class="top-story-date">
                            ${date}
                        </div>
                      `
                    : ""
            }

            ${
                summary
                    ? `
                        <p class="top-story-summary">
                            ${summary}
                        </p>
                      `
                    : ""
            }

        </div>
    `;

    return card;
}


/* =========================================
   BREAKING NEWS
========================================= */

function renderBreakingNews(articles) {

    if (!breakingNews) return;

    const breakingArticles = articles.filter(
        article =>
            article.breaking === "yes" ||
            article.breaking === true
    );

    const source = breakingArticles.length
        ? breakingArticles
        : articles.slice(0, 5);

    if (!source.length) {

        breakingNews.innerHTML = `
            <span class="breaking-empty">
                No breaking news at the moment.
            </span>
        `;

        return;
    }

    breakingNews.innerHTML = source
        .slice(0, 5)
        .map(article => `
            <a href="${articleLink(article)}">
                ${escapeHTML(article.title || "Untitled Article")}
            </a>
        `)
        .join(
            ' <span class="breaking-separator">•</span> '
        );
}


/* =========================================
   TOP STORIES
========================================= */

function renderTopStories(articles) {

    if (!topStoriesGrid) return;

    const topStories = [...articles]
        .sort((a, b) => {

            const viewsA = Number(a.views) || 0;
            const viewsB = Number(b.views) || 0;

            if (viewsB !== viewsA) {
                return viewsB - viewsA;
            }

            return new Date(b.date) - new Date(a.date);

        })
        .slice(0, 4);

    topStoriesGrid.innerHTML = "";

    if (!topStories.length) {

        topStoriesGrid.innerHTML = `
            <p class="empty-news">
                No stories available yet.
            </p>
        `;

        return;
    }

    topStories.forEach((article, index) => {

        topStoriesGrid.appendChild(
            createTopStoryCard(article, index)
        );

    });
}


/* =========================================
   LATEST NEWS
========================================= */

function renderLatestNews(articles) {

    if (!latestNewsGrid) return;

    const latest = articles.slice(0, 6);

    latestNewsGrid.innerHTML = "";

    if (!latest.length) {

        latestNewsGrid.innerHTML = `
            <p class="empty-news">
                No latest news available yet.
            </p>
        `;

        return;
    }

    latest.forEach(article => {

        latestNewsGrid.appendChild(
            createNewsCard(article)
        );

    });
}


/* =========================================
   TRENDING / MOST READ
========================================= */

function renderTrendingNews(articles) {

    if (!trendingNewsGrid) return;

    const trending = [...articles]
        .sort((a, b) => {

            const viewsA = Number(a.views) || 0;
            const viewsB = Number(b.views) || 0;

            return viewsB - viewsA;

        })
        .slice(0, 6);

    trendingNewsGrid.innerHTML = "";

    if (!trending.length) {

        trendingNewsGrid.innerHTML = `
            <p class="empty-news">
                No trending stories yet.
            </p>
        `;

        return;
    }

    trending.forEach(article => {

        trendingNewsGrid.appendChild(
            createNewsCard(article)
        );

    });
}


/* =========================================
   MORE NEWS
========================================= */

function renderMoreNews(articles) {

    if (!newsFeed) return;

    const moreNews = articles.slice(0, 10);

    newsFeed.innerHTML = "";

    if (!moreNews.length) {

        newsFeed.innerHTML = `
            <p class="empty-news">
                No more news available yet.
            </p>
        `;

        return;
    }

    moreNews.forEach(article => {

        newsFeed.appendChild(
            createNewsCard(article)
        );

    });
}


/* =========================================
   SEARCH
========================================= */

if (searchForm) {

    searchForm.addEventListener("submit", event => {

        event.preventDefault();

        const query = searchInput
            ? searchInput.value.trim()
            : "";

        if (!query) return;

        window.location.href =
            `search.html?q=${encodeURIComponent(query)}`;

    });
}


/* =========================================
   NEWSLETTER
========================================= */

if (newsletterForm) {

    newsletterForm.addEventListener("submit", event => {

        event.preventDefault();

        const emailInput =
            document.getElementById("newsletterEmail");

        const email = emailInput
            ? emailInput.value.trim()
            : "";

        if (!email) {

            alert(
                "Please enter your email address."
            );

            return;
        }

        alert(
            "Newsletter system will be connected to the database next."
        );

        newsletterForm.reset();

    });
}


/* =========================================
   BACK TO TOP
========================================= */

const backToTop =
    document.getElementById("backToTop");

if (backToTop) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    });

    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });
}


/* =========================================
   LOAD HOMEPAGE
========================================= */

async function loadHomepage() {

    console.log(
        "DΛMZΞΞ NEWS: Loading articles from Supabase..."
    );

    const articles = await getArticles();

    renderBreakingNews(articles);
    renderTopStories(articles);
    renderLatestNews(articles);
    renderTrendingNews(articles);
    renderMoreNews(articles);

    console.log(
        `DΛMZΞΞ NEWS: ${articles.length} published article(s) loaded.`
    );
}


loadHomepage();


console.log(
    "DΛMZΞΞ NEWS homepage loaded successfully."
);

});