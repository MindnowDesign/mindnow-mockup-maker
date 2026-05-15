"use client";

import { LayoutPanelTop } from "lucide-react";
import { useState } from "react";
import { EffectAccordionSection } from "@/components/effect-accordion-section";
import { useMockupFrame } from "@/components/mockup-frame-context";
import { CANVAS_GRADIENT_TEMPLATES } from "@/lib/canvas-background-gradient-templates";
import { cn } from "@/lib/utils";

const previewButtonBase = cn(
  "size-9 shrink-0 overflow-hidden rounded-lg border text-left outline-none transition-colors",
  "focus-visible:ring-2 focus-visible:ring-white/25"
);

export function CanvasBackgroundTemplatesSection() {
  const { canvasGradientTemplateId, setCanvasGradientTemplateId } =
    useMockupFrame();
  const [gradientOpen, setGradientOpen] = useState(false);

  return (
    <div className="space-y-2 pt-1">
      <span
        className="block text-xs font-medium text-zinc-400"
        id="canvas-bg-templates-label"
      >
        Templates
      </span>
      <div className="space-y-2" aria-labelledby="canvas-bg-templates-label">
        <EffectAccordionSection
          sectionId="canvas-template-gradient"
          label="Gradient"
          Icon={LayoutPanelTop}
          open={gradientOpen}
          onToggle={() => setGradientOpen((o) => !o)}
          openTrailingIcon="collapse"
        >
          <div className="space-y-2">
            <div
              role="radiogroup"
              aria-label="Gradient templates"
              className="flex min-w-0 items-center gap-2"
            >
              {CANVAS_GRADIENT_TEMPLATES.map((entry) => {
                const selected = canvasGradientTemplateId === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={entry.label}
                    onClick={() =>
                      setCanvasGradientTemplateId(
                        selected ? null : entry.id
                      )
                    }
                    className={cn(
                      previewButtonBase,
                      selected
                        ? "border-zinc-500 shadow-sm ring-2 ring-inset ring-white/20"
                        : "border-zinc-700 hover:border-zinc-500"
                    )}
                    style={{ background: entry.previewBackground }}
                  />
                );
              })}
            </div>
            {canvasGradientTemplateId ? (
              <button
                type="button"
                onClick={() => setCanvasGradientTemplateId(null)}
                className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
              >
                Remove template background
              </button>
            ) : null}
          </div>
        </EffectAccordionSection>
      </div>
    </div>
  );
}
