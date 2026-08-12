"use client";

import {
  Folder,
  Frame,
  Image as ImageIcon,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { MockupFrameProvider } from "@/components/mockup-frame-context";
import { MockupMediaProvider } from "@/components/mockup-media-context";
import { MockupWorkspaceHistoryProvider } from "@/components/mockup-workspace-history";
import { ProjectWorkspaceHydrate } from "@/components/project-workspace-hydrate";
import { UserProfileDialog } from "@/components/user-profile-dialog";
import { WorkspaceTopBar } from "@/components/workspace-top-bar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
} from "@/components/sidebar";
import {
  WorkspaceFeaturePanel,
  type WorkspaceFeatureId,
} from "@/components/workspace-feature-panel";
import { cn } from "@/lib/utils";

/** Workspace rail icon buttons — larger hit target than footer avatar. */
const SIDEBAR_WORKSPACE_RAIL_ITEM =
  "mx-auto flex size-12 shrink-0 items-center justify-center gap-0 px-0 py-0";

/** Logo / account controls in compact sidebar match the same dimensions. */
const SIDEBAR_COMPACT_CONTROL =
  "mx-auto flex size-10 shrink-0 items-center justify-center px-0 py-0";

/** Compact sidebar button (no route) — matches inactive `SidebarItem` look. */
const SIDEBAR_COMPACT_ICON_BUTTON = cn(
  "flex min-w-0 items-center gap-0 rounded-lg text-sm/6 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
  "text-zinc-400 hover:bg-white/5 hover:text-white",
  SIDEBAR_WORKSPACE_RAIL_ITEM
);

export type ProjectWorkspaceShellUser = {
  firstName: string;
  lastName: string;
  email: string;
};

function getInitials(firstName: string, lastName: string) {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return (a + b).toUpperCase() || "–";
}

type ProjectWorkspaceShellProps = {
  children: ReactNode;
  user: ProjectWorkspaceShellUser;
  logo?: ReactNode;
  teamLabel?: string;
};

/**
 * Project workspace chrome: mockup providers, top bar, compact rail, feature panel.
 * Loaded only on `/projects/:id` routes via dynamic import from `CatalystShell`.
 */
export function ProjectWorkspaceShell({
  children,
  user,
  logo,
  teamLabel = "Mindnow",
}: ProjectWorkspaceShellProps) {
  const pathname = usePathname();
  const isProjects = pathname === "/projects";
  const initials = getInitials(user.firstName, user.lastName);

  const [workspaceFeature, setWorkspaceFeature] =
    useState<WorkspaceFeatureId | null>(null);

  function toggleWorkspaceFeature(id: WorkspaceFeatureId) {
    setWorkspaceFeature((prev) => (prev === id ? null : id));
  }

  const sidebarRail = (
    <Sidebar
      className="h-full max-h-full w-16 items-stretch"
      aria-label="Compact workspace navigation"
    >
      <SidebarBody className="px-1.5 pt-4">
        <SidebarSection className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  SIDEBAR_COMPACT_ICON_BUTTON,
                  workspaceFeature === "media" && "bg-white/10 text-white"
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
                  workspaceFeature === "frame" && "bg-white/10 text-white"
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
                  workspaceFeature === "background" && "bg-white/10 text-white"
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
        </SidebarSection>
      </SidebarBody>

      <SidebarFooter className="px-1.5">
        <UserProfileDialog
          user={user}
          teamLabel={teamLabel}
          trigger={
            <button
              type="button"
              className={cn(
                "flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/25",
                SIDEBAR_COMPACT_CONTROL
              )}
              aria-label={`${user.firstName} ${user.lastName} — ${user.email}`}
              aria-haspopup="dialog"
            >
              <span className="flex min-w-0 flex-none items-center justify-center gap-3">
                <Avatar className="size-10 shrink-0 rounded-full after:rounded-full [&_[data-slot=avatar-fallback]]:rounded-full">
                  <AvatarFallback
                    className="rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: "#D94716" }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </span>
            </button>
          }
        />
      </SidebarFooter>
    </Sidebar>
  );

  // Stable wrapper so the rail does not remount when the feature panel opens.
  const workspaceSidebar = (
    <div className="hidden h-full min-h-0 shrink-0 flex-row overflow-hidden lg:flex">
      {sidebarRail}
      {workspaceFeature ? (
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
      ) : null}
    </div>
  );

  return (
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
  );
}
