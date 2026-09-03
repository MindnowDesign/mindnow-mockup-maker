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

function SectionHeaderLabel({
  label,
  Icon,
  active,
}: {
  label: string;
  Icon: React.ComponentType<CanvasStyleIconProps>;
  active: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2 text-left text-neutral-100">
      <Icon
        className="size-3.5 shrink-0 text-neutral-400"
        strokeWidth={2}
        aria-hidden
      />
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate">{label}</span>
        {active ? (
          <span
            className="size-1.5 shrink-0 rounded-full bg-orange-300"
            aria-hidden
          />
        ) : null}
      </span>
    </span>
  );
}

function SectionToggleSwitch({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`${enabled ? "Disable" : "Enable"} ${label}`}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
        enabled
          ? "border-orange-300/80 bg-orange-300/90"
          : "border-neutral-600 bg-neutral-800"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none block size-2.5 rounded-full bg-white shadow-sm transition-transform",
          enabled ? "translate-x-3.5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function EffectAccordionSection({
  sectionId,
  label,
  Icon,
  open = false,
  onToggle,
  children,
  /** Shows a light-orange dot after the label when applied to the canvas. */
  active = false,
  /** `toggle`: switch controls enabled state and detail panel visibility together. */
  variant = "accordion",
  enabled = false,
  onEnabledChange,
  /** When open: `collapse` uses chevron; `remove` shows trash (clear effect). */
  openTrailingIcon = "collapse",
}: {
  sectionId: string;
  label: string;
  Icon: React.ComponentType<CanvasStyleIconProps>;
  open?: boolean;
  onToggle?: () => void;
  children: ReactNode;
  active?: boolean;
  variant?: "accordion" | "toggle";
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  openTrailingIcon?: "collapse" | "remove";
}) {
  const showRemoveIcon = openTrailingIcon === "remove" && open;

  if (variant === "toggle") {
    return (
      <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium">
          <SectionHeaderLabel label={label} Icon={Icon} active={false} />
          <SectionToggleSwitch
            enabled={enabled}
            onChange={(next) => onEnabledChange?.(next)}
            label={label}
          />
        </div>
        {enabled ? (
          <div className="space-y-3 border-t border-neutral-800 px-3 pb-3 pt-3 text-neutral-100">
            {children}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={open ? sectionId : ""}
      onValueChange={(value) => {
        const nextOpen = value === sectionId;
        if (nextOpen !== open) onToggle?.();
      }}
      className="w-full"
    >
      <AccordionItem
        value={sectionId}
        className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 not-last:border-b-neutral-800"
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
            "items-center gap-2 rounded-none border-0 px-3 py-2.5 text-xs font-medium hover:bg-neutral-900/80 hover:no-underline",
            "focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-0",
            "[&_[data-slot=accordion-trigger-icon]]:text-neutral-400",
            showRemoveIcon && "[&_[data-slot=accordion-trigger-icon]]:hidden"
          )}
        >
          <SectionHeaderLabel label={label} Icon={Icon} active={active} />
          {showRemoveIcon ? (
            <Trash2
              className="size-4 shrink-0 text-neutral-400"
              strokeWidth={2}
              aria-hidden
            />
          ) : null}
        </AccordionTrigger>
        <AccordionContent className="border-t border-neutral-800 px-3 pb-3 pt-3 text-neutral-100">
          <div className="space-y-3">{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
