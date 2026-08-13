import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Home CTA card to start a new project — centered, neutral surfaces. */
export function CreateProjectSection() {
  return (
    <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-neutral-800/80 bg-neutral-900/30 px-8 py-16 text-center">
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-neutral-800"
        aria-hidden
      >
        <Plus className="size-5 text-foreground" strokeWidth={2} />
      </span>

      <div className="flex max-w-md flex-col gap-2">
        <p className="text-xl font-semibold tracking-tight text-foreground">
          Create a new project
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Start from a blank canvas. Drop or paste screenshots and videos to
          build device mockups.
        </p>
      </div>

      <Button asChild variant="outline" className="mt-1 h-10 px-4">
        <Link href="/projects/new">
          <Plus data-icon="inline-start" strokeWidth={1.75} aria-hidden />
          Start building
        </Link>
      </Button>
    </div>
  );
}
