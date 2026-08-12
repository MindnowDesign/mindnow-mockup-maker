import { TrashCardsGrid } from "@/components/trash-cards-grid";

type TrashPageProps = {
  searchParams: Promise<{
    focus?: string | string[];
    next?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function TrashPage({ searchParams }: TrashPageProps) {
  const params = await searchParams;
  const focusProjectId = firstParam(params.focus)?.trim() || undefined;
  const nextHref = firstParam(params.next)?.trim() || undefined;

  return (
    <div className="flex min-h-full flex-col">
      <div className="w-full flex-1 px-[72px] py-10">
        <section
          aria-labelledby="trash-page-heading"
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2">
            <h1
              id="trash-page-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
            >
              Trash
            </h1>
          </div>

          <TrashCardsGrid
            focusProjectId={focusProjectId}
            nextHref={nextHref}
          />
        </section>
      </div>
    </div>
  );
}
