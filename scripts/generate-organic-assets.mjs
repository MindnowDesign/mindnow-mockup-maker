/**
 * Generates lightweight WebP assets from source PNGs in
 * `public/background-templates/organic/`.
 *
 * - previews/ — sidebar grid (~96px)
 * - display/  — canvas full view (~1280px max, WebP q78)
 *
 * Run after adding or replacing a source PNG:
 *   npm run generate:organic-assets
 *
 * Source PNGs are gitignored (~17MB each). To stop tracking existing PNGs:
 *   git rm --cached 'public/background-templates/organic/*.png'
 */
import { mkdir, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";

const ORGANIC_ROOT = join(
  process.cwd(),
  "public/background-templates/organic"
);
const PREVIEW_DIR = join(ORGANIC_ROOT, "previews");
const DISPLAY_DIR = join(ORGANIC_ROOT, "display");

const PREVIEW_SIZE = 96;
/** Matches max mockup frame (~920px) with headroom for export / retina. */
const DISPLAY_MAX = 1280;
const DISPLAY_WEBP_QUALITY = 78;

async function main() {
  await mkdir(PREVIEW_DIR, { recursive: true });
  await mkdir(DISPLAY_DIR, { recursive: true });

  const entries = await readdir(ORGANIC_ROOT, { withFileTypes: true });
  const pngFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".png"))
    .map((e) => e.name)
    .sort();

  if (pngFiles.length === 0) {
    console.log("No PNG files found in", ORGANIC_ROOT);
    return;
  }

  console.log(`Processing ${pngFiles.length} organic backgrounds…`);

  for (const file of pngFiles) {
    const slug = basename(file, ".png");
    const input = join(ORGANIC_ROOT, file);
    const previewOut = join(PREVIEW_DIR, `${slug}.webp`);
    const displayOut = join(DISPLAY_DIR, `${slug}.webp`);

    await sharp(input)
      .resize(PREVIEW_SIZE, PREVIEW_SIZE, { fit: "cover" })
      .webp({ quality: 72 })
      .toFile(previewOut);

    await sharp(input)
      .resize(DISPLAY_MAX, DISPLAY_MAX, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: DISPLAY_WEBP_QUALITY })
      .toFile(displayOut);

    console.log(`  ✓ ${slug}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
