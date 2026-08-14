"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";

import { HomeSearch } from "@/components/home-search";
import { cn } from "@/lib/utils";

type GlobalSearchContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(
  null
);

export function useGlobalSearch() {
  const value = useContext(GlobalSearchContext);
  if (!value) {
    throw new Error("useGlobalSearch must be used within GlobalSearchProvider");
  }
  return value;
}

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((open) => !open), []);

  return (
    <GlobalSearchContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </GlobalSearchContext.Provider>
  );
}

/** Full-viewport search overlay — same field, dropdown, and blur as Home. */
export function GlobalSearchOverlay() {
  const { isOpen, close } = useGlobalSearch();
  const [query, setQuery] = useState("");
  const titleId = useId();

  useEffect(() => {
    if (isOpen) return;
    setQuery("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.preventDefault();
      close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal aria-labelledby={titleId}>
      <h2 id={titleId} className="sr-only">
        Search
      </h2>
      <button
        type="button"
        aria-label="Close search"
        className={cn(
          "absolute inset-0 bg-black/25",
          "supports-backdrop-filter:backdrop-blur-[6px]"
        )}
        onClick={close}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-6 pt-24 md:px-[72px] md:pt-[72px]">
        <div
          className="pointer-events-auto w-full max-w-[800px]"
          onClick={(e) => {
            if (e.target instanceof Element && e.target.closest("a")) {
              close();
            }
          }}
        >
          <HomeSearch
            id="global-search"
            listboxId="global-search-results"
            query={query}
            onQueryChange={setQuery}
            overlay
            autoFocus
            onOpenResult={close}
          />
        </div>
      </div>
    </div>
  );
}
