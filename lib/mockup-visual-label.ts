/** Default canvas visual title: Visual 01, Visual 02, … */
export function defaultVisualLabel(oneBasedIndex: number): string {
  return `Visual ${String(oneBasedIndex).padStart(2, "0")}`;
}
