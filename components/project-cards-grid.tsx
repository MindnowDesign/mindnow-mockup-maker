"use client";

import { useEffect, useState } from "react";

import { ProjectProductCard } from "@/components/project-product-card";
import { ProjectsEmptyState } from "@/components/projects-empty-state";
import { formatEditedAgo } from "@/lib/format-edited-ago";
import { projectCardPreviewSlides } from "@/lib/project-card-preview-slides";
import { listSavedProjects, type SavedProject } from "@/lib/saved-projects";

/** Saved project tiles for `/projects`. */
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
    return <ProjectsEmptyState />;
  }

  return (
    <div className="@container">
      <div className="grid grid-cols-1 items-stretch gap-4 @[420px]:grid-cols-2 @[720px]:grid-cols-3 @[1100px]:grid-cols-4">
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
    </div>
  );
}
