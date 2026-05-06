/** HSB / HSV for UI — H 0–360°, S and V 0–100%. */

export type Hsv = { h: number; s: number; v: number };

function clamp255(n: number) {
  return Math.min(255, Math.max(0, Math.round(n)));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const t = hex.trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(t)) return null;
  return {
    r: parseInt(t.slice(1, 3), 16),
    g: parseInt(t.slice(3, 5), 16),
    b: parseInt(t.slice(5, 7), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const x = (n: number) => clamp255(n).toString(16).padStart(2, "0").toUpperCase();
  return `#${x(r)}${x(g)}${x(b)}`;
}

/** RGB [0–255] → HSV with H 0–360, S/V 0–100. */
export function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  const v = max;
  const s = max === 0 ? 0 : d / max;

  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      default:
        h = ((rn - gn) / d + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

/** HSV → RGB [0–255]. */
export function hsvToRgb(h: number, s: number, v: number): {
  r: number;
  g: number;
  b: number;
} {
  const hh = ((h % 360) + 360) % 360;
  const ss = Math.min(100, Math.max(0, s)) / 100;
  const vv = Math.min(100, Math.max(0, v)) / 100;

  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;

  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hh < 60) {
    rp = c;
    gp = x;
  } else if (hh < 120) {
    rp = x;
    gp = c;
  } else if (hh < 180) {
    gp = c;
    bp = x;
  } else if (hh < 240) {
    gp = x;
    bp = c;
  } else if (hh < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

export function hexToHsv(hex: string): Hsv | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

export function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}
