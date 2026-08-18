"use client";

import { useEffect, useState } from "react";

import { HomeSearch } from "@/components/home-search";
import { LastProjectsList } from "@/components/last-projects-list";
import { cn } from "@/lib/utils";

/** Home: welcome, search, then last projects. */
export function HomePageContent() {
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;

  useEffect(() => {
    if (!searching) return;
    const main = document.querySelector("main");
    if (!(main instanceof HTMLElement)) return;
    const previous = main.style.overflow;
    main.style.overflow = "hidden";
    return () => {
      main.style.overflow = previous;
    };
  }, [searching]);

  return (
    <div className="flex min-h-full flex-col">
      <button
        type="button"
        aria-label="Close search"
        tabIndex={searching ? 0 : -1}
        aria-hidden={!searching}
        className={cn(
          "fixed inset-0 z-40 transition-[opacity,backdrop-filter] duration-300 ease-out",
          searching
            ? "bg-black/25 opacity-100 supports-backdrop-filter:backdrop-blur-[6px]"
            : "pointer-events-none bg-black/25 opacity-0 supports-backdrop-filter:backdrop-blur-none"
        )}
        onClick={() => setQuery("")}
      />

      <div className="w-full flex-1 space-y-[72px] px-[72px] pt-[72px] pb-10">
        <header className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-[40px] font-semibold tracking-tight text-foreground">
            Welcome Jane
          </h1>
          <HomeSearch
            query={query}
            onQueryChange={setQuery}
            overlay={searching}
          />
        </header>

        <section
          aria-labelledby="last-projects-heading"
          className="min-w-0"
        >
          <LastProjectsList />
        </section>
      </div>
    </div>
  );
}
