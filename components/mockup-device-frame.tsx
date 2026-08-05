"use client";

import type { CSSProperties, ReactNode } from "react";

import { MOCKUP_DEVICE_BY_ID } from "@/lib/mockup-device-templates";
import { cn } from "@/lib/utils";

type MockupDeviceFrameProps = {
  deviceTemplateId: string | null;
  className?: string;
  children: ReactNode;
};

/**
 * Stacks user media in the screen rect (by %) and draws the frame PNG on top.
 * The frame asset should use a transparent screen area; an opaque black screen will hide the media.
 */
export function MockupDeviceFrame({
  deviceTemplateId,
  className,
  children,
}: MockupDeviceFrameProps) {
  const template = deviceTemplateId
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

  /**
   * Contain-fit inside the parent: size by the limiting axis so landscape
   * tablets are not squashed in a square canvas (height:100% + max-w used to).
   */
  const frameBoxStyle: CSSProperties = {
    aspectRatio: `${fw} / ${fh}`,
    width: `min(100cqw, calc(100cqh * ${fw} / ${fh}))`,
    height: `min(100cqh, calc(100cqw * ${fh} / ${fw}))`,
  };

  return (
    <div
      className={cn(
        "@container relative flex h-full w-full min-h-0 min-w-0 items-center justify-center [container-type:size]",
        className
      )}
    >
      <div className="relative max-h-full max-w-full" style={frameBoxStyle}>
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
