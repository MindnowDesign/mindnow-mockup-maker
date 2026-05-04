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
        "flex min-h-dvh w-full flex-col bg-zinc-900 lg:flex-row",
        className
      )}
    >
      {sidebar}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {navbar}
        <main className="min-h-dvh min-w-0 flex-1 border-zinc-800 bg-zinc-950 lg:border-l">
          {children}
        </main>
      </div>
    </div>
  );
}
