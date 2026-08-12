/**
 * Compact relative / calendar labels for Recent search rows
 * (e.g. "Yesterday", "Aug 10").
 */
export function formatSearchDate(
  searchedAtMs: number,
  nowMs = Date.now()
): string {
  const date = new Date(searchedAtMs);
  const now = new Date(nowMs);

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfThatDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();

  const dayDiff = Math.round((startOfToday - startOfThatDay) / 86_400_000);

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";

  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  if (date.getFullYear() !== now.getFullYear()) {
    opts.year = "numeric";
  }
  return date.toLocaleDateString(undefined, opts);
}
