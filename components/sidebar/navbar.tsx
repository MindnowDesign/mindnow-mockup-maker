import Link from "next/link";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Navbar({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-4 py-3 lg:hidden",
        className
      )}
      {...props}
    />
  );
}

export function NavbarSpacer({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("min-w-0 flex-1", className)} {...props} />;
}

export function NavbarSection({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props} />
  );
}

export type NavbarItemProps = {
  className?: string;
  current?: boolean;
  children?: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  "aria-label"?: string;
};

export function NavbarItem({
  className,
  current,
  href,
  onClick,
  children,
  ...props
}: NavbarItemProps) {
  const classes = cn(
    "flex size-10 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
    current ? "bg-white/5 text-neutral-50" : "hover:bg-white/5 hover:text-neutral-50",
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-current={current ? "page" : undefined}
        className={classes}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-current={current ? "true" : undefined}
      className={classes}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      {...props}
    >
      {children}
    </button>
  );
}
