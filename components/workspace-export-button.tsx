"use client";

import { ChevronDown, Download } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { useMockupFrame } from "@/components/mockup-frame-context";
import { useMockupMedia } from "@/components/mockup-media-context";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  captureMockupExport,
  DEFAULT_MOCKUP_EXPORT_FORMAT,
  DEFAULT_MOCKUP_EXPORT_SCALE,
  downloadDataUrl,
  MOCKUP_EXPORT_FORMATS,
  MOCKUP_EXPORT_SCALES,
  mockupExportFilename,
  type MockupExportFormat,
  type MockupExportScale,
} from "@/lib/capture-mockup-export";
import { frameMatchesVisualPrefs } from "@/lib/frame-matches-visual-prefs";
import { defaultVisualLabel } from "@/lib/mockup-visual-label";
import { waitForVisualCaptureReady } from "@/lib/wait-for-visual-capture-ready";
import { cn } from "@/lib/utils";

type WorkspaceExportButtonProps = {
  className?: string;
};

function visualExportName(
  visuals: { id: string; label?: string }[],
  visualId: string | null
): string {
  const live = document
    .querySelector<HTMLInputElement>("[data-mockup-visual-title]")
    ?.value.trim();
  if (live) return live;

  const index = visuals.findIndex((v) => v.id === visualId);
  const slot = index >= 0 ? visuals[index] : visuals[0];
  if (!slot) return "visual";
  const oneBased = (index >= 0 ? index : 0) + 1;
  return slot.label?.trim() || defaultVisualLabel(oneBased);
}

const FORMAT_HINTS: Record<MockupExportFormat, string> = {
  png: "Keeps high quality and transparent backgrounds",
  jpeg: "Smaller files with solid backgrounds, ideal for sharing",
};

function FormatRadio({
  selected,
  label,
  onSelect,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-wide text-neutral-100 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
    >
      <span
        aria-hidden
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected
            ? "border-neutral-100 bg-neutral-900"
            : "border-neutral-600 bg-neutral-950"
        )}
      >
        {selected ? (
          <span className="size-2 rounded-full bg-neutral-100" />
        ) : null}
      </span>
      <span>{label}</span>
    </button>
  );
}

function ScaleChip({
  selected,
  label,
  onSelect,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "inline-flex h-8 min-w-10 flex-1 items-center justify-center rounded-lg border text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
        selected
          ? "border-neutral-500 bg-neutral-800 text-neutral-50 shadow-sm"
          : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-200"
      )}
    >
      {label}
    </button>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function WorkspaceExportButton({
  className,
}: WorkspaceExportButtonProps) {
  const frame = useMockupFrame();
  const {
    visuals,
    activeVisualId,
    setActiveVisualId,
    visualWorkspacePrefs,
  } = useMockupMedia();

  const [format, setFormat] = useState<MockupExportFormat>(
    DEFAULT_MOCKUP_EXPORT_FORMAT
  );
  const [scale, setScale] = useState<MockupExportScale>(
    DEFAULT_MOCKUP_EXPORT_SCALE
  );
  const [exporting, setExporting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const abortRef = useRef(false);

  const activeVisualIdRef = useRef(activeVisualId);
  activeVisualIdRef.current = activeVisualId;
  const visualsRef = useRef(visuals);
  visualsRef.current = visuals;
  const prefsRef = useRef(visualWorkspacePrefs);
  prefsRef.current = visualWorkspacePrefs;
  const frameRef = useRef(frame);
  frameRef.current = frame;

  const captureActive = useCallback(
    async (nextFormat: MockupExportFormat, nextScale: MockupExportScale) => {
      const el = document.querySelector<HTMLElement>(
        "[data-mockup-capture-target]"
      );
      if (!el?.isConnected) return null;
      return captureMockupExport(el, {
        format: nextFormat,
        scale: nextScale,
      });
    },
    []
  );

  const downloadSelected = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const dataUrl = await captureActive(format, scale);
      if (!dataUrl) return;
      downloadDataUrl(
        dataUrl,
        mockupExportFilename(
          visualExportName(visualsRef.current, activeVisualIdRef.current),
          format,
          scale
        )
      );
      setMenuOpen(false);
    } finally {
      setExporting(false);
    }
  }, [captureActive, exporting, format, scale]);

  const exportAll = useCallback(async () => {
    const slots = visualsRef.current;
    if (exporting || slots.length === 0) return;
    abortRef.current = false;
    setExporting(true);
    const restoreId = activeVisualIdRef.current;
    const getCaptureElement = () =>
      document.querySelector<HTMLElement>("[data-mockup-capture-target]");

    try {
      for (let i = 0; i < slots.length; i++) {
        if (abortRef.current) break;
        const slot = slots[i]!;
        const label = slot.label?.trim() || defaultVisualLabel(i + 1);

        setActiveVisualId(slot.id);

        const captureEl = await waitForVisualCaptureReady({
          visualId: slot.id,
          getCaptureElement,
          isFrameSynced: () => {
            if (activeVisualIdRef.current !== slot.id) return false;
            const f = frameRef.current;
            return frameMatchesVisualPrefs(
              {
                aspectPreset: f.aspectPreset,
                canvasBackgroundMode: f.canvasBackgroundMode,
                canvasSolidColor: f.canvasSolidColor,
                canvasGradientTemplateId: f.canvasGradientTemplateId,
                deviceTemplateId: f.deviceTemplateId,
              },
              prefsRef.current[slot.id]
            );
          },
          gradientTemplateId: (() => {
            const bg = prefsRef.current[slot.id]?.canvasBackground;
            if (bg?.mode !== "template") return null;
            return bg.gradientTemplateId ?? null;
          })(),
          shouldAbort: () => abortRef.current,
        });

        if (abortRef.current || !captureEl?.isConnected) break;

        const dataUrl = await captureMockupExport(captureEl, {
          format,
          scale,
        });
        if (!dataUrl) continue;

        downloadDataUrl(
          dataUrl,
          mockupExportFilename(label, format, scale)
        );
        await sleep(180);
      }

      if (restoreId && !abortRef.current) {
        setActiveVisualId(restoreId);
      }
      setMenuOpen(false);
    } finally {
      setExporting(false);
    }
  }, [exporting, format, scale, setActiveVisualId]);

  const splitHalfClassName =
    "h-full border-0 bg-transparent shadow-none transition-colors hover:bg-black/[0.1] active:bg-black/[0.18] active:translate-y-0 focus-visible:relative focus-visible:z-10";

  return (
    <div
      className={cn(
        "inline-flex h-9 shrink-0 overflow-hidden rounded-lg bg-primary text-primary-foreground",
        className
      )}
    >
      <Button
        type="button"
        variant="default"
        size="lg"
        disabled={exporting}
        onClick={() => void downloadSelected()}
        aria-label={`Export as ${scale}x ${format === "jpeg" ? "JPG" : "PNG"}`}
        title={`Export as ${scale}x ${format === "jpeg" ? "JPG" : "PNG"}`}
        className={cn(splitHalfClassName, "rounded-none rounded-l-lg")}
      >
        <Download className="size-4" strokeWidth={1.75} aria-hidden />
        Export
      </Button>

      <span
        aria-hidden
        className="w-px shrink-0 self-stretch bg-primary-foreground/20"
      />

      <Popover
        open={menuOpen}
        onOpenChange={(open) => {
          if (!open) abortRef.current = true;
          setMenuOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="default"
            size="lg"
            disabled={exporting}
            aria-label="Export options"
            title="Export options"
            className={cn(
              splitHalfClassName,
              "rounded-none rounded-r-lg px-2 aria-expanded:bg-black/[0.14] data-[state=open]:bg-black/[0.14]"
            )}
          >
            <ChevronDown className="size-4" strokeWidth={2} aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="z-[200] w-[min(100vw-2rem,18rem)] max-w-none gap-0 rounded-2xl border border-neutral-700 bg-neutral-900 p-4 text-neutral-100 shadow-xl ring-1 ring-white/5"
        >
          <h2 className="text-[15px] font-semibold tracking-tight text-neutral-100">
            Export options
          </h2>

          <div
            role="radiogroup"
            aria-label="Format"
            className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            {MOCKUP_EXPORT_FORMATS.map((item) => (
              <FormatRadio
                key={item.id}
                label={item.label}
                selected={item.id === format}
                onSelect={() => setFormat(item.id)}
              />
            ))}
          </div>

          <p className="mt-3 text-[12px] leading-snug text-neutral-500">
            {FORMAT_HINTS[format]}
          </p>

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
              Quality
            </p>
            <div role="radiogroup" aria-label="Quality" className="flex gap-1.5">
              {MOCKUP_EXPORT_SCALES.map((item) => (
                <ScaleChip
                  key={item.id}
                  label={item.label}
                  selected={scale === item.id}
                  onSelect={() => setScale(item.id)}
                />
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Button
              type="button"
              variant="default"
              size="lg"
              disabled={exporting}
              onClick={() => void downloadSelected()}
              className="h-10 w-full"
            >
              <Download className="size-4" strokeWidth={2} aria-hidden />
              Export
            </Button>
            {visuals.length > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={exporting}
                onClick={() => void exportAll()}
                className="h-10 w-full border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800 hover:text-neutral-50"
              >
                Export {visuals.length} visuals
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
