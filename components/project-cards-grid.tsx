"use client";

import { ProjectProductCard } from "@/components/project-product-card";
import { formatEditedAgo } from "@/lib/format-edited-ago";
import { projectCardPreviewSlides } from "@/lib/project-card-preview-slides";
import type { SavedProject } from "@/lib/saved-projects";

/** Saved project tiles for `/projects`. */
export function ProjectCardsGrid({ projects }: { projects: SavedProject[] }) {
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
