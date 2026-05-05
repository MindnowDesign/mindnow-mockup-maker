"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { FrameAspectPresetId } from "@/lib/mockup-aspect";

type MockupFrameContextValue = {
  aspectPreset: FrameAspectPresetId;
  setAspectPreset: (id: FrameAspectPresetId) => void;
};

const MockupFrameContext = createContext<MockupFrameContextValue | null>(null);

export function MockupFrameProvider({ children }: { children: ReactNode }) {
  const [aspectPreset, setAspectPreset] =
    useState<FrameAspectPresetId>("square-1-1");

  const value = useMemo(
    () => ({ aspectPreset, setAspectPreset }),
    [aspectPreset]
  );

  return (
    <MockupFrameContext.Provider value={value}>
      {children}
    </MockupFrameContext.Provider>
  );
}

export function useMockupFrame() {
  const ctx = useContext(MockupFrameContext);
  if (!ctx) {
    throw new Error("useMockupFrame must be used within MockupFrameProvider");
  }
  return ctx;
}
