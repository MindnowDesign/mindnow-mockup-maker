"use client";

import { SolidColorPopoverRow } from "@/components/solid-color-popover-row";
import { safeHex } from "@/components/canvas-solid-color-popover-panel";

export {
  CanvasSolidColorPopoverPanel,
  safeHex,
} from "@/components/canvas-solid-color-popover-panel";

type CanvasSolidColorPickerProps = {
  color: string;
  onChange: (hex: string) => void;
};

/**
 * Full-width solid color control — uses `SolidColorPopoverRow` (`variant="field"`).
 */
export function CanvasSolidColorPicker({
  color,
  onChange,
}: CanvasSolidColorPickerProps) {
  return (
    <SolidColorPopoverRow
      variant="field"
      className="w-full min-w-0"
      displayHex={safeHex(color)}
      onColorChange={onChange}
      triggerAriaLabel="Open color picker"
    />
  );
}
