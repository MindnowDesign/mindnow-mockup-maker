import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type RecentVisualCardProps = {
  title: string;
  /** e.g. "Edited 1 hour ago" */
  editedLabel: string;
  className?: string;
};

/**
 * Tile for the Recent visuals grid: preview placeholder, title, edit timestamp — no visual-count badge.
 */
export function RecentVisualCard({
  title,
  editedLabel,
  className,
}: RecentVisualCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col gap-0 overflow-hidden py-0 ring-zinc-800/80 transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 bg-zinc-800">
        <span className="sr-only">Recent visual preview placeholder image</span>
      </div>

      <CardHeader className="gap-1 border-b border-border/50 p-[16px]">
        <CardTitle className="text-left line-clamp-2">{title}</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          {editedLabel}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
