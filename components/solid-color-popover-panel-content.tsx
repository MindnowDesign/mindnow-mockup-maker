"use client";

import { CanvasSolidColorPopoverPanel } from "@/components/canvas-solid-color-popover-panel";

export const solidColorPopoverContentClass =
  "w-[min(100vw-2rem,280px)] border-zinc-700 bg-zinc-900 p-3 shadow-xl ring-1 ring-zinc-700 text-zinc-100";

/** Gradient fill draggable picker only (+20% vs standard popover width). */
export const draggableColorPopoverContentClass =
  "w-[min(100vw-2rem,336px)] border-zinc-700 bg-zinc-900 p-3 shadow-xl ring-1 ring-zinc-700 text-zinc-100";

export const DRAGGABLE_COLOR_PICKER_PANEL_SIZE = {
  width: 336,
  height: 296,
} as const;

type SolidColorPopoverPanelContentProps = {
  displayHex: string;
  onColorChange: (hex: string) => void;
  popoverOpen: boolean;
  triggerAriaLabel: string;
  /** Template fill draggable picker only — opacity in the HEX/HSB row. */
  fillOpacityPercent?: number;
  onFillOpacityPercentChange?: (percent: number) => void;
};

/** Shared color picker body — `CanvasSolidColorPopoverPanel`. */
export function SolidColorPopoverPanelContent({
  displayHex,
  onColorChange,
  popoverOpen,
  triggerAriaLabel,
  fillOpacityPercent,
  onFillOpacityPercentChange,
}: SolidColorPopoverPanelContentProps) {
  return (
    <CanvasSolidColorPopoverPanel
      color={displayHex}
      onChange={onColorChange}
      popoverOpen={popoverOpen}
      opacityPercent={fillOpacityPercent}
      onOpacityPercentChange={onFillOpacityPercentChange}
      opacityInputAriaLabel={`${triggerAriaLabel} opacity`}
    />
  );
}
