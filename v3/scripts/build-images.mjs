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

/**
 * name, source, aspect (w/h), focus point (0–1) the crop is centred on, widths.
 * The crop keeps as much of the source as the aspect allows.
 */
const jobs = [
  // H03 Brand spectrum — desktop 16:9 and mobile 9:16 per beat
  ['h03-work-desktop', DCP('Gulfalts Office.png'), 16 / 9, [0.5, 0.5], [1280, 1920, 2560]],
  ['h03-work-mobile', DCP('Office space 9-16.png'), 9 / 16, [0.5, 0.5], [720, 1080]],
  ['h03-movement-desktop', DCP('Padel.png'), 16 / 9, [0.5, 0.5], [1280, 1920, 2560]],
  ['h03-movement-mobile', DCP('padel 9-16.png'), 9 / 16, [0.5, 0.5], [720, 1080]],
  ['h03-culture-desktop', DFD('Galleria Loft Space.jpg'), 16 / 9, [0.5, 0.55], [1280, 1920, 2560]],
  ['h03-culture-mobile', DFD('Galleria Loft Space.jpg'), 9 / 16, [0.46, 0.5], [720, 1080]],
  ['h03-life-desktop', DCP('Outdoor food court.png'), 16 / 9, [0.5, 0.58], [1280, 1920, 2560]],
  ['h03-life-mobile', DCP('Outdoor food court.png'), 9 / 16, [0.5, 0.5], [720, 1080]],

  // H05 Creative Park / H08 Fintech District — portrait architecture
  ['h05-creative-park', DCP('Block 5 Padel - side.png'), 3 / 4, [0.5, 0.5], [640, 960, 1280, 1600]],
  ['h08-fintech-district', DFD('Courtyard corner.jpg'), 3 / 4, [0.6, 0.5], [640, 960, 1280, 1600]],

  // H13 directory previews and the share image
  ['preview-creative-park', DCP('Block 5 Padel - side.png'), 16 / 9, [0.5, 0.62], [320]],
  ['preview-fintech-district', DFD('Courtyard corner.jpg'), 16 / 9, [0.6, 0.5], [320]],
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

for (const [name, source, aspect, focus, widths] of jobs) {
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
