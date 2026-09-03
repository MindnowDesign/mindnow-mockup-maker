import { isBrowserTemplateId } from "@/lib/mockup-browser-templates";

export type DeviceTemplateCategory = "screenshot" | "browser" | "device";

export function deviceTemplateCategory(
  id: string | null | undefined
): DeviceTemplateCategory {
  if (id == null) return "screenshot";
  if (isBrowserTemplateId(id)) return "browser";
  return "device";
}
