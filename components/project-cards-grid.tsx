"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ProjectProductCard } from "@/components/project-product-card";
import { StartFromScratchCard } from "@/components/start-from-scratch-card";
import { Button } from "@/components/ui/button";
import { formatEditedAgo } from "@/lib/format-edited-ago";
import { projectCardPreviewSlides } from "@/lib/project-card-preview-slides";
import { listSavedProjects, type SavedProject } from "@/lib/saved-projects";

/** Same grid as the home “Projects” section — create tile + project tiles. */
export function ProjectCardsGrid() {
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

  if (hydrated && projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 px-6 py-16 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- static empty-state asset */}
        <img
          src="/images/empty-states/projects.png"
          alt=""
          aria-hidden
          draggable={false}
          className="size-[120px] object-contain"
        />
        <p className="text-sm font-medium text-zinc-200">No projects yet</p>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Create a project to start building mockups. Your work will show up
          here.
        </p>
        <Button asChild className="mt-1">
          <Link href="/projects/new">
            <Plus data-icon="inline-start" strokeWidth={1.75} aria-hidden />
            Create new project
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StartFromScratchCard aria-label="Create new project" />
      {projects.map((p) => (
        <ProjectProductCard
          key={p.id}
          title={p.title}
          visualCount={p.visualCount}
          editedLabel={formatEditedAgo(p.updatedAt)}
          href={`/projects/${p.id}`}
          previewSrc={p.previewDataUrl || null}
          previewSlides={projectCardPreviewSlides(p)}
          projectId={p.id}
        />
      ))}
    </div>
  );
}
