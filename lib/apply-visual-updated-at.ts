import type { SavedProject, SavedVisualSlot } from "@/lib/saved-projects";

/**
 * Stamp `updatedAt` only on the active visual. Other slots keep their own timestamp;
 * never copy the project-level `updatedAt` on every autosave.
 */
export function applyVisualUpdatedAt(
  slots: SavedVisualSlot[],
  activeVisualId: string | null,
  disk: SavedProject | undefined,
  fallbackMs: number
): SavedVisualSlot[] {
  const now = Date.now();
  const diskById = new Map((disk?.visualSlots ?? []).map((s) => [s.id, s]));

  return slots.map((slot) => {
    if (slot.id === activeVisualId) {
      return { ...slot, updatedAt: now };
    }

    const prev = diskById.get(slot.id);
    if (prev?.updatedAt != null) {
      return { ...slot, updatedAt: prev.updatedAt };
    }

    // Legacy slot (exists on disk but never had per-visual time): seed once, then freeze.
    if (prev) {
      const seeded = prev.updatedAt ?? disk?.updatedAt ?? fallbackMs;
      return { ...slot, updatedAt: seeded };
    }

    // New slot added since last save — treat as created now until the user edits it.
    return { ...slot, updatedAt: now };
  });
}
