import { CANVAS_GRADIENT_TEMPLATES } from "@/lib/canvas-background-gradient-templates";
import { CANVAS_WAVE_TEMPLATES } from "@/lib/canvas-background-wave-templates";

const SVG_POINTER_EVENTS_STYLE =
  "<style>svg,svg *{pointer-events:none!important}</style>";

function patchSvgHtmlForInteraction(html: string): string {
  if (html.includes("pointer-events:none!important")) return html;
  return `${SVG_POINTER_EVENTS_STYLE}${html}`;
}

const htmlByPath = new Map<string, string>();
const inflightByPath = new Map<string, Promise<string>>();
const listeners = new Set<() => void>();

function notify(): void {
  queueMicrotask(() => {
    for (const listener of listeners) {
      listener();
    }
  });
}

export function subscribeGradientSvgCache(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCachedGradientSvgHtml(
  path: string | null | undefined
): string | null {
  if (!path) return null;
  return htmlByPath.get(path) ?? null;
}

export async function ensureGradientSvgCached(path: string): Promise<string> {
  const cached = htmlByPath.get(path);
  if (cached) return cached;

  let inflight = inflightByPath.get(path);
  if (!inflight) {
    inflight = fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(String(response.status));
        }
        return response.text();
      })
      .then((html) => {
        htmlByPath.set(path, patchSvgHtmlForInteraction(html));
        inflightByPath.delete(path);
        notify();
        return html;
      })
      .catch((error) => {
        inflightByPath.delete(path);
        throw error;
      });
    inflightByPath.set(path, inflight);
  }

  return inflight;
}

export function preloadGradientSvgPaths(paths: Iterable<string>): void {
  for (const path of paths) {
    void ensureGradientSvgCached(path).catch(() => {
      /* ignore — UI keeps fallback until retry */
    });
  }
}

export function getCanvasGradientSvgPaths(): string[] {
  return CANVAS_GRADIENT_TEMPLATES.flatMap((template) =>
    template.inlineSvgWithCssVars && template.svgPublicPath
      ? [template.svgPublicPath]
      : []
  );
}

export function getCanvasWaveSvgPaths(): string[] {
  return CANVAS_WAVE_TEMPLATES.map((t) => t.svgPublicPath);
}

export function getCanvasInlineSvgPaths(): string[] {
  return [...getCanvasGradientSvgPaths(), ...getCanvasWaveSvgPaths()];
}

export function preloadAllCanvasGradientSvgs(): void {
  preloadGradientSvgPaths(getCanvasGradientSvgPaths());
}

export function preloadAllCanvasWaveSvgs(): void {
  preloadGradientSvgPaths(getCanvasWaveSvgPaths());
}
