/**
 * Patches wave SVGs so fills/strokes use `--cbg-*` CSS variables (same as gradients).
 * Run after replacing source files: npm run prepare:wave-svgs
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WAVE_DIR = join(process.cwd(), "public/background-templates/wave");

function patchWaveSvg(content) {
  let out = content;

  if (!out.includes("preserveAspectRatio=")) {
    out = out.replace(
      /<svg([^>]*)>/,
      '<svg$1 preserveAspectRatio="xMidYMid slice">'
    );
  }

  if (!/pointer-events\s*=\s*["']none["']/i.test(out)) {
    out = out.replace(/<svg\b/i, '<svg pointer-events="none"');
  }

  out = out.replace(
    /<rect width="1184" height="792" fill="#0F0F0F"\/>/g,
    '<rect width="1184" height="792" fill="var(--cbg-0, #0F0F0F)"/>'
  );

  out = out.replace(
    /stroke="white"/g,
    'stroke="var(--cbg-1, #FFFFFF)"'
  );

  out = out.replace(
    /stroke="#F0F1F1"/gi,
    'stroke="var(--cbg-1, #F0F1F1)"'
  );

  return out;
}

const files = readdirSync(WAVE_DIR)
  .filter((f) => f.endsWith(".svg"))
  .sort();

for (const file of files) {
  const path = join(WAVE_DIR, file);
  const next = patchWaveSvg(readFileSync(path, "utf8"));
  writeFileSync(path, next);
  console.log(`  ✓ ${file}`);
}

console.log(`Patched ${files.length} wave SVGs.`);
