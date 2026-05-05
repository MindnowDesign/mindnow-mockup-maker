import { Plus } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type StartFromScratchCardProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** Defaults to `/projects/new`. */
  href?: ComponentProps<typeof Link>["href"];
};

/**
 * Empty-state tile: dashed card with plus icon and “Create new project” label.
 * Navigates to the new-project workspace by default. Use in the same grid as project cards with `items-stretch`; fills cell height (`h-full`).
 */
export function StartFromScratchCard({
  className,
  href = "/projects/new",
  ...props
}: StartFromScratchCardProps) {
  return (
    <Link
      href={href}
      {...props}
      className={cn(
        "group flex h-full min-h-0 w-full cursor-pointer flex-col items-center justify-center gap-3 self-stretch rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        "border-zinc-600 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <Plus
        className="size-7 shrink-0 text-foreground transition-transform group-hover:scale-105"
        strokeWidth={2}
        aria-hidden
      />
      <span className="text-base font-semibold tracking-tight text-foreground">
        Create new project
      </span>
    </Link>
  );
}
