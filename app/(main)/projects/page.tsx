import { Plus } from "lucide-react";
import Link from "next/link";

import { ProjectCardsGrid } from "@/components/project-cards-grid";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="w-full flex-1 px-[72px] py-10">
        <section
          aria-labelledby="projects-page-heading"
          className="flex flex-col gap-8"
        >
          <div className="flex items-center justify-between gap-4">
            <h1
              id="projects-page-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
            >
              Projects
            </h1>
            <Link
              href="/projects/new"
              aria-label="Create new project"
              className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }))}
            >
              <Plus strokeWidth={1.75} aria-hidden />
            </Link>
          </div>

          <ProjectCardsGrid />
        </section>
      </div>
    </div>
  );
}
