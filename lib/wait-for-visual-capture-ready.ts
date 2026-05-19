import { getCanvasInlineSvgTemplateById } from "@/lib/canvas-background-inline-svg-template";
import { isCanvasOrganicTemplateId } from "@/lib/canvas-background-organic-templates";
import {
  ensureGradientSvgCached,
  getCachedGradientSvgHtml,
} from "@/lib/gradient-svg-cache";
import { getOrganicDisplayPathForTemplateId } from "@/lib/organic-image-cache";
import { waitForCaptureReady } from "@/lib/wait-for-capture-ready";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function flushPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function waitForCaptureTargetAssets(
  container: HTMLElement,
  gradientTemplateId: string | null
): Promise<void> {
  const template = getCanvasInlineSvgTemplateById(gradientTemplateId);
  if (template?.inlineSvgWithCssVars && template.svgPublicPath) {
    await ensureGradientSvgCached(template.svgPublicPath).catch(() => {
      /* fallback peek remains visible */
    });
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline) {
      const hasInline = Boolean(
        container.querySelector("[class*='[&>svg]'] svg, [class*='[&_svg]'] svg")
      );
      if (hasInline || getCachedGradientSvgHtml(template.svgPublicPath)) break;
      await sleep(32);
    }
  }

  if (isCanvasOrganicTemplateId(gradientTemplateId)) {
    const path = getOrganicDisplayPathForTemplateId(gradientTemplateId);
    if (path) {
      const deadline = Date.now() + 4000;
      while (Date.now() < deadline) {
        const img = container.querySelector<HTMLImageElement>(
          `img[src="${path}"]`
        );
        if (img?.complete && img.naturalWidth > 0) break;
        await sleep(32);
      }
    }
  }
}

export type WaitForVisualCaptureReadyOptions = {
  visualId: string;
  getCaptureElement: () => HTMLElement | null;
  isFrameSynced: () => boolean;
  gradientTemplateId: string | null;
  shouldAbort?: () => boolean;
  timeoutMs?: number;
};

/**
 * Waits until the active visual id, frame prefs, and background assets match
 * before thumbnail capture (avoids black frames from switching too early).
 */
export async function waitForVisualCaptureReady(
  options: WaitForVisualCaptureReadyOptions
): Promise<HTMLElement | null> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (options.shouldAbort?.()) return null;

    if (options.isFrameSynced()) {
      const el = options.getCaptureElement();
      if (
        el?.isConnected &&
        el.getAttribute("data-active-visual-id") === options.visualId
      ) {
        await waitForCaptureTargetAssets(el, options.gradientTemplateId);
        await waitForCaptureReady(el);
        await flushPaint();
        return el;
      }
    }

    await flushPaint();
    await sleep(24);
  }

  const el = options.getCaptureElement();
  if (el?.isConnected) {
    await waitForCaptureReady(el);
  }
  return el;
}
