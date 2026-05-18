"use client";

import {
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { DraggableWorkspaceColorPicker } from "@/components/draggable-workspace-color-picker";
import { CanvasSolidColorPopoverPanel } from "@/components/canvas-solid-color-popover-panel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const rowChrome =
  "rounded-lg border border-zinc-700 bg-zinc-950 outline-none transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-white/25";

const popoverContentClass =
  "w-[min(100vw-2rem,280px)] border-zinc-700 bg-zinc-900 p-3 shadow-xl ring-1 ring-zinc-700 text-zinc-100";

const triggerButtonClass =
  "flex min-h-10 min-w-0 flex-1 items-center gap-1.5 px-2 text-left outline-none transition-colors hover:bg-zinc-900 focus-visible:bg-zinc-900";

const fieldTriggerClass =
  "box-border flex h-10 min-h-10 w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-left outline-none transition-colors hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-white/25";

const swatchTriggerClass =
  "box-border size-6 shrink-0 rounded border border-zinc-600 outline-none transition-colors hover:border-zinc-400 focus-visible:ring-2 focus-visible:ring-white/25";

function OpacityPercentField({
  value,
  onChange,
  inputAriaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  inputAriaLabel: string;
}) {
  const [opacityText, setOpacityText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setOpacityText(String(value));
  }, [value, focused]);

  function commitOpacity(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    if (digits === "") {
      onChange(0);
      setOpacityText("0");
      return;
    }
    const n = Math.min(100, Math.max(0, parseInt(digits, 10)));
    onChange(n);
    setOpacityText(String(n));
  }

  function handleOpacityArrowKeys(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const digits = opacityText.replace(/\D/g, "");
    const base = digits === "" ? value : parseInt(digits, 10);
    const step = e.shiftKey ? 10 : 1;
    const delta = e.key === "ArrowUp" ? step : -step;
    const next = Math.min(100, Math.max(0, base + delta));
    onChange(next);
    setOpacityText(String(next));
  }

  return (
    <div className="flex shrink-0 items-center">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={inputAriaLabel}
        value={opacityText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commitOpacity(opacityText);
        }}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
          setOpacityText(digits);
          if (digits !== "") {
            const n = Math.min(100, Math.max(0, parseInt(digits, 10)));
            onChange(n);
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
  );
}

export type SolidColorPopoverRowProps = {
  /**
   * `row` — divided sidebar bar (optional opacity). `field` — full-width trigger
   * (canvas solid / noise color). `swatch` — 24×24 swatch only (no hex row, no opacity).
   */
  variant?: "row" | "field" | "swatch";
  /** Merged onto outer wrapper (`field`: width; `row`: chrome row). */
  className?: string;
  /** Normalized `#RRGGBB` for swatch, trigger text, and picker `color`. */
  displayHex: string;
  onColorChange: (hex: string) => void;
  triggerAriaLabel: string;
  opacityPercent?: {
    value: number;
    onChange: (n: number) => void;
    inputAriaLabel: string;
  };
  /** Workspace canvas pickers: drag within the main stage bounds (Figma-style). */
  popoverDraggable?: boolean;
};

/**
 * Solid color + popover: `row` = sidebar bar with optional opacity %; `field` =
 * full-width trigger (canvas solid / noise).
 */
export function SolidColorPopoverRow({
  variant = "row",
  className,
  displayHex,
  onColorChange,
  triggerAriaLabel,
  opacityPercent,
  popoverDraggable = false,
}: SolidColorPopoverRowProps) {
  const [open, setOpen] = useState(false);

  if (popoverDraggable && variant === "swatch") {
    return (
      <DraggableWorkspaceColorPicker
        displayHex={displayHex}
        onColorChange={onColorChange}
        triggerAriaLabel={triggerAriaLabel}
        className={className}
      />
    );
  }

  const triggerClass =
    variant === "field" ? fieldTriggerClass : triggerButtonClass;

  const popover = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={triggerAriaLabel}
          aria-haspopup="dialog"
          className={
            variant === "swatch"
              ? cn(swatchTriggerClass, className)
              : triggerClass
          }
          style={
            variant === "swatch" ? { backgroundColor: displayHex } : undefined
          }
        >
          {variant === "swatch" ? null : (
            <>
              <span
                className="block size-5 shrink-0 rounded border border-zinc-600"
                style={{ backgroundColor: displayHex }}
              />
              <span className="min-w-0 truncate font-mono text-[11px] leading-none tabular-nums tracking-tight text-zinc-100">
                {displayHex.slice(1)}
              </span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className={popoverContentClass}
      >
        <CanvasSolidColorPopoverPanel
          color={displayHex}
          onChange={onColorChange}
          popoverOpen={open}
        />
      </PopoverContent>
    </Popover>
  );

  if (variant === "field") {
    return <div className={cn("w-full min-w-0", className)}>{popover}</div>;
  }

  if (variant === "swatch") {
    return popover;
  }

  return (
    <div
      className={cn(
        "flex min-h-10 min-w-0 divide-x divide-zinc-700 overflow-hidden",
        rowChrome,
        className
      )}
    >
      {popover}
      {opacityPercent ? (
        <OpacityPercentField
          value={opacityPercent.value}
          onChange={opacityPercent.onChange}
          inputAriaLabel={opacityPercent.inputAriaLabel}
        />
      ) : null}
    </div>
  );
}
