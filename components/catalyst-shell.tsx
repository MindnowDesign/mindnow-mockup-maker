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
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { MockupFrameProvider } from "@/components/mockup-frame-context";
import { MockupMediaProvider } from "@/components/mockup-media-context";
import { MockupWorkspaceHistoryProvider } from "@/components/mockup-workspace-history";
import { ProjectWorkspaceHydrate } from "@/components/project-workspace-hydrate";
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
import {
  WorkspaceFeaturePanel,
  type WorkspaceFeatureId,
} from "@/components/workspace-feature-panel";
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

/** Workspace rail icon buttons — larger hit target than footer avatar. */
const SIDEBAR_WORKSPACE_RAIL_ITEM =
  "mx-auto flex size-12 shrink-0 items-center justify-center gap-0 px-0 py-0";

/** Logo / account controls in compact sidebar match the same dimensions. */
const SIDEBAR_COMPACT_CONTROL = "mx-auto flex size-10 shrink-0 items-center justify-center px-0 py-0";

/** Compact sidebar button (no route) — matches inactive `SidebarItem` look. */
const SIDEBAR_COMPACT_ICON_BUTTON = cn(
  "flex min-w-0 items-center gap-0 rounded-lg text-sm/6 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
  "text-zinc-400 hover:bg-white/5 hover:text-white",
  SIDEBAR_WORKSPACE_RAIL_ITEM
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

  const [workspaceFeature, setWorkspaceFeature] =
    useState<WorkspaceFeatureId | null>(null);

  useEffect(() => {
    if (!isProjectWorkspacePath(pathname)) {
      setWorkspaceFeature(null);
    }
  }, [pathname]);

  function toggleWorkspaceFeature(id: WorkspaceFeatureId) {
    setWorkspaceFeature((prev) => (prev === id ? null : id));
  }

  const sidebarRail = (
        <Sidebar
          className={cn(
            isProjectWorkspace && "h-full max-h-full w-16 items-stretch"
          )}
          aria-label={isProjectWorkspace ? "Compact workspace navigation" : undefined}
        >
          {!isProjectWorkspace ? (
            <SidebarHeader className="px-2">
              <button
                type="button"
                className="mb-2.5 flex w-full min-w-0 items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm/6 font-medium text-white outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/25"
                aria-expanded="false"
                aria-haspopup="menu"
              >
                <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                  {logo ?? <DefaultSidebarLogo label={teamLabel} />}
                </span>
                <SidebarLabel className="flex-1">{teamLabel}</SidebarLabel>
                <ChevronDown
                  className="size-4 shrink-0 text-zinc-500"
                  aria-hidden
                />
              </button>

              <SidebarSection>
                <SidebarItem href="/search" current={isSearch}>
                  <Search className="size-5 shrink-0" strokeWidth={1.75} />
                  <SidebarLabel>Search</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
            </SidebarHeader>
          ) : null}

          <SidebarBody
            className={cn(isProjectWorkspace && "px-1.5 pt-4")}
          >
            <SidebarSection
              className={cn(isProjectWorkspace && "space-y-2")}
            >
              {isProjectWorkspace ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          SIDEBAR_COMPACT_ICON_BUTTON,
                          workspaceFeature === "media" &&
                            "bg-white/10 text-white"
                        )}
                        aria-label="Media"
                        aria-pressed={workspaceFeature === "media"}
                        onClick={() => toggleWorkspaceFeature("media")}
                      >
                        <ImageIcon
                          className="size-6 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Media</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          SIDEBAR_COMPACT_ICON_BUTTON,
                          workspaceFeature === "frame" &&
                            "bg-white/10 text-white"
                        )}
                        aria-label="Frame"
                        aria-pressed={workspaceFeature === "frame"}
                        onClick={() => toggleWorkspaceFeature("frame")}
                      >
                        <Frame
                          className="size-6 shrink-0"
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
                        className={cn(
                          SIDEBAR_COMPACT_ICON_BUTTON,
                          workspaceFeature === "background" &&
                            "bg-white/10 text-white"
                        )}
                        aria-label="Canvas"
                        aria-pressed={workspaceFeature === "background"}
                        onClick={() => toggleWorkspaceFeature("background")}
                      >
                        <Palette
                          className="size-6 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Canvas</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/projects"
                        className={cn(
                          SIDEBAR_COMPACT_ICON_BUTTON,
                          isProjects && "bg-white/10 text-white"
                        )}
                        aria-label="Projects"
                        aria-current={isProjects ? "page" : undefined}
                      >
                        <Folder
                          className="size-6 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Projects</TooltipContent>
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
  );

  const workspaceSidebar =
    isProjectWorkspace && workspaceFeature ? (
      <div className="hidden h-full min-h-0 shrink-0 flex-row overflow-hidden lg:flex">
        {sidebarRail}
        <aside
          className="flex h-full min-h-0 w-[304px] min-w-[304px] shrink-0 flex-col overflow-hidden border-r border-zinc-800 bg-zinc-900"
          aria-label={
            workspaceFeature === "frame"
              ? "Frame tools"
              : workspaceFeature === "background"
                ? "Canvas tools"
                : "Media tools"
          }
        >
          <WorkspaceFeaturePanel feature={workspaceFeature} />
        </aside>
      </div>
    ) : (
      sidebarRail
    );

  return (
    <TooltipProvider>
      <ProjectWorkspaceTitleProvider>
        {isProjectWorkspace ? (
          <MockupFrameProvider>
            <MockupMediaProvider>
              <MockupWorkspaceHistoryProvider>
                <ProjectWorkspaceHydrate />
                <div className="flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden bg-zinc-900">
                  <WorkspaceTopBar
                    teamLabel={teamLabel}
                    logo={logo}
                    className="relative z-10 shrink-0"
                  />
                  <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
                    {workspaceSidebar}
                    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto border-zinc-800 bg-zinc-950 lg:border-l">
                      {children}
                    </main>
                  </div>
                </div>
              </MockupWorkspaceHistoryProvider>
            </MockupMediaProvider>
          </MockupFrameProvider>
        ) : (
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
            sidebar={sidebarRail}
          >
            {children}
          </SidebarLayout>
        )}
      </ProjectWorkspaceTitleProvider>
    </TooltipProvider>
  );
}
