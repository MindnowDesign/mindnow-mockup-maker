"use client";

import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import type { CanvasStyleIconProps } from "@/components/canvas-style-icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function EffectAccordionSection({
  sectionId,
  label,
  Icon,
  open,
  onToggle,
  children,
  /** When open: `collapse` uses chevron; `remove` shows trash (clear effect). */
  openTrailingIcon = "collapse",
}: {
  sectionId: string;
  label: string;
  Icon: React.ComponentType<CanvasStyleIconProps>;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  openTrailingIcon?: "collapse" | "remove";
}) {
  const showRemoveIcon = openTrailingIcon === "remove" && open;

  return (
    <Accordion
      type="single"
      collapsible
      value={open ? sectionId : ""}
      onValueChange={(value) => {
        const nextOpen = value === sectionId;
        if (nextOpen !== open) onToggle();
      }}
      className="w-full"
    >
      <AccordionItem
        value={sectionId}
        className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 not-last:border-b-zinc-800"
      >
        <AccordionTrigger
          title={
            openTrailingIcon === "remove"
              ? open
                ? "Remove effect"
                : "Add effect"
              : undefined
          }
          className={cn(
            "items-center gap-2 rounded-none border-0 px-3 py-2.5 text-xs font-medium hover:bg-zinc-900/80 hover:no-underline",
            "focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-0",
            "[&_[data-slot=accordion-trigger-icon]]:text-zinc-400",
            showRemoveIcon && "[&_[data-slot=accordion-trigger-icon]]:hidden"
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 text-left text-zinc-100">
            <Icon
              className="size-3.5 shrink-0 text-zinc-400"
              strokeWidth={2}
              aria-hidden
            />
            {label}
          </span>
          {showRemoveIcon ? (
            <Trash2
              className="size-4 shrink-0 text-zinc-400"
              strokeWidth={2}
              aria-hidden
            />
          ) : null}
        </AccordionTrigger>
        <AccordionContent className="border-t border-zinc-800 px-3 pb-3 pt-3 text-zinc-100">
          <div className="space-y-3">{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
