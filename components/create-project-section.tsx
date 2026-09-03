import { Plus } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Home CTA tile to start a new project — same slot size as project cards. */
export function CreateProjectSection() {
  return (
    <Link
      href="/projects/new"
      className={cn(
        "flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/30 p-4 text-center",
        "outline-none transition-colors hover:border-neutral-600/90 hover:bg-neutral-900/50",
        "focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
      )}
    >
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#F6AF7B]/20"
        aria-hidden
      >
        <Plus className="size-5 text-[#F6AF7B]" strokeWidth={2} />
      </span>

      <div className="flex max-w-md flex-col gap-2">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          Create a new project
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Start from a blank canvas. Drop or paste screenshots and videos to
          build device mockups.
        </p>
      </div>

      <span
        className={cn(buttonVariants({ size: "sm" }), "mt-1 pointer-events-none")}
      >
        <Plus data-icon="inline-start" strokeWidth={1.75} aria-hidden />
        Create project
      </span>
    </Link>
  );
}
