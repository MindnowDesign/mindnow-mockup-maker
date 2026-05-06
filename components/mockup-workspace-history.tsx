"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { useMockupFrame } from "@/components/mockup-frame-context";
import type { MockupMediaItem } from "@/components/mockup-media-context";
import { useMockupMedia } from "@/components/mockup-media-context";
import {
  captureWorkspaceSnapshot,
  DEFAULT_WORKSPACE_SNAPSHOT,
  serializeWorkspaceSnapshot,
  type WorkspaceSnapshot,
} from "@/lib/mockup-workspace-snapshot";

const MAX_SNAPSHOTS = 80;

type MockupWorkspaceHistoryValue = {
  undo: () => void;
  redo: () => void;
  resetAll: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const MockupWorkspaceHistoryContext =
  createContext<MockupWorkspaceHistoryValue | null>(null);

export function MockupWorkspaceHistoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const frame = useMockupFrame();
  const media = useMockupMedia();

  const historyRef = useRef<{ snapshots: WorkspaceSnapshot[]; index: number }>({
    snapshots: [],
    index: -1,
  });
  const isApplyingRef = useRef(false);
  const canRecordRef = useRef(false);
  const [, bump] = useState(0);

  const snapshot = useMemo(
    () => captureWorkspaceSnapshot(frame, media),
    [frame, media.items, media.activeId]
  );

  useEffect(() => {
    canRecordRef.current = false;
    const t = window.setTimeout(() => {
      canRecordRef.current = true;
    }, 220);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!canRecordRef.current || isApplyingRef.current) return;
    const handle = window.setTimeout(() => {
      if (isApplyingRef.current) return;
      const key = serializeWorkspaceSnapshot(snapshot);
      const { snapshots, index } = historyRef.current;
      const curKey =
        index >= 0 && snapshots[index]
          ? serializeWorkspaceSnapshot(snapshots[index]!)
          : "";
      if (key === curKey) return;

      let nextSnapshots = [...snapshots.slice(0, index + 1), snapshot];
      if (nextSnapshots.length > MAX_SNAPSHOTS) {
        nextSnapshots = nextSnapshots.slice(-MAX_SNAPSHOTS);
      }
      historyRef.current = {
        snapshots: nextSnapshots,
        index: nextSnapshots.length - 1,
      };
      bump((n) => n + 1);
    }, 420);
    return () => window.clearTimeout(handle);
  }, [snapshot]);

  const applySnapshot = useCallback(
    (snap: WorkspaceSnapshot) => {
      isApplyingRef.current = true;
      frame.setAspectPreset(snap.aspectPreset);
      frame.hydrateCanvasBackground(snap.canvasBackground);
      media.replaceLibrary(snap.mediaItems as MockupMediaItem[], snap.activeMediaId);
      window.requestAnimationFrame(() => {
        isApplyingRef.current = false;
      });
    },
    [frame, media]
  );

  const undo = useCallback(() => {
    const { snapshots, index } = historyRef.current;
    if (index <= 0 || !snapshots[index - 1]) return;
    applySnapshot(snapshots[index - 1]!);
    historyRef.current = { snapshots, index: index - 1 };
    bump((n) => n + 1);
  }, [applySnapshot]);

  const redo = useCallback(() => {
    const { snapshots, index } = historyRef.current;
    if (index < 0 || index >= snapshots.length - 1) return;
    applySnapshot(snapshots[index + 1]!);
    historyRef.current = { snapshots, index: index + 1 };
    bump((n) => n + 1);
  }, [applySnapshot]);

  const resetAll = useCallback(() => {
    const blank = {
      ...DEFAULT_WORKSPACE_SNAPSHOT,
      mediaItems: [],
      activeMediaId: null,
    };
    applySnapshot(blank);
    historyRef.current = {
      snapshots: [blank],
      index: 0,
    };
    bump((n) => n + 1);
  }, [applySnapshot]);

  const { snapshots, index } = historyRef.current;
  const canUndo = index > 0;
  const canRedo = index >= 0 && index < snapshots.length - 1;

  const value = useMemo(
    () => ({
      undo,
      redo,
      resetAll,
      canUndo,
      canRedo,
    }),
    [undo, redo, resetAll, canUndo, canRedo]
  );

  return (
    <MockupWorkspaceHistoryContext.Provider value={value}>
      {children}
    </MockupWorkspaceHistoryContext.Provider>
  );
}

export function useMockupWorkspaceHistory() {
  const ctx = useContext(MockupWorkspaceHistoryContext);
  if (!ctx) {
    throw new Error(
      "useMockupWorkspaceHistory must be used within MockupWorkspaceHistoryProvider"
    );
  }
  return ctx;
}
