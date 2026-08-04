"use client";

import {
  CopyPlus,
  EllipsisVertical,
  Image as ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { useMockupMedia } from "@/components/mockup-media-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { frameLikeToPersistedCanvasBackground } from "@/lib/mockup-workspace-snapshot";
import { resourceUrlToDataUrl } from "@/lib/resource-to-data-url";
import { cn } from "@/lib/utils";

export function WorkspaceMediaPanel() {
  const frame = useMockupFrame();
  const {
    library,
    activeItem,
    assignMediaToActiveVisual,
    addLibraryFromFileList,
    removeLibraryItem,
    createNewVisualFromItem,
  } = useMockupMedia();

  const [pendingDuplicateId, setPendingDuplicateId] = useState<string | null>(
    null
  );
  const [pendingBackgroundId, setPendingBackgroundId] = useState<string | null>(
    null
  );

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
          <span className="flex w-full items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-medium text-white outline-none transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-white/25">
            <Upload className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Add media
          </span>
        </label>
      </div>

      {library.length > 0 ? (
        <ul className="grid w-full min-w-0 grid-cols-2 gap-[8px] [grid-template-columns:repeat(2,minmax(0,1fr))]">
          {library.map((item) => {
            const isSelected = activeItem?.id === item.id;
            return (
              <li
                key={item.id}
                className="group relative w-full min-w-0 pb-[100%]"
              >
                <button
                  type="button"
                  onClick={() => assignMediaToActiveVisual(item.id)}
                  data-selected={isSelected ? "true" : "false"}
                  className={cn(
                    "absolute inset-0 box-border overflow-hidden rounded-lg bg-zinc-950 outline-none transition-colors",
                    /* Border survives `overflow-hidden`; rings were unreliable here. */
                    isSelected
                      ? "border-2 border-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]"
                      : "border border-zinc-700 hover:border-zinc-500",
                    "focus-visible:border-white focus-visible:ring-2 focus-visible:ring-violet-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                  )}
                  aria-label={`Place on active canvas — ${item.kind}`}
                  aria-pressed={isSelected}
                >
                  {item.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element -- project blob URL
                    <img
                      src={item.url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="pointer-events-none block size-full object-cover select-none"
                      draggable={false}
                    />
                  ) : (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="pointer-events-none block size-full object-cover select-none"
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
                    {item.kind === "image" ? (
                      <DropdownMenuItem
                        disabled={pendingBackgroundId === item.id}
                        className="gap-2"
                        onSelect={() => {
                          void (async () => {
                            setPendingBackgroundId(item.id);
                            try {
                              const dataUrl = await resourceUrlToDataUrl(
                                item.url
                              );
                              const base =
                                frameLikeToPersistedCanvasBackground(frame);
                              frame.hydrateCanvasBackground({
                                ...base,
                                mode: "image",
                                imageDataUrl: dataUrl,
                              });
                            } catch (e) {
                              console.error(
                                "Failed to use media as canvas background",
                                e
                              );
                            } finally {
                              setPendingBackgroundId(null);
                            }
                          })();
                        }}
                      >
                        <ImageIcon
                          className="size-4 shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                        Use as background
                      </DropdownMenuItem>
                    ) : null}
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
