"use client";

import { animate, motion, MotionConfig, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const THUMB_SPRING = {
  type: "spring",
  stiffness: 800,
  damping: 80,
  mass: 4,
} as const;

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  "aria-label"?: string;
  className?: string;
  size?: "default" | "sm";
  tone?: "primary" | "orange";
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  label,
  "aria-label": ariaLabel,
  className,
  size = "default",
  tone = "orange",
}: SwitchProps) {
  const id = useId();
  const thumbRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    if (!thumbRef.current || reduce) return;
    if (disabled && isPressed) {
      animate(
        thumbRef.current,
        { x: [0, -2, 2, -1, 0] },
        { delay: 0.2, duration: 0.6 }
      );
    }
  }, [disabled, isPressed, reduce]);

  const squish = !disabled && isPointer && isPressed && !reduce;
  const isSm = size === "sm";

  return (
    <MotionConfig transition={reduce ? { duration: 0 } : THUMB_SPRING}>
      <span className={cn("inline-flex items-center gap-3", className)}>
        <motion.button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label ? undefined : ariaLabel}
          disabled={disabled}
          onClick={() => !disabled && onCheckedChange(!checked)}
          onPointerDown={(e) => {
            setIsPressed(true);
            setIsPointer(e.type.startsWith("pointer"));
          }}
          onPointerUp={() => setIsPressed(false)}
          onPointerLeave={() => setIsPressed(false)}
          initial={false}
          data-state={checked ? "checked" : "unchecked"}
          className={cn(
            "group peer inline-flex shrink-0 cursor-pointer items-center rounded-full outline-none transition-[background-color,box-shadow] duration-200",
            "focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isSm ? "h-4 w-7 px-0.5" : "h-7 w-12 px-1",
            checked
              ? cn(
                  "justify-end",
                  tone === "orange"
                    ? "bg-orange-300 shadow-[0_0_10px_rgba(253,186,116,0.28)]"
                    : "bg-primary"
                )
              : cn(
                  "justify-start",
                  tone === "orange" ? "bg-neutral-800" : "bg-muted-foreground/60"
                )
          )}
        >
          <motion.div
            ref={thumbRef}
            layout
            animate={{ scale: squish ? 0.9 : 1 }}
            className={cn(
              "pointer-events-none block rounded-full bg-white shadow-md",
              isSm ? "h-2.5 w-2.5" : "h-5 w-5"
            )}
          >
            <div
              className={cn(
                isSm ? "size-2.5" : "size-5",
                squish && (checked ? "ml-1" : "mr-1")
              )}
            />
          </motion.div>
        </motion.button>
        {label ? (
          <label
            htmlFor={id}
            className="cursor-pointer text-sm text-foreground"
          >
            {label}
          </label>
        ) : null}
      </span>
    </MotionConfig>
  );
}
