"use client";

import { Redo2, Undo2 } from "lucide-react";

import { useMockupWorkspaceHistory } from "@/components/mockup-workspace-history";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function WorkspaceCanvasToolbar({ className }: { className?: string }) {
  const { undo, redo, resetAll, canUndo, canRedo } =
    useMockupWorkspaceHistory();

  return (
    <div
      className={cn(
        "relative isolate flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 p-1 shadow-lg backdrop-blur-sm",
        className
      )}
      role="toolbar"
      aria-label="Canvas history"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-zinc-300 hover:bg-white/10 hover:text-white [&_svg]:pointer-events-auto"
            aria-label="Undo"
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2 className="size-4" strokeWidth={2} aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Undo</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-zinc-300 hover:bg-white/10 hover:text-white [&_svg]:pointer-events-auto"
            aria-label="Redo"
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2 className="size-4" strokeWidth={2} aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Redo</TooltipContent>
      </Tooltip>
      <span className="mx-0.5 h-5 w-px shrink-0 bg-zinc-700" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
        aria-label="Reset all"
        onClick={resetAll}
      >
        Reset all
      </Button>
    </div>
  );
}
