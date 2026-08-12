"use client";

import {
  ChevronUp,
  Folder,
  Home,
  Search,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ProjectWorkspaceTitleProvider } from "@/components/project-workspace-title-context";
import { UserProfileDialog } from "@/components/user-profile-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
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
import { isProjectWorkspacePath } from "@/lib/project-workspace";
import { cn } from "@/lib/utils";

const ProjectWorkspaceShell = dynamic(
  () =>
    import("@/components/project-workspace-shell").then(
      (m) => m.ProjectWorkspaceShell
    ),
  {
    loading: () => (
      <div
        className="h-dvh max-h-dvh w-full bg-zinc-900"
        aria-busy
        aria-label="Loading workspace"
      />
    ),
  }
);

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

const DEFAULT_SIDEBAR_LOGO_SRC = "/images/logo.png";

function DefaultSidebarLogo({ label }: { label: string }) {
  return (
    <Image
      src={DEFAULT_SIDEBAR_LOGO_SRC}
      alt={label}
      width={32}
      height={32}
      className="size-full object-contain"
      priority
    />
  );
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
 * Project routes under `/projects/:id` use a compact icon-only sidebar and a workspace top bar.
 * @see https://catalyst.tailwindui.com/docs/sidebar-layout
 */
export function CatalystShell({
  children,
  user = defaultUser,
  logo,
  teamLabel = "Mindnow",
}: CatalystShellProps) {
  const pathname = usePathname();
  const isProjectWorkspace = isProjectWorkspacePath(pathname);
  const isHome = pathname === "/";
  const isSearch = pathname === "/search";
  const isProjects = pathname === "/projects";
  const isTrash = pathname === "/trash";
  const isAccount = pathname === "/account";
  const initials = getInitials(user.firstName, user.lastName);

  if (isProjectWorkspace) {
    return (
      <TooltipProvider>
        <ProjectWorkspaceTitleProvider>
          <ProjectWorkspaceShell
            user={user}
            logo={logo}
            teamLabel={teamLabel}
          >
            {children}
          </ProjectWorkspaceShell>
        </ProjectWorkspaceTitleProvider>
      </TooltipProvider>
    );
  }

  const sidebarRail = (
    <Sidebar>
      <SidebarHeader className="px-2">
        <div className="mb-2.5 flex w-full min-w-0 items-center gap-3 rounded-lg px-2.5 py-2 text-sm/6 font-medium text-white">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            {logo ?? <DefaultSidebarLogo label={teamLabel} />}
          </span>
          <SidebarLabel className="flex-1">{teamLabel}</SidebarLabel>
        </div>

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
          <SidebarItem href="/trash" current={isTrash}>
            <Trash2 className="size-5 shrink-0" strokeWidth={1.75} />
            <SidebarLabel>Trash</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>

      <SidebarFooter>
        <UserProfileDialog
          user={user}
          teamLabel={teamLabel}
          trigger={
            <button
              type="button"
              className="flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/25"
              aria-label={`${user.firstName} ${user.lastName} — ${user.email}`}
              aria-haspopup="dialog"
            >
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="size-10 shrink-0 rounded-full after:rounded-full [&_[data-slot=avatar-fallback]]:rounded-full">
                  <AvatarFallback
                    className="rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: "#D94716" }}
                  >
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
          }
        />
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <TooltipProvider>
      <ProjectWorkspaceTitleProvider>
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
                  <span
                    className="flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: "#D94716" }}
                  >
                    {initials}
                  </span>
                </NavbarItem>
              </NavbarSection>
            </Navbar>
          }
          sidebar={sidebarRail}
        >
          {children}
        </SidebarLayout>
      </ProjectWorkspaceTitleProvider>
    </TooltipProvider>
  );
}
