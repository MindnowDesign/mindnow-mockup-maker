/**
 * Relative time without a prefix — e.g. "just now", "2 hours ago", "Aug 5".
 * Callers add their own verb ("Edited …", "Trashed …").
 */
export function formatTimeAgo(atMs: number, nowMs = Date.now()): string {
  const diffMs = Math.max(0, nowMs - atMs);
  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ${min === 1 ? "minute" : "minutes"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${hr === 1 ? "hour" : "hours"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ${day === 1 ? "day" : "days"} ago`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week} ${week === 1 ? "week" : "weeks"} ago`;

  const d = new Date(atMs);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  if (d.getFullYear() !== new Date(nowMs).getFullYear()) {
    opts.year = "numeric";
  }
  return d.toLocaleDateString(undefined, opts);
}
