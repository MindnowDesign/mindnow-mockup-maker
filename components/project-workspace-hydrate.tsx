"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { getSavedProject } from "@/lib/saved-projects";
import { getProjectsWorkspaceSegment } from "@/lib/project-workspace";

/**
 * Restores frame preset when opening a saved project (`/projects/:id`).
 * Title is handled in `ProjectWorkspaceTitleProvider`.
 */
export function ProjectWorkspaceHydrate() {
  const pathname = usePathname();
  const { setAspectPreset } = useMockupFrame();

  useEffect(() => {
    const segment = getProjectsWorkspaceSegment(pathname);
    if (!segment || segment === "new") return;
    const saved = getSavedProject(segment);
    if (saved) setAspectPreset(saved.aspectPreset);
  }, [pathname, setAspectPreset]);

  return null;
}
