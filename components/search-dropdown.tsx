"use client";

import { ArrowDown, ArrowUp, CornerDownLeft, Folder } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  HighlightedText,
  SearchResultThumb,
} from "@/components/search-hits-list";
import { recordRecentSearch } from "@/lib/recent-searches";
import { scrollbarSubtleClass } from "@/lib/scrollbar-classes";
import type { SearchHitItem, SearchHits } from "@/lib/search-hits";
import { cn } from "@/lib/utils";

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex size-5 items-center justify-center rounded border border-neutral-700 bg-neutral-950 text-neutral-400">
      {children}
    </kbd>
  );
}

function DropdownRow({
  item,
  query,
  active,
  onActive,
}: {
  item: SearchHitItem;
  query: string;
  active: boolean;
  onActive: () => void;
}) {
  return (
    <Link
      id={item.id}
      role="option"
      aria-selected={active}
      href={item.href}
      onMouseEnter={onActive}
      onClick={() =>
        recordRecentSearch({
          title: item.title,
          href: item.href,
          kind: item.kind,
        })
      }
      className={cn(
        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-neutral-100",
        "outline-none transition-colors",
        active ? "bg-white/10" : "hover:bg-white/5"
      )}
    >
      {item.kind === "visual" ? (
        <SearchResultThumb slide={item.previewSlide} label={item.title} />
      ) : (
        <SearchResultThumb label={item.title}>
          <Folder className="size-4 text-neutral-400" strokeWidth={1.75} />
        </SearchResultThumb>
      )}
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <span className="w-full truncate">
          <HighlightedText text={item.title} query={query} />
        </span>
        {item.kind === "visual" && item.projectTitle ? (
          <span className="w-full truncate text-xs text-neutral-500">
            {item.projectTitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

type SearchDropdownProps = {
  id: string;
  hits: SearchHits;
  items: SearchHitItem[];
  query: string;
  activeId: string | null;
  onActiveIdChange: (id: string) => void;
};

/** Categorized search results panel — Visuals and Projects. */
export function SearchDropdown({
  id,
  hits,
  items,
  query,
  activeId,
  onActiveIdChange,
}: SearchDropdownProps) {
  const hasVisuals = hits.visuals.length > 0;
  const hasProjects = hits.projects.length > 0;
  const hasResults = items.length > 0;

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-xl",
        "bg-neutral-900 shadow-lg ring-1 ring-neutral-800"
      )}
    >
      <div
        id={id}
        role="listbox"
        aria-label="Search results"
        className={cn(
          "max-h-[min(420px,50vh)] overflow-y-auto p-2",
          scrollbarSubtleClass
        )}
      >
        {hasResults ? (
          <div className="flex flex-col gap-3">
            {hasVisuals ? (
              <section className="flex flex-col gap-1">
                <h2 className="px-2.5 pt-1 text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
                  Visuals
                </h2>
                <ul className="flex flex-col">
                  {items
                    .filter((item) => item.kind === "visual")
                    .map((item) => (
                      <li key={item.id}>
                        <DropdownRow
                          item={item}
                          query={query}
                          active={item.id === activeId}
                          onActive={() => onActiveIdChange(item.id)}
                        />
                      </li>
                    ))}
                </ul>
              </section>
            ) : null}

            {hasProjects ? (
              <section className="flex flex-col gap-1">
                <h2 className="px-2.5 pt-1 text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
                  Projects
                </h2>
                <ul className="flex flex-col">
                  {items
                    .filter((item) => item.kind === "project")
                    .map((item) => (
                      <li key={item.id}>
                        <DropdownRow
                          item={item}
                          query={query}
                          active={item.id === activeId}
                          onActive={() => onActiveIdChange(item.id)}
                        />
                      </li>
                    ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : (
          <p className="px-2.5 py-6 text-center text-sm text-neutral-500">
            No results
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-1.5 border-t border-neutral-800 px-3 py-2">
        <Kbd>
          <ArrowUp className="size-3" strokeWidth={2} aria-hidden />
        </Kbd>
        <Kbd>
          <ArrowDown className="size-3" strokeWidth={2} aria-hidden />
        </Kbd>
        <Kbd>
          <CornerDownLeft className="size-3" strokeWidth={2} aria-hidden />
        </Kbd>
        <span className="sr-only">Use arrow keys to navigate, Enter to open</span>
      </div>
    </div>
  );
}
