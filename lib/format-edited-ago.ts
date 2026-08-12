import { formatTimeAgo } from "@/lib/format-time-ago";

/**
 * e.g. "Edited 2 hours ago" — matches the Recent visuals tiles copy style.
 */
export function formatEditedAgo(updatedAtMs: number, nowMs = Date.now()): string {
  return `Edited ${formatTimeAgo(updatedAtMs, nowMs)}`;
}
