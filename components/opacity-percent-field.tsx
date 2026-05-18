"use client";

import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

type OpacityPercentFieldProps = {
  value: number;
  onChange: (n: number) => void;
  inputAriaLabel: string;
  className?: string;
};

/** 0–100 opacity input with trailing `%`. */
export function OpacityPercentField({
  value,
  onChange,
  inputAriaLabel,
  className,
}: OpacityPercentFieldProps) {
  const [opacityText, setOpacityText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setOpacityText(String(value));
  }, [value, focused]);

  function commitOpacity(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    if (digits === "") {
      onChange(0);
      setOpacityText("0");
      return;
    }
    const n = Math.min(100, Math.max(0, parseInt(digits, 10)));
    onChange(n);
    setOpacityText(String(n));
  }

  function handleOpacityArrowKeys(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const digits = opacityText.replace(/\D/g, "");
    const base = digits === "" ? value : parseInt(digits, 10);
    const step = e.shiftKey ? 10 : 1;
    const delta = e.key === "ArrowUp" ? step : -step;
    const next = Math.min(100, Math.max(0, base + delta));
    onChange(next);
    setOpacityText(String(next));
  }

  return (
    <div className={className ?? "flex shrink-0 items-center"}>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={inputAriaLabel}
        value={opacityText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commitOpacity(opacityText);
        }}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
          setOpacityText(digits);
          if (digits !== "") {
            const n = Math.min(100, Math.max(0, parseInt(digits, 10)));
            onChange(n);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            handleOpacityArrowKeys(e);
            return;
          }
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="min-w-0 max-w-[3rem] bg-transparent px-1.5 py-2 text-right font-mono text-[11px] leading-none tabular-nums text-zinc-100 outline-none focus-visible:bg-white/5"
      />
      <span
        className="flex shrink-0 items-center justify-center pl-0.5 pr-2 font-mono text-[11px] text-zinc-400 tabular-nums"
        aria-hidden
      >
        %
      </span>
    </div>
  );
}
