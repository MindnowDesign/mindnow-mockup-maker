"use client";

import { Download, Home, Pencil, Save } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { useProjectWorkspaceTitle } from "@/components/project-workspace-title-context";
import { getWorkspaceTitle } from "@/lib/project-workspace";
import { cn } from "@/lib/utils";

type WorkspaceTopBarProps = {
  className?: string;
};

/**
 * Top bar for project workspace routes: Home link + editable title + Save / Export.
 */
export function WorkspaceTopBar({ className }: WorkspaceTopBarProps) {
  const pathname = usePathname();
  const { title, setTitle } = useProjectWorkspaceTitle();
  const fallbackTitle = getWorkspaceTitle(pathname);
  const titleInputRef = useRef<HTMLInputElement>(null);

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
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors outline-none hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          aria-label="Home"
        >
          <Home className="size-5" strokeWidth={1.75} />
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
          size="sm"
          className="h-10 gap-2 px-[12px] border-zinc-700 bg-zinc-900/60 text-zinc-100 hover:bg-zinc-800 hover:text-white"
        >
          <Save className="size-4" strokeWidth={1.75} aria-hidden />
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 gap-2 px-[12px] border-zinc-700 bg-zinc-900/60 text-zinc-100 hover:bg-zinc-800 hover:text-white"
        >
          <Download className="size-4" strokeWidth={1.75} aria-hidden />
          Export
        </Button>
      </div>
    </header>
  );
}
