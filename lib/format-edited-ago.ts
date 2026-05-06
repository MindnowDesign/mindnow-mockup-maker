/**
 * e.g. "Edited 2 hours ago" — matches the Recent visuals tiles copy style.
 */
export function formatEditedAgo(updatedAtMs: number, nowMs = Date.now()): string {
  const diffMs = Math.max(0, nowMs - updatedAtMs);
  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "Edited just now";
  const min = Math.floor(sec / 60);
  if (min < 60)
    return `Edited ${min} ${min === 1 ? "minute" : "minutes"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Edited ${hr} ${hr === 1 ? "hour" : "hours"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `Edited ${day} ${day === 1 ? "day" : "days"} ago`;
  const week = Math.floor(day / 7);
  if (week < 5) return `Edited ${week} ${week === 1 ? "week" : "weeks"} ago`;
  const d = new Date(updatedAtMs);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  if (d.getFullYear() !== new Date(nowMs).getFullYear()) {
    opts.year = "numeric";
  }
  return `Edited ${d.toLocaleDateString(undefined, opts)}`;
}
