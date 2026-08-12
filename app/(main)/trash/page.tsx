import { TrashCardsGrid } from "@/components/trash-cards-grid";

export default function TrashPage() {
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

          <TrashCardsGrid />
        </section>
      </div>
    </div>
  );
}
