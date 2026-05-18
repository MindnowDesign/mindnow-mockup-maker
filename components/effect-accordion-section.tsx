"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import type { CanvasStyleIconProps } from "@/components/canvas-style-icons";
import { cn } from "@/lib/utils";

export function EffectAccordionSection({
  sectionId,
  label,
  Icon,
  open,
  onToggle,
  children,
  /** When open: `collapse` shows minus (fold); `remove` shows trash (clear effect). */
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
  const triggerId = `${sectionId}-trigger`;
  const panelId = `${sectionId}-panel`;

  const trailingOpenIcon =
    openTrailingIcon === "remove" ? (
      <Trash2 className="size-4 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
    ) : (
      <Minus className="size-4 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
    );

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        title={
          openTrailingIcon === "remove"
            ? open
              ? "Remove effect"
              : "Add effect"
            : undefined
        }
        className={cn(
          "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left outline-none transition-colors",
          "hover:bg-zinc-900/80 focus-visible:ring-2 focus-visible:ring-white/25"
        )}
      >
        <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-100">
          <Icon className="size-3.5 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
          {label}
        </span>
        {open ? (
          trailingOpenIcon
        ) : (
          <Plus className="size-4 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
        )}
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="space-y-3 border-t border-zinc-800 px-3 pb-3 pt-3"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
