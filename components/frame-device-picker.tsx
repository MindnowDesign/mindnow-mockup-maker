"use client";

import {
  Camera,
  ChevronDown,
  Globe,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useMockupFrame } from "@/components/mockup-frame-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FrameDeviceStyles } from "@/components/frame-device-styles";
import { cn } from "@/lib/utils";

export type FrameDeviceValue =
  | "screenshot"
  | "phone"
  | "tablet"
  | "desktop"
  | "laptop";

export type DeviceFilterTab = FrameDeviceValue;

const FILTER_ORDER: { value: FrameDeviceValue; icon: LucideIcon; label: string }[] =
  [
    { value: "screenshot", icon: Camera, label: "Screenshot" },
    { value: "phone", icon: Smartphone, label: "Phone" },
    { value: "tablet", icon: Tablet, label: "Tablet" },
    { value: "desktop", icon: Monitor, label: "Desktop" },
    { value: "laptop", icon: Laptop, label: "Laptop" },
  ];

const TRIGGER_META: Record<
  FrameDeviceValue,
  { icon: LucideIcon; label: string }
> = {
  screenshot: { icon: Camera, label: "Screenshot" },
  phone: { icon: Smartphone, label: "Phone" },
  tablet: { icon: Tablet, label: "Tablet" },
  desktop: { icon: Monitor, label: "Desktop" },
  laptop: { icon: Laptop, label: "Laptop" },
};

type TemplatePick = {
  preset: FrameDeviceValue;
  headline: string;
  detail?: string;
};

function TemplateFooterHint() {
  return (
    <span className="text-xs font-medium leading-snug text-zinc-500">6 styles</span>
  );
}

/** Fixed preview height so every TemplateTile matches across tabs. */
function PreviewPlate({ children }: { children?: ReactNode }) {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-lg bg-zinc-900">
      {children}
    </div>
  );
}

const TILE_PREVIEW_INNER =
  "absolute inset-2.5 rounded-md bg-zinc-800";

function TemplateTile({
  title,
  subtitle,
  resolution,
  preview,
  footer,
  onPick,
  className,
}: {
  title: string;
  subtitle?: string;
  resolution?: string;
  preview: ReactNode;
  footer?: ReactNode;
  onPick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "group flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-left transition-colors",
        "hover:border-zinc-600 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        className
      )}
    >
      <div className="p-2">{preview}</div>
      <div className="flex min-h-[4.5rem] flex-1 flex-col gap-2 px-3 pb-3">
        <div className="min-w-0">
          <div className="truncate font-semibold text-white">{title}</div>
          {subtitle ? (
            <div className="text-xs text-zinc-500">{subtitle}</div>
          ) : null}
          {resolution ? (
            <div className="mt-1 font-mono text-[11px] text-zinc-500">
              {resolution}
            </div>
          ) : null}
        </div>
        {footer ?? <TemplateFooterHint />}
      </div>
    </button>
  );
}

export function FrameDevicePicker() {
  const { deviceTemplateId, setDeviceTemplateId } = useMockupFrame();
  const [open, setOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<DeviceFilterTab>("screenshot");
  const [selection, setSelection] = useState<TemplatePick>({
    preset: "screenshot",
    headline: TRIGGER_META.screenshot.label,
    detail: undefined,
  });

  const SelectedIcon = TRIGGER_META[selection.preset].icon;

  useEffect(() => {
    if (deviceTemplateId === "iphone-17-black") {
      setSelection({
        preset: "phone",
        headline: "iPhone 17",
        detail: "402 × 874",
      });
      setFilterTab("phone");
      return;
    }
    if (deviceTemplateId?.startsWith("iphone-17-pro-max-")) {
      setSelection({
        preset: "phone",
        headline: "iPhone 17 Pro Max",
        detail: "440 × 956",
      });
      setFilterTab("phone");
      return;
    }
    setSelection({
      preset: "screenshot",
      headline: TRIGGER_META.screenshot.label,
      detail: undefined,
    });
    setFilterTab("screenshot");
  }, [deviceTemplateId]);

  function pickTemplate(next: TemplatePick) {
    setSelection(next);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <span
          className="text-xs font-medium text-zinc-400"
          id="frame-device-label"
        >
          Device
        </span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            aria-labelledby="frame-device-label"
            className={cn(
              "flex min-h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm outline-none transition-colors",
              "hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 data-[state=open]:border-zinc-600 data-[state=open]:bg-zinc-900"
            )}
          >
            <span className="flex min-w-0 flex-1 items-start gap-2.5">
              <SelectedIcon
                className="mt-0.5 size-[18px] shrink-0 text-zinc-300"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-semibold text-white">
                  {selection.headline}
                </span>
                {selection.detail ? (
                  <span className="truncate font-mono text-xs text-zinc-500">
                    {selection.detail}
                  </span>
                ) : null}
              </span>
            </span>
            <ChevronDown
              className="size-4 shrink-0 text-zinc-500"
              strokeWidth={1.75}
              aria-hidden
            />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className={cn(
              "z-[200] w-[min(420px,calc(100vw-2rem))] max-w-none gap-0 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 p-0 shadow-xl ring-1 ring-white/5"
            )}
          >
            <Tabs
              value={filterTab}
              onValueChange={(v) => setFilterTab(v as DeviceFilterTab)}
              className="gap-0"
            >
              <div className="shrink-0 border-b border-zinc-800 bg-zinc-950/80 px-3 pt-3 pb-3">
                <TabsList className="flex h-auto w-full flex-wrap items-start gap-2 rounded-none border-0 bg-transparent p-0">
                  {FILTER_ORDER.map(({ value, icon: Icon, label }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      title={label}
                      aria-label={label}
                      className={cn(
                        "group inline-flex shrink-0 items-center overflow-hidden rounded-full border border-transparent outline-none transition-all",
                        "bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800",
                        "data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm",
                        "data-[state=inactive]:size-9 data-[state=inactive]:justify-center",
                        "data-[state=active]:h-auto data-[state=active]:min-h-10 data-[state=active]:max-w-[min(180px,calc(100vw-8rem))] data-[state=active]:gap-2 data-[state=active]:px-2.5 data-[state=active]:py-2 data-[state=active]:justify-start",
                        "data-[state=active]:[&>.device-tab-copy]:block"
                      )}
                    >
                      <Icon
                        className="size-4 shrink-0"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <span className="device-tab-copy hidden min-w-0 flex-1 truncate text-left text-xs font-semibold text-inherit">
                        {label}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="max-h-[min(520px,calc(70vh))] overflow-y-auto overscroll-contain px-3 py-4">
                <TabsContent value="screenshot" className="m-0 outline-none">
                  <div className="flex justify-start">
                    <div className="w-full min-w-0 max-w-[calc((100%-0.5rem)/2)]">
                      <TemplateTile
                        title="Screenshot"
                        subtitle="Adapts to media"
                        footer={
                          <span className="text-xs font-medium leading-snug text-zinc-500">
                            Plain canvas
                          </span>
                        }
                        preview={
                          <PreviewPlate>
                            <div className={TILE_PREVIEW_INNER} />
                          </PreviewPlate>
                        }
                        onPick={() => {
                          setDeviceTemplateId(null);
                          pickTemplate({
                            preset: "screenshot",
                            headline: "Screenshot",
                            detail: undefined,
                          });
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="m-0 outline-none">
                  <div className="grid grid-cols-2 items-stretch gap-2">
                    <TemplateTile
                      title="iPhone 17"
                      resolution="402 × 874"
                      preview={
                        <PreviewPlate>
                          <div className={TILE_PREVIEW_INNER} />
                        </PreviewPlate>
                      }
                      onPick={() => {
                        setDeviceTemplateId("iphone-17-black");
                        pickTemplate({
                          preset: "phone",
                          headline: "iPhone 17",
                          detail: "402 × 874",
                        });
                      }}
                    />
                    <TemplateTile
                      title="iPhone 17 Pro Max"
                      resolution="440 × 956"
                      preview={
                        <PreviewPlate>
                          <div className={TILE_PREVIEW_INNER} />
                        </PreviewPlate>
                      }
                      onPick={() => {
                        setDeviceTemplateId("iphone-17-pro-max-silver");
                        pickTemplate({
                          preset: "phone",
                          headline: "iPhone 17 Pro Max",
                          detail: "440 × 956",
                        });
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="tablet" className="m-0 outline-none">
                  <div className="grid grid-cols-2 items-stretch gap-2">
                    <TemplateTile
                      title="Tablet 11″"
                      resolution="834 × 1194"
                      preview={
                        <PreviewPlate>
                          <div className={TILE_PREVIEW_INNER} />
                        </PreviewPlate>
                      }
                      onPick={() =>
                        pickTemplate({
                          preset: "tablet",
                          headline: "Tablet 11″",
                          detail: "834 × 1194",
                        })
                      }
                    />
                    <TemplateTile
                      title="Tablet 13″"
                      resolution="1366 × 1024"
                      preview={
                        <PreviewPlate>
                          <div className={TILE_PREVIEW_INNER} />
                        </PreviewPlate>
                      }
                      onPick={() =>
                        pickTemplate({
                          preset: "tablet",
                          headline: "Tablet 13″",
                          detail: "1366 × 1024",
                        })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="desktop" className="m-0 outline-none">
                  <div className="grid grid-cols-2 items-stretch gap-2">
                    <TemplateTile
                      title="Browser"
                      subtitle="Adapts to media"
                      preview={
                        <PreviewPlate>
                          <div
                            className={cn(
                              TILE_PREVIEW_INNER,
                              "flex items-center justify-center"
                            )}
                          >
                            <Globe
                              className="size-10 text-zinc-500"
                              strokeWidth={1}
                              aria-hidden
                            />
                          </div>
                        </PreviewPlate>
                      }
                      onPick={() =>
                        pickTemplate({
                          preset: "desktop",
                          headline: "Browser",
                          detail: "1440 × 900",
                        })
                      }
                    />
                    <TemplateTile
                      title="Desktop 5K"
                      resolution="2560 × 1440"
                      preview={
                        <PreviewPlate>
                          <div className={TILE_PREVIEW_INNER} />
                        </PreviewPlate>
                      }
                      onPick={() =>
                        pickTemplate({
                          preset: "desktop",
                          headline: "Desktop 5K",
                          detail: "2560 × 1440",
                        })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="laptop" className="m-0 outline-none">
                  <div className="grid grid-cols-2 items-stretch gap-2">
                    <TemplateTile
                      title="Laptop Pro 16″"
                      resolution="1728 × 1117"
                      preview={
                        <PreviewPlate>
                          <div className={TILE_PREVIEW_INNER} />
                        </PreviewPlate>
                      }
                      onPick={() =>
                        pickTemplate({
                          preset: "laptop",
                          headline: "Laptop Pro 16″",
                          detail: "1728 × 1117",
                        })
                      }
                    />
                    <TemplateTile
                      title="Laptop Air 13″"
                      resolution="1440 × 900"
                      preview={
                        <PreviewPlate>
                          <div className={TILE_PREVIEW_INNER} />
                        </PreviewPlate>
                      }
                      onPick={() =>
                        pickTemplate({
                          preset: "laptop",
                          headline: "Laptop Air 13″",
                          detail: "1440 × 900",
                        })
                      }
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </PopoverContent>
        </Popover>
      </div>
      <FrameDeviceStyles />
    </div>
  );
}
