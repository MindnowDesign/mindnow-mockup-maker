"use client";

import { Folder } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SearchResultThumb } from "@/components/search-hits-list";
import { Badge } from "@/components/ui/badge";
import { formatEditedAgo } from "@/lib/format-edited-ago";
import { listSavedProjects, type SavedProject } from "@/lib/saved-projects";
import { scrollbarSubtleClass } from "@/lib/scrollbar-classes";
import { cn } from "@/lib/utils";

const LAST_PROJECTS_LIMIT = 5;

/** Compact list of recently edited projects for the Home “Last Projects” panel. */
export function LastProjectsList() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function refresh() {
      setProjects(listSavedProjects().slice(0, LAST_PROJECTS_LIMIT));
    }
    refresh();
    setHydrated(true);
    window.addEventListener("mindnow:saved-projects-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mindnow:saved-projects-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div
      className={cn(
        "min-h-64 flex-1 overflow-y-auto rounded-xl border border-neutral-800/80 bg-neutral-900/30 p-4",
        scrollbarSubtleClass
      )}
    >
      {hydrated && projects.length === 0 ? (
        <p className="px-3 py-8 text-center text-sm text-neutral-500">
          No recent projects
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((project) => {
            const visualLabel = `${project.visualCount} ${project.visualCount === 1 ? "visual" : "visuals"}`;

            return (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  aria-label={`Open project: ${project.title}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3",
                    "outline-none transition-colors hover:border-neutral-600/90 hover:bg-white/5",
                    "focus-visible:ring-2 focus-visible:ring-white/25"
                  )}
                >
                  <SearchResultThumb label={project.title}>
                    <Folder
                      className="size-4 text-neutral-400"
                      strokeWidth={1.75}
                    />
                  </SearchResultThumb>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-neutral-100">
                      {project.title}
                    </span>
                    <span className="truncate text-xs text-neutral-500">
                      {formatEditedAgo(project.updatedAt)}
                    </span>
                  </span>
                  <Badge
                    variant="secondary"
                    aria-label={`${visualLabel} in this project`}
                    className="h-6 shrink-0 tabular-nums border-neutral-700 bg-neutral-800/90 px-2.5 text-xs font-medium text-neutral-200"
                  >
                    {visualLabel}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
