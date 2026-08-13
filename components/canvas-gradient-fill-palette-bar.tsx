"use client";

import { RotateCcw } from "lucide-react";

import { SolidColorPopoverRow } from "@/components/solid-color-popover-row";
import { useMockupFrame } from "@/components/mockup-frame-context";
import {
  getGradientFillLabel,
  getGradientTemplateFillKeys,
  templateSupportsEditableGradientFills,
} from "@/lib/canvas-gradient-1-fill";
import { cn } from "@/lib/utils";

type CanvasGradientFillPaletteBarProps = {
  displayFills: Record<string, string>;
  displayOpacities: Record<string, number>;
};

export function CanvasGradientFillPaletteBar({
  displayFills,
  displayOpacities,
}: CanvasGradientFillPaletteBarProps) {
  const {
    canvasBackgroundMode,
    canvasGradientTemplateId,
    patchCanvasGradientFillKey,
    patchCanvasGradientFillOpacity,
    resetCanvasGradientFillToDefaults,
  } = useMockupFrame();

  if (
    canvasBackgroundMode !== "template" ||
    !templateSupportsEditableGradientFills(canvasGradientTemplateId)
  ) {
    return null;
  }

  const fillKeys = getGradientTemplateFillKeys(canvasGradientTemplateId);

  return (
    <div className="flex w-full max-w-full min-w-0 flex-wrap items-center justify-start gap-2 px-1 py-2">
      <div
        className="flex flex-wrap items-center justify-start gap-1.5"
        role="group"
        aria-label="Template color stops"
      >
        {fillKeys.map((key) => (
          <SolidColorPopoverRow
            key={key}
            variant="swatch"
            popoverDraggable
            displayHex={displayFills[key]}
            onColorChange={(hex) => patchCanvasGradientFillKey(key, hex)}
            fillOpacityPercent={displayOpacities[key]}
            onFillOpacityPercentChange={(percent) =>
              patchCanvasGradientFillOpacity(key, percent)
            }
            triggerAriaLabel={getGradientFillLabel(
              canvasGradientTemplateId!,
              key
            )}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={resetCanvasGradientFillToDefaults}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-400 outline-none transition-colors",
          "hover:border-neutral-500 hover:bg-neutral-800 hover:text-neutral-100",
          "focus-visible:ring-2 focus-visible:ring-white/25"
        )}
        title="Reset template colors"
        aria-label="Reset template colors to defaults"
      >
        <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
