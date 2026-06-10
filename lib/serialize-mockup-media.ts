import type {
  MockupLibraryItem,
  MockupVisualSlot,
} from "@/components/mockup-media-context";
import type { SavedMediaItem, SavedVisualSlot } from "@/lib/saved-projects";
import { resourceUrlToDataUrl } from "@/lib/resource-to-data-url";

export async function serializeMockupMediaForSave(
  library: MockupLibraryItem[],
  visuals: MockupVisualSlot[],
  activeVisualId: string | null,
  /** Canvas layer media ids — always serialized even if not on a visual slot. */
  requiredMediaIds: string[] = []
): Promise<{
  mediaItems: SavedMediaItem[];
  visualSlots: SavedVisualSlot[];
  activeVisualId: string | null;
}> {
  const byId = new Map(library.map((item) => [item.id, item]));
  const idsToSerialize = new Set<string>([
    ...library.map((item) => item.id),
    ...requiredMediaIds.filter(Boolean),
  ]);

  const mediaItems: SavedMediaItem[] = [];
  for (const id of idsToSerialize) {
    const item = byId.get(id);
    if (!item) continue;
    try {
      const dataUrl = item.url.startsWith("data:")
        ? item.url
        : await resourceUrlToDataUrl(item.url);
      mediaItems.push({
        id: item.id,
        kind: item.kind,
        dataUrl,
      });
    } catch (e) {
      console.error("Failed to serialize media item", item.id, e);
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
