"use client";

import { RotateCcw } from "lucide-react";

import { SolidColorPopoverRow } from "@/components/solid-color-popover-row";
import { useMockupFrame } from "@/components/mockup-frame-context";
import {
  GRADIENT_1_FILL_KEYS,
  GRADIENT_1_FILL_LABELS,
  type Gradient1FillKey,
} from "@/lib/canvas-gradient-1-fill";
import { cn } from "@/lib/utils";

type CanvasGradientFillPaletteBarProps = {
  /** Must match the `--cbg-*` values on the inline gradient SVG (normalized hex). */
  displayFills: Record<Gradient1FillKey, string>;
};

export function CanvasGradientFillPaletteBar({
  displayFills,
}: CanvasGradientFillPaletteBarProps) {
  const {
    canvasGradientTemplateId,
    patchCanvasGradientFillKey,
    resetCanvasGradientFillToDefaults,
  } = useMockupFrame();

  if (canvasGradientTemplateId !== "gradient-1") {
    return null;
  }

  return (
    <div className="flex w-full max-w-full min-w-0 flex-wrap items-center justify-start gap-2 px-1 py-2">
      <div className="flex flex-wrap items-center justify-start gap-1.5">
        {GRADIENT_1_FILL_KEYS.map((key) => (
          <SolidColorPopoverRow
            key={key}
            variant="swatch"
            displayHex={displayFills[key]}
            onColorChange={(hex) => patchCanvasGradientFillKey(key, hex)}
            triggerAriaLabel={GRADIENT_1_FILL_LABELS[key]}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={resetCanvasGradientFillToDefaults}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-400 outline-none transition-colors",
          "hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100",
          "focus-visible:ring-2 focus-visible:ring-white/25"
        )}
        title="Reset gradient colors"
        aria-label="Reset gradient colors to defaults"
      >
        <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
