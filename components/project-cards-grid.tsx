"use client";

import { useEffect, useState } from "react";

import { ProjectProductCard } from "@/components/project-product-card";
import { StartFromScratchCard } from "@/components/start-from-scratch-card";
import { formatEditedAgo } from "@/lib/format-edited-ago";
import { listSavedProjects, type SavedProject } from "@/lib/saved-projects";

function cardPreviewSrcs(p: SavedProject): string[] | undefined {
  if (p.visualSlots?.length && p.previewThumbByVisualId) {
    const urls = p.visualSlots
      .map((s) => p.previewThumbByVisualId![s.id])
      .filter((u): u is string => !!u && u.length > 0);
    if (urls.length > 0) return urls;
  }
  const legacy = p.previewDataUrls?.filter((u) => !!u && u.length > 0);
  return legacy?.length ? legacy : undefined;
}

/** Same grid as the home “My projects” section — create tile + project tiles. */
export function ProjectCardsGrid() {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    function refresh() {
      setProjects(listSavedProjects());
    }
    refresh();
    window.addEventListener("mindnow:saved-projects-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mindnow:saved-projects-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

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
          previewSrcs={cardPreviewSrcs(p)}
          projectId={p.id}
        />
      ))}
    </div>
  );
}
