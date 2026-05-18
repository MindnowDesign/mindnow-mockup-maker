import type { CSSProperties } from "react";

/**
 * PNG organic backgrounds under `public/background-templates/organic/`.
 * Ids use the `organic-` prefix (e.g. `organic-blue-1` → `blue-1.png`).
 */
const ORGANIC_SLUGS = [
  "blue-1",
  "blue-2",
  "blue-3",
  "blue-4",
  "blue-4-1",
  "blue-6",
  "blue-7",
  "blue-8",
  "blue-9",
  "blue-10",
  "brown-1",
  "brown-2",
  "brown-3",
  "brown-4",
  "brown-5",
  "brown-6",
  "brown-7",
  "brown-8",
  "brown-9",
  "green-1",
  "green-2",
  "green-3",
  "green-4",
  "pink-1",
  "pink-2",
  "pink-3",
  "pink-4",
  "pink-5",
  "pink-6",
  "pink-7",
  "pink-8",
  "pink-9",
  "red-1",
  "red-2",
  "red-3",
  "red-4",
  "red-5",
  "red-6",
  "red-7",
  "red-8",
] as const;

export type CanvasOrganicTemplateDefinition = {
  id: string;
  label: string;
  /** Full-resolution source (regenerate assets with `npm run generate:organic-assets`). */
  pngPublicPath: string;
  /** Sidebar grid — small WebP under `organic/previews/`. */
  previewPublicPath: string;
  /** Canvas + peek — WebP under `organic/display/`. */
  displayPublicPath: string;
};

function organicLabelFromSlug(slug: string): string {
  const [family, ...rest] = slug.split("-");
  const num = rest.join("-");
  const familyTitle = family.charAt(0).toUpperCase() + family.slice(1);
  return num ? `Organic ${familyTitle} ${num}` : `Organic ${familyTitle}`;
}

export const CANVAS_ORGANIC_TEMPLATES: CanvasOrganicTemplateDefinition[] =
  ORGANIC_SLUGS.map((slug) => {
    const pngPublicPath = `/background-templates/organic/${slug}.png`;
    return {
      id: `organic-${slug}`,
      label: organicLabelFromSlug(slug),
      pngPublicPath,
      previewPublicPath: `/background-templates/organic/previews/${slug}.webp`,
      displayPublicPath: `/background-templates/organic/display/${slug}.webp`,
    };
  });

export function getCanvasOrganicTemplateById(
  id: string | null | undefined
): CanvasOrganicTemplateDefinition | undefined {
  if (!id) return undefined;
  return CANVAS_ORGANIC_TEMPLATES.find((t) => t.id === id);
}

export function isCanvasOrganicTemplateId(
  id: string | null | undefined
): boolean {
  return Boolean(getCanvasOrganicTemplateById(id));
}

export function canvasOrganicTemplateToPeekBackgroundStyle(
  templateId: string | null | undefined,
  height: number | string = "100%"
): CSSProperties | null {
  if (!templateId) return null;
  const t = getCanvasOrganicTemplateById(templateId);
  if (!t) return null;
  return {
    width: "100%",
    height,
    backgroundImage: `url(${t.displayPublicPath})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

export function canvasOrganicTemplateToCaptureStyle(
  templateId: string | null | undefined,
  height: number | string
): CSSProperties | null {
  return canvasOrganicTemplateToPeekBackgroundStyle(templateId, height);
}
