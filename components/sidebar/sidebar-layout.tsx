import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SidebarLayoutProps = {
  sidebar: ReactNode;
  navbar: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Equivalent to Catalyst UI Kit `SidebarLayout`.
 * @see https://catalyst.tailwindui.com/docs/sidebar-layout
 */
export function SidebarLayout({
  sidebar,
  navbar,
  children,
  className,
}: SidebarLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-dvh max-h-dvh min-h-0 w-full flex-col gap-2 overflow-hidden bg-shell p-2 lg:flex-row",
        className
      )}
    >
      {sidebar}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-neutral-950">
        {navbar}
        <main className="no-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
