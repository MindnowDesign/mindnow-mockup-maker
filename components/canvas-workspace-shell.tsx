"use client";

import type { ReactNode } from "react";

import {
  CanvasWorkspaceBoundsProvider,
  useCanvasWorkspaceBoundaryRef,
} from "@/components/canvas-workspace-bounds-context";
import { cn } from "@/lib/utils";

export function CanvasWorkspaceShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const boundaryRef = useCanvasWorkspaceBoundaryRef();

  return (
    <CanvasWorkspaceBoundsProvider boundaryRef={boundaryRef}>
      <div
        ref={boundaryRef}
        className={cn(
          "relative grid min-h-full w-full place-items-center px-[72px] py-10",
          className
        )}
      >
        {children}
      </div>
    </CanvasWorkspaceBoundsProvider>
  );
}
