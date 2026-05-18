"use client";

import { useEffect, useState } from "react";
import { preloadAllCanvasGradientSvgs } from "@/lib/gradient-svg-cache";
import {
  StyleGradientIcon,
  StyleOrganicIcon,
} from "@/components/canvas-style-icons";
import { EffectAccordionSection } from "@/components/effect-accordion-section";
import { useMockupFrame } from "@/components/mockup-frame-context";
import { CANVAS_GRADIENT_TEMPLATES } from "@/lib/canvas-background-gradient-templates";
import { cn } from "@/lib/utils";

const templatePreviewGridClass =
  "grid w-full grid-cols-5 gap-2";

const previewButtonBase = cn(
  "aspect-square w-full min-w-0 overflow-hidden rounded-lg border text-left outline-none transition-colors",
  "focus-visible:ring-2 focus-visible:ring-white/25"
);

export function CanvasBackgroundTemplatesSection() {
  const { canvasGradientTemplateId, setCanvasGradientTemplateId } =
    useMockupFrame();
  const [gradientOpen, setGradientOpen] = useState(false);
  const [organicOpen, setOrganicOpen] = useState(false);

  useEffect(() => {
    if (!gradientOpen) return;
    preloadAllCanvasGradientSvgs();
  }, [gradientOpen]);

  return (
    <div className="space-y-2 pt-1">
      <div className="space-y-2" aria-label="Templates">
        <EffectAccordionSection
          sectionId="canvas-template-gradient"
          label="Gradient"
          Icon={StyleGradientIcon}
          open={gradientOpen}
          onToggle={() => setGradientOpen((o) => !o)}
          openTrailingIcon="collapse"
        >
          <div className="space-y-2">
            <div
              role="radiogroup"
              aria-label="Gradient templates"
              className={templatePreviewGridClass}
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
          </div>
        </EffectAccordionSection>
        <EffectAccordionSection
          sectionId="canvas-template-organic"
          label="Organic"
          Icon={StyleOrganicIcon}
          open={organicOpen}
          onToggle={() => setOrganicOpen((o) => !o)}
          openTrailingIcon="collapse"
        >
          <div
            role="radiogroup"
            aria-label="Organic templates"
            className={templatePreviewGridClass}
          />
        </EffectAccordionSection>
      </div>
    </div>
  );
}
