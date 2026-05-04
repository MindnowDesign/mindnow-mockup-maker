import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Navbar({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-3 lg:hidden",
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

export type NavbarItemProps = ComponentProps<typeof Link> & {
  current?: boolean;
};

export function NavbarItem({
  className,
  current,
  ...props
}: NavbarItemProps) {
  return (
    <Link
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
        current ? "bg-white/5 text-white" : "hover:bg-white/5 hover:text-white",
        className
      )}
      {...props}
    />
  );
}
