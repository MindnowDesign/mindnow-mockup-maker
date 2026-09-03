import Link from "next/link";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";

import { scrollbarSubtleClass } from "@/lib/scrollbar-classes";
import { cn } from "@/lib/utils";

export function Sidebar({ className, ...props }: ComponentProps<"aside">) {
  return (
    <aside
      className={cn(
        "hidden h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden rounded-xl bg-neutral-900 lg:flex",
        className
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("shrink-0 px-2 pt-4", className)} {...props} />;
}

export function SidebarBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2 pt-2",
        scrollbarSubtleClass,
        className
      )}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("shrink-0 border-t border-neutral-800 p-2", className)}
      {...props}
    />
  );
}

export function SidebarSection({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("space-y-0.5", className)} {...props} />;
}

export function SidebarHeading({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "mb-2 px-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase",
        className
      )}
      {...props}
    />
  );
}

export function SidebarLabel({
  className,
  ...props
}: ComponentProps<"span">) {
  return <span className={cn("min-w-0 truncate", className)} {...props} />;
}

export function SidebarSpacer({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("min-h-0 flex-1", className)} {...props} />;
}

export type SidebarItemProps = {
  className?: string;
  current?: boolean;
  children?: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  "aria-label"?: string;
  "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog";
  "aria-expanded"?: boolean;
};

export function SidebarItem({
  className,
  current,
  href,
  onClick,
  children,
  "aria-label": ariaLabel,
  "aria-haspopup": ariaHasPopup,
  "aria-expanded": ariaExpanded,
}: SidebarItemProps) {
  const classes = cn(
    "flex min-w-0 items-center gap-3 rounded-lg px-2.5 py-2 text-sm/6 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
    current
      ? "bg-white/5 text-neutral-50"
      : "text-neutral-400 hover:bg-white/5 hover:text-neutral-50",
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-current={current ? "page" : undefined}
        aria-label={ariaLabel}
        aria-haspopup={ariaHasPopup}
        aria-expanded={ariaExpanded}
        data-slot="sidebar-item"
        data-current={current ? "" : undefined}
        className={classes}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-current={current ? "true" : undefined}
      aria-label={ariaLabel}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      data-slot="sidebar-item"
      data-current={current ? "" : undefined}
      className={cn(classes, "w-full")}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
    >
      {children}
    </button>
  );
}
