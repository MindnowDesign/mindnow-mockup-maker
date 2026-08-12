"use client";

import { Folder, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";

import { formatSearchDate } from "@/lib/format-search-date";
import type { ProjectCardPreviewSlide } from "@/lib/project-card-preview-slides";
import {
  clearRecentSearches,
  listRecentSearches,
  MAX_RECENT_SEARCHES,
  recordRecentSearch,
  RECENT_SEARCHES_CHANGED_EVENT,
  type RecentSearch,
} from "@/lib/recent-searches";
import { listRecentVisuals, type RecentVisualEntry } from "@/lib/recent-visuals";
import { resolveOpenHref } from "@/lib/resolve-open-href";
import { listSavedProjects, type SavedProject } from "@/lib/saved-projects";
import { cn } from "@/lib/utils";

type SearchHits = {
  visuals: RecentVisualEntry[];
  projects: SavedProject[];
};

const EMPTY_HITS: SearchHits = { visuals: [], projects: [] };

const resultRowClass = cn(
  "flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-lg -mx-3 px-3 py-2.5",
  "text-sm transition-colors hover:bg-white/5"
);

function resolveThumbSrc(
  slide?: ProjectCardPreviewSlide | null,
  captureSrc?: string | null
) {
  return slide?.captureSrc || slide?.mediaDataUrl || captureSrc || null;
}

function SearchResultThumb({
  slide,
  captureSrc,
  label,
}: {
  slide?: ProjectCardPreviewSlide | null;
  captureSrc?: string | null;
  label: string;
}) {
  const src = resolveThumbSrc(slide, captureSrc);

  return (
    <span
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden",
        "rounded-md bg-zinc-900 ring-1 ring-inset ring-zinc-800"
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- PNG data URLs from saved projects
        <img
          src={src}
          alt=""
          aria-label={label}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="size-full object-cover"
        />
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}

function matchesQuery(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

/** Bold every case-insensitive match of `query` inside `text`. */
function HighlightedText({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  const q = query.trim();
  if (!q) {
    return <span className={className}>{text}</span>;
  }

  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const parts: { value: string; match: boolean }[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const index = lower.indexOf(needle, cursor);
    if (index === -1) {
      parts.push({ value: text.slice(cursor), match: false });
      break;
    }
    if (index > cursor) {
      parts.push({ value: text.slice(cursor, index), match: false });
    }
    parts.push({
      value: text.slice(index, index + needle.length),
      match: true,
    });
    cursor = index + needle.length;
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.match ? (
          <strong key={i} className="font-semibold">
            {part.value}
          </strong>
        ) : (
          <span key={i} className="font-normal">
            {part.value}
          </span>
        )
      )}
    </span>
  );
}

function collectHits(query: string): SearchHits {
  const q = query.trim();
  if (!q) return EMPTY_HITS;

  return {
    visuals: listRecentVisuals(50).filter((v) => matchesQuery(v.title, q)),
    projects: listSavedProjects().filter((p) => matchesQuery(p.title, q)),
  };
}

export function SearchPageContent() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [hits, setHits] = useState<SearchHits>(EMPTY_HITS);

  useEffect(() => {
    function refreshRecent() {
      setRecent(listRecentSearches(MAX_RECENT_SEARCHES));
    }
    refreshRecent();
    window.addEventListener(RECENT_SEARCHES_CHANGED_EVENT, refreshRecent);
    window.addEventListener("mindnow:saved-projects-changed", refreshRecent);
    window.addEventListener("storage", refreshRecent);
    return () => {
      window.removeEventListener(RECENT_SEARCHES_CHANGED_EVENT, refreshRecent);
      window.removeEventListener(
        "mindnow:saved-projects-changed",
        refreshRecent
      );
      window.removeEventListener("storage", refreshRecent);
    };
  }, []);

  const trimmed = query.trim();
  const showResults = trimmed.length > 0;
  const hasVisuals = hits.visuals.length > 0;
  const hasProjects = hits.projects.length > 0;
  const hasAnyResults = hasVisuals || hasProjects;

  useEffect(() => {
    if (!trimmed) {
      setHits(EMPTY_HITS);
      return;
    }
    setHits(collectHits(trimmed));
  }, [trimmed]);

  const recentRows = recent.map((item) => ({
    ...item,
    dateLabel: formatSearchDate(item.searchedAt),
  }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Keep query as-typed; Recent only records clicks on results.
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      clearSearch();
    }
  }

  function clearSearch() {
    setQuery("");
    setHits(EMPTY_HITS);
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex w-full flex-1 justify-center px-6 py-10 md:px-[72px] md:pt-16">
        <div className="flex w-full max-w-2xl flex-col gap-8">
          <form onSubmit={onSubmit} className="w-full">
            <label htmlFor="mindnow-search" className="sr-only">
              Search
            </label>
            <div
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-full",
                "bg-zinc-900 px-4",
                "ring-1 ring-inset ring-zinc-800",
                "focus-within:ring-white/20"
              )}
            >
              <Search
                className="size-4 shrink-0 text-zinc-500"
                strokeWidth={1.75}
                aria-hidden
              />
              <input
                id="mindnow-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className={cn(
                  "min-w-0 flex-1 bg-transparent text-sm text-zinc-100",
                  "outline-none placeholder:text-zinc-500",
                  "[&::-webkit-search-cancel-button]:hidden"
                )}
              />
              {trimmed ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full",
                    "text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200",
                    "outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                  )}
                >
                  <X className="size-4" strokeWidth={1.75} aria-hidden />
                </button>
              ) : null}
            </div>
          </form>

          {showResults ? (
            hasAnyResults ? (
              <div className="flex flex-col gap-8">
                {hasVisuals ? (
                  <section
                    aria-labelledby="search-visuals-heading"
                    className="flex flex-col gap-3"
                  >
                    <h2
                      id="search-visuals-heading"
                      className="text-sm font-medium text-zinc-500"
                    >
                      Visuals
                    </h2>
                    <ul className="flex flex-col">
                      {hits.visuals.map((visual) => (
                        <li
                          key={`visual:${visual.projectId}:${visual.visualId}`}
                        >
                          <Link
                            href={visual.href}
                            onClick={() =>
                              recordRecentSearch({
                                title: visual.title,
                                href: visual.href,
                                kind: "visual",
                              })
                            }
                            className={resultRowClass}
                          >
                            <SearchResultThumb
                              slide={visual.previewSlide}
                              label={visual.title}
                            />
<span className="min-w-0 flex-1 truncate text-zinc-100">
                              <HighlightedText
                                text={visual.title}
                                query={trimmed}
                              />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {hasProjects ? (
                  <section
                    aria-labelledby="search-projects-heading"
                    className="flex flex-col gap-3"
                  >
                    <h2
                      id="search-projects-heading"
                      className="text-sm font-medium text-zinc-500"
                    >
                      Projects
                    </h2>
                    <ul className="flex flex-col">
                      {hits.projects.map((project) => {
                        const href = `/projects/${project.id}`;
                        return (
                          <li key={`project:${project.id}`}>
                            <Link
                              href={href}
                              onClick={() =>
                                recordRecentSearch({
                                  title: project.title,
                                  href,
                                  kind: "project",
                                })
                              }
                              className={resultRowClass}
                            >
                              <span
                                className={cn(
                                  "flex size-10 shrink-0 items-center justify-center",
                                  "rounded-md bg-zinc-900 ring-1 ring-inset ring-zinc-800"
                                )}
                                aria-hidden
                              >
                                <Folder
                                  className="size-4 text-zinc-400"
                                  strokeWidth={1.75}
                                />
                              </span>
<span className="min-w-0 flex-1 truncate text-zinc-100">
                                <HighlightedText
                                  text={project.title}
                                  query={trimmed}
                                />
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No results</p>
            )
          ) : (
            <section
              aria-labelledby="recent-searches-heading"
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="recent-searches-heading"
                  className="text-sm font-medium text-zinc-500"
                >
                  Recent
                </h2>
                {recentRows.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => clearRecentSearches()}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors",
                      "hover:text-zinc-200",
                      "outline-none focus-visible:text-zinc-200"
                    )}
                  >
                    <X className="size-3.5" strokeWidth={1.75} aria-hidden />
                    Clear
                  </button>
                ) : null}
              </div>
              {recentRows.length === 0 ? (
                <p className="text-sm text-zinc-500">No recent searches</p>
              ) : (
                <ul className="flex flex-col">
                  {recentRows.map((item) => {
                    const href = resolveOpenHref(item.href);
                    return (
                      <li key={item.id}>
                        <Link
                          href={href}
                          onClick={() =>
                            recordRecentSearch({
                              title: item.title,
                              href: item.href,
                              kind: item.kind,
                            })
                          }
                          className={cn(
                            "flex w-[calc(100%+1.5rem)] items-center justify-between gap-4 rounded-lg -mx-3 px-3 py-3",
                            "text-sm transition-colors hover:bg-white/5"
                          )}
                        >
                          <span className="min-w-0 truncate text-zinc-100">
                            {item.title}
                          </span>
                          <span className="shrink-0 text-zinc-500">
                            {item.dateLabel}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
