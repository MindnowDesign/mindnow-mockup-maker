"use client";

import { FrameAspectRatioSelect } from "@/components/frame-aspect-ratio-select";

export type WorkspaceFeatureId = "frame" | "background" | "media";

const TITLES: Record<WorkspaceFeatureId, string> = {
  frame: "Frame",
  background: "Background",
  media: "Media",
};

const DESCRIPTIONS: Record<WorkspaceFeatureId, string> = {
  frame:
    "Adjust frame size, device presets, and viewport settings for your mockup.",
  background:
    "Pick colors, gradients, and scene backgrounds behind your composition.",
  media:
    "Add images, uploads, and asset placeholders for this project.",
};

type WorkspaceFeaturePanelProps = {
  feature: WorkspaceFeatureId;
};

/**
 * Secondary sidebar content when a workspace rail icon is selected.
 */
export function WorkspaceFeaturePanel({ feature }: WorkspaceFeaturePanelProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-white">
          {TITLES[feature]}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          {DESCRIPTIONS[feature]}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {feature === "frame" ? (
          <FrameAspectRatioSelect />
        ) : (
          <p className="text-sm text-zinc-500">
            Feature controls will go here.
          </p>
        )}
      </div>
    </div>
  );
}
