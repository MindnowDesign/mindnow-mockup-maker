import Link from "next/link";

import { ProjectCardSlidePreview } from "@/components/project-card-slide-preview";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectCardPreviewSlide } from "@/lib/project-card-preview-slides";
import { cn } from "@/lib/utils";

export type RecentVisualCardProps = {
  title: string;
  /** e.g. "Edited 1 hour ago" */
  editedLabel: string;
  /** Opens the parent project with this visual selected. */
  href: string;
  previewSlide?: ProjectCardPreviewSlide | null;
  className?: string;
};

/**
 * Tile for the Recent visuals grid: preview, title, edit timestamp — no visual-count badge.
 */
export function RecentVisualCard({
  title,
  editedLabel,
  href,
  previewSlide,
  className,
}: RecentVisualCardProps) {
  return (
    <Card
      className={cn(
        "relative flex h-full w-full min-h-0 flex-col gap-0 overflow-hidden py-0 ring-0 border border-zinc-800/80 transition-colors hover:border-zinc-600/90",
        className
      )}
    >
      <Link
        href={href}
        className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        aria-label={`Open visual: ${title}`}
      />

      <div className="relative z-[2] aspect-[4/3] w-full shrink-0 bg-zinc-950 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
          {previewSlide ? (
            <ProjectCardSlidePreview slide={previewSlide} pageLabel={title} />
          ) : (
            <span className="sr-only">Recent visual preview placeholder image</span>
          )}
        </div>
      </div>

      <CardHeader className="relative z-[2] gap-1 border-b border-border/50 p-[16px] pointer-events-none">
        <CardTitle className="text-left line-clamp-2">{title}</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          {editedLabel}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
