"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ProjectProductCard } from "@/components/project-product-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { projectCardPreviewSlides } from "@/lib/project-card-preview-slides";
import {
  emptyTrash,
  listTrashedProjects,
  notifySavedProjectsChanged,
  type SavedProject,
} from "@/lib/saved-projects";

/** Trashed projects — same tiles as `/projects`, with restore / permanent delete. */
export function TrashCardsGrid() {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    function refresh() {
      setProjects(listTrashedProjects());
    }
    refresh();
    window.addEventListener("mindnow:saved-projects-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mindnow:saved-projects-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 px-6 py-16 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
          <Trash2 className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="text-sm font-medium text-zinc-200">Trash is empty</p>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Projects you delete land here so you can restore them before removing
          them for good.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <Trash2 data-icon="inline-start" strokeWidth={1.75} aria-hidden />
              Empty trash
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Empty trash?</DialogTitle>
              <DialogDescription>
                This permanently deletes {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}. This cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    emptyTrash();
                    notifySavedProjectsChanged();
                  }}
                >
                  Delete permanently
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectProductCard
            key={p.id}
            title={p.title}
            visualCount={p.visualCount}
            editedLabel={`Trashed ${formatTimeAgo(p.trashedAt ?? p.updatedAt)}`}
            previewSrc={p.previewDataUrl || null}
            previewSlides={projectCardPreviewSlides(p)}
            projectId={p.id}
            trashed
          />
        ))}
      </div>
    </div>
  );
}
