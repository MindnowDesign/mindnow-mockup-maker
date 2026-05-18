import { CANVAS_GRADIENT_TEMPLATES } from "@/lib/canvas-background-gradient-templates";

const htmlByPath = new Map<string, string>();
const inflightByPath = new Map<string, Promise<string>>();
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
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
        htmlByPath.set(path, html);
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

export function preloadAllCanvasGradientSvgs(): void {
  preloadGradientSvgPaths(getCanvasGradientSvgPaths());
}
