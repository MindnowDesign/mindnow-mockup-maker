"use client";

import { useEffect, useState } from "react";

import { RecentVisualCard } from "@/components/recent-visual-card";
import { formatEditedAgo } from "@/lib/format-edited-ago";
import { listRecentVisuals, type RecentVisualEntry } from "@/lib/recent-visuals";

/** Home “Recent visuals” grid — one tile per edited visual across all projects. */
export function RecentVisualsGrid() {
  const [visuals, setVisuals] = useState<RecentVisualEntry[]>([]);

  useEffect(() => {
    function refresh() {
      setVisuals(listRecentVisuals());
    }
    refresh();
    window.addEventListener("mindnow:saved-projects-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mindnow:saved-projects-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (visuals.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visuals.map((v) => (
        <RecentVisualCard
          key={`${v.projectId}:${v.visualId}`}
          title={v.title}
          editedLabel={formatEditedAgo(v.updatedAt)}
          href={v.href}
          previewSlide={v.previewSlide}
        />
      ))}
    </div>
  );
}
