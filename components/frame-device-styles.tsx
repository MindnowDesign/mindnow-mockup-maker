"use client";

import { useMockupFrame } from "@/components/mockup-frame-context";
import {
  IPHONE_17_PRO_MAX_STYLES,
  isIphone17ProMaxTemplateId,
} from "@/lib/mockup-device-templates";
import { cn } from "@/lib/utils";

export function FrameDeviceStyles() {
  const { deviceTemplateId, setDeviceTemplateId } = useMockupFrame();

  if (!isIphone17ProMaxTemplateId(deviceTemplateId)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-xs font-medium text-zinc-400"
        id="frame-styles-label"
      >
        Styles
      </span>
      <div
        role="radiogroup"
        aria-labelledby="frame-styles-label"
        className="grid grid-cols-4 gap-x-1 gap-y-2"
      >
        {IPHONE_17_PRO_MAX_STYLES.map(({ templateId, shortLabel, coverSrc }) => {
          const selected = deviceTemplateId === templateId;
          return (
            <div
              key={templateId}
              className="flex min-w-0 flex-col items-center gap-0.5"
            >
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={shortLabel}
                title={shortLabel}
                onClick={() => setDeviceTemplateId(templateId)}
                className={cn(
                  "flex aspect-square w-full min-w-0 overflow-hidden rounded-[8px] border p-2 transition-colors",
                  selected
                    ? "border-zinc-500 bg-zinc-800 shadow-sm ring-1 ring-white/10"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900"
                )}
              >
                <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-[6px] ring-2 ring-inset ring-zinc-600/40">
                  {/* eslint-disable-next-line @next/next/no-img-element -- style thumbnail */}
                  <img
                    src={coverSrc}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    draggable={false}
                  />
                </div>
              </button>
              <span
                className={cn(
                  "line-clamp-2 w-full text-center text-[8px] font-medium leading-snug",
                  selected ? "text-white" : "text-zinc-400"
                )}
              >
                {shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
