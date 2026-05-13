import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

/** Same contract as Lucide in the style picker: `className`, `strokeWidth`, plus SVG passthrough. */
export type ScreenshotPickerIconProps = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

function strokeWidthAttr(
  strokeWidth: ScreenshotPickerIconProps["strokeWidth"]
): number {
  if (typeof strokeWidth === "number" && !Number.isNaN(strokeWidth)) {
    return strokeWidth;
  }
  if (typeof strokeWidth === "string") {
    const n = parseFloat(strokeWidth);
    if (!Number.isNaN(n)) return n;
  }
  return 2;
}

/**
 * Picker icons — synced from `public/icons/style-outline.svg`, `style-glass.svg`,
 * `style-liquid-glass.svg` (update both when you change the files).
 */
export function ScreenshotStyleOutlinedIcon({
  className,
  strokeWidth,
  ...rest
}: ScreenshotPickerIconProps) {
  const main = strokeWidthAttr(strokeWidth);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...rest}
    >
      <path
        d="M19.7778 2H4.22222C2.99492 2 2 2.99492 2 4.22222V19.7778C2 21.0051 2.99492 22 4.22222 22H19.7778C21.0051 22 22 21.0051 22 19.7778V4.22222C22 2.99492 21.0051 2 19.7778 2Z"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.05077 5.63672C6.67574 5.63672 6.31607 5.7857 6.05089 6.05089C5.7857 6.31607 5.63672 6.67574 5.63672 7.05077"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.9492 5.63672C17.3242 5.63672 17.6839 5.7857 17.9491 6.05089C18.2143 6.31607 18.3633 6.67574 18.3633 7.05077"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3633 16.9492C18.3633 17.3242 18.2143 17.6839 17.9491 17.9491C17.6839 18.2143 17.3242 18.3633 16.9492 18.3633"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.05077 18.3633C6.67574 18.3633 6.31607 18.2143 6.05089 17.9491C5.7857 17.6839 5.63672 17.3242 5.63672 16.9492"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.87891 5.63672H10.5859"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.87891 18.3633H10.5859"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.416 5.63672H14.123"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.416 18.3633H14.123"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.63672 9.87891V10.5859"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3633 9.87891V10.5859"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.63672 13.4141V14.1211"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3633 13.4141V14.1211"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ScreenshotStyleGlassIcon({
  className,
  strokeWidth,
  ...rest
}: ScreenshotPickerIconProps) {
  const main = strokeWidthAttr(strokeWidth);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...rest}
    >
      <path
        d="M9 6L6 9"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7L6 15"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.7778 2H4.22222C2.99492 2 2 2.99492 2 4.22222V19.7778C2 21.0051 2.99492 22 4.22222 22H19.7778C21.0051 22 22 21.0051 22 19.7778V4.22222C22 2.99492 21.0051 2 19.7778 2Z"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ScreenshotStyleLiquidGlassIcon({
  className,
  strokeWidth,
  ...rest
}: ScreenshotPickerIconProps) {
  const main = strokeWidthAttr(strokeWidth);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...rest}
    >
      <path
        d="M19.7778 2H4.22222C2.99492 2 2 2.99492 2 4.22222V19.7778C2 21.0051 2.99492 22 4.22222 22H19.7778C21.0051 22 22 21.0051 22 19.7778V4.22222C22 2.99492 21.0051 2 19.7778 2Z"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 18C14.75 18 17 16.0036 17 13.5818C17 12.3164 16.2875 11.1164 14.8625 10.1018C13.4375 9.08727 12.3625 7.58182 12 6C11.6375 7.58182 10.575 9.09818 9.1375 10.1018C7.7 11.1055 7 12.3273 7 13.5818C7 16.0036 9.25 18 12 18Z"
        stroke="currentColor"
        strokeWidth={main}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
