import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Turn near-black pixels in the CoreWeave logo into transparent pixels so the
// asset can sit on any background. Run with: node scripts/makeLogoTransparent.mjs
const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "..", "src", "assets", "coreweave-logo.png");
const OUT = SRC;

// Any pixel whose max(R,G,B) is below this gets fully transparent.
// Pixels above fade in proportionally so anti-aliased edges stay smooth.
const HARD_CUTOFF = 24;   // below → fully transparent
const SOFT_CUTOFF = 90;   // above → fully opaque (scaled by luminance band)

const input = await readFile(SRC);
const img = sharp(input).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (let i = 0; i < data.length; i += channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const lum = Math.max(r, g, b);
  let alpha;
  if (lum <= HARD_CUTOFF) alpha = 0;
  else if (lum >= SOFT_CUTOFF) alpha = 255;
  else alpha = Math.round(((lum - HARD_CUTOFF) / (SOFT_CUTOFF - HARD_CUTOFF)) * 255);
  data[i + 3] = alpha;
}

const out = await sharp(data, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(OUT, out);
console.log(`wrote ${OUT} (${out.length} bytes, ${width}x${height})`);
