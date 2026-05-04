import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProjectProductCardProps = {
  title: string;
  /** Number of visuals in this project (badge next to the title, right-aligned). */
  visualCount: number;
  className?: string;
};

/**
 * Product-style project tile: gray media placeholder, title row with visual-count
 * badge aligned to the right.
 */
export function ProjectProductCard({
  title,
  visualCount,
  className,
}: ProjectProductCardProps) {
  const visualBadgeLabel = `${visualCount} ${visualCount === 1 ? "visual" : "visuals"} in this project`;

  return (
    <Card
      className={cn(
        "flex h-full min-h-0 flex-col gap-0 overflow-hidden py-0 ring-zinc-800/80 transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 bg-zinc-800">
        <span className="sr-only">Project preview placeholder image</span>
      </div>

      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 p-[16px]">
        <CardTitle className="min-w-0 flex-1 text-left line-clamp-2">
          {title}
        </CardTitle>
        <Badge
          variant="secondary"
          aria-label={visualBadgeLabel}
          className="h-6 shrink-0 tabular-nums border-zinc-700 bg-zinc-800/90 px-2.5 text-xs font-medium text-zinc-200"
        >
          {visualCount} {visualCount === 1 ? "visual" : "visuals"}
        </Badge>
      </CardHeader>
    </Card>
  );
}
