"use client";

import { Check, ChevronDown } from "lucide-react";
import { useId, useState, type CSSProperties } from "react";

import { SolidColorPopoverRow } from "@/components/solid-color-popover-row";
import { useMockupFrame } from "@/components/mockup-frame-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CANVAS_HALFTONE_CONTRAST_MAX,
  CANVAS_HALFTONE_CONTRAST_MIN,
  CANVAS_HALFTONE_GRIDS,
  CANVAS_HALFTONE_RADIUS_MAX,
  CANVAS_HALFTONE_RADIUS_MIN,
  CANVAS_HALFTONE_SIZE_MAX,
  CANVAS_HALFTONE_SIZE_MIN,
  CANVAS_HALFTONE_TYPES,
  type CanvasHalftoneGridId,
  type CanvasHalftoneTypeId,
  normalizeHalftoneHex,
} from "@/lib/canvas-halftone";
import { cn } from "@/lib/utils";

function HalftoneCheckboxRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-3 text-xs font-medium text-zinc-200"
    >
      <span className="min-w-0 truncate font-mono text-[11px] tracking-tight">
        {label}
      </span>
      <span className="relative size-4 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          aria-label={label}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center rounded-[3px] border transition-colors",
            checked
              ? "border-white bg-white text-zinc-950"
              : "border-zinc-600 bg-zinc-950 peer-hover:border-zinc-500"
          )}
        >
          {checked ? (
            <Check className="size-3" strokeWidth={3} aria-hidden />
          ) : null}
        </span>
      </span>
    </label>
  );
}

function HalftoneNumberSliderRow({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (next: number) => void;
}) {
  const fieldId = `${useId()}-field`;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="font-mono text-[11px] font-medium tracking-tight text-zinc-200"
        >
          {label}
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          style={
            {
              ["--range-pct" as string]: `${pct}%`,
            } as CSSProperties
          }
          className="canvas-effect-range w-full min-w-0 flex-1 cursor-pointer"
        />
        <input
          id={fieldId}
          type="text"
          inputMode="decimal"
          aria-label={`${label} value`}
          defaultValue={format(value)}
          key={`${id}-${format(value)}`}
          onBlur={(e) => {
            const raw = e.currentTarget.value.trim().replace(",", ".");
            const n = Number(raw);
            if (!Number.isFinite(n)) {
              e.currentTarget.value = format(value);
              return;
            }
            onChange(n);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-8 w-14 shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-center font-mono text-xs text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-white/25"
        />
      </div>
    </div>
  );
}

function HalftoneTypeDropdown({
  value,
  onChange,
}: {
  value: CanvasHalftoneTypeId;
  onChange: (id: CanvasHalftoneTypeId) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[11px] font-medium tracking-tight text-zinc-200">
        type
      </span>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex h-8 w-[120px] shrink-0 items-center justify-between gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 font-mono text-xs text-zinc-100 outline-none hover:border-zinc-500 focus-visible:ring-2 focus-visible:ring-white/25"
            aria-label="Halftone type"
          >
            <span>{value}</span>
            <ChevronDown className="size-3.5 shrink-0 text-zinc-400" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-28">
          {CANVAS_HALFTONE_TYPES.map((id) => (
            <DropdownMenuItem
              key={id}
              className="font-mono text-xs"
              onSelect={() => onChange(id)}
            >
              {id}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function HalftoneGridDropdown({
  value,
  onChange,
}: {
  value: CanvasHalftoneGridId;
  onChange: (id: CanvasHalftoneGridId) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[11px] font-medium tracking-tight text-zinc-200">
        grid
      </span>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex h-8 w-[120px] shrink-0 items-center justify-between gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 font-mono text-xs text-zinc-100 outline-none hover:border-zinc-500 focus-visible:ring-2 focus-visible:ring-white/25"
            aria-label="Halftone grid"
          >
            <span>{value}</span>
            <ChevronDown className="size-3.5 shrink-0 text-zinc-400" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-28">
          {CANVAS_HALFTONE_GRIDS.map((id) => (
            <DropdownMenuItem
              key={id}
              className="font-mono text-xs"
              onSelect={() => onChange(id)}
            >
              {id}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Controls for Paper Design HalftoneDots (options from the shader panel). */
export function CanvasHalftoneControls() {
  const {
    canvasBackgroundImageUrl,
    canvasHalftoneEnabled,
    setCanvasHalftoneEnabled,
    canvasHalftoneColorBack,
    setCanvasHalftoneColorBack,
    canvasHalftoneColorFront,
    setCanvasHalftoneColorFront,
    canvasHalftoneOriginalColors,
    setCanvasHalftoneOriginalColors,
    canvasHalftoneInverted,
    setCanvasHalftoneInverted,
    canvasHalftoneType,
    setCanvasHalftoneType,
    canvasHalftoneGrid,
    setCanvasHalftoneGrid,
    canvasHalftoneSize,
    setCanvasHalftoneSize,
    canvasHalftoneRadius,
    setCanvasHalftoneRadius,
    canvasHalftoneContrast,
    setCanvasHalftoneContrast,
  } = useMockupFrame();

  function enableAnd<T>(apply: (value: T) => void) {
    return (value: T) => {
      if (!canvasHalftoneEnabled) setCanvasHalftoneEnabled(true);
      apply(value);
    };
  }

  return (
    <div className="space-y-3">
      {!canvasBackgroundImageUrl ? (
        <p className="text-[11px] leading-relaxed text-zinc-500">
          Add a background image to apply Halftone Dots.
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <span className="shrink-0 font-mono text-[11px] font-medium tracking-tight text-zinc-200">
          colorBack
        </span>
        <div className="w-[120px] shrink-0">
          <SolidColorPopoverRow
            variant="field"
            className="w-full min-w-0"
            displayHex={normalizeHalftoneHex(
              canvasHalftoneColorBack,
              "#F2F1E8"
            )}
            onColorChange={enableAnd(setCanvasHalftoneColorBack)}
            triggerAriaLabel="colorBack"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="shrink-0 font-mono text-[11px] font-medium tracking-tight text-zinc-200">
          colorFront
        </span>
        <div className="w-[120px] shrink-0">
          <SolidColorPopoverRow
            variant="field"
            className="w-full min-w-0"
            displayHex={normalizeHalftoneHex(
              canvasHalftoneColorFront,
              "#2B2B2B"
            )}
            onColorChange={enableAnd(setCanvasHalftoneColorFront)}
            triggerAriaLabel="colorFront"
          />
        </div>
      </div>
      <HalftoneCheckboxRow
        id="canvas-halftone-original-colors"
        label="originalColors"
        checked={canvasHalftoneOriginalColors}
        onCheckedChange={enableAnd(setCanvasHalftoneOriginalColors)}
      />
      <HalftoneTypeDropdown
        value={canvasHalftoneType}
        onChange={enableAnd(setCanvasHalftoneType)}
      />
      <HalftoneGridDropdown
        value={canvasHalftoneGrid}
        onChange={enableAnd(setCanvasHalftoneGrid)}
      />
      <HalftoneCheckboxRow
        id="canvas-halftone-inverted"
        label="inverted"
        checked={canvasHalftoneInverted}
        onCheckedChange={enableAnd(setCanvasHalftoneInverted)}
      />
      <HalftoneNumberSliderRow
        id="canvas-halftone-size"
        label="size"
        value={canvasHalftoneSize}
        min={CANVAS_HALFTONE_SIZE_MIN}
        max={CANVAS_HALFTONE_SIZE_MAX}
        step={0.01}
        format={(n) => n.toFixed(2)}
        onChange={enableAnd(setCanvasHalftoneSize)}
      />
      <HalftoneNumberSliderRow
        id="canvas-halftone-radius"
        label="radius"
        value={canvasHalftoneRadius}
        min={CANVAS_HALFTONE_RADIUS_MIN}
        max={CANVAS_HALFTONE_RADIUS_MAX}
        step={0.01}
        format={(n) => n.toFixed(2)}
        onChange={enableAnd(setCanvasHalftoneRadius)}
      />
      <HalftoneNumberSliderRow
        id="canvas-halftone-contrast"
        label="contrast"
        value={canvasHalftoneContrast}
        min={CANVAS_HALFTONE_CONTRAST_MIN}
        max={CANVAS_HALFTONE_CONTRAST_MAX}
        step={0.01}
        format={(n) => n.toFixed(2)}
        onChange={enableAnd(setCanvasHalftoneContrast)}
      />
    </div>
  );
}
