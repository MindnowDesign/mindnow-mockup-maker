import { Plus } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type StartFromScratchCardProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** Defaults to `/projects/new`. */
  href?: ComponentProps<typeof Link>["href"];
};

/**
 * CTA tile (not a two-part project card): one surface, same footprint as
 * {@link ProjectProductCard} — ~4:3 preview height + title-row band via `min-height`.
 */
export function StartFromScratchCard({
  className,
  href = "/projects/new",
  ...rest
}: StartFromScratchCardProps) {
  return (
    <div
      className={cn("@container h-full min-h-0 w-full max-w-full", className)}
    >
      <Link
        href={href}
        {...rest}
        className={cn(
          "group flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl px-6 py-10 outline-none transition-[background-color,box-shadow]",
          /* Match project card total height: 4:3 block + ~57px header strip at this width */
          "min-h-[calc(75cqw+57px)]",
          "bg-zinc-800 ring-1 ring-zinc-800/80 hover:bg-zinc-700/85 hover:shadow-md",
          "focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        )}
      >
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-500 bg-zinc-900/35 transition-colors group-hover:border-zinc-400"
          aria-hidden
        >
          <Plus
            className="size-7 text-foreground transition-transform group-hover:scale-105"
            strokeWidth={2}
          />
        </span>
        <span className="text-center text-base font-semibold tracking-tight text-foreground">
          Create new project
        </span>
      </Link>
    </div>
  );
}
