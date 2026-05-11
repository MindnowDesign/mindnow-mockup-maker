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

  /** Scales with mockup size (~104px at full asset scale → use % of clip box). */
  const clipStyle: CSSProperties = {
    left: `${s.leftPct}%`,
    top: `${s.topPct}%`,
    width: `${s.widthPct}%`,
    height: `${s.heightPct}%`,
    borderRadius: "8.6%",
  };

  return (
    <div
      className={cn(
        "relative mx-auto max-h-full w-auto max-w-full",
        className
      )}
      style={{
        aspectRatio: `${fw} / ${fh}`,
        height: "100%",
        width: "auto",
      }}
    >
      <div
        className="absolute z-0 overflow-hidden"
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
        draggable={false}
        className="pointer-events-none relative z-10 h-full w-full select-none object-fill"
      />
    </div>
  );
}
