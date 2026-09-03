"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ProjectCardsGrid } from "@/components/project-cards-grid";
import { ProjectsEmptyState } from "@/components/projects-empty-state";
import { buttonVariants } from "@/components/ui/button";
import { listSavedProjects, type SavedProject } from "@/lib/saved-projects";
import { cn } from "@/lib/utils";

/** Projects list page — header CTA only when at least one project exists. */
export function ProjectsPageContent() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function refresh() {
      setProjects(listSavedProjects());
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

  const isEmpty = hydrated && projects.length === 0;
  const showCreateButton = hydrated && projects.length > 0;

  return (
    <section
      aria-labelledby="projects-page-heading"
      className="flex flex-col gap-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h1
          id="projects-page-heading"
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          Projects
        </h1>
        {showCreateButton ? (
          <Link
            href="/projects/new"
            aria-label="Create new project"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-md" })
            )}
          >
            <Plus strokeWidth={1.75} aria-hidden />
          </Link>
        ) : null}
      </div>

      {isEmpty ? <ProjectsEmptyState /> : <ProjectCardsGrid projects={projects} />}
    </section>
  );
}
