"use client";

import { ChevronDown } from "lucide-react";
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
  CANVAS_DOT_GRID_GAP_MAX,
  CANVAS_DOT_GRID_GAP_MIN,
  CANVAS_DOT_GRID_RANGE_MAX,
  CANVAS_DOT_GRID_SHAPES,
  CANVAS_DOT_GRID_SIZE_MAX,
  CANVAS_DOT_GRID_SIZE_MIN,
  type CanvasDotGridShapeId,
  normalizeDotGridHex,
} from "@/lib/canvas-dot-grid";

const DOT_GRID_ACTIVATE_PERCENT = 25;

function DotGridNumberSliderRow({
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
      <label
        htmlFor={id}
        className="font-mono text-[11px] font-medium tracking-tight text-neutral-200"
      >
        {label}
      </label>
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
          className="h-8 w-14 shrink-0 rounded-md border border-neutral-700 bg-neutral-900/30 px-2 text-center font-mono text-xs text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-white/25"
        />
      </div>
    </div>
  );
}

function DotGridShapeDropdown({
  value,
  onChange,
}: {
  value: CanvasDotGridShapeId;
  onChange: (id: CanvasDotGridShapeId) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[11px] font-medium tracking-tight text-neutral-200">
        shape
      </span>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex h-8 w-[120px] shrink-0 items-center justify-between gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-2.5 font-mono text-xs text-neutral-100 outline-none hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-white/25"
            aria-label="Dot grid shape"
          >
            <span>{value}</span>
            <ChevronDown className="size-3.5 shrink-0 text-neutral-400" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-28">
          {CANVAS_DOT_GRID_SHAPES.map((id) => (
            <DropdownMenuItem
              key={id}
              className="font-mono text-xs capitalize"
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

/** Controls for Paper Design DotGrid (Effects panel). */
export function CanvasDotGridControls() {
  const {
    canvasDotGridPercent,
    setCanvasDotGridPercent,
    canvasDotGridColorBack,
    setCanvasDotGridColorBack,
    canvasDotGridColorFill,
    setCanvasDotGridColorFill,
    canvasDotGridShape,
    setCanvasDotGridShape,
    canvasDotGridSize,
    setCanvasDotGridSize,
    canvasDotGridGapX,
    setCanvasDotGridGapX,
    canvasDotGridGapY,
    setCanvasDotGridGapY,
    canvasDotGridSizeRange,
    setCanvasDotGridSizeRange,
    canvasDotGridOpacityRange,
    setCanvasDotGridOpacityRange,
  } = useMockupFrame();

  function activateAnd<T>(apply: (value: T) => void) {
    return (value: T) => {
      if (canvasDotGridPercent === 0) {
        setCanvasDotGridPercent(DOT_GRID_ACTIVATE_PERCENT);
      }
      apply(value);
    };
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="shrink-0 font-mono text-[11px] font-medium tracking-tight text-neutral-200">
          colorBack
        </span>
        <div className="w-[120px] shrink-0">
          <SolidColorPopoverRow
            variant="field"
            className="w-full min-w-0"
            displayHex={normalizeDotGridHex(canvasDotGridColorBack, "#000000")}
            onColorChange={activateAnd(setCanvasDotGridColorBack)}
            triggerAriaLabel="colorBack"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="shrink-0 font-mono text-[11px] font-medium tracking-tight text-neutral-200">
          colorFill
        </span>
        <div className="w-[120px] shrink-0">
          <SolidColorPopoverRow
            variant="field"
            className="w-full min-w-0"
            displayHex={normalizeDotGridHex(canvasDotGridColorFill, "#FFFFFF")}
            onColorChange={activateAnd(setCanvasDotGridColorFill)}
            triggerAriaLabel="colorFill"
          />
        </div>
      </div>
      <DotGridShapeDropdown
        value={canvasDotGridShape}
        onChange={activateAnd(setCanvasDotGridShape)}
      />
      <DotGridNumberSliderRow
        id="canvas-dot-grid-size"
        label="size"
        value={canvasDotGridSize}
        min={CANVAS_DOT_GRID_SIZE_MIN}
        max={CANVAS_DOT_GRID_SIZE_MAX}
        step={1}
        format={(n) => String(Math.round(n))}
        onChange={activateAnd(setCanvasDotGridSize)}
      />
      <DotGridNumberSliderRow
        id="canvas-dot-grid-gap-x"
        label="gapX"
        value={canvasDotGridGapX}
        min={CANVAS_DOT_GRID_GAP_MIN}
        max={CANVAS_DOT_GRID_GAP_MAX}
        step={1}
        format={(n) => String(Math.round(n))}
        onChange={activateAnd(setCanvasDotGridGapX)}
      />
      <DotGridNumberSliderRow
        id="canvas-dot-grid-gap-y"
        label="gapY"
        value={canvasDotGridGapY}
        min={CANVAS_DOT_GRID_GAP_MIN}
        max={CANVAS_DOT_GRID_GAP_MAX}
        step={1}
        format={(n) => String(Math.round(n))}
        onChange={activateAnd(setCanvasDotGridGapY)}
      />
      <DotGridNumberSliderRow
        id="canvas-dot-grid-size-range"
        label="sizeRange"
        value={canvasDotGridSizeRange}
        min={0}
        max={CANVAS_DOT_GRID_RANGE_MAX}
        step={0.01}
        format={(n) => n.toFixed(2)}
        onChange={activateAnd(setCanvasDotGridSizeRange)}
      />
      <DotGridNumberSliderRow
        id="canvas-dot-grid-opacity-range"
        label="opacityRange"
        value={canvasDotGridOpacityRange}
        min={0}
        max={CANVAS_DOT_GRID_RANGE_MAX}
        step={0.01}
        format={(n) => n.toFixed(2)}
        onChange={activateAnd(setCanvasDotGridOpacityRange)}
      />
    </div>
  );
}
