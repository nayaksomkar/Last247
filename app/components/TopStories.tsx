"use client";

import { useEffect, useState } from "react";
import FeaturedStory from "./FeaturedStory";
import StoryCard from "./StoryCard";
import NewsReaderAside, { type NewsStory } from "./NewsReaderAside";

type NewsAPIArticle = {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
};

type NewsAPIResponse = {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
};

function getCategory(title: string, description: string | null): NewsStory["category"] {
  const text = `${title} ${description ?? ""}`.toLowerCase();

  const technologyKeywords = [
    "ai",
    "artificial intelligence",
    "technology",
    "tech",
    "google",
    "microsoft",
    "apple",
    "openai",
    "nvidia",
    "chip",
    "software",
    "robot",
    "cyber",
    "iphone",
    "android",
  ];

  const businessKeywords = [
    "market",
    "stock",
    "stocks",
    "economy",
    "economic",
    "business",
    "company",
    "companies",
    "bank",
    "finance",
    "financial",
    "investor",
    "investment",
    "trade",
    "oil price",
  ];

  const scienceKeywords = [
    "science",
    "scientist",
    "scientists",
    "research",
    "researchers",
    "study",
    "space",
    "nasa",
    "climate",
    "physics",
    "biology",
    "medicine",
    "discovery",
  ];

  if (technologyKeywords.some((keyword) => text.includes(keyword))) {
    return "Technology";
  }

  if (businessKeywords.some((keyword) => text.includes(keyword))) {
    return "Business";
  }

  if (scienceKeywords.some((keyword) => text.includes(keyword))) {
    return "Science";
  }

  return "World";
}

function getAccent(category: NewsStory["category"]): NewsStory["accent"] {
  switch (category) {
    case "Technology":
      return "blue";

    case "Business":
      return "amber";

    case "Science":
      return "green";

    case "World":
    default:
      return "red";
  }
}

function getTimeAgo(date: string) {
  const published = new Date(date).getTime();
  const now = Date.now();

  const difference = Math.max(0, now - published);

  const minutes = Math.floor(difference / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${days}d ago`;
}

function getReadTime(article: NewsAPIArticle) {
  const text = `${article.description ?? ""} ${article.content ?? ""}`;

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(words / 200));

  if (minutes === 1) {
    return "1 min read";
  }

  return `${minutes} min read`;
}

function convertArticleToStory(article: NewsAPIArticle): NewsStory {
  const category = getCategory(
    article.title,
    article.description
  );

  return {
    category,

    title: article.title,

    summary:
      article.description ||
      "No summary is available for this story.",

    source: article.source.name,

    time: getTimeAgo(article.publishedAt),

    readTime: getReadTime(article),

    accent: getAccent(category),

    image: article.urlToImage || undefined,

    body: article.content
      ? [
          article.description || "",
          article.content
            .replace(/\[\+\d+ chars\]/, "")
            .trim(),
        ].filter(Boolean)
      : article.description
        ? [article.description]
        : undefined,

    sources: [
      {
        name: article.source.name,
        url: article.url,
      },
    ],
  };
}

export default function TopStories() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [selectedStory, setSelectedStory] =
    useState<NewsStory | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/news");

        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data: NewsAPIResponse = await response.json();

        if (data.status !== "ok") {
          throw new Error("News API returned an error");
        }

        const convertedStories = data.articles
          .filter((article) => article.title)
          .filter(
            (article) =>
              article.title !== "[Removed]"
          )
          .map(convertArticleToStory);

        setStories(convertedStories);
      } catch (error) {
        console.error("News fetching error:", error);

        setError(
          "We couldn't load the latest stories. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<NewsStory>;

      setSelectedStory(customEvent.detail);
    };

    window.addEventListener(
      "last247:open-story",
      handler
    );

    return () => {
      window.removeEventListener(
        "last247:open-story",
        handler
      );
    };
  }, []);

  return (
    <>
      <section
        id="latest"
        className="scroll-mt-24 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          {/* Section heading */}
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-blue" />
                The briefing
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-5xl">
                Top stories
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                The highest-signal stories from the last 24 hours,
                distilled into the essentials.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />

              <span>
                {loading
                  ? "Fetching latest stories..."
                  : `${stories.length} stories available`}
              </span>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-9 grid gap-4 lg:grid-cols-12">

              <div className="min-h-115 animate-pulse rounded-3xl border border-border/70 bg-card/50 lg:col-span-7" />

              <div className="space-y-4 lg:col-span-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-52 animate-pulse rounded-2xl border border-border/70 bg-card/50"
                  />
                ))}
              </div>

            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="mt-9 rounded-2xl border border-red/20 bg-red/5 p-8 text-center">
              <p className="font-semibold text-red">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:border-red/30"
              >
                Try again
              </button>
            </div>
          )}

          {/* Stories */}
          {!loading && !error && stories.length > 0 && (
            <div className="mt-9 grid gap-4 lg:grid-cols-12 lg:items-stretch">

              {/* Featured story */}
              <div className="lg:col-span-7">
                <FeaturedStory story={stories[0]} />
              </div>

              {/* Scrollable stories */}
              <div className="relative min-h-0 lg:col-span-5">

                {/* Top fade */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 rounded-t-2xl bg-linear-to-b from-background to-transparent"
                />

                {/* Bottom fade */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 rounded-b-2xl bg-linear-to-t from-background to-transparent"
                />

                <div className="stories-scroll relative h-115 space-y-4 overflow-y-auto overscroll-contain pr-2 snap-y snap-mandatory scroll-py-2">

                  {stories.slice(1).map((story, index) => (
                    <div
                      key={`${story.title}-${index}`}
                      className="snap-start"
                    >
                      <StoryCard {...story} />
                    </div>
                  ))}

                </div>

                {/* Scroll indicator */}
                {stories.length > 3 && (
                  <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted backdrop-blur-md sm:flex">
                    <span className="h-1 w-1 rounded-full bg-muted" />
                    Scroll for more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No stories */}
          {!loading && !error && stories.length === 0 && (
            <div className="mt-9 rounded-2xl border border-border bg-card p-10 text-center">
              <p className="text-muted">
                No stories were found.
              </p>
            </div>
          )}

          {/* Bottom meta */}
          {!loading && !error && stories.length > 0 && (
            <div className="mt-8 flex flex-col gap-3 border-t border-border/60 pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">

              <span>
                Click any story to read the briefing without leaving the page.
              </span>

              <span>
                Summary of stories
              </span>

            </div>
          )}

        </div>
      </section>

      {/* Story reader sidebar */}
      <NewsReaderAside
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </>
  );
}