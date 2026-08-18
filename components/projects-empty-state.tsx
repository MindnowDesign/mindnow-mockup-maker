import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Dashed empty state used on Home and Projects when nothing is saved yet. */
export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-800 px-6 py-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- static empty-state asset */}
      <img
        src="/images/empty-states/projects.png?v=2"
        alt=""
        aria-hidden
        draggable={false}
        className="size-[120px] object-contain"
      />
      <p className="text-lg font-semibold tracking-tight text-foreground">
        No projects yet
      </p>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Create a project to start building mockups. Your work will show up
        here.
      </p>
      <Button asChild className="mt-1 h-10">
        <Link href="/projects/new">
          <Plus data-icon="inline-start" strokeWidth={1.75} aria-hidden />
          Create new project
        </Link>
      </Button>
    </div>
  );
}
