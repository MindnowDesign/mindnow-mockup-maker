"use client";

import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="relative aspect-[4/3] w-full shrink-0 bg-zinc-800">
          {previewSrc ? (
            <Image
              src={previewSrc}
              alt=""
              fill
              className="object-cover"
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <span className="sr-only">Project preview placeholder image</span>
          )}
        </div>

        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 p-[16px]">
          <CardTitle className="min-w-0 flex-1 text-left line-clamp-2">
            {title}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-2">
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
                      className="text-red-400 focus:bg-red-500/15 focus:text-red-300"
                      onSelect={() => {
                        deleteSavedProject(projectId);
                        notifySavedProjectsChanged();
                        if (pathname === `/projects/${projectId}`) {
                          router.push("/projects");
                        }
                      }}
                    >
                      Deletar
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
