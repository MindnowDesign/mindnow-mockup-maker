"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CreateProjectSection } from "@/components/create-project-section";
import { ProjectProductCard } from "@/components/project-product-card";
import { ProjectsEmptyState } from "@/components/projects-empty-state";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNavigation,
  useCarousel,
} from "@/components/ui/carousel";
import { formatEditedAgo } from "@/lib/format-edited-ago";
import { projectCardPreviewSlides } from "@/lib/project-card-preview-slides";
import { listSavedProjects, type SavedProject } from "@/lib/saved-projects";
import { cn } from "@/lib/utils";

const LAST_PROJECTS_LIMIT = 5;
const carouselItemClass =
  "basis-full overflow-visible pl-4 @[420px]:basis-1/2 @[720px]:basis-1/3 @[1100px]:basis-1/4";

const navButtonClass = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
  "border border-white/10 bg-black/45 p-0 shadow-md backdrop-blur-sm",
  "hover:bg-black/60 disabled:pointer-events-none disabled:opacity-30",
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-neutral-50"
);

function LastProjectsNav() {
  const { itemsCount, visibleItemsCount } = useCarousel();
  if (itemsCount <= visibleItemsCount) return null;

  return (
    <CarouselNavigation
      className="relative left-auto top-auto ml-auto flex w-auto shrink-0 translate-y-0 items-center justify-end gap-2 px-0"
      classNameButton={navButtonClass}
      alwaysShow
    />
  );
}

/** Recent projects as product cards — carousel when more than a page fits. */
export function LastProjectsList() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function refresh() {
      setProjects(listSavedProjects().slice(0, LAST_PROJECTS_LIMIT));
    }
    refresh();
    setHydrated(true);
    window.addEventListener("mindnow:saved-projects-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mindnow:saved-projects-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (hydrated && projects.length === 0) {
    return (
      <>
        <h2 id="last-projects-heading" className="sr-only">
          Last Projects
        </h2>
        <ProjectsEmptyState />
      </>
    );
  }

  return (
    <Carousel disableDrag className="flex min-w-0 flex-col">
      <div className="flex flex-col gap-4">
        <div className="flex min-h-9 items-center justify-between gap-4">
          <Link
            href="/projects"
            className="inline-flex w-fit items-center gap-2 rounded-sm text-foreground outline-none transition-colors hover:text-neutral-300 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            <h2
              id="last-projects-heading"
              className="text-base font-semibold tracking-tight"
            >
              Last Projects
            </h2>
            <ChevronRight
              className="size-4 shrink-0"
              strokeWidth={2}
              aria-hidden
            />
          </Link>

          <LastProjectsNav />
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Last projects"
          className="@container min-w-0 overflow-hidden"
        >
          <CarouselContent className="-ml-4 items-stretch">
            <CarouselItem className={carouselItemClass}>
              <CreateProjectSection />
            </CarouselItem>
            {projects.map((project) => (
              <CarouselItem key={project.id} className={carouselItemClass}>
                <ProjectProductCard
                  title={project.title}
                  visualCount={project.visualCount}
                  editedLabel={formatEditedAgo(project.updatedAt)}
                  href={`/projects/${project.id}`}
                  previewSrc={project.previewDataUrl || null}
                  previewSlides={projectCardPreviewSlides(project)}
                  projectId={project.id}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </div>
    </Carousel>
  );
}
