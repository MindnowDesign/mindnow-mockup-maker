"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ProjectCardSlidePreview } from "@/components/project-card-slide-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectCardPreviewSlide } from "@/lib/project-card-preview-slides";
import {
  deleteSavedProject,
  notifySavedProjectsChanged,
  restoreProject,
  trashProject,
} from "@/lib/saved-projects";
import { cn } from "@/lib/utils";

export type ProjectProductCardProps = {
  title: string;
  /** Number of visuals in this project (badge next to the title, right-aligned). */
  visualCount: number;
  /** e.g. "Edited 2 hours ago" — shown under the title. */
  editedLabel?: string;
  className?: string;
  /** Opens this project in the workspace. */
  href?: string;
  /** Last saved canvas preview (often a PNG data URL). */
  previewSrc?: string | null;
  /** @deprecated Prefer `previewSlides` — one entry per visual slot. */
  previewSrcs?: string[] | null;
  /** One slide per visual (workspace order); enables hover arrows when length > 1. */
  previewSlides?: ProjectCardPreviewSlide[];
  /** When set, shows the overflow menu (e.g. delete). */
  projectId?: string;
  /** Trash tile: swaps the menu for restore / permanent delete. */
  trashed?: boolean;
};

/**
 * Product-style project tile: preview thumbnail, title row with visual-count
 * badge aligned to the right.
 */
export function ProjectProductCard({
  title,
  visualCount,
  editedLabel,
  className,
  href,
  previewSrc,
  previewSrcs,
  previewSlides,
  projectId,
  trashed = false,
}: ProjectProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const visualBadgeLabel = `${visualCount} ${visualCount === 1 ? "visual" : "visuals"} in this project`;

  const slides = useMemo((): ProjectCardPreviewSlide[] => {
    if (previewSlides?.length) return previewSlides;
    const legacyUrls = previewSrcs?.filter((u) => u && u.length > 0) ?? [];
    const urls =
      legacyUrls.length > 0
        ? legacyUrls
        : previewSrc
          ? [previewSrc]
          : [];
    return urls.map((captureSrc, i) => ({
      visualId: `legacy-${i}`,
      captureSrc,
      canvasBackground: null,
      mediaDataUrl: null,
    }));
  }, [previewSlides, previewSrcs, previewSrc]);

  const [previewIdx, setPreviewIdx] = useState(0);
  const n = slides.length;
  const activeSlide =
    n > 0 ? slides[((previewIdx % n) + n) % n]! : null;
  const showPreviewSwitcher = slides.length > 1;
  const previewPageLabel =
    slides.length > 1
      ? `Preview ${previewIdx + 1} of ${slides.length}`
      : undefined;

  const card = (
    <Card
      className={cn(
        "group/card flex h-full min-h-0 flex-col gap-0 overflow-hidden py-0 ring-0 border border-zinc-800/80 transition-colors hover:border-zinc-600/90",
        href && "relative",
        className
      )}
    >
      {href ? (
        <Link
          href={href}
          className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          aria-label={`Open project: ${title}`}
        />
      ) : null}

      <div
        className={cn(
          "relative z-[2] flex min-h-0 flex-1 flex-col",
          href && "pointer-events-none"
        )}
      >
        <div className="relative aspect-[4/3] w-full shrink-0 bg-zinc-950">
          <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
            {activeSlide ? (
              <ProjectCardSlidePreview
                slide={activeSlide}
                pageLabel={previewPageLabel}
              />
            ) : (
              <span className="sr-only">Project preview placeholder image</span>
            )}
          </div>
          {showPreviewSwitcher ? (
            <>
              <div className="pointer-events-auto absolute left-2 top-1/2 z-[3] -translate-y-1/2 opacity-0 group-hover/card:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-full border border-white/10 bg-black/45 text-white shadow-md backdrop-blur-sm hover:bg-black/60"
                  aria-label="Previous canvas preview"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreviewIdx((i) => (i - 1 + n) % n);
                  }}
                >
                  <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
                </Button>
              </div>
              <div className="pointer-events-auto absolute right-2 top-1/2 z-[3] -translate-y-1/2 opacity-0 group-hover/card:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-full border border-white/10 bg-black/45 text-white shadow-md backdrop-blur-sm hover:bg-black/60"
                  aria-label="Next canvas preview"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreviewIdx((i) => (i + 1) % n);
                  }}
                >
                  <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
                </Button>
              </div>
            </>
          ) : null}
        </div>

        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/50 p-[16px]">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-left line-clamp-2">{title}</CardTitle>
            {editedLabel ? (
              <CardDescription className="text-xs leading-relaxed text-zinc-500">
                {editedLabel}
              </CardDescription>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            <Badge
              variant="secondary"
              aria-label={visualBadgeLabel}
              className="h-6 shrink-0 tabular-nums border-zinc-700 bg-zinc-800/90 px-2.5 text-xs font-medium text-zinc-200"
            >
              {visualCount} {visualCount === 1 ? "visual" : "visuals"}
            </Badge>
            {projectId ? (
              <div className="pointer-events-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-zinc-400 hover:bg-white/10 hover:text-white"
                      aria-label="Project actions"
                      aria-haspopup="menu"
                    >
                      <MoreHorizontal className="size-4" strokeWidth={2} aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {trashed ? (
                      <DropdownMenuItem
                        className="gap-2"
                        onSelect={() => {
                          restoreProject(projectId);
                          notifySavedProjectsChanged();
                        }}
                      >
                        <RotateCcw className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                        Restore
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      className="gap-2 text-red-400 focus:bg-red-500/15 focus:text-red-300"
                      onSelect={() => {
                        if (trashed) {
                          deleteSavedProject(projectId);
                        } else {
                          trashProject(projectId);
                        }
                        notifySavedProjectsChanged();
                        if (!trashed && pathname === `/projects/${projectId}`) {
                          router.push("/projects");
                        }
                      }}
                    >
                      <Trash2 className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                      {trashed ? "Delete permanently" : "Move to Trash"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null}
          </div>
        </CardHeader>
      </div>
    </Card>
  );

  if (href) {
    return (
      <div className="h-full min-h-0">
        {card}
      </div>
    );
  }

  return card;
}
