"use client";

import { useGradientSvgHtml } from "@/components/use-gradient-svg-html";

/** @deprecated Use `useGradientSvgHtml("gradient-1")` */
export function useGradient1SvgHtml(): string | null {
  return useGradientSvgHtml("gradient-1");
}
