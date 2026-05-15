"use client";

import { useEffect, useState } from "react";

const GRADIENT_1_SRC = "/background-templates/gradients/gradient-1.svg";

/**
 * Fetches the public SVG once (same markup as `gradient-1.svg`) for inline
 * rendering so parent CSS variables can drive fills.
 */
export function useGradient1SvgHtml(): string | null {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GRADIENT_1_SRC)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => {
        if (!cancelled) setHtml(t);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return html;
}
