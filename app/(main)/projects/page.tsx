import { ProjectCardsGrid } from "@/components/project-cards-grid";

export default function ProjectsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="w-full flex-1 px-[72px] py-10">
        <section
          aria-labelledby="projects-page-heading"
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2">
            <h1
              id="projects-page-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
            >
              Projects
            </h1>
          </div>

          <ProjectCardsGrid />
        </section>
      </div>
    </div>
  );
}
