"use client";

import {
  Content as SelectContent,
  Icon as SelectDropdownIcon,
  Item as SelectItem,
  ItemIndicator as SelectItemIndicator,
  ItemText as SelectItemText,
  Portal as SelectPortal,
  Root as SelectRoot,
  Trigger as SelectTrigger,
  Value as SelectValue,
  Viewport as SelectViewport,
} from "@radix-ui/react-select";
import { Check, ChevronDown, Rows3 } from "lucide-react";
import {
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { CanvasSolidColorPopoverPanel } from "@/components/canvas-solid-color-picker";
import { useMockupFrame } from "@/components/mockup-frame-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IPHONE_17_PRO_MAX_STYLES,
  isIphone17ProMaxTemplateId,
} from "@/lib/mockup-device-templates";
import {
  DEFAULT_SCREENSHOT_BORDER_COLOR,
  DEFAULT_SCREENSHOT_OUTLINE_COLOR,
  SCREENSHOT_BORDER_POSITION_OPTIONS,
  SCREENSHOT_BORDER_WEIGHT_MAX,
  SCREENSHOT_BORDER_WEIGHT_MIN,
  type ScreenshotBorderPosition,
  type ScreenshotStyleId,
} from "@/lib/mockup-screenshot-style";
import { cn } from "@/lib/utils";

const inputChrome =
  "rounded-lg border border-zinc-700 bg-zinc-950 outline-none transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-white/25";

function normalizeHex(raw: string): string {
  const t = raw.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1]!;
    const g = t[2]!;
    const b = t[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return DEFAULT_SCREENSHOT_BORDER_COLOR;
}

function normalizeOutlineHex(raw: string): string {
  const t = raw.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1]!;
    const g = t[2]!;
    const b = t[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return DEFAULT_SCREENSHOT_OUTLINE_COLOR;
}

const SCREENSHOT_STYLE_OPTIONS: { id: ScreenshotStyleId; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "border", label: "Border" },
  { id: "glass", label: "Glass" },
  { id: "outline", label: "Outline" },
];

function ScreenshotOutlineColorRow({
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
  const hex = normalizeOutlineHex(color);
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
        "flex min-h-10 min-w-0 divide-x divide-zinc-700 overflow-hidden",
        inputChrome
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Outline color"
            aria-haspopup="dialog"
            className={cn(
              "flex min-h-10 min-w-0 flex-1 items-center gap-1.5 px-2 text-left outline-none transition-colors",
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
            onChange={(next) => onColorChange(normalizeOutlineHex(next))}
            popoverOpen={open}
          />
        </PopoverContent>
      </Popover>
      <div className="flex shrink-0 items-center">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Outline opacity"
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

function ScreenshotBorderColorRow({
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
        "flex min-h-10 min-w-0 divide-x divide-zinc-700 overflow-hidden",
        inputChrome
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Border color"
            aria-haspopup="dialog"
            className={cn(
              "flex min-h-10 min-w-0 flex-1 items-center gap-1.5 px-2 text-left outline-none transition-colors",
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
          aria-label="Border color opacity"
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

function ScreenshotBorderPositionSelect({
  value,
  onChange,
}: {
  value: ScreenshotBorderPosition;
  onChange: (next: ScreenshotBorderPosition) => void;
}) {
  return (
    <SelectRoot
      value={value}
      onValueChange={(v) => onChange(v as ScreenshotBorderPosition)}
    >
      <SelectTrigger
        aria-label="Border position"
        className={cn(
          "flex min-h-10 w-full min-w-0 cursor-pointer items-center justify-between gap-2 px-2.5 py-2 text-left text-xs font-medium text-zinc-100",
          inputChrome
        )}
      >
        <SelectValue placeholder="Select…" />
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
          className="z-[250] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-lg"
        >
          <SelectViewport className="p-1">
            {SCREENSHOT_BORDER_POSITION_OPTIONS.map(({ id, label }) => (
              <SelectItem
                key={id}
                value={id}
                textValue={label}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-2 pr-8 text-xs font-medium outline-none",
                  "text-zinc-200 data-highlighted:bg-zinc-800 data-highlighted:text-white data-[state=checked]:bg-zinc-800/90"
                )}
              >
                <SelectItemText>{label}</SelectItemText>
                <SelectItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                  <Check
                    className="size-3.5 text-white"
                    strokeWidth={2}
                    aria-hidden
                  />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  );
}

function ScreenshotBorderWeightField({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  function commit(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    if (digits === "") {
      onChange(SCREENSHOT_BORDER_WEIGHT_MIN);
      setText(String(SCREENSHOT_BORDER_WEIGHT_MIN));
      return;
    }
    const n = Math.min(
      SCREENSHOT_BORDER_WEIGHT_MAX,
      Math.max(SCREENSHOT_BORDER_WEIGHT_MIN, parseInt(digits, 10))
    );
    onChange(n);
    setText(String(n));
  }

  function handleArrowKeys(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const digits = text.replace(/\D/g, "");
    const base = digits === "" ? value : parseInt(digits, 10);
    const step = e.shiftKey ? 10 : 1;
    const delta = e.key === "ArrowUp" ? step : -step;
    const next = Math.min(
      SCREENSHOT_BORDER_WEIGHT_MAX,
      Math.max(SCREENSHOT_BORDER_WEIGHT_MIN, base + delta)
    );
    onChange(next);
    setText(String(next));
  }

  return (
    <div
      className={cn(
        "flex min-h-10 min-w-0 items-center gap-1.5 px-2 py-2",
        inputChrome
      )}
    >
      <Rows3
        className="size-4 shrink-0 text-zinc-300"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label="Border weight in pixels"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit(text);
        }}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
          setText(digits);
          if (digits !== "") {
            const n = Math.min(
              SCREENSHOT_BORDER_WEIGHT_MAX,
              Math.max(SCREENSHOT_BORDER_WEIGHT_MIN, parseInt(digits, 10))
            );
            onChange(n);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            handleArrowKeys(e);
            return;
          }
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="min-w-0 flex-1 bg-transparent px-0.5 py-0 font-mono text-[11px] leading-none tabular-nums text-zinc-100 outline-none focus-visible:bg-white/5"
      />
    </div>
  );
}

function ScreenshotStyleControls() {
  const {
    screenshotStyle,
    setScreenshotStyle,
    screenshotBorderColor,
    setScreenshotBorderColor,
    screenshotBorderColorOpacity,
    setScreenshotBorderColorOpacity,
    screenshotBorderPosition,
    setScreenshotBorderPosition,
    screenshotBorderWeight,
    setScreenshotBorderWeight,
    screenshotOutlineColor,
    setScreenshotOutlineColor,
    screenshotOutlineColorOpacity,
    setScreenshotOutlineColorOpacity,
  } = useMockupFrame();

  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-xs font-medium text-zinc-400"
        id="frame-screenshot-styles-label"
      >
        Styles
      </span>
      <div
        role="radiogroup"
        aria-labelledby="frame-screenshot-styles-label"
        className="grid grid-cols-2 gap-2"
      >
        {SCREENSHOT_STYLE_OPTIONS.map(({ id, label }) => {
          const selected = screenshotStyle === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setScreenshotStyle(id)}
              className={cn(
                "flex min-h-10 items-center justify-center rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
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

      {screenshotStyle === "border" ? (
        <div className="space-y-2 pt-1">
          <ScreenshotBorderColorRow
            color={screenshotBorderColor}
            onColorChange={setScreenshotBorderColor}
            opacity={screenshotBorderColorOpacity}
            onOpacityChange={setScreenshotBorderColorOpacity}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[11px] font-medium text-zinc-500">
                Position
              </span>
              <ScreenshotBorderPositionSelect
                value={screenshotBorderPosition}
                onChange={setScreenshotBorderPosition}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[11px] font-medium text-zinc-500">
                Weight
              </span>
              <ScreenshotBorderWeightField
                value={screenshotBorderWeight}
                onChange={setScreenshotBorderWeight}
              />
            </div>
          </div>
        </div>
      ) : null}

      {screenshotStyle === "outline" ? (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-medium text-zinc-500">Color</span>
          <ScreenshotOutlineColorRow
            color={screenshotOutlineColor}
            onColorChange={setScreenshotOutlineColor}
            opacity={screenshotOutlineColorOpacity}
            onOpacityChange={setScreenshotOutlineColorOpacity}
          />
        </div>
      ) : null}
    </div>
  );
}

function IphoneProMaxStyleControls() {
  const { deviceTemplateId, setDeviceTemplateId } = useMockupFrame();
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

export function FrameDeviceStyles() {
  const { deviceTemplateId } = useMockupFrame();

  if (deviceTemplateId == null) {
    return <ScreenshotStyleControls />;
  }
  if (isIphone17ProMaxTemplateId(deviceTemplateId)) {
    return <IphoneProMaxStyleControls />;
  }
  return null;
}
