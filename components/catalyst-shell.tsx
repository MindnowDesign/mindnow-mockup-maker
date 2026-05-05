"use client";

import { ChevronDown, ChevronUp, Folder, Home, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarLayout,
  SidebarSection,
} from "@/components/sidebar";

export type CatalystShellUser = {
  firstName: string;
  lastName: string;
  email: string;
};

const defaultUser: CatalystShellUser = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
};

function getInitials(firstName: string, lastName: string) {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return (a + b).toUpperCase() || "–";
}

type CatalystShellProps = {
  children: React.ReactNode;
  user?: CatalystShellUser;
  logo?: ReactNode;
  /** Label next to the logo (team / product), like “Tailwind Labs” in the Catalyst demo. */
  teamLabel?: string;
};

/**
 * Application shell mirroring the Catalyst `SidebarLayout` + `Sidebar` + `Navbar` composition.
 * @see https://catalyst.tailwindui.com/docs/sidebar-layout
 */
export function CatalystShell({
  children,
  user = defaultUser,
  logo,
  teamLabel = "Mindnow",
}: CatalystShellProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isSearch = pathname === "/search";
  const isProjects = pathname === "/projects";
  const isAccount = pathname === "/account";
  const initials = getInitials(user.firstName, user.lastName);

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem
              href="/search"
              current={isSearch}
              aria-label="Search"
            >
              <Search className="size-5" strokeWidth={1.75} />
            </NavbarItem>
            <NavbarItem href="/" current={isHome} aria-label="Home">
              <Home className="size-5" strokeWidth={1.75} />
            </NavbarItem>
            <NavbarItem
              href="/account"
              current={isAccount}
              aria-label="Account"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-semibold text-white">
                {initials}
              </span>
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <button
              type="button"
              className="mb-2.5 flex w-full min-w-0 items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm/6 font-medium text-white outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/25"
              aria-expanded="false"
              aria-haspopup="menu"
            >
              <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/15">
                {logo ?? <span className="sr-only">Logo</span>}
              </span>
              <SidebarLabel className="flex-1">{teamLabel}</SidebarLabel>
              <ChevronDown className="size-4 shrink-0 text-zinc-500" aria-hidden />
            </button>

            <SidebarSection>
              <SidebarItem href="/search" current={isSearch}>
                <Search className="size-5 shrink-0" strokeWidth={1.75} />
                <SidebarLabel>Search</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={isHome}>
                <Home className="size-5 shrink-0" strokeWidth={1.75} />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/projects" current={isProjects}>
                <Folder className="size-5 shrink-0" strokeWidth={1.75} />
                <SidebarLabel>Projects</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter>
            <button
              type="button"
              className="flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/25"
              aria-label={`${user.firstName} ${user.lastName} — ${user.email}`}
              aria-haspopup="menu"
            >
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="size-10 shrink-0 rounded-md after:rounded-md [&_[data-slot=avatar-fallback]]:rounded-md">
                  <AvatarFallback className="rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm/5 font-medium text-white">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="block truncate text-xs/5 font-normal text-zinc-400">
                    {user.email}
                  </span>
                </span>
              </span>
              <ChevronUp className="size-4 shrink-0 text-zinc-500" aria-hidden />
            </button>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
