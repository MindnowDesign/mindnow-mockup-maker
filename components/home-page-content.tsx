"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CreateProjectSection } from "@/components/create-project-section";
import { HomeSearch } from "@/components/home-search";
import { LastProjectsList } from "@/components/last-projects-list";
import { RecentVisualsSection } from "@/components/recent-visuals-section";
import { cn } from "@/lib/utils";

/** Home: welcome, search, create project, then recent visuals. */
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
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Welcome Jane
          </h1>
          <HomeSearch
            query={query}
            onQueryChange={setQuery}
            overlay={searching}
          />
        </header>

        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <section
            aria-labelledby="start-project-heading"
            className="flex min-h-0 flex-col gap-4"
          >
            <h2
              id="start-project-heading"
              className="text-base font-semibold tracking-tight text-foreground"
            >
              Start project
            </h2>
            <CreateProjectSection />
          </section>

          <section
            aria-labelledby="last-projects-heading"
            className="flex min-h-0 flex-col gap-4"
          >
            <Link
              href="/projects"
              className="inline-flex w-fit items-center gap-2 rounded-sm text-foreground outline-none transition-colors hover:text-neutral-300 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              <h2
                id="last-projects-heading"
                className="text-base font-semibold tracking-tight"
              >
                Last Projects
              </h2>
              <ChevronRight
                className="size-4 shrink-0"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
            <LastProjectsList />
          </section>
        </div>

        <RecentVisualsSection />
      </div>
    </div>
  );
}
