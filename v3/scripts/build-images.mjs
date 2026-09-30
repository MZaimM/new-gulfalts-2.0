/*
 * Responsive stills for V3, cut from the 4K renders in ../Website Material.
 * Every image ships as AVIF (primary) + mozjpeg (fallback) at several widths, so a phone never
 * downloads a 4K file and a retina desktop never gets an upscaled one.
 *
 * Output: public/media/images/<name>-<width>.{avif,jpg}
 * The widths and names are mirrored in src/content/images.ts.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const material = path.resolve(root, '../Website Material');
const out = path.join(root, 'public/media/images');
await mkdir(out, { recursive: true });

const DCP = file => path.join(material, 'DCP ', file);
const DFD = file => path.join(material, 'DFD ', file);
// Venue images taken from gulfalts.com (V8 District, Motor Garten project renders).
const SITE = file => path.join(material, 'gulfalts.com', file);
// Photos taken from gulfalts-homepage-preview.html (Our destinations slider).
const PORTAL = file => path.join(material, 'portals', file);

/**
 * name, source, aspect (w/h), focus point (0–1) the crop is centred on, widths.
 * The crop keeps as much of the source as the aspect allows.
 */
const jobs = [
  // H03 Brand spectrum stills now live in backups/brand-spectrum/images (section removed).

  // H05 Featured destinations — Creative Park and Fintech District, 4:3 side by side
  ['featured-creative-park', DCP('Block 5 Padel - side.png'), 4 / 3, [0.5, 0.6], [640, 960, 1280, 1600]],
  ['featured-fintech-district', DFD('Courtyard corner.jpg'), 4 / 3, [0.58, 0.5], [640, 960, 1280, 1600]],

  // Our destinations slider — square, seen through a circle
  ['slide-creative-park', PORTAL('dcp-photo.jpg'), 1, [0.5, 0.56], [640, 1100]],
  ['slide-fintech-district', PORTAL('dfd-photo.jpg'), 1, [0.5, 0.5], [640, 788]],

  // H13 directory previews and the share image
  ['preview-creative-park', DCP('Block 5 Padel - side.png'), 16 / 9, [0.5, 0.62], [320]],
  ['preview-fintech-district', DFD('Courtyard corner.jpg'), 16 / 9, [0.6, 0.5], [320]],
  ['preview-v8-district', SITE('v8-district-auto-park.avif'), 16 / 9, [0.35, 0.55], [320]],
  ['preview-motor-garten', SITE('motor-garten-concept.avif'), 16 / 9, [0.5, 0.5], [320]],
  ['og-gulfalts', DCP('Block 5 Padel - side.png'), 1200 / 630, [0.5, 0.6], [1200]]
];

const cropFor = (width, height, aspect, [fx, fy]) => {
  let w = width;
  let h = Math.round(width / aspect);
  if (h > height) {
    h = height;
    w = Math.round(height * aspect);
  }
  const left = Math.round(Math.min(width - w, Math.max(0, width * fx - w / 2)));
  const top = Math.round(Math.min(height - h, Math.max(0, height * fy - h / 2)));
  return { left, top, width: w, height: h };
};

// `node scripts/build-images.mjs slide-` renders only the jobs whose name starts with the argument.
const only = process.argv[2];

for (const [name, source, aspect, focus, widths] of jobs) {
  if (only && !name.startsWith(only)) continue;
  const { width, height } = await sharp(source).metadata();
  const region = cropFor(width, height, aspect, focus);
  for (const target of widths) {
    const w = Math.min(target, region.width);
    const h = Math.round(w / aspect);
    const base = sharp(source).extract(region).resize(w, h, { kernel: 'lanczos3' });
    const file = path.join(out, `${name}-${target}`);
    const jpeg = name.startsWith('og-')
      ? base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`${file}.jpg`)
      : Promise.all([
        base.clone().avif({ quality: 52, effort: 5, chromaSubsampling: '4:2:0' }).toFile(`${file}.avif`),
        base.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(`${file}.jpg`)
      ]);
    await jpeg;
    console.log(`${name}-${target}  ${w}×${h}`);
  }
}
