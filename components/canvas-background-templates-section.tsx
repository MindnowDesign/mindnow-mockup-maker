"use client";

import { LineSquiggle, ZodiacAquarius } from "lucide-react";
import { useEffect, useState } from "react";
import { ensureGradientSvgCached } from "@/lib/gradient-svg-cache";
import { getCanvasGradientTemplateById } from "@/lib/canvas-background-gradient-templates";
import { getCanvasWaveTemplateById } from "@/lib/canvas-background-wave-templates";
import { CANVAS_WAVE_TEMPLATES } from "@/lib/canvas-background-wave-templates";
import { StyleGradientIcon } from "@/components/canvas-style-icons";
import { EffectAccordionSection } from "@/components/effect-accordion-section";
import { useMockupFrame } from "@/components/mockup-frame-context";
import { CANVAS_GRADIENT_TEMPLATES } from "@/lib/canvas-background-gradient-templates";
import { OrganicTemplatePreviewThumb } from "@/components/organic-template-preview-thumb";
import { CANVAS_ORGANIC_TEMPLATES } from "@/lib/canvas-background-organic-templates";
import { preloadOrganicTemplateId } from "@/lib/organic-image-cache";
import { cn } from "@/lib/utils";

const templatePreviewGridClass =
  "grid w-full grid-cols-5 gap-2";

const previewButtonBase = cn(
  "aspect-square w-full min-w-0 overflow-hidden rounded-lg border text-left outline-none transition-colors",
  "focus-visible:ring-2 focus-visible:ring-white/25"
);

function preloadInlineSvgPath(path: string | null | undefined) {
  if (!path) return;
  void ensureGradientSvgCached(path).catch(() => {});
}

export function CanvasBackgroundTemplatesSection() {
  const { canvasGradientTemplateId, setCanvasGradientTemplateId } =
    useMockupFrame();
  const [openTemplateSection, setOpenTemplateSection] = useState("");

  const gradientOpen = openTemplateSection === "canvas-template-gradient";
  const organicOpen = openTemplateSection === "canvas-template-organic";
  const wavesOpen = openTemplateSection === "canvas-template-waves";

  function toggleTemplateSection(sectionId: string) {
    setOpenTemplateSection((current) =>
      current === sectionId ? "" : sectionId
    );
  }

  useEffect(() => {
    if (!gradientOpen) return;
    const template = getCanvasGradientTemplateById(canvasGradientTemplateId);
    if (template?.inlineSvgWithCssVars && template.svgPublicPath) {
      void ensureGradientSvgCached(template.svgPublicPath).catch(() => {});
    }
  }, [gradientOpen, canvasGradientTemplateId]);

  useEffect(() => {
    if (!organicOpen) return;
    if (canvasGradientTemplateId?.startsWith("organic-")) {
      preloadOrganicTemplateId(canvasGradientTemplateId);
    }
  }, [organicOpen, canvasGradientTemplateId]);

  useEffect(() => {
    if (!wavesOpen) return;
    const waveId = getCanvasWaveTemplateById(canvasGradientTemplateId)
      ? canvasGradientTemplateId
      : CANVAS_WAVE_TEMPLATES[0]?.id;
    const path = getCanvasWaveTemplateById(waveId)?.svgPublicPath;
    if (path) void ensureGradientSvgCached(path).catch(() => {});
  }, [wavesOpen, canvasGradientTemplateId]);

  return (
    <div className="space-y-2 pt-1">
      <div className="space-y-2" aria-label="Templates">
        <EffectAccordionSection
          sectionId="canvas-template-gradient"
          label="Gradient"
          Icon={StyleGradientIcon}
          open={gradientOpen}
          onToggle={() => toggleTemplateSection("canvas-template-gradient")}
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
                    onMouseEnter={() =>
                      preloadInlineSvgPath(entry.svgPublicPath)
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
          Icon={LineSquiggle}
          open={organicOpen}
          onToggle={() => toggleTemplateSection("canvas-template-organic")}
          openTrailingIcon="collapse"
        >
          <div
            role="radiogroup"
            aria-label="Organic templates"
            className={templatePreviewGridClass}
          >
            {CANVAS_ORGANIC_TEMPLATES.map((entry) => (
              <OrganicTemplatePreviewThumb
                key={entry.id}
                entry={entry}
                selected={canvasGradientTemplateId === entry.id}
                onSelect={() => {
                  const nextId =
                    canvasGradientTemplateId === entry.id ? null : entry.id;
                  if (nextId) preloadOrganicTemplateId(nextId);
                  setCanvasGradientTemplateId(nextId);
                }}
              />
            ))}
          </div>
        </EffectAccordionSection>
        <EffectAccordionSection
          sectionId="canvas-template-waves"
          label="Waves"
          Icon={ZodiacAquarius}
          open={wavesOpen}
          onToggle={() => toggleTemplateSection("canvas-template-waves")}
          openTrailingIcon="collapse"
        >
          <div
            role="radiogroup"
            aria-label="Waves templates"
            className={templatePreviewGridClass}
          >
            {CANVAS_WAVE_TEMPLATES.map((entry) => {
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
                  onMouseEnter={() =>
                    preloadInlineSvgPath(entry.svgPublicPath)
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
        </EffectAccordionSection>
      </div>
    </div>
  );
}
