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

import type { SavedMediaItem } from "@/lib/saved-projects";

export type MockupMediaItem = {
  id: string;
  kind: "image" | "video";
  url: string;
};

type MockupMediaState = {
  items: MockupMediaItem[];
  activeId: string | null;
};

export type HydrateFromSavedPayload = {
  mediaItems?: SavedMediaItem[];
  activeMediaId?: string | null;
} | null;

type MockupMediaContextValue = {
  items: MockupMediaItem[];
  activeId: string | null;
  activeItem: MockupMediaItem | null;
  addFromFileList: (files: FileList | null) => void;
  setActiveId: (id: string | null) => void;
  remove: (id: string) => void;
  /** Replace library from localStorage (or clear when `null`). */
  hydrateFromSaved: (payload: HydrateFromSavedPayload) => void;
};

const MockupMediaContext = createContext<MockupMediaContextValue | null>(null);

function revokeIfBlobUrl(url: string) {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

function pickKind(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

export function MockupMediaProvider({ children }: { children: ReactNode }) {
  const [{ items, activeId }, setState] = useState<MockupMediaState>({
    items: [],
    activeId: null,
  });
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        revokeIfBlobUrl(item.url);
      }
    };
  }, []);

  const hydrateFromSaved = useCallback((payload: HydrateFromSavedPayload) => {
    setState((s) => {
      for (const item of s.items) {
        revokeIfBlobUrl(item.url);
      }
      if (!payload?.mediaItems?.length) {
        return { items: [], activeId: null };
      }
      const nextItems: MockupMediaItem[] = payload.mediaItems.map((m) => ({
        id: m.id,
        kind: m.kind,
        url: m.dataUrl,
      }));
      let nextActive = payload.activeMediaId ?? null;
      if (nextActive && !nextItems.some((i) => i.id === nextActive)) {
        nextActive = null;
      }
      if (!nextActive) {
        nextActive = nextItems[nextItems.length - 1]!.id;
      }
      return { items: nextItems, activeId: nextActive };
    });
  }, []);

  const addFromFileList = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const kind = pickKind(file);
    if (!kind) return;
    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);
    const entry: MockupMediaItem = { id, kind, url };
    setState((s) => ({
      items: [...s.items, entry],
      activeId: id,
    }));
  }, []);

  const setActiveId = useCallback((id: string | null) => {
    setState((s) => ({ ...s, activeId: id }));
  }, []);

  const remove = useCallback((id: string) => {
    setState((s) => {
      const target = s.items.find((x) => x.id === id);
      if (target) revokeIfBlobUrl(target.url);
      const nextItems = s.items.filter((x) => x.id !== id);
      let nextActive = s.activeId;
      if (nextActive === id) {
        nextActive = nextItems[nextItems.length - 1]?.id ?? null;
      }
      return { items: nextItems, activeId: nextActive };
    });
  }, []);

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return items.find((x) => x.id === activeId) ?? null;
  }, [items, activeId]);

  const value = useMemo(
    () => ({
      items,
      activeId,
      activeItem,
      addFromFileList,
      setActiveId,
      remove,
      hydrateFromSaved,
    }),
    [
      items,
      activeId,
      activeItem,
      addFromFileList,
      setActiveId,
      remove,
      hydrateFromSaved,
    ]
  );

  return (
    <MockupMediaContext.Provider value={value}>
      {children}
    </MockupMediaContext.Provider>
  );
}

export function useMockupMedia() {
  const ctx = useContext(MockupMediaContext);
  if (!ctx) {
    throw new Error("useMockupMedia must be used within MockupMediaProvider");
  }
  return ctx;
}
