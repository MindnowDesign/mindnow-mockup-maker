import type {
  MockupLibraryItem,
  MockupVisualSlot,
} from "@/components/mockup-media-context";
import type { SavedMediaItem, SavedVisualSlot } from "@/lib/saved-projects";
import { resourceUrlToDataUrl } from "@/lib/resource-to-data-url";

export async function serializeMockupMediaForSave(
  library: MockupLibraryItem[],
  visuals: MockupVisualSlot[],
  activeVisualId: string | null
): Promise<{
  mediaItems: SavedMediaItem[];
  visualSlots: SavedVisualSlot[];
  activeVisualId: string | null;
}> {
  const mediaItems: SavedMediaItem[] = [];
  for (const item of library) {
    try {
      const dataUrl = await resourceUrlToDataUrl(item.url);
      mediaItems.push({
        id: item.id,
        kind: item.kind,
        dataUrl,
      });
    } catch (e) {
      console.error("Failed to serialize media item", e);
    }
  }

  let av = activeVisualId;
  if (av && !visuals.some((v) => v.id === av)) {
    av = visuals[visuals.length - 1]?.id ?? null;
  }
  if (!av && visuals.length > 0) {
    av = visuals[visuals.length - 1]!.id;
  }

  const visualSlots: SavedVisualSlot[] = visuals.map((v) => ({
    id: v.id,
    mediaId:
      v.mediaId && mediaItems.some((m) => m.id === v.mediaId)
        ? v.mediaId
        : null,
    ...(v.label?.trim() ? { label: v.label.trim() } : {}),
  }));

  return { mediaItems, visualSlots, activeVisualId: av };
}
