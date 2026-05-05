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

import { getWorkspaceTitle, isProjectWorkspacePath } from "@/lib/project-workspace";

type ProjectWorkspaceTitleContextValue = {
  title: string;
  setTitle: (value: string) => void;
};

const ProjectWorkspaceTitleContext =
  createContext<ProjectWorkspaceTitleContextValue | null>(null);

export function ProjectWorkspaceTitleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [title, setTitle] = useState(() =>
    isProjectWorkspacePath(pathname) ? getWorkspaceTitle(pathname) : ""
  );

  useEffect(() => {
    if (isProjectWorkspacePath(pathname)) {
      setTitle(getWorkspaceTitle(pathname));
    }
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
