import { HeroGrainientBackground } from "@/components/hero-grainient-background";
import { ProjectCardsGrid } from "@/components/project-cards-grid";
import { RecentVisualsSection } from "@/components/recent-visuals-section";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="relative isolate h-[min(35.2vh,320px)] w-full shrink-0 overflow-hidden bg-zinc-900">
        <HeroGrainientBackground />
      </header>

      <div className="w-full flex-1 space-y-[72px] px-[72px] pt-[72px] pb-10">
        <RecentVisualsSection />

        <section
          aria-labelledby="projects-heading"
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2">
            <h2
              id="projects-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
            >
              Projects
            </h2>
          </div>

          <ProjectCardsGrid />
        </section>
      </div>
    </div>
  );
}
