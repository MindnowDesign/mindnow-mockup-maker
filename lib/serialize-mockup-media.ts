import type { MockupMediaItem } from "@/components/mockup-media-context";
import type { SavedMediaItem } from "@/lib/saved-projects";
import { resourceUrlToDataUrl } from "@/lib/resource-to-data-url";

export async function serializeMockupMediaForSave(
  items: MockupMediaItem[],
  activeId: string | null
): Promise<{ mediaItems: SavedMediaItem[]; activeMediaId: string | null }> {
  const mediaItems: SavedMediaItem[] = [];
  for (const item of items) {
    try {
      const dataUrl = await resourceUrlToDataUrl(item.url);
      const row: (typeof mediaItems)[number] = {
        id: item.id,
        kind: item.kind,
        dataUrl,
      };
      if (item.label?.trim()) {
        row.label = item.label.trim();
      }
      mediaItems.push(row);
    } catch (e) {
      console.error("Failed to serialize media item", e);
    }
  }

  let activeMediaId = activeId;
  if (activeMediaId && !mediaItems.some((m) => m.id === activeMediaId)) {
    activeMediaId = mediaItems[mediaItems.length - 1]?.id ?? null;
  }
  if (!activeMediaId && mediaItems.length > 0) {
    activeMediaId = mediaItems[mediaItems.length - 1]!.id;
  }

  return { mediaItems, activeMediaId };
}
