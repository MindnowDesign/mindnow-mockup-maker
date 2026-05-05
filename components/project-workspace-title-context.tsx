"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { getSavedProject } from "@/lib/saved-projects";
import {
  getProjectsWorkspaceSegment,
  getWorkspaceTitle,
  isProjectWorkspacePath,
} from "@/lib/project-workspace";

type ProjectWorkspaceTitleContextValue = {
  title: string;
  setTitle: (value: string) => void;
};

const ProjectWorkspaceTitleContext =
  createContext<ProjectWorkspaceTitleContextValue | null>(null);

function initialTitleForPath(pathname: string): string {
  if (!isProjectWorkspacePath(pathname)) return "";
  const segment = getProjectsWorkspaceSegment(pathname);
  if (!segment || segment === "new") return getWorkspaceTitle(pathname);
  if (typeof window === "undefined") return getWorkspaceTitle(pathname);
  const saved = getSavedProject(segment);
  return saved?.title?.trim() || getWorkspaceTitle(pathname);
}

export function ProjectWorkspaceTitleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [title, setTitle] = useState(() => initialTitleForPath(pathname));

  useEffect(() => {
    if (!isProjectWorkspacePath(pathname)) return;
    const segment = getProjectsWorkspaceSegment(pathname);
    if (!segment) return;
    if (segment === "new") {
      setTitle(getWorkspaceTitle(pathname));
      return;
    }
    const saved = getSavedProject(segment);
    setTitle(saved?.title?.trim() || getWorkspaceTitle(pathname));
  }, [pathname]);

  const value = useMemo(() => ({ title, setTitle }), [title]);

  return (
    <ProjectWorkspaceTitleContext.Provider value={value}>
      {children}
    </ProjectWorkspaceTitleContext.Provider>
  );
}

export function useProjectWorkspaceTitle() {
  const ctx = useContext(ProjectWorkspaceTitleContext);
  if (!ctx) {
    throw new Error(
      "useProjectWorkspaceTitle must be used within ProjectWorkspaceTitleProvider"
    );
  }
  return ctx;
}
