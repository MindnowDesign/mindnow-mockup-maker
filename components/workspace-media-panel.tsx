"use client";

import { CopyPlus, EllipsisVertical, Trash2 } from "lucide-react";
import { useState } from "react";

import { useMockupMedia } from "@/components/mockup-media-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function WorkspaceMediaPanel() {
  const {
    library,
    visuals,
    activeVisualId,
    assignMediaToActiveVisual,
    addLibraryFromFileList,
    removeLibraryItem,
    createNewVisualFromItem,
  } = useMockupMedia();

  const [pendingDuplicateId, setPendingDuplicateId] = useState<string | null>(
    null
  );

  const activeVisual = visuals.find((v) => v.id === activeVisualId);

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      <div className="w-full min-w-0">
        <label className="block w-full min-w-0 cursor-pointer">
          <span className="sr-only">Add media</span>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              addLibraryFromFileList(e.target.files);
              e.target.value = "";
            }}
          />
          <span className="flex w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-medium text-white outline-none transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-white/25">
            Add media
          </span>
        </label>
      </div>

      {library.length > 0 ? (
        <ul className="grid w-full min-w-0 grid-cols-2 gap-1.5">
          {library.map((item) => {
            const isOnActiveCanvas = activeVisual?.mediaId === item.id;
            return (
              <li key={item.id} className="group relative min-w-0 max-w-full">
                <button
                  type="button"
                  onClick={() => assignMediaToActiveVisual(item.id)}
                  className={cn(
                    "relative aspect-square w-full max-w-full min-w-0 overflow-hidden rounded-lg bg-zinc-950 outline-none ring-offset-2 ring-offset-zinc-900 transition-shadow focus-visible:ring-2 focus-visible:ring-white/25",
                    isOnActiveCanvas
                      ? "ring-2 ring-white"
                      : "ring-1 ring-zinc-700 hover:ring-zinc-500"
                  )}
                  aria-label={`Place on active canvas — ${item.kind}`}
                  aria-pressed={isOnActiveCanvas}
                >
                  {item.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element -- project blob URL
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "absolute right-1 top-1 z-10 flex size-7 items-center justify-center rounded-md bg-zinc-950/90 text-zinc-300 opacity-0 shadow-md backdrop-blur-sm transition-opacity",
                        "hover:bg-zinc-800 hover:text-white",
                        "group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                        "data-[state=open]:opacity-100 data-[state=open]:bg-zinc-800"
                      )}
                      aria-label="Media actions"
                      aria-haspopup="menu"
                    >
                      <EllipsisVertical
                        className="size-4"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-44">
                    <DropdownMenuItem
                      disabled={pendingDuplicateId === item.id}
                      className="gap-2"
                      onSelect={() => {
                        void (async () => {
                          setPendingDuplicateId(item.id);
                          try {
                            await createNewVisualFromItem(item.id);
                          } finally {
                            setPendingDuplicateId(null);
                          }
                        })();
                      }}
                    >
                      <CopyPlus className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                      New visual
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 text-red-400 focus:bg-red-500/15 focus:text-red-300"
                      onSelect={() => removeLibraryItem(item.id)}
                    >
                      <Trash2 className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">
          No media yet — add files here or from the canvas.
        </p>
      )}
    </div>
  );
}
