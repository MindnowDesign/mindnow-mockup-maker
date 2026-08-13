"use client";

import { Folder } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { recordRecentSearch } from "@/lib/recent-searches";
import type { ProjectCardPreviewSlide } from "@/lib/project-card-preview-slides";
import type { SearchHits } from "@/lib/search-hits";
import { cn } from "@/lib/utils";

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

export const searchResultThumbClass = cn(
  "relative flex size-10 min-h-10 min-w-10 shrink-0 items-center justify-center overflow-hidden",
  "rounded-md bg-zinc-900 ring-1 ring-inset ring-zinc-800"
);

export function SearchResultThumb({
  slide,
  captureSrc,
  label,
  children,
}: {
  slide?: ProjectCardPreviewSlide | null;
  captureSrc?: string | null;
  label: string;
  children?: ReactNode;
}) {
  const src = resolveThumbSrc(slide, captureSrc);

  return (
    <span className={searchResultThumbClass} aria-hidden={src ? undefined : true}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- PNG data URLs from saved projects
        <img
          src={src}
          alt=""
          aria-label={label}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="size-10 object-cover"
        />
      ) : children ? (
        children
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}

/** Bold every case-insensitive match of `query` inside `text`. */
export function HighlightedText({
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

type SearchHitsListProps = {
  hits: SearchHits;
  query: string;
};

/** Visual and project rows for an active search query. */
export function SearchHitsList({ hits, query }: SearchHitsListProps) {
  const hasVisuals = hits.visuals.length > 0;
  const hasProjects = hits.projects.length > 0;

  if (!hasVisuals && !hasProjects) {
    return <p className="text-sm text-zinc-500">No results</p>;
  }

  return (
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
              <li key={`visual:${visual.projectId}:${visual.visualId}`}>
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
                    <HighlightedText text={visual.title} query={query} />
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
                      <HighlightedText text={project.title} query={query} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
