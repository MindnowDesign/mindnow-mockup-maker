"use client";

import type { CSSProperties, ReactNode } from "react";

import { MOCKUP_DEVICE_BY_ID } from "@/lib/mockup-device-templates";
import { isBrowserTemplateId } from "@/lib/mockup-browser-templates";
import { cn } from "@/lib/utils";

type MockupDeviceFrameProps = {
  deviceTemplateId: string | null;
  className?: string;
  /** CSS `filter` value (e.g. `drop-shadow(...)`) on the whole device stack (screen + bezel). */
  frameDropShadow?: string | null;
  children: ReactNode;
};

/**
 * Stacks user media in the screen rect (by %) and draws the frame PNG on top.
 * The frame asset should use a transparent screen area; an opaque black screen will hide the media.
 */
export function MockupDeviceFrame({
  deviceTemplateId,
  className,
  frameDropShadow,
  children,
}: MockupDeviceFrameProps) {
  const template =
    deviceTemplateId && !isBrowserTemplateId(deviceTemplateId)
      ? MOCKUP_DEVICE_BY_ID[deviceTemplateId]
      : undefined;

  if (!template) {
    return <>{children}</>;
  }

  const { framePixelWidth: fw, framePixelHeight: fh, screen: s } = template;
  const radius = template.screenBorderRadiusPct ?? 8.6;
  const borderRadius =
    typeof radius === "number"
      ? `${radius}%`
      : `${radius.xPct}% / ${radius.yPct}%`;

  /** Scales with mockup size (~104px at full asset scale for phones → use % of clip box). */
  const clipStyle: CSSProperties = {
    left: `${s.leftPct}%`,
    top: `${s.topPct}%`,
    width: `${s.widthPct}%`,
    height: `${s.heightPct}%`,
    borderRadius,
  };

  const screenW = s.widthPct / 100;
  const screenH = s.heightPct / 100;
  const fitToScreen = template.fitToScreen === true;
  const fitScale = template.fitScale ?? 1;
  /** Align this Y% of the frame with the canvas center (default: screen center). */
  const anchorYPct =
    template.opticalCenterYPct ?? s.topPct + s.heightPct / 2;
  const anchorXPct = s.leftPct + s.widthPct / 2;

  /**
   * Frame-fit: whole asset contain-fits the canvas (stand/chin stay visible).
   * Screen-fit: screen rect contain-fits (stand may clip) — optional for tight crops.
   * `fitScale` leaves presentation margin (e.g. 0.88 ≈ reference mockup framing).
   */
  const frameBoxStyle: CSSProperties = fitToScreen
    ? {
        aspectRatio: `${fw} / ${fh}`,
        width: `calc(min(calc(100cqw / ${screenW}), calc(100cqh / ${screenH} * ${fw} / ${fh})) * ${fitScale})`,
        height: `calc(min(calc(100cqh / ${screenH}), calc(100cqw / ${screenW} * ${fh} / ${fw})) * ${fitScale})`,
        transform: `translate(${50 - anchorXPct}%, ${50 - anchorYPct}%)`,
      }
    : {
        aspectRatio: `${fw} / ${fh}`,
        width: `calc(min(100cqw, calc(100cqh * ${fw} / ${fh})) * ${fitScale})`,
        height: `calc(min(100cqh, calc(100cqw * ${fh} / ${fw})) * ${fitScale})`,
      };

  const frameBoxFilterStyle: CSSProperties = frameDropShadow
    ? { filter: frameDropShadow }
    : {};

  return (
    <div
      className={cn(
        "relative flex h-full w-full min-h-0 min-w-0 items-center justify-center",
        className
      )}
      style={{ containerType: "size" }}
    >
      <div
        className="relative isolate"
        style={{ ...frameBoxStyle, ...frameBoxFilterStyle }}
      >
        <div
          className="absolute z-0 overflow-hidden bg-black"
          style={clipStyle}
        >
          <div className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:h-full [&_video]:w-full [&_video]:object-cover">
            {children}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- static public asset */}
        <img
          src={template.frameSrc}
          alt=""
          width={fw}
          height={fh}
          decoding="async"
          draggable={false}
          className="pointer-events-none relative z-10 h-full w-full select-none object-fill"
        />
      </div>
    </div>
  );
}
