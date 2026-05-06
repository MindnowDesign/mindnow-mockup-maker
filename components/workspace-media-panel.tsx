"use client";

import { Trash2 } from "lucide-react";
import { useRef } from "react";

import { useMockupMedia } from "@/components/mockup-media-context";
import { cn } from "@/lib/utils";

export function WorkspaceMediaPanel() {
  const { items, activeId, setActiveId, addFromFileList, remove } =
    useMockupMedia();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-medium text-white outline-none transition-colors hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-white/25"
        >
          Add media
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          onChange={(e) => {
            addFromFileList(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <li key={item.id} className="group relative min-w-0">
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-950 outline-none ring-offset-2 ring-offset-zinc-900 transition-shadow focus-visible:ring-2 focus-visible:ring-white/25",
                  activeId === item.id
                    ? "ring-2 ring-white"
                    : "ring-1 ring-zinc-700 hover:ring-zinc-500"
                )}
                aria-label={`Show on canvas — ${item.kind}`}
                aria-pressed={activeId === item.id}
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
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(item.id);
                }}
                className={cn(
                  "absolute right-1 top-1 z-10 flex size-7 items-center justify-center rounded-md bg-zinc-950/90 text-zinc-300 opacity-0 shadow-md backdrop-blur-sm transition-opacity",
                  "hover:bg-red-600 hover:text-white",
                  "group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                )}
                aria-label="Remove media"
              >
                <Trash2 className="size-3.5" strokeWidth={2} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">
          No media yet — add files here or from the canvas.
        </p>
      )}
    </div>
  );
}
