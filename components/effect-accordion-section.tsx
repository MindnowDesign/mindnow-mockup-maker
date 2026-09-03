"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { CanvasStyleIconProps } from "@/components/canvas-style-icons";
import { Switch } from "@/components/ui/beui-switch";

/** Smooth ease — slow start, gentle settle (no spring snap on tall panels). */
const PANEL_EASE = [0.32, 0.72, 0, 1] as const;

/** Scale open/close duration with content height so long panels don't feel rushed. */
function panelDuration(contentHeight: number): number {
  if (contentHeight <= 96) return 0.34;
  if (contentHeight <= 220) return 0.4;
  return Math.min(0.72, 0.36 + contentHeight / 620);
}

function useMeasuredPanelHeight(enabled: boolean) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      setHeight(el.scrollHeight);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return { contentRef, height };
}

function SectionHeaderLabel({
  label,
  Icon,
}: {
  label: string;
  Icon: React.ComponentType<CanvasStyleIconProps>;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2 text-left text-neutral-100">
      <Icon
        className="size-3.5 shrink-0 text-neutral-400"
        strokeWidth={2}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </span>
  );
}

/** Toggle row that expands detail controls while enabled. */
export function EffectAccordionSection({
  label,
  Icon,
  enabled,
  onEnabledChange,
  children,
}: {
  label: string;
  Icon: React.ComponentType<CanvasStyleIconProps>;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const { contentRef, height } = useMeasuredPanelHeight(enabled);
  const duration = panelDuration(height);
  const panelTransition = reduce
    ? { duration: 0 }
    : { duration, ease: PANEL_EASE };

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
      <div className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium">
        <SectionHeaderLabel label={label} Icon={Icon} />
        <Switch
          size="sm"
          tone="orange"
          checked={enabled}
          onCheckedChange={onEnabledChange}
          aria-label={`${enabled ? "Disable" : "Enable"} ${label}`}
        />
      </div>
      <motion.div
        initial={false}
        animate={{
          height: enabled ? height : 0,
          opacity: enabled ? 1 : 0,
        }}
        transition={panelTransition}
        className="overflow-hidden"
        style={{ pointerEvents: enabled ? "auto" : "none" }}
      >
        <motion.div
          ref={contentRef}
          initial={false}
          animate={{
            y: enabled ? 0 : -5,
          }}
          transition={panelTransition}
          className="space-y-3 border-t border-neutral-800 px-3 pb-3 pt-3 text-neutral-100"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
