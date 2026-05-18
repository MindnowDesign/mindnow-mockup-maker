"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  isOrganicImageDecoded,
  preloadOrganicImagePath,
  subscribeOrganicImageCache,
} from "@/lib/organic-image-cache";

/** True once the display WebP for `path` has been decoded (module cache). */
export function useOrganicImageReady(path: string | null): boolean {
  useEffect(() => {
    if (!path) return;
    void preloadOrganicImagePath(path).catch(() => {
      /* UI keeps placeholder until retry */
    });
  }, [path]);

  return useSyncExternalStore(
    subscribeOrganicImageCache,
    () => (path ? isOrganicImageDecoded(path) : false),
    () => false
  );
}
