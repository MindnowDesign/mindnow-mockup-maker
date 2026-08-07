"use client";

import { useId, useLayoutEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

import { MOCKUP_DEVICE_BY_ID } from "@/lib/mockup-device-templates";
import { isBrowserTemplateId } from "@/lib/mockup-browser-templates";
import {
  deviceFrameShadowActive,
  deviceShadowFloodColor,
  deviceShadowFloodOpacity,
  deviceShadowStdDeviation,
  type FrameShadowNumbers,
} from "@/lib/mockup-frame-shadow";
import { cn } from "@/lib/utils";

type MockupDeviceFrameProps = {
  deviceTemplateId: string | null;
  className?: string;
  deviceShadow?: FrameShadowNumbers | null;
  children: ReactNode;
};

/**
 * Stacks user media in the screen rect (by %) and draws the frame PNG on top.
 * The frame asset should use a transparent screen area; an opaque black screen will hide the media.
 */
export function MockupDeviceFrame({
  deviceTemplateId,
  className,
  deviceShadow,
  children,
}: MockupDeviceFrameProps) {
  const shadowFilterId = useId().replace(/:/g, "");
  const filterRef = useRef<HTMLDivElement>(null);
  const template =
    deviceTemplateId && !isBrowserTemplateId(deviceTemplateId)
      ? MOCKUP_DEVICE_BY_ID[deviceTemplateId]
      : undefined;

  const shadowActive =
    deviceShadow != null && deviceFrameShadowActive(deviceShadow);

  useLayoutEffect(() => {
    const el = filterRef.current;
    if (!el || !shadowActive || !deviceShadow) return;
    const filter = el.style.filter;
    el.style.filter = "none";
    void el.getBoundingClientRect();
    el.style.filter = filter;
  }, [
    deviceShadow?.offsetX,
    deviceShadow?.offsetY,
    deviceShadow?.blur,
    deviceShadow?.color,
    deviceShadow?.colorOpacity,
    shadowActive,
    shadowFilterId,
  ]);

  if (!template) {
    return <>{children}</>;
  }

  const activeShadow = shadowActive ? deviceShadow! : null;

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

  const filterStyle: CSSProperties = shadowActive
    ? {
        filter: `url(#${shadowFilterId})`,
        willChange: "filter",
      }
    : {};

  return (
    <div
      className={cn(
        "relative flex h-full w-full min-h-0 min-w-0 items-center justify-center",
        className
      )}
      style={{ containerType: "size" }}
    >
      {shadowActive && activeShadow ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        >
          <defs>
            <filter
              id={shadowFilterId}
              filterUnits="objectBoundingBox"
              x="-1"
              y="-1"
              width="3"
              height="3"
              colorInterpolationFilters="sRGB"
            >
              <feDropShadow
                dx={activeShadow.offsetX}
                dy={activeShadow.offsetY}
                stdDeviation={deviceShadowStdDeviation(activeShadow.blur)}
                floodColor={deviceShadowFloodColor(activeShadow)}
                floodOpacity={deviceShadowFloodOpacity(activeShadow)}
              />
            </filter>
          </defs>
        </svg>
      ) : null}
      <div
        ref={filterRef}
        data-mockup-shadow-filter
        className="relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-visible"
        style={{ ...filterStyle }}
      >
        <div
          data-mockup-bounds-target
          className="relative isolate"
          style={frameBoxStyle}
        >
          <div
            className="absolute z-0 overflow-hidden bg-black"
            data-mockup-screen-clip
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
    </div>
  );
}
