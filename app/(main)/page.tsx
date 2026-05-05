import Image from "next/image";

import { ProjectProductCard } from "@/components/project-product-card";
import { RecentVisualCard } from "@/components/recent-visual-card";
import { StartFromScratchCard } from "@/components/start-from-scratch-card";

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

          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RecentVisualCard
              title="Hero mockup"
              editedLabel="Edited 1 hour ago"
            />
            <RecentVisualCard
              title="Checkout flow"
              editedLabel="Edited yesterday"
            />
            <RecentVisualCard
              title="Settings panel"
              editedLabel="Edited 3 days ago"
            />
            <RecentVisualCard
              title="Onboarding tour"
              editedLabel="Edited last week"
            />
          </div>
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

          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StartFromScratchCard aria-label="Create new project" />
            <ProjectProductCard title="Project Name" visualCount={4} />
            <ProjectProductCard title="Project Name" visualCount={12} />
          </div>
        </section>
      </div>
    </div>
  );
}
