"use client";

import { CloudCheck, Download, Loader2, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { Button } from "@/components/ui/button";
import { useProjectWorkspaceTitle } from "@/components/project-workspace-title-context";
import {
  getProjectsWorkspaceSegment,
  getWorkspaceTitle,
} from "@/lib/project-workspace";
import { notifySavedProjectsChanged, upsertSavedProject } from "@/lib/saved-projects";
import { cn } from "@/lib/utils";

const DEFAULT_WORKSPACE_LOGO_SRC = "/images/logo.png";

type WorkspaceTopBarProps = {
  className?: string;
  /** Shown next to the logo (accessibility / branding). */
  teamLabel?: string;
  /** Replace default Mindnow mark in the header. */
  logo?: ReactNode;
};

type SavePhase = "idle" | "loading" | "saved";

const SAVE_SAVED_MS = 2000;

/**
 * Top bar for project workspace routes: logo (home) + editable title + Save / Export.
 */
export function WorkspaceTopBar({
  className,
  teamLabel = "Mindnow",
  logo,
}: WorkspaceTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { aspectPreset } = useMockupFrame();
  const { title, setTitle } = useProjectWorkspaceTitle();
  const fallbackTitle = getWorkspaceTitle(pathname);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [savePhase, setSavePhase] = useState<SavePhase>("idle");
  const saveTimersRef = useRef<{ reset?: ReturnType<typeof setTimeout> }>({});

  useEffect(() => {
    return () => {
      clearTimeout(saveTimersRef.current.reset);
    };
  }, []);

  async function handleSave() {
    if (savePhase !== "idle") return;
    const segment = getProjectsWorkspaceSegment(pathname);
    if (!segment) return;

    clearTimeout(saveTimersRef.current.reset);

    setSavePhase("loading");

    try {
      const projectId = segment === "new" ? crypto.randomUUID() : segment;

      const el = document.querySelector<HTMLElement>(
        "[data-mockup-capture-target]"
      );
      let previewDataUrl = "";
      if (el) {
        const { toPng } = await import("html-to-image");
        const maxSide = Math.max(el.offsetWidth, el.offsetHeight, 1);
        const pixelRatio = Math.min(1.25, 640 / maxSide);
        previewDataUrl = await toPng(el, {
          cacheBust: true,
          pixelRatio,
        });
      }

      const resolvedTitle = title.trim() || fallbackTitle;

      upsertSavedProject({
        id: projectId,
        title: resolvedTitle,
        updatedAt: Date.now(),
        previewDataUrl,
        aspectPreset,
        visualCount: 1,
      });
      notifySavedProjectsChanged();

      if (segment === "new") {
        router.replace(`/projects/${projectId}`);
      }

      setSavePhase("saved");
      saveTimersRef.current.reset = setTimeout(() => {
        setSavePhase("idle");
      }, SAVE_SAVED_MS);
    } catch (e) {
      console.error(e);
      setSavePhase("idle");
    }
  }

  return (
    <header
      className={cn(
        "flex min-h-14 shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          href="/"
          aria-label="Home"
          className="flex size-[40px] shrink-0 flex-none items-center justify-center overflow-hidden rounded-lg text-zinc-400 outline-none transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            {logo ?? (
              <Image
                src={DEFAULT_WORKSPACE_LOGO_SRC}
                alt=""
                width={32}
                height={32}
                className="size-full object-contain"
                priority
              />
            )}
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 justify-start">
          <div className="group inline-flex w-fit max-w-full min-w-0 cursor-text items-center gap-2">
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                const trimmed = title.trim();
                setTitle(trimmed || fallbackTitle);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  setTitle(fallbackTitle);
                  e.currentTarget.blur();
                }
              }}
              spellCheck={false}
              autoComplete="off"
              aria-label="Project name"
              placeholder="Untitled project"
              maxLength={128}
              className={cn(
                "max-w-full border-0 bg-transparent px-0 py-0 text-base font-semibold tracking-tight text-white outline-none ring-0 shadow-none",
                "min-w-0 [field-sizing:content]",
                "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
                "placeholder:text-zinc-500"
              )}
            />
            <span
              className={cn(
                "inline-flex shrink-0 opacity-0 transition-opacity duration-150",
                "group-hover:opacity-100 group-focus-within:opacity-100"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                titleInputRef.current?.focus();
              }}
            >
              <Pencil
                className="size-4 text-zinc-500"
                strokeWidth={2}
                aria-hidden
              />
            </span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={savePhase !== "idle"}
          aria-busy={savePhase === "loading"}
          onClick={handleSave}
          className="border-zinc-700 bg-zinc-900/60 text-zinc-100 hover:bg-zinc-800 hover:text-white"
        >
          {savePhase === "loading" && (
            <Loader2
              className="size-4 shrink-0 animate-spin"
              strokeWidth={1.75}
              aria-hidden
            />
          )}
          {savePhase === "saved" && (
            <CloudCheck
              className="size-4 shrink-0 text-emerald-400"
              strokeWidth={1.75}
              aria-hidden
            />
          )}
          <span>
            {savePhase === "loading" && "Saving…"}
            {savePhase === "saved" && "Saved"}
            {savePhase === "idle" && "Save"}
          </span>
        </Button>
        <Button
          type="button"
          variant="default"
          size="lg"
        >
          <Download className="size-4" strokeWidth={1.75} aria-hidden />
          Export
        </Button>
      </div>
    </header>
  );
}
