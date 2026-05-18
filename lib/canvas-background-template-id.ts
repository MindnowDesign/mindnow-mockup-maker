import { getCanvasGradientTemplateById } from "@/lib/canvas-background-gradient-templates";
import { getCanvasOrganicTemplateById } from "@/lib/canvas-background-organic-templates";
import { getCanvasWaveTemplateById } from "@/lib/canvas-background-wave-templates";

export function isValidCanvasBackgroundTemplateId(
  id: string | null | undefined
): boolean {
  if (!id?.trim()) return false;
  const trimmed = id.trim();
  return Boolean(
    getCanvasGradientTemplateById(trimmed) ||
      getCanvasWaveTemplateById(trimmed) ||
      getCanvasOrganicTemplateById(trimmed)
  );
}
