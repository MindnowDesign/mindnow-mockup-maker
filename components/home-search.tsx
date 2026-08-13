"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type KeyboardEvent } from "react";

import { SearchDropdown } from "@/components/search-dropdown";
import { SearchField } from "@/components/search-field";
import { recordRecentSearch } from "@/lib/recent-searches";
import {
  collectHits,
  EMPTY_SEARCH_HITS,
  flattenSearchHits,
} from "@/lib/search-hits";
import { cn } from "@/lib/utils";

const LISTBOX_ID = "home-search-results";

type HomeSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  overlay?: boolean;
};

/** Home search field with categorized results dropdown. */
export function HomeSearch({
  query,
  onQueryChange,
  overlay = false,
}: HomeSearchProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const trimmed = query.trim();
  const open = trimmed.length > 0;
  const hits = open ? collectHits(trimmed) : EMPTY_SEARCH_HITS;
  const items = flattenSearchHits(hits);
  const activeItem = items[activeIndex] ?? null;

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmed]);

  useEffect(() => {
    if (!activeItem) return;
    document
      .getElementById(activeItem.id)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeItem]);

  function clearSearch() {
    onQueryChange("");
    setActiveIndex(0);
  }

  function openActive() {
    if (!activeItem) return;
    recordRecentSearch({
      title: activeItem.title,
      href: activeItem.href,
      kind: activeItem.kind,
    });
    router.push(activeItem.href);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((index) => (index - 1 + items.length) % items.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      openActive();
    }
  }

  return (
    <div
      className={cn(
        "w-full max-w-[800px] text-left",
        overlay && "relative z-50"
      )}
    >
      <SearchField
        id="home-search"
        className="max-w-none"
        query={query}
        onQueryChange={onQueryChange}
        onClear={clearSearch}
        onKeyDown={onKeyDown}
        expanded={open}
        listboxId={LISTBOX_ID}
        activeOptionId={activeItem?.id ?? null}
      />
      {open ? (
        <div className="mt-2 w-full origin-top animate-in fade-in-0 slide-in-from-top-1 duration-300 ease-out">
          <SearchDropdown
            id={LISTBOX_ID}
            hits={hits}
            items={items}
            query={trimmed}
            activeId={activeItem?.id ?? null}
            onActiveIdChange={(id) => {
              const index = items.findIndex((item) => item.id === id);
              if (index >= 0) setActiveIndex(index);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
