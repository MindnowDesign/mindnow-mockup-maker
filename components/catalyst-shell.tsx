"use client";

import {
  ChevronDown,
  ChevronUp,
  Folder,
  Frame,
  Home,
  Image as ImageIcon,
  Palette,
  Search,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ProjectWorkspaceTitleProvider } from "@/components/project-workspace-title-context";
import { WorkspaceTopBar } from "@/components/workspace-top-bar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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

/** Icon-only sidebar links use the same square hit target as the footer avatar (40×40). */
const SIDEBAR_COMPACT_ITEM =
  "mx-auto flex size-10 shrink-0 items-center justify-center gap-0 px-0 py-0";

/** Logo / account controls in compact sidebar match the same dimensions. */
const SIDEBAR_COMPACT_CONTROL = "mx-auto flex size-10 shrink-0 items-center justify-center px-0 py-0";

/** Compact sidebar button (no route) — matches inactive `SidebarItem` look. */
const SIDEBAR_COMPACT_ICON_BUTTON = cn(
  "flex min-w-0 items-center gap-0 rounded-lg text-sm/6 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
  "text-zinc-400 hover:bg-white/5 hover:text-white",
  SIDEBAR_COMPACT_ITEM
);

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
  const isAccount = pathname === "/account";
  const initials = getInitials(user.firstName, user.lastName);

  return (
    <TooltipProvider>
      <ProjectWorkspaceTitleProvider>
        <SidebarLayout
        navbar={
          isProjectWorkspace ? (
            <WorkspaceTopBar className="lg:hidden" />
          ) : (
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
        )
      }
      sidebar={
        <Sidebar
          className={cn(isProjectWorkspace && "w-16 items-stretch")}
          aria-label={isProjectWorkspace ? "Compact workspace navigation" : undefined}
        >
          <SidebarHeader className={cn(isProjectWorkspace && "px-1.5")}>
            <button
              type="button"
              className={cn(
                "mb-2.5 flex w-full min-w-0 items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm/6 font-medium text-white outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/25",
                isProjectWorkspace && cn("mb-2", SIDEBAR_COMPACT_CONTROL)
              )}
              aria-expanded="false"
              aria-haspopup="menu"
            >
              <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                {logo ?? <DefaultSidebarLogo label={teamLabel} />}
              </span>
              {!isProjectWorkspace && (
                <>
                  <SidebarLabel className="flex-1">{teamLabel}</SidebarLabel>
                  <ChevronDown
                    className="size-4 shrink-0 text-zinc-500"
                    aria-hidden
                  />
                </>
              )}
            </button>

            {!isProjectWorkspace && (
              <SidebarSection>
                <SidebarItem href="/search" current={isSearch}>
                  <Search className="size-5 shrink-0" strokeWidth={1.75} />
                  <SidebarLabel>Search</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
            )}
          </SidebarHeader>

          <SidebarBody className={cn(isProjectWorkspace && "px-1.5")}>
            <SidebarSection>
              {isProjectWorkspace ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={SIDEBAR_COMPACT_ICON_BUTTON}
                        aria-label="Frame"
                      >
                        <Frame
                          className="size-5 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Frame</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={SIDEBAR_COMPACT_ICON_BUTTON}
                        aria-label="Background"
                      >
                        <Palette
                          className="size-5 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Background</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={SIDEBAR_COMPACT_ICON_BUTTON}
                        aria-label="Media"
                      >
                        <ImageIcon
                          className="size-5 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Media</TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  <SidebarItem href="/" current={isHome}>
                    <Home className="size-5 shrink-0" strokeWidth={1.75} />
                    <SidebarLabel>Home</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/projects" current={isProjects}>
                    <Folder className="size-5 shrink-0" strokeWidth={1.75} />
                    <SidebarLabel>Projects</SidebarLabel>
                  </SidebarItem>
                </>
              )}
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className={cn(isProjectWorkspace && "px-1.5")}>
            <button
              type="button"
              className={cn(
                "flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/25",
                isProjectWorkspace && SIDEBAR_COMPACT_CONTROL
              )}
              aria-label={`${user.firstName} ${user.lastName} — ${user.email}`}
              aria-haspopup="menu"
            >
              <span
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-3",
                  isProjectWorkspace && "flex-none justify-center"
                )}
              >
                <Avatar className="size-10 shrink-0 rounded-md after:rounded-md [&_[data-slot=avatar-fallback]]:rounded-md">
                  <AvatarFallback className="rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!isProjectWorkspace && (
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm/5 font-medium text-white">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-400">
                      {user.email}
                    </span>
                  </span>
                )}
              </span>
              {!isProjectWorkspace && (
                <ChevronUp className="size-4 shrink-0 text-zinc-500" aria-hidden />
              )}
            </button>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {isProjectWorkspace ? (
        <>
          <WorkspaceTopBar className="sticky top-0 z-10 hidden lg:flex" />
          {children}
        </>
      ) : (
        children
      )}
        </SidebarLayout>
      </ProjectWorkspaceTitleProvider>
    </TooltipProvider>
  );
}
