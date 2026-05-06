"use client";

import Link from "next/link";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

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
import {
  deleteSavedProject,
  notifySavedProjectsChanged,
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
  /** When set, shows the overflow menu (e.g. delete). */
  projectId?: string;
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
  projectId,
}: ProjectProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const visualBadgeLabel = `${visualCount} ${visualCount === 1 ? "visual" : "visuals"} in this project`;

  const card = (
    <Card
      className={cn(
        "flex h-full min-h-0 flex-col gap-0 overflow-hidden py-0 ring-zinc-800/80 transition-shadow hover:shadow-md",
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
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- PNG data URLs from saved projects; layout needs object-contain like design reference
              <img
                src={previewSrc}
                alt=""
                className="max-h-full max-w-full object-contain object-center rounded-[8px]"
                draggable={false}
              />
            ) : (
              <span className="sr-only">Project preview placeholder image</span>
            )}
          </div>
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
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      className="gap-2 text-red-400 focus:bg-red-500/15 focus:text-red-300"
                      onSelect={() => {
                        deleteSavedProject(projectId);
                        notifySavedProjectsChanged();
                        if (pathname === `/projects/${projectId}`) {
                          router.push("/projects");
                        }
                      }}
                    >
                      <Trash2 className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                      Delete
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
