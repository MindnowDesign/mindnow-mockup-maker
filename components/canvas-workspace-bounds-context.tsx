"use client";

import { createContext, useContext, useRef, type ReactNode, type RefObject } from "react";

const CanvasWorkspaceBoundsContext =
  createContext<RefObject<HTMLElement | null> | null>(null);

export function useCanvasWorkspaceBounds() {
  return useContext(CanvasWorkspaceBoundsContext);
}

export function CanvasWorkspaceBoundsProvider({
  children,
  boundaryRef,
}: {
  children: ReactNode;
  boundaryRef: RefObject<HTMLElement | null>;
}) {
  return (
    <CanvasWorkspaceBoundsContext.Provider value={boundaryRef}>
      {children}
    </CanvasWorkspaceBoundsContext.Provider>
  );
}

export function useCanvasWorkspaceBoundaryRef() {
  return useRef<HTMLDivElement>(null);
}
