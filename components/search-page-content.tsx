"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SearchField } from "@/components/search-field";
import { SearchHitsList } from "@/components/search-hits-list";
import { formatSearchDate } from "@/lib/format-search-date";
import {
  clearRecentSearches,
  listRecentSearches,
  MAX_RECENT_SEARCHES,
  recordRecentSearch,
  RECENT_SEARCHES_CHANGED_EVENT,
  type RecentSearch,
} from "@/lib/recent-searches";
import { resolveOpenHref } from "@/lib/resolve-open-href";
import { collectHits, EMPTY_SEARCH_HITS } from "@/lib/search-hits";
import { cn } from "@/lib/utils";

export function SearchPageContent() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<RecentSearch[]>([]);

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
  const hits = showResults ? collectHits(trimmed) : EMPTY_SEARCH_HITS;

  const recentRows = recent.map((item) => ({
    ...item,
    dateLabel: formatSearchDate(item.searchedAt),
  }));

  function clearSearch() {
    setQuery("");
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex w-full flex-1 justify-center px-6 py-10 md:px-[72px] md:pt-16">
        <div className="flex w-full max-w-2xl flex-col gap-8">
          <SearchField
            query={query}
            onQueryChange={setQuery}
            onClear={clearSearch}
          />

          {showResults ? (
            <SearchHitsList hits={hits} query={trimmed} />
          ) : (
            <section
              aria-labelledby="recent-searches-heading"
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="recent-searches-heading"
                  className="text-sm font-medium text-neutral-500"
                >
                  Recent
                </h2>
                {recentRows.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => clearRecentSearches()}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors",
                      "hover:text-neutral-200",
                      "outline-none focus-visible:text-neutral-200"
                    )}
                  >
                    <X className="size-3.5" strokeWidth={1.75} aria-hidden />
                    Clear
                  </button>
                ) : null}
              </div>
              {recentRows.length === 0 ? (
                <p className="text-sm text-neutral-500">No recent searches</p>
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
                          <span className="min-w-0 truncate text-neutral-100">
                            {item.title}
                          </span>
                          <span className="shrink-0 text-neutral-500">
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
