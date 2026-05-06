"use client";

import {
  Content as SelectContent,
  Icon as SelectDropdownIcon,
  Item as SelectItem,
  ItemIndicator as SelectItemIndicator,
  Portal as SelectPortal,
  Root as SelectRoot,
  Trigger as SelectTrigger,
  Viewport as SelectViewport,
} from "@radix-ui/react-select";
import { Check, ChevronDown, Pipette } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { HexColorPicker } from "react-colorful";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { hexToHsv, hsvToHex, type Hsv } from "@/lib/color-hex-hsv";
import { DEFAULT_CANVAS_SOLID_COLOR } from "@/lib/mockup-canvas-background";
import { cn } from "@/lib/utils";

const DEFAULT_HSV = { h: 0, s: 0, v: 100 };

function normalizeHex(raw: string): string {
  const t = raw.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1]!;
    const g = t[2]!;
    const b = t[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return DEFAULT_CANVAS_SOLID_COLOR;
}

function safeHex(color: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
    ? color.toUpperCase()
    : DEFAULT_CANVAS_SOLID_COLOR;
}

type ColorFormat = "hex" | "hsb";

type CanvasSolidColorPickerProps = {
  color: string;
  onChange: (hex: string) => void;
};

const pickerChrome =
  "rounded-lg border border-zinc-700 bg-zinc-950 outline-none transition-colors hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-white/25";

/**
 * Inner panel (HexColorPicker + eyedropper + HEX/HSB row) — shared by
 * `CanvasSolidColorPicker` and compact triggers (e.g. noise color).
 */
export function CanvasSolidColorPopoverPanel({
  color,
  onChange,
  popoverOpen,
}: {
  color: string;
  onChange: (hex: string) => void;
  popoverOpen: boolean;
}) {
  const hex = safeHex(color);
  const [hexDraft, setHexDraft] = useState(hex);
  const [format, setFormat] = useState<ColorFormat>("hex");

  const hsv = useMemo((): Hsv => hexToHsv(hex) ?? DEFAULT_HSV, [hex]);

  useEffect(() => {
    if (popoverOpen) setHexDraft(hex);
  }, [popoverOpen, hex]);

  async function sampleFromScreen() {
    const EyeDropperClass = (
      globalThis as unknown as {
        EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
      }
    ).EyeDropper;
    if (!EyeDropperClass) return;
    try {
      const ed = new EyeDropperClass();
      const { sRGBHex } = await ed.open();
      if (sRGBHex) onChange(normalizeHex(sRGBHex));
    } catch {
      /* dismissed or unsupported */
    }
  }

  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  function clampHue(n: number) {
    return Math.min(360, Math.max(0, Math.round(n)));
  }
  function clampPct(n: number) {
    return Math.min(100, Math.max(0, Math.round(n)));
  }

  function applyHsv(next: Hsv) {
    onChange(hsvToHex(next.h, next.s, next.v));
  }

  /** Shift + ↑/↓: step by 10 (Hue 0–360, S/V 0–100). */
  function handleHsvShiftArrowStep(
    e: ReactKeyboardEvent<HTMLInputElement>,
    axis: "h" | "s" | "v"
  ) {
    if (!e.shiftKey) return;
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const delta = e.key === "ArrowUp" ? 10 : -10;
    if (axis === "h") {
      applyHsv({ ...hsv, h: clampHue(hsv.h + delta) });
    } else if (axis === "s") {
      applyHsv({ ...hsv, s: clampPct(hsv.s + delta) });
    } else {
      applyHsv({ ...hsv, v: clampPct(hsv.v + delta) });
    }
  }

  const eyedropperBtn = hasEyeDropper ? (
    <button
      type="button"
      onClick={sampleFromScreen}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center text-zinc-400 outline-none",
        pickerChrome
      )}
      aria-label="Pick color from screen"
    >
      <Pipette className="size-4" strokeWidth={2} aria-hidden />
    </button>
  ) : null;

  const formatSelect = (
    <SelectRoot
      value={format}
      onValueChange={(v) => setFormat(v as ColorFormat)}
    >
      <SelectTrigger
        aria-label="Color format"
        className={cn(
          "flex h-9 w-[76px] shrink-0 cursor-pointer items-center justify-between gap-1 px-2.5 py-1.5 text-xs font-semibold text-zinc-100",
          pickerChrome
        )}
      >
        <span>{format === "hex" ? "HEX" : "HSB"}</span>
        <SelectDropdownIcon asChild>
          <ChevronDown
            className="size-3.5 shrink-0 text-zinc-500"
            strokeWidth={1.75}
            aria-hidden
          />
        </SelectDropdownIcon>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent
          position="popper"
          sideOffset={6}
          align="start"
          className="z-[250] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-lg"
        >
          <SelectViewport className="p-1">
            <SelectItem
              value="hex"
              textValue="HEX"
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-md py-2 pl-2 pr-8 text-sm font-semibold outline-none",
                "text-zinc-200 data-highlighted:bg-zinc-800 data-highlighted:text-white data-[state=checked]:bg-zinc-800/90"
              )}
            >
              HEX
              <SelectItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                <Check className="size-3.5 text-white" strokeWidth={2} aria-hidden />
              </SelectItemIndicator>
            </SelectItem>
            <SelectItem
              value="hsb"
              textValue="HSB"
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-md py-2 pl-2 pr-8 text-sm font-semibold outline-none",
                "text-zinc-200 data-highlighted:bg-zinc-800 data-highlighted:text-white data-[state=checked]:bg-zinc-800/90"
              )}
            >
              HSB
              <SelectItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                <Check className="size-3.5 text-white" strokeWidth={2} aria-hidden />
              </SelectItemIndicator>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  );

  const numberInputClass =
    "min-w-0 flex-1 bg-transparent py-2 text-center font-mono text-xs text-zinc-100 outline-none focus-visible:bg-white/5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  const valueRow =
    format === "hex" ? (
      <input
        type="text"
        value={hexDraft}
        onChange={(e) => {
          const v = e.target.value;
          setHexDraft(v);
          if (/^#[0-9A-Fa-f]{6}$/i.test(v)) {
            onChange(normalizeHex(v));
          }
        }}
        onBlur={() => {
          const n = normalizeHex(hexDraft);
          setHexDraft(n);
          onChange(n);
        }}
        spellCheck={false}
        autoComplete="off"
        aria-label="Hex color"
        className={cn(
          "min-h-9 min-w-0 flex-1 px-2 py-2 font-mono text-xs text-zinc-100",
          pickerChrome
        )}
      />
    ) : (
      <div
        className={cn(
          "flex min-h-9 min-w-0 flex-1 divide-x divide-zinc-700 overflow-hidden",
          pickerChrome
        )}
      >
        <input
          type="number"
          aria-label="Hue"
          min={0}
          max={360}
          step={1}
          value={hsv.h}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            applyHsv({ ...hsv, h: clampHue(n) });
          }}
          onKeyDown={(e) => handleHsvShiftArrowStep(e, "h")}
          className={numberInputClass}
        />
        <input
          type="number"
          aria-label="Saturation percent"
          min={0}
          max={100}
          step={1}
          value={hsv.s}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            applyHsv({ ...hsv, s: clampPct(n) });
          }}
          onKeyDown={(e) => handleHsvShiftArrowStep(e, "s")}
          className={numberInputClass}
        />
        <input
          type="number"
          aria-label="Brightness percent"
          min={0}
          max={100}
          step={1}
          value={hsv.v}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            applyHsv({ ...hsv, v: clampPct(n) });
          }}
          onKeyDown={(e) => handleHsvShiftArrowStep(e, "v")}
          className={numberInputClass}
        />
      </div>
    );

  return (
    <div className="canvas-solid-picker react-colorful-wrapper flex flex-col gap-3">
      <HexColorPicker
        color={hex}
        onChange={(next) => onChange(normalizeHex(next))}
        style={{ width: "100%", height: 184 }}
      />
      <div className="flex w-full items-center gap-1.5">
        {eyedropperBtn}
        {formatSelect}
        {valueRow}
      </div>
    </div>
  );
}

/**
 * Saturation/lightness + hue (react-colorful), HEX or HSB inputs, Eyedropper.
 */
export function CanvasSolidColorPicker({
  color,
  onChange,
}: CanvasSolidColorPickerProps) {
  const hex = safeHex(color);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open color picker"
          aria-haspopup="dialog"
          className={cn(
            "box-border flex h-10 min-h-10 w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-left outline-none transition-colors",
            "hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-white/25"
          )}
        >
          <span
            className="block size-5 shrink-0 rounded border border-zinc-600"
            style={{ backgroundColor: hex }}
          />
          <span className="min-w-0 truncate font-mono text-[11px] leading-none tabular-nums tracking-tight text-zinc-100">
            {hex.slice(1)}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className={cn(
          "w-[min(100vw-2rem,280px)] border-zinc-700 bg-zinc-900 p-3 shadow-xl ring-1 ring-zinc-700",
          "text-zinc-100"
        )}
      >
        <CanvasSolidColorPopoverPanel
          color={color}
          onChange={onChange}
          popoverOpen={open}
        />
      </PopoverContent>
    </Popover>
  );
}
