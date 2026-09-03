"use client";

import { LineSquiggle, ZodiacAquarius } from "lucide-react";
import { useEffect } from "react";
import { ensureGradientSvgCached } from "@/lib/gradient-svg-cache";
import { getCanvasGradientTemplateById } from "@/lib/canvas-background-gradient-templates";
import {
  CANVAS_GRADIENT_TEMPLATES,
} from "@/lib/canvas-background-gradient-templates";
import {
  CANVAS_ORGANIC_TEMPLATES,
  isCanvasOrganicTemplateId,
} from "@/lib/canvas-background-organic-templates";
import {
  CANVAS_WAVE_TEMPLATES,
  getCanvasWaveTemplateById,
} from "@/lib/canvas-background-wave-templates";
import { StyleGradientIcon } from "@/components/canvas-style-icons";
import { EffectAccordionSection } from "@/components/effect-accordion-section";
import { useMockupFrame } from "@/components/mockup-frame-context";
import { OrganicTemplatePreviewThumb } from "@/components/organic-template-preview-thumb";
import { preloadOrganicTemplateId } from "@/lib/organic-image-cache";
import { cn } from "@/lib/utils";

const templatePreviewGridClass = "grid w-full grid-cols-5 gap-2";

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

  const gradientEnabled = Boolean(
    getCanvasGradientTemplateById(canvasGradientTemplateId)
  );
  const organicEnabled = isCanvasOrganicTemplateId(canvasGradientTemplateId);
  const wavesEnabled = Boolean(
    getCanvasWaveTemplateById(canvasGradientTemplateId)
  );

  useEffect(() => {
    if (!gradientEnabled) return;
    const template = getCanvasGradientTemplateById(canvasGradientTemplateId);
    if (template?.inlineSvgWithCssVars && template.svgPublicPath) {
      void ensureGradientSvgCached(template.svgPublicPath).catch(() => {});
    }
  }, [gradientEnabled, canvasGradientTemplateId]);

  useEffect(() => {
    if (!organicEnabled) return;
    if (canvasGradientTemplateId) {
      preloadOrganicTemplateId(canvasGradientTemplateId);
    }
  }, [organicEnabled, canvasGradientTemplateId]);

  useEffect(() => {
    if (!wavesEnabled) return;
    const waveId = getCanvasWaveTemplateById(canvasGradientTemplateId)
      ? canvasGradientTemplateId
      : CANVAS_WAVE_TEMPLATES[0]?.id;
    const path = getCanvasWaveTemplateById(waveId)?.svgPublicPath;
    if (path) void ensureGradientSvgCached(path).catch(() => {});
  }, [wavesEnabled, canvasGradientTemplateId]);

  return (
    <div className="space-y-2 pt-1">
      <div className="space-y-2" aria-label="Templates">
        <EffectAccordionSection
          label="Gradient"
          Icon={StyleGradientIcon}
          enabled={gradientEnabled}
          onEnabledChange={(next) => {
            if (next) {
              const firstId = CANVAS_GRADIENT_TEMPLATES[0]?.id;
              if (firstId) setCanvasGradientTemplateId(firstId);
              return;
            }
            if (gradientEnabled) {
              setCanvasGradientTemplateId(null);
            }
          }}
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
                    onClick={() => setCanvasGradientTemplateId(entry.id)}
                    onMouseEnter={() =>
                      preloadInlineSvgPath(entry.svgPublicPath)
                    }
                    className={cn(
                      previewButtonBase,
                      selected
                        ? "border-neutral-500 shadow-sm ring-2 ring-inset ring-white/20"
                        : "border-neutral-700 hover:border-neutral-500"
                    )}
                    style={{ background: entry.previewBackground }}
                  />
                );
              })}
            </div>
          </div>
        </EffectAccordionSection>
        <EffectAccordionSection
          label="Organic"
          Icon={LineSquiggle}
          enabled={organicEnabled}
          onEnabledChange={(next) => {
            if (next) {
              const firstId = CANVAS_ORGANIC_TEMPLATES[0]?.id;
              if (firstId) {
                preloadOrganicTemplateId(firstId);
                setCanvasGradientTemplateId(firstId);
              }
              return;
            }
            if (organicEnabled) {
              setCanvasGradientTemplateId(null);
            }
          }}
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
                  preloadOrganicTemplateId(entry.id);
                  setCanvasGradientTemplateId(entry.id);
                }}
              />
            ))}
          </div>
        </EffectAccordionSection>
        <EffectAccordionSection
          label="Waves"
          Icon={ZodiacAquarius}
          enabled={wavesEnabled}
          onEnabledChange={(next) => {
            if (next) {
              const firstId = CANVAS_WAVE_TEMPLATES[0]?.id;
              if (firstId) setCanvasGradientTemplateId(firstId);
              return;
            }
            if (wavesEnabled) {
              setCanvasGradientTemplateId(null);
            }
          }}
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
                  onClick={() => setCanvasGradientTemplateId(entry.id)}
                  onMouseEnter={() =>
                    preloadInlineSvgPath(entry.svgPublicPath)
                  }
                  className={cn(
                    previewButtonBase,
                    selected
                      ? "border-neutral-500 shadow-sm ring-2 ring-inset ring-white/20"
                      : "border-neutral-700 hover:border-neutral-500"
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
