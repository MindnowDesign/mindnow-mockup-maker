export function AuthLoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-shell text-sm text-neutral-400"
      aria-busy
      aria-label={label}
    >
      {label}
    </div>
  );
}
