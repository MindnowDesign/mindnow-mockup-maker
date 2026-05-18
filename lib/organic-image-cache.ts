import { getCanvasOrganicTemplateById } from "@/lib/canvas-background-organic-templates";

const decodedPaths = new Set<string>();
const inflightByPath = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();

function notify(): void {
  queueMicrotask(() => {
    for (const listener of listeners) {
      listener();
    }
  });
}

export function subscribeOrganicImageCache(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isOrganicImageDecoded(path: string | null | undefined): boolean {
  if (!path) return false;
  return decodedPaths.has(path);
}

/** Warms the browser image cache (decode once per path). */
export function preloadOrganicImagePath(path: string): Promise<void> {
  if (decodedPaths.has(path)) {
    return Promise.resolve();
  }

  const inflight = inflightByPath.get(path);
  if (inflight) return inflight;

  const promise = new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      void img
        .decode()
        .catch(() => {
          /* decode optional — onload is enough for paint */
        })
        .finally(() => {
          decodedPaths.add(path);
          inflightByPath.delete(path);
          notify();
          resolve();
        });
    };
    img.onerror = () => {
      inflightByPath.delete(path);
      reject(new Error(`Failed to load ${path}`));
    };
    img.src = path;
  });

  inflightByPath.set(path, promise);
  return promise;
}

export function preloadOrganicTemplateId(
  templateId: string | null | undefined
): void {
  const path = getOrganicDisplayPathForTemplateId(templateId);
  if (!path) return;
  void preloadOrganicImagePath(path).catch(() => {
    /* UI keeps previous frame until retry */
  });
}

export function getOrganicDisplayPathForTemplateId(
  templateId: string | null | undefined
): string | null {
  const t = getCanvasOrganicTemplateById(templateId);
  return t?.displayPublicPath ?? null;
}

export function getOrganicPreviewPathForTemplateId(
  templateId: string | null | undefined
): string | null {
  const t = getCanvasOrganicTemplateById(templateId);
  return t?.previewPublicPath ?? null;
}

let hoverDisplayPreloadTimer: ReturnType<typeof setTimeout> | undefined;
let hoverDisplayPreloadPath: string | null = null;

/** Debounced warm-up of display WebP when hovering a sidebar thumb (one at a time). */
export function scheduleOrganicDisplayPreload(
  templateId: string | null | undefined,
  debounceMs = 180
): void {
  const path = getOrganicDisplayPathForTemplateId(templateId);
  if (!path) return;
  if (decodedPaths.has(path)) return;

  if (hoverDisplayPreloadPath === path && hoverDisplayPreloadTimer != null) {
    return;
  }

  if (hoverDisplayPreloadTimer != null) {
    clearTimeout(hoverDisplayPreloadTimer);
  }

  hoverDisplayPreloadTimer = setTimeout(() => {
    hoverDisplayPreloadTimer = undefined;
    hoverDisplayPreloadPath = path;
    void preloadOrganicImagePath(path).catch(() => {
      if (hoverDisplayPreloadPath === path) {
        hoverDisplayPreloadPath = null;
      }
    });
  }, debounceMs);
}

export function cancelOrganicDisplayPreloadSchedule(): void {
  if (hoverDisplayPreloadTimer != null) {
    clearTimeout(hoverDisplayPreloadTimer);
    hoverDisplayPreloadTimer = undefined;
  }
}
