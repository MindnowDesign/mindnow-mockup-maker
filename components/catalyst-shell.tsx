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
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ProjectWorkspaceTitleProvider } from "@/components/project-workspace-title-context";
import { UserAvatar, UserProfileDialog, fullName } from "@/components/user-profile-dialog";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  GlobalSearchOverlay,
  GlobalSearchProvider,
  useGlobalSearch,
} from "@/components/global-search";
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

const ProjectWorkspaceShell = dynamic(
  () =>
    import("@/components/project-workspace-shell").then(
      (m) => m.ProjectWorkspaceShell
    ),
  {
    loading: () => (
      <div
        className="h-dvh max-h-dvh w-full bg-shell"
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
  avatarUrl?: string | null;
};

const defaultUser: CatalystShellUser = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
};

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
  onSignOut?: () => void | Promise<void>;
};

/**
 * Application shell mirroring the Catalyst `SidebarLayout` + `Sidebar` + `Navbar` composition.
 * Project routes under `/projects/:id` use a compact icon-only sidebar and a workspace top bar.
 * @see https://catalyst.tailwindui.com/docs/sidebar-layout
 */
export function CatalystShell({
  children,
  user: authUser = defaultUser,
  logo,
  teamLabel = "Mindnow",
  onSignOut,
}: CatalystShellProps) {
  const pathname = usePathname();
  const [profileUser, setProfileUser] = useState(authUser);
  const hasLocalProfileEdit = useRef(false);

  useEffect(() => {
    hasLocalProfileEdit.current = false;
    setProfileUser(authUser);
  }, [authUser.email]);

  useEffect(() => {
    setProfileUser((prev) => {
      if (hasLocalProfileEdit.current) {
        return {
          ...authUser,
          firstName: prev.firstName,
          lastName: prev.lastName,
          avatarUrl: prev.avatarUrl ?? null,
        };
      }

      return {
        ...authUser,
        avatarUrl: authUser.avatarUrl ?? null,
      };
    });
  }, [
    authUser.email,
    authUser.firstName,
    authUser.lastName,
    authUser.avatarUrl,
  ]);

  function handleProfileUserChange(next: CatalystShellUser) {
    hasLocalProfileEdit.current = true;
    setProfileUser(next);
  }

  const isProjectWorkspace = isProjectWorkspacePath(pathname);
  const isHome = pathname === "/";
  const isProjects = pathname === "/projects";
  const isTrash = pathname === "/trash";
  const isAccount = pathname === "/account";

  return (
    <TooltipProvider>
      <ProjectWorkspaceTitleProvider>
        <GlobalSearchProvider>
          {isProjectWorkspace ? (
            <ProjectWorkspaceShell
              user={profileUser}
              logo={logo}
              teamLabel={teamLabel}
              onSignOut={onSignOut}
              onUserChange={handleProfileUserChange}
            >
              {children}
            </ProjectWorkspaceShell>
          ) : (
            <MainAppChrome
              user={profileUser}
              logo={logo}
              teamLabel={teamLabel}
              isHome={isHome}
              isProjects={isProjects}
              isTrash={isTrash}
              isAccount={isAccount}
              onSignOut={onSignOut}
              onUserChange={handleProfileUserChange}
            >
              {children}
            </MainAppChrome>
          )}
          <GlobalSearchOverlay />
        </GlobalSearchProvider>
      </ProjectWorkspaceTitleProvider>
    </TooltipProvider>
  );
}

function MainAppChrome({
  children,
  user,
  logo,
  teamLabel,
  isHome,
  isProjects,
  isTrash,
  isAccount,
  onSignOut,
  onUserChange,
}: {
  children: ReactNode;
  user: CatalystShellUser;
  logo?: ReactNode;
  teamLabel: string;
  isHome: boolean;
  isProjects: boolean;
  isTrash: boolean;
  isAccount: boolean;
  onSignOut?: () => void | Promise<void>;
  onUserChange?: (user: CatalystShellUser) => void;
}) {
  const { isOpen: searchOpen, toggle: toggleSearch } = useGlobalSearch();

  const sidebarRail = (
    <Sidebar>
      <SidebarHeader className="px-2">
        <div className="mb-2.5 flex w-full min-w-0 items-center gap-3 rounded-lg px-2.5 py-2 text-sm/6 font-medium text-neutral-50">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            {logo ?? <DefaultSidebarLogo label={teamLabel} />}
          </span>
          <SidebarLabel className="flex-1">{teamLabel}</SidebarLabel>
        </div>

        <SidebarSection>
          <SidebarItem
            current={searchOpen}
            onClick={toggleSearch}
            aria-label="Search"
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
          >
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
          onSignOut={onSignOut}
          onUserChange={onUserChange}
          trigger={
            <button
              type="button"
              className="flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/25"
              aria-label={`${fullName(user)} — ${user.email}`}
              aria-haspopup="dialog"
            >
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar
                  user={user}
                  className="size-10"
                  fallbackClassName="text-sm"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm/5 font-medium text-neutral-50">
                    {fullName(user)}
                  </span>
                  <span className="block truncate text-xs/5 font-normal text-neutral-400">
                    {user.email}
                  </span>
                </span>
              </span>
              <ChevronUp className="size-4 shrink-0 text-neutral-500" aria-hidden />
            </button>
          }
        />
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem
              current={searchOpen}
              onClick={toggleSearch}
              aria-label="Search"
              aria-haspopup="dialog"
              aria-expanded={searchOpen}
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
              <UserAvatar
                user={user}
                className="size-8"
                fallbackClassName="text-xs"
              />
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={sidebarRail}
    >
      {children}
    </SidebarLayout>
  );
}
