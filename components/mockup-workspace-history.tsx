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
import type {
  MockupLibraryItem,
  MockupVisualSlot,
} from "@/components/mockup-media-context";
import { useMockupMedia } from "@/components/mockup-media-context";
import { normalizeAspectPreset } from "@/lib/mockup-aspect";
import {
  captureWorkspaceSnapshot,
  createCanvasResetSnapshot,
  serializeWorkspaceSnapshot,
  type VisualWorkspacePrefs,
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

function navFromIndex(snapshots: WorkspaceSnapshot[], index: number) {
  return {
    canUndo: index > 0,
    canRedo: index >= 0 && index < snapshots.length - 1,
  };
}

function coerceVisualState(snap: WorkspaceSnapshot): {
  library: MockupLibraryItem[];
  visuals: MockupVisualSlot[];
  activeVisualId: string | null;
} {
  const library = snap.mediaItems as MockupLibraryItem[];
  const visuals: MockupVisualSlot[] =
    snap.visualSlots && snap.visualSlots.length > 0
      ? (snap.visualSlots as MockupVisualSlot[])
      : library.map((m) => ({
          id: m.id,
          mediaId: m.id,
        }));
  let activeVisualId = snap.activeVisualId ?? null;
  if (
    activeVisualId &&
    !visuals.some((v) => v.id === activeVisualId)
  ) {
    activeVisualId = visuals[visuals.length - 1]?.id ?? null;
  }
  if (!activeVisualId && visuals.length > 0) {
    activeVisualId = visuals[visuals.length - 1]!.id;
  }
  return { library, visuals, activeVisualId };
}

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
  /** Derived from history stack — never read historyRef during render (concurrent-safe). */
  const [navFlags, setNavFlags] = useState({ canUndo: false, canRedo: false });

  const commitHistory = useCallback(
    (snapshots: WorkspaceSnapshot[], index: number) => {
      historyRef.current = { snapshots, index };
      setNavFlags(navFromIndex(snapshots, index));
    },
    []
  );

  const snapshot = useMemo(
    () =>
      captureWorkspaceSnapshot(frame, {
        library: media.library,
        visuals: media.visuals,
        activeVisualId: media.activeVisualId,
        visualWorkspacePrefs: media.visualWorkspacePrefs,
      }),
    [
      frame,
      media.library,
      media.visuals,
      media.activeVisualId,
      media.visualWorkspacePrefs,
    ]
  );

  useEffect(() => {
    commitHistory([], -1);
  }, [pathname, commitHistory]);

  useEffect(() => {
    canRecordRef.current = false;
    const t = window.setTimeout(() => {
      canRecordRef.current = true;
    }, 220);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (isApplyingRef.current) return;
    const handle = window.setTimeout(() => {
      if (!canRecordRef.current || isApplyingRef.current) return;
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
      commitHistory(nextSnapshots, nextSnapshots.length - 1);
    }, 420);
    return () => window.clearTimeout(handle);
  }, [snapshot, commitHistory]);

  const applySnapshot = useCallback(
    (snap: WorkspaceSnapshot) => {
      isApplyingRef.current = true;
      frame.setAspectPreset(normalizeAspectPreset(snap.aspectPreset));
      frame.hydrateCanvasBackground(snap.canvasBackground);
      const { library, visuals, activeVisualId } = coerceVisualState(snap);
      const frameSeed: VisualWorkspacePrefs = {
        aspectPreset: snap.aspectPreset,
        canvasBackground: snap.canvasBackground ?? null,
      };
      media.replaceWorkspaceMedia(
        library,
        visuals,
        activeVisualId,
        frameSeed,
        snap.visualWorkspacePrefs ?? null
      );
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
    commitHistory(snapshots, index - 1);
  }, [applySnapshot, commitHistory]);

  const redo = useCallback(() => {
    const { snapshots, index } = historyRef.current;
    if (index < 0 || index >= snapshots.length - 1) return;
    applySnapshot(snapshots[index + 1]!);
    commitHistory(snapshots, index + 1);
  }, [applySnapshot, commitHistory]);

  const resetAll = useCallback(() => {
    const resetSnap = createCanvasResetSnapshot(
      media.library.map((m) => ({ ...m }))
    );
    const { snapshots, index } = historyRef.current;
    applySnapshot(resetSnap);
    let nextSnapshots = [...snapshots.slice(0, index + 1), resetSnap];
    if (nextSnapshots.length > MAX_SNAPSHOTS) {
      nextSnapshots = nextSnapshots.slice(-MAX_SNAPSHOTS);
    }
    commitHistory(nextSnapshots, nextSnapshots.length - 1);
  }, [applySnapshot, commitHistory, media.library]);

  const value = useMemo(
    () => ({
      undo,
      redo,
      resetAll,
      canUndo: navFlags.canUndo,
      canRedo: navFlags.canRedo,
    }),
    [undo, redo, resetAll, navFlags.canUndo, navFlags.canRedo]
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
