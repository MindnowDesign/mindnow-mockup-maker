"use client";

import {
  Check,
  ChevronDown,
  Monitor,
  RectangleHorizontal,
  RectangleVertical,
  SlidersHorizontal,
  Smartphone,
  Square,
} from "lucide-react";
import { type ComponentType } from "react";
import {
  Content,
  Icon as SelectDropdownIcon,
  Item,
  ItemIndicator,
  Portal,
  Root,
  Trigger,
  Viewport,
} from "@radix-ui/react-select";

import type { FrameAspectPresetId } from "@/lib/mockup-aspect";
import { useMockupFrame } from "@/components/mockup-frame-context";
import { cn } from "@/lib/utils";

export type { FrameAspectPresetId };

type Preset = {
  id: FrameAspectPresetId;
  label: string;
  ratio: string | null;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const PRESETS: Preset[] = [
  {
    id: "landscape-16-9",
    label: "Landscape",
    ratio: "16:9",
    Icon: RectangleHorizontal,
  },
  {
    id: "standard-4-3",
    label: "Standard",
    ratio: "4:3",
    Icon: Monitor,
  },
  {
    id: "square-1-1",
    label: "Square",
    ratio: "1:1",
    Icon: Square,
  },
  {
    id: "portrait-4-5",
    label: "Portrait",
    ratio: "4:5",
    Icon: Smartphone,
  },
  {
    id: "vertical-9-16",
    label: "Vertical",
    ratio: "9:16",
    Icon: RectangleVertical,
  },
  {
    id: "custom",
    label: "Custom",
    ratio: null,
    Icon: SlidersHorizontal,
  },
];

function presetEntryLabel(p: Preset) {
  return p.ratio ? `${p.label} (${p.ratio})` : p.label;
}

export function FrameAspectRatioSelect() {
  const { aspectPreset: value, setAspectPreset: setValue } = useMockupFrame();
  const selected = PRESETS.find((p) => p.id === value) ?? PRESETS[4];
  const SelectedIcon = selected.Icon;

  return (
    <>
      <span className="text-xs font-medium text-zinc-400" id="frame-aspect-label">
        Aspect ratio
      </span>
      <Root
        value={value}
        onValueChange={(v) => setValue(v as FrameAspectPresetId)}
      >
        <Trigger
          aria-labelledby="frame-aspect-label"
          className={cn(
            "flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm outline-none transition-colors",
            "hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 data-[state=open]:border-zinc-600 data-[state=open]:bg-zinc-900"
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2.5">
            <SelectedIcon
              className="size-[18px] shrink-0 text-zinc-300"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="inline-flex min-w-0 items-center gap-1">
              <span className="truncate font-semibold text-white">
                {selected.label}
              </span>
              {selected.ratio ? (
                <span className="shrink-0 whitespace-nowrap text-zinc-500">
                  ({selected.ratio})
                </span>
              ) : null}
            </span>
          </span>
          <SelectDropdownIcon asChild>
            <ChevronDown
              className="size-4 shrink-0 text-zinc-500"
              strokeWidth={1.75}
              aria-hidden
            />
          </SelectDropdownIcon>
        </Trigger>
        <Portal>
          <Content
            position="popper"
            sideOffset={6}
            align="start"
            className="z-[200] max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-lg"
          >
            <Viewport className="p-1">
              {PRESETS.map((preset) => {
                const ItemIcon = preset.Icon;
                return (
                  <Item
                    key={preset.id}
                    value={preset.id}
                    textValue={presetEntryLabel(preset)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center gap-2.5 rounded-md py-2 pl-2 pr-8 text-sm outline-none",
                      "text-zinc-200 data-highlighted:bg-zinc-800 data-highlighted:text-white data-[state=checked]:bg-zinc-800/90"
                    )}
                  >
                    <ItemIcon
                      className="size-[18px] shrink-0 text-zinc-400"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className="inline-flex min-w-0 flex-1 items-center gap-1">
                      <span className="font-semibold text-white">
                        {preset.label}
                      </span>
                      {preset.ratio ? (
                        <span className="shrink-0 whitespace-nowrap text-zinc-500">
                          ({preset.ratio})
                        </span>
                      ) : null}
                    </span>
                    <ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                      <Check
                        className="size-3.5 text-white"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </ItemIndicator>
                  </Item>
                );
              })}
            </Viewport>
          </Content>
        </Portal>
      </Root>
    </>
  );
}
