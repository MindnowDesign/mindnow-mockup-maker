import Image from "next/image";

import { ProjectCardsGrid } from "@/components/project-cards-grid";
import { RecentVisualsGrid } from "@/components/recent-visuals-grid";

/** Hero — `public/images/hero_image.png`. */
const HERO_IMAGE = "/images/hero_image.png";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="relative isolate h-[min(44vh,400px)] w-full shrink-0 overflow-hidden bg-zinc-900">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 from-25% via-zinc-950/30 to-transparent"
          aria-hidden
        />
      </header>

      <div className="w-full flex-1 space-y-[72px] px-[72px] py-10">
        <section
          aria-labelledby="recent-visuals-heading"
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2">
            <h1
              id="recent-visuals-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
            >
              Recent visuals
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Screenshots and exports you have worked on recently will show up here.
            </p>
          </div>

          <RecentVisualsGrid />
        </section>

        <section
          aria-labelledby="projects-heading"
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2">
            <h2
              id="projects-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
            >
              My projects
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Organize and open your mockups. New projects will appear here when you
              create them.
            </p>
          </div>

          <ProjectCardsGrid />
        </section>
      </div>
    </div>
  );
}
