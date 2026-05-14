"use client";

import { Grid3x3 } from "lucide-react";
import {
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import { CanvasSolidColorPopoverPanel } from "@/components/canvas-solid-color-picker";
import { useMockupFrame } from "@/components/mockup-frame-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FrameShadowPresetId } from "@/lib/mockup-frame-shadow";
import { cn } from "@/lib/utils";

const inputChrome =
  "rounded-lg border border-zinc-700 bg-zinc-950 outline-none transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-white/25";

const PRESET_OPTIONS: { id: FrameShadowPresetId; label: string }[] = [
  { id: "custom", label: "Custom" },
  { id: "sharp", label: "Sharp" },
  { id: "soft", label: "Soft" },
  { id: "floating", label: "Floating" },
];

const SHADOW_FIELD_TOOLTIPS = {
  x: "Position X (px)\nHorizontal offset: positive shifts the shadow to the right, negative to the left. Values like 2 or −2 are valid.",
  y: "Position Y (px)\nVertical offset: positive shifts the shadow downward, negative upward. Values like 2 or −2 are valid.",
  blur:
    "Blur (px)\nLower values produce a harder, sharper shadow edge; higher values soften the falloff—similar to Figma’s shadow blur.",
} as const;

/** Matches clamping in `mockup-frame-context` setters. */
const SHADOW_OFFSET_MIN = -128;
const SHADOW_OFFSET_MAX = 128;
const SHADOW_BLUR_MIN = 0;
const SHADOW_BLUR_MAX = 128;

function normalizeHex(raw: string): string {
  const t = raw.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1]!;
    const g = t[2]!;
    const b = t[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return "#000000";
}

function fieldTooltipContent(tooltip: string) {
  return (
    <TooltipContent
      side="top"
      sideOffset={6}
      className="max-w-[min(260px,calc(100vw-2rem))] whitespace-pre-line text-left font-normal leading-snug"
    >
      {tooltip}
    </TooltipContent>
  );
}

function ShadowNumericField({
  inputAriaLabel,
  tooltip,
  prefix,
  value,
  onCommit,
  icon,
  min,
  max,
  allowNegative = true,
}: {
  inputAriaLabel: string;
  tooltip: string;
  prefix?: string;
  value: number;
  onCommit: (n: number) => void;
  icon?: ReactNode;
  min: number;
  max: number;
  allowNegative?: boolean;
}) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  function commit(raw: string) {
    const trimmed = raw.trim().replace(/^\+/, "");
    if (allowNegative) {
      if (trimmed === "" || trimmed === "-") {
        onCommit(0);
        setText("0");
        return;
      }
    } else if (trimmed === "") {
      onCommit(min);
      setText(String(min));
      return;
    }
    const n = parseInt(
      allowNegative ? trimmed : trimmed.replace(/\D/g, ""),
      10
    );
    if (Number.isNaN(n)) {
      setText(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, n));
    onCommit(clamped);
    setText(String(clamped));
  }

  function currentNumericBase(): number {
    const t = text.trim();
    if (allowNegative) {
      if (t === "" || t === "-") return value;
      const n = parseInt(t, 10);
      return Number.isNaN(n) ? value : n;
    }
    const digits = t.replace(/\D/g, "");
    if (digits === "") return value;
    const n = parseInt(digits, 10);
    return Number.isNaN(n) ? value : n;
  }

  function handleArrowKeys(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const base = currentNumericBase();
    const step = e.shiftKey ? 10 : 1;
    const delta = e.key === "ArrowUp" ? step : -step;
    const next = Math.min(max, Math.max(min, base + delta));
    onCommit(next);
    setText(String(next));
  }

  const helpTriggerClass =
    "shrink-0 cursor-help rounded px-0.5 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/25";

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={cn(
          "flex min-h-10 min-w-0 items-center gap-1.5 px-2 py-2",
          inputChrome
        )}
      >
        {prefix ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  helpTriggerClass,
                  "font-mono text-[11px] text-zinc-500 tabular-nums"
                )}
                tabIndex={0}
                aria-label={`${inputAriaLabel} — more info in tooltip`}
              >
                {prefix}
              </span>
            </TooltipTrigger>
            {fieldTooltipContent(tooltip)}
          </Tooltip>
        ) : null}
        {icon ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(helpTriggerClass, "flex text-zinc-500 [&>svg]:size-3.5")}
                tabIndex={0}
                aria-label={`${inputAriaLabel} — more info in tooltip`}
              >
                {icon}
              </span>
            </TooltipTrigger>
            {fieldTooltipContent(tooltip)}
          </Tooltip>
        ) : null}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={inputAriaLabel}
          value={text}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            commit(text);
          }}
          onChange={(e) => {
            if (!allowNegative) {
              setText(e.target.value.replace(/\D/g, ""));
              return;
            }
            let v = e.target.value.replace(/[^\d-]/g, "");
            if (v.includes("-")) {
              const rest = v.replace(/-/g, "");
              v = rest === "" ? "-" : `-${rest}`;
            }
            setText(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              handleArrowKeys(e);
              return;
            }
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="min-w-0 flex-1 bg-transparent px-0.5 py-0 text-right font-mono text-[11px] leading-none tabular-nums text-zinc-100 outline-none focus-visible:bg-white/5"
        />
      </div>
    </TooltipProvider>
  );
}

function ShadowColorOpacityRow({
  color,
  onColorChange,
  opacity,
  onOpacityChange,
}: {
  color: string;
  onColorChange: (hex: string) => void;
  opacity: number;
  onOpacityChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const hex = normalizeHex(color);
  const [opacityText, setOpacityText] = useState(String(opacity));
  const [opacityFocused, setOpacityFocused] = useState(false);

  useEffect(() => {
    if (!opacityFocused) setOpacityText(String(opacity));
  }, [opacity, opacityFocused]);

  function commitOpacity(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    if (digits === "") {
      onOpacityChange(0);
      setOpacityText("0");
      return;
    }
    const n = Math.min(100, Math.max(0, parseInt(digits, 10)));
    onOpacityChange(n);
    setOpacityText(String(n));
  }

  function handleOpacityArrowKeys(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const digits = opacityText.replace(/\D/g, "");
    const base = digits === "" ? opacity : parseInt(digits, 10);
    const step = e.shiftKey ? 10 : 1;
    const delta = e.key === "ArrowUp" ? step : -step;
    const next = Math.min(100, Math.max(0, base + delta));
    onOpacityChange(next);
    setOpacityText(String(next));
  }

  return (
    <div
      className={cn(
        "flex min-h-9 min-w-0 divide-x divide-zinc-700 overflow-hidden",
        inputChrome
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Shadow color"
            aria-haspopup="dialog"
            className={cn(
              "flex min-h-9 min-w-0 flex-1 items-center gap-1.5 px-2 text-left outline-none transition-colors",
              "hover:bg-zinc-900 focus-visible:bg-zinc-900"
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
            color={hex}
            onChange={(next) => onColorChange(normalizeHex(next))}
            popoverOpen={open}
          />
        </PopoverContent>
      </Popover>
      <div className="flex shrink-0 items-center">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Shadow opacity"
          value={opacityText}
          onFocus={() => setOpacityFocused(true)}
          onBlur={() => {
            setOpacityFocused(false);
            commitOpacity(opacityText);
          }}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
            setOpacityText(digits);
            if (digits !== "") {
              const n = Math.min(100, Math.max(0, parseInt(digits, 10)));
              onOpacityChange(n);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              handleOpacityArrowKeys(e);
              return;
            }
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="min-w-0 max-w-[3rem] bg-transparent px-1.5 py-2 text-right font-mono text-[11px] leading-none tabular-nums text-zinc-100 outline-none focus-visible:bg-white/5"
        />
        <span
          className="flex shrink-0 items-center justify-center pl-0.5 pr-2 font-mono text-[11px] text-zinc-400 tabular-nums"
          aria-hidden
        >
          %
        </span>
      </div>
    </div>
  );
}

export function FrameShadowControls() {
  const {
    frameShadowPreset,
    setFrameShadowPreset,
    frameShadowOffsetX,
    setFrameShadowOffsetX,
    frameShadowOffsetY,
    setFrameShadowOffsetY,
    frameShadowBlur,
    setFrameShadowBlur,
    frameShadowColor,
    setFrameShadowColor,
    frameShadowColorOpacity,
    setFrameShadowColorOpacity,
  } = useMockupFrame();

  return (
    <div className="flex min-w-0 flex-col gap-3">
        <span
          className="text-xs font-medium text-zinc-400"
          id="frame-shadows-label"
        >
          Shadows
        </span>
        <div
          role="radiogroup"
          aria-labelledby="frame-shadows-label"
          className="grid min-w-0 grid-cols-4 gap-1.5"
        >
          {PRESET_OPTIONS.map(({ id, label }) => {
            const selected = frameShadowPreset === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setFrameShadowPreset(id)}
                className={cn(
                  "min-h-9 rounded-lg border px-1 py-1.5 text-center text-[10px] font-semibold leading-tight transition-colors",
                  selected
                    ? "border-zinc-500 bg-zinc-800 text-white shadow-sm"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div className="grid min-w-0 grid-cols-3 gap-2">
            <div className="min-w-0">
              <ShadowNumericField
                key="frame-shadow-offset-x"
                inputAriaLabel="Shadow position X: positive right, negative left"
                tooltip={SHADOW_FIELD_TOOLTIPS.x}
                prefix="X"
                value={frameShadowOffsetX}
                onCommit={setFrameShadowOffsetX}
                min={SHADOW_OFFSET_MIN}
                max={SHADOW_OFFSET_MAX}
              />
            </div>
            <div className="min-w-0">
              <ShadowNumericField
                key="frame-shadow-offset-y"
                inputAriaLabel="Shadow position Y: positive down, negative up"
                tooltip={SHADOW_FIELD_TOOLTIPS.y}
                prefix="Y"
                value={frameShadowOffsetY}
                onCommit={setFrameShadowOffsetY}
                min={SHADOW_OFFSET_MIN}
                max={SHADOW_OFFSET_MAX}
              />
            </div>
            <div className="min-w-0">
              <ShadowNumericField
                key="frame-shadow-blur"
                inputAriaLabel="Shadow blur: lower sharper, higher softer"
                tooltip={SHADOW_FIELD_TOOLTIPS.blur}
                value={frameShadowBlur}
                onCommit={setFrameShadowBlur}
                allowNegative={false}
                min={SHADOW_BLUR_MIN}
                max={SHADOW_BLUR_MAX}
                icon={<Grid3x3 strokeWidth={2} />}
              />
            </div>
          </div>
          <ShadowColorOpacityRow
            color={frameShadowColor}
            onColorChange={setFrameShadowColor}
            opacity={frameShadowColorOpacity}
            onOpacityChange={setFrameShadowColorOpacity}
          />
      </div>
    </div>
  );
}
