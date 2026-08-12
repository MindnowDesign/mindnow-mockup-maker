"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
import { isSafeProjectNextHref } from "@/lib/resolve-open-href";
import {
  emptyTrash,
  listTrashedProjects,
  notifySavedProjectsChanged,
  restoreProject,
  type SavedProject,
} from "@/lib/saved-projects";
import { cn } from "@/lib/utils";

type TrashCardsGridProps = {
  /** Project to highlight when arriving from a recent search / deep link. */
  focusProjectId?: string;
  /** After Restore, continue to this project/visual href when safe. */
  nextHref?: string;
};

/** Trashed projects — same tiles as `/projects`, with restore / permanent delete. */
export function TrashCardsGrid({
  focusProjectId,
  nextHref,
}: TrashCardsGridProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const focusRef = useRef<HTMLDivElement | null>(null);

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

  const focusedProject =
    focusProjectId != null
      ? projects.find((p) => p.id === focusProjectId)
      : undefined;

  useEffect(() => {
    if (!focusedProject || !focusRef.current) return;
    focusRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [focusedProject]);

  function handleRestoreFocused() {
    if (!focusProjectId) return;
    restoreProject(focusProjectId);
    notifySavedProjectsChanged();

    if (isSafeProjectNextHref(nextHref)) {
      router.push(nextHref);
      return;
    }

    router.replace("/trash");
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 px-6 py-16 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- static empty-state asset */}
        <img
          src="/images/empty-states/trash.png"
          alt=""
          aria-hidden
          draggable={false}
          className="size-[120px] object-contain"
        />
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
      {focusedProject ? (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-medium text-zinc-100">
              This project is in Trash
            </p>
            <p className="truncate text-sm text-muted-foreground">
              Restore “{focusedProject.title}” to open it again.
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0"
            onClick={handleRestoreFocused}
          >
            <RotateCcw data-icon="inline-start" strokeWidth={1.75} aria-hidden />
            Restore
          </Button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
            >
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
        {projects.map((p) => {
          const isFocused = p.id === focusProjectId;
          return (
            <div
              key={p.id}
              id={`trash-project-${p.id}`}
              ref={isFocused ? focusRef : undefined}
              className={cn(
                "rounded-xl transition-[box-shadow,ring-color]",
                isFocused &&
                  "ring-2 ring-white/35 ring-offset-2 ring-offset-zinc-950"
              )}
            >
              <ProjectProductCard
                title={p.title}
                visualCount={p.visualCount}
                editedLabel={`Trashed ${formatTimeAgo(p.trashedAt ?? p.updatedAt)}`}
                previewSrc={p.previewDataUrl || null}
                previewSlides={projectCardPreviewSlides(p)}
                projectId={p.id}
                trashed
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
