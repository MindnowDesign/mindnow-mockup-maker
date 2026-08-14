"use client";

import { Search, X } from "lucide-react";
import type { FormEvent, KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

type SearchFieldProps = {
  id?: string;
  query: string;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  expanded?: boolean;
  listboxId?: string;
  activeOptionId?: string | null;
  autoFocus?: boolean;
  /** Solid fill — use over blur overlays so the field matches Home on `bg-neutral-950`. */
  opaque?: boolean;
};

/** Search input used on Home and Search. */
export function SearchField({
  id = "mindnow-search",
  query,
  onQueryChange,
  onClear,
  onKeyDown,
  className,
  expanded,
  listboxId,
  activeOptionId,
  autoFocus = false,
  opaque = false,
}: SearchFieldProps) {
  const trimmed = query.trim();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "Escape") {
      onClear();
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("w-full max-w-[800px]", className)}>
      <label htmlFor={id} className="sr-only">
        Search for projects or visuals
      </label>
      <div
        className={cn(
          "flex h-12 w-full items-center gap-3 rounded-xl px-4",
          opaque ? "bg-neutral-950" : "bg-neutral-900/30",
          "ring-1 ring-inset ring-neutral-800",
          "focus-within:ring-white/20"
        )}
      >
        <Search
          className="size-4 shrink-0 text-neutral-500"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          id={id}
          type="search"
          role={listboxId ? "combobox" : undefined}
          aria-autocomplete={listboxId ? "list" : undefined}
          aria-expanded={listboxId ? Boolean(expanded) : undefined}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId ?? undefined}
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for projects or visuals..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-sm text-neutral-100",
            "outline-none placeholder:text-neutral-500",
            "[&::-webkit-search-cancel-button]:hidden"
          )}
        />
        {trimmed ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full",
              "text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-200",
              "outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            )}
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
      </div>
    </form>
  );
}
