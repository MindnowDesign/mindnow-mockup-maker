"use client";

import { useRef, useState } from "react";

import { DraggableFloatingPopoverShell } from "@/components/draggable-floating-popover-shell";
import {
  SolidColorPopoverPanelContent,
  solidColorPopoverContentClass,
} from "@/components/solid-color-popover-panel-content";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OpacityPercentField } from "@/components/opacity-percent-field";
import { hexToRgbaCss } from "@/lib/canvas-gradient-fill-opacity";
import { cn } from "@/lib/utils";

const rowChrome =
  "rounded-lg border border-zinc-700 bg-zinc-950 outline-none transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-white/25";

const triggerButtonClass =
  "flex min-h-10 min-w-0 flex-1 items-center gap-1.5 px-2 text-left outline-none transition-colors hover:bg-zinc-900 focus-visible:bg-zinc-900";

const fieldTriggerClass =
  "box-border flex h-10 min-h-10 w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-left outline-none transition-colors hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-white/25";

const swatchTriggerClass =
  "box-border size-6 shrink-0 rounded border border-zinc-600 outline-none transition-colors hover:border-zinc-400 focus-visible:ring-2 focus-visible:ring-white/25";

export type SolidColorPopoverRowProps = {
  /**
   * `row` — divided sidebar bar (optional opacity). `field` — full-width trigger
   * (canvas solid / noise color). `swatch` — 24×24 swatch only (no hex row, no opacity).
   */
  variant?: "row" | "field" | "swatch";
  /** Merged onto outer wrapper (`field`: width; `row`: chrome row). */
  className?: string;
  /** Normalized `#RRGGBB` for swatch, trigger text, and picker `color`. */
  displayHex: string;
  onColorChange: (hex: string) => void;
  triggerAriaLabel: string;
  opacityPercent?: {
    value: number;
    onChange: (n: number) => void;
    inputAriaLabel: string;
  };
  /** Workspace gradient fill swatches only — draggable panel within canvas bounds. */
  popoverDraggable?: boolean;
  /** Template fill draggable picker only. */
  fillOpacityPercent?: number;
  onFillOpacityPercentChange?: (percent: number) => void;
};

/**
 * Solid color + popover: `row` = sidebar bar with optional opacity %; `field` =
 * full-width trigger (canvas solid / noise).
 */
export function SolidColorPopoverRow({
  variant = "row",
  className,
  displayHex,
  onColorChange,
  triggerAriaLabel,
  opacityPercent,
  popoverDraggable = false,
  fillOpacityPercent,
  onFillOpacityPercentChange,
}: SolidColorPopoverRowProps) {
  const [open, setOpen] = useState(false);
  const draggableTriggerRef = useRef<HTMLButtonElement>(null);

  const panelContent = (
    <SolidColorPopoverPanelContent
      displayHex={displayHex}
      onColorChange={onColorChange}
      popoverOpen={open}
      triggerAriaLabel={triggerAriaLabel}
      fillOpacityPercent={fillOpacityPercent}
      onFillOpacityPercentChange={onFillOpacityPercentChange}
    />
  );

  if (popoverDraggable && variant === "swatch") {
    return (
      <>
        <button
          ref={draggableTriggerRef}
          type="button"
          data-color-picker-trigger
          aria-label={triggerAriaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(swatchTriggerClass, className)}
          style={{
            backgroundColor: hexToRgbaCss(
              displayHex,
              fillOpacityPercent ?? 100
            ),
          }}
        />
        <DraggableFloatingPopoverShell
          open={open}
          onOpenChange={setOpen}
          triggerRef={draggableTriggerRef}
          ariaLabel={triggerAriaLabel}
        >
          {panelContent}
        </DraggableFloatingPopoverShell>
      </>
    );
  }

  const triggerClass =
    variant === "field" ? fieldTriggerClass : triggerButtonClass;

  const popover = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={triggerAriaLabel}
          aria-haspopup="dialog"
          className={
            variant === "swatch"
              ? cn(swatchTriggerClass, className)
              : triggerClass
          }
          style={
            variant === "swatch" ? { backgroundColor: displayHex } : undefined
          }
        >
          {variant === "swatch" ? null : (
            <>
              <span
                className="block size-5 shrink-0 rounded border border-zinc-600"
                style={{ backgroundColor: displayHex }}
              />
              <span className="min-w-0 truncate font-mono text-[11px] leading-none tabular-nums tracking-tight text-zinc-100">
                {displayHex.slice(1)}
              </span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className={solidColorPopoverContentClass}
      >
        {panelContent}
      </PopoverContent>
    </Popover>
  );

  if (variant === "field") {
    return <div className={cn("w-full min-w-0", className)}>{popover}</div>;
  }

  if (variant === "swatch") {
    return popover;
  }

  return (
    <div
      className={cn(
        "flex min-h-10 min-w-0 divide-x divide-zinc-700 overflow-hidden",
        rowChrome,
        className
      )}
    >
      {popover}
      {opacityPercent ? (
        <OpacityPercentField
          value={opacityPercent.value}
          onChange={opacityPercent.onChange}
          inputAriaLabel={opacityPercent.inputAriaLabel}
        />
      ) : null}
    </div>
  );
}
