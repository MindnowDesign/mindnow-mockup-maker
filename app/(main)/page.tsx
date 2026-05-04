import Image from "next/image";

/** Hero visual — abstract studio-style artwork (Screenhance-like mood). */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=85&auto=format&fit=crop";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="relative isolate h-[min(44vh,400px)] w-full shrink-0 overflow-hidden bg-zinc-900">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 from-25% via-zinc-950/30 to-transparent"
          aria-hidden
        />
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 space-y-16 px-6 py-10 md:px-10">
        <section aria-labelledby="recent-visuals-heading">
          <div className="flex flex-col gap-2 border-b border-border/60 pb-8">
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

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No recent visuals
              </p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Generate or upload visuals to see them in this list.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="projects-heading">
          <div className="flex flex-col gap-2 border-b border-border/60 pb-8">
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

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No projects yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Create a project to see it listed here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
