"use client";

import {
  Check,
  CopyPlus,
  EllipsisVertical,
  Image as ImageIcon,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { useMockupMedia } from "@/components/mockup-media-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { frameLikeToPersistedCanvasBackground } from "@/lib/mockup-workspace-snapshot";
import { resourceUrlToDataUrl } from "@/lib/resource-to-data-url";
import { cn } from "@/lib/utils";

function mediaCountLabel(count: number): string {
  return count === 1 ? "1 imagem" : `${count} imagens`;
}

export function WorkspaceMediaPanel() {
  const frame = useMockupFrame();
  const {
    library,
    activeItem,
    assignMediaToActiveVisual,
    addLibraryFromFileList,
    removeLibraryItem,
    removeLibraryItems,
    createNewVisualFromItem,
  } = useMockupMedia();

  const [pendingDuplicateId, setPendingDuplicateId] = useState<string | null>(
    null
  );
  const [pendingBackgroundId, setPendingBackgroundId] = useState<string | null>(
    null
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected =
    library.length > 0 && selectedIds.size === library.length;
  const selectedCount = selectedIds.size;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(library.map((item) => item.id)));
  }, [allSelected, library]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedCount === 0) return;
    removeLibraryItems([...selectedIds]);
    exitSelectionMode();
  }, [selectedCount, selectedIds, removeLibraryItems, exitSelectionMode]);

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      <div className="w-full min-w-0">
        <label className="group block w-full min-w-0 cursor-pointer">
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
          <span
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border border-dashed border-neutral-600 bg-neutral-950/80 px-3 py-2.5 text-left text-sm font-medium text-neutral-300 outline-none transition-colors",
              "hover:border-neutral-500 hover:bg-neutral-900 hover:text-neutral-50",
              "group-focus-within:ring-2 group-focus-within:ring-white/25 group-focus-within:ring-offset-2 group-focus-within:ring-offset-neutral-900"
            )}
          >
            <Upload className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Add media
          </span>
        </label>
      </div>

      {library.length > 0 ? (
        <>
          {selectionMode ? (
            <div className="flex min-h-6 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="shrink-0 text-neutral-300 hover:bg-white/10 hover:text-neutral-50"
                onClick={handleSelectAll}
              >
                {allSelected ? "Deselect all" : "Select all"}
              </Button>
              <span className="shrink-0 text-xs text-neutral-500">
                {selectedCount} selected
              </span>
              <div className="ml-auto flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  disabled={selectedCount === 0}
                  aria-label={
                    selectedCount > 0
                      ? `Delete ${selectedCount} selected`
                      : "Delete selected"
                  }
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="size-3.5" strokeWidth={2} aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-neutral-400 hover:bg-white/10 hover:text-neutral-50"
                  aria-label="Cancel selection"
                  onClick={exitSelectionMode}
                >
                  <X className="size-3.5" strokeWidth={2} aria-hidden />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-6 items-center gap-2">
              <span className="text-xs text-neutral-500">
                {mediaCountLabel(library.length)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="ml-auto shrink-0 text-neutral-400 hover:bg-white/10 hover:text-neutral-50"
                onClick={() => setSelectionMode(true)}
              >
                Select
              </Button>
            </div>
          )}

          <ul className="grid w-full min-w-0 grid-cols-2 gap-[8px] [grid-template-columns:repeat(2,minmax(0,1fr))]">
            {library.map((item) => {
              const isOnCanvas = activeItem?.id === item.id;
              const isChecked = selectedIds.has(item.id);
              return (
                <li
                  key={item.id}
                  className="group relative w-full min-w-0 pb-[100%]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (selectionMode) {
                        toggleSelected(item.id);
                        return;
                      }
                      assignMediaToActiveVisual(item.id);
                    }}
                    data-selected={
                      selectionMode
                        ? isChecked
                          ? "true"
                          : "false"
                        : isOnCanvas
                          ? "true"
                          : "false"
                    }
                    className={cn(
                      "absolute inset-0 box-border overflow-hidden rounded-lg bg-neutral-950 outline-none transition-colors",
                      selectionMode
                        ? isChecked
                          ? "border-2 border-orange-400 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]"
                          : "border border-neutral-700 hover:border-neutral-500"
                        : isOnCanvas
                          ? "border-2 border-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]"
                          : "border border-neutral-700 hover:border-neutral-500",
                      "focus-visible:border-white focus-visible:ring-2 focus-visible:ring-orange-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                    )}
                    aria-label={
                      selectionMode
                        ? `${isChecked ? "Deselect" : "Select"} ${item.kind}`
                        : `Place on active canvas — ${item.kind}`
                    }
                    aria-pressed={selectionMode ? isChecked : isOnCanvas}
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
                    {selectionMode ? (
                      <span
                        className={cn(
                          "absolute left-1.5 top-1.5 z-10 flex size-5 items-center justify-center rounded-md border shadow-md backdrop-blur-sm transition-colors",
                          isChecked
                            ? "border-orange-300 bg-orange-400 text-white"
                            : "border-neutral-600 bg-neutral-950/90 text-transparent"
                        )}
                        aria-hidden
                      >
                        <Check className="size-3.5" strokeWidth={2.5} />
                      </span>
                    ) : null}
                  </button>
                  {!selectionMode ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          className={cn(
                            "absolute right-1 top-1 z-10 flex size-7 items-center justify-center rounded-md bg-neutral-950/90 text-neutral-300 opacity-0 shadow-md backdrop-blur-sm transition-opacity",
                            "hover:bg-neutral-800 hover:text-neutral-50",
                            "group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                            "data-[state=open]:opacity-100 data-[state=open]:bg-neutral-800"
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
                          <CopyPlus
                            className="size-4 shrink-0"
                            strokeWidth={2}
                            aria-hidden
                          />
                          New visual
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-red-400 focus:bg-red-500/15 focus:text-red-300"
                          onSelect={() => removeLibraryItem(item.id)}
                        >
                          <Trash2
                            className="size-4 shrink-0"
                            strokeWidth={2}
                            aria-hidden
                          />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="text-sm text-neutral-500">
          No media yet — add files here or from the canvas.
        </p>
      )}
    </div>
  );
}
