import type { KeyLocationId } from './types';
import { image, scrubMedia as media, still, type InnerPage } from './inner-page';

/*
 * Dubai Creative Park page (dubai-creative-park/index.html), V3 inner page (content/inner-page.ts),
 * cloned from the Fintech District page. The v1 design is archived at
 * archive/dubai-creative-park-v1/ (git tag archive/dcp-design-v1).
 *
 * Copy reuses the v1 page's client copy: the lead, "Most places are built for one thing. This one
 * was built for all of it.", the Work / Movement / Culture / Life roll and the tour stories.
 * Lines marked PROPOSED are new supporting copy for the template's slots and need client sign-off.
 *
 * PLACEHOLDER media: there are no DCP renders in Website Material yet, so every still is a frame
 * of the DCP footage (scripts/build-media.sh `dcp-page`). Swap in renders when they arrive.
 */

// ---------------------------------------------------------------------------
// Arrival — SCRUB (Final tour 0–5.6 s: Dubai → Al Quoz → the park from above → the building rises
// → the office inside). Then the frame shrinks into a card (`shrink`), the header turns ink (`light`).
// ---------------------------------------------------------------------------
const arrival: InnerPage['arrival'] = {
  id: 'dcp-arrival',
  code: 'DCP-01',
  title: 'Arrival',
  type: 'scrub',
  media: media('dcp-arrival', 'v01'),
  duration: 5.6,
  track: { desktop: 500, mobile: 420 },
  videoSpan: [0, 0.84],
  steps: { light: 0.95 },
  cues: [
    { at: 0, id: 'city', label: 'Arrival' },
    { at: 0.18, id: 'dubai', label: 'Dubai', copy: 'Dubai' },
    { at: 0.36, id: 'al-quoz', label: 'Al Quoz', copy: 'Al Quoz' },
    { at: 0.54, id: 'park', label: 'Creative Park', copy: 'Creative Park' },
    { at: 0.89, id: 'inside', label: 'Inside' }
  ],
  copy: {
    eyebrow: 'Dubai Creative Park',
    eyebrowLarge: true,
    title: 'A destination built around movement.',
    enter: 'Scroll to explore'
  }
};

// ---------------------------------------------------------------------------
// Intro — STATIC: the v1 lead, filled word by word, then the figures (v1 hero eyebrow and stats).
// ---------------------------------------------------------------------------
const intro: InnerPage['intro'] = {
  id: 'dcp-intro',
  code: 'DCP-02',
  title: 'Intro',
  type: 'static',
  copy: {
    eyebrow: 'Dubai Creative Park',
    body: 'Sport, wellness, family activities, creative studios and F&B, brought together in one connected, walkable community.',
    stats: [
      { value: '500,000', label: 'sq ft' },
      { value: '54', label: 'spaces' },
      { value: '25+', label: 'activation zones' }
    ]
  }
};

// ---------------------------------------------------------------------------
// Work · Movement · Culture · Life — STATIC, pinned (the v1 "For …" roll).
// ---------------------------------------------------------------------------
const everyday: InnerPage['everyday'] = {
  id: 'dcp-everyday',
  code: 'DCP-03',
  title: 'Work, movement, culture, life',
  type: 'static',
  track: { desktop: 420, mobile: 380 },
  copy: {
    eyebrow: 'Built for all of it',
    heading: 'Work, movement, culture and life at Dubai Creative Park',
    items: [
      {
        word: 'Work',
        body: 'Bright, open offices built for focus and collaboration.',
        main: { ...image('dcp-work', [480, 864], 4 / 5), alt: 'An open-plan office with a lounge and tall windows onto the park.' },
        detail: { ...image('dcp-work-detail', [480, 720], 1), alt: 'People at work in a bright office with timber shelving.' }
      },
      {
        word: 'Movement',
        body: 'Run, ride and play with people who share your pace.',
        main: { ...image('dcp-move', [480, 864], 4 / 5), alt: 'Runners and cyclists on a tree-lined path beside the padel courts.' },
        detail: { ...image('dcp-move-detail', [480, 720], 1), alt: 'A padel match in an indoor hall.' }
      },
      {
        word: 'Culture',
        /** PROPOSED */
        body: 'Markets, creative studios and food that bring the park together.',
        main: { ...image('dcp-culture', [480, 864], 4 / 5), alt: 'Food trucks and shared tables in an open-air market.' },
        detail: { ...image('dcp-culture-detail', [480, 720], 1), alt: 'A long communal table under festoon lights.' }
      },
      {
        word: 'Life',
        body: 'Train, swim and recharge, then stay for sunsets to share.',
        main: { ...image('dcp-life', [480, 864], 4 / 5), alt: 'An indoor pool with loungers and palms.' },
        detail: { ...image('dcp-life-detail', [480, 720], 1), alt: 'The park frontage lit up at dusk.' }
      }
    ]
  }
};

// ---------------------------------------------------------------------------
// Transformation — SCRUB (Built for all, 12.05 s): a raw green warehouse opens up and is fitted
// out around the visitor. Cues reuse the v1 roll timings (4.45 / 6.5 / 8.8 / 11 s).
// ---------------------------------------------------------------------------
const transformation: InnerPage['transformation'] = {
  id: 'dcp-transformation',
  code: 'DCP-04',
  title: 'Transformation',
  type: 'scrub',
  media: media('dcp-built-for-all', 'v01'),
  duration: 12.05,
  track: { desktop: 900, mobile: 720 },
  /** 0 → 0.2: the grid zooms into the video tile; the scrub runs to 0.9, then holds. */
  videoSpan: [0.22, 0.9],
  zoom: [0.02, 0.2],
  cues: [
    { at: 0, id: 'warehouse', label: 'A raw warehouse', copy: 'A raw warehouse', still: still('dcp-transformation', 1, 'v01') },
    { at: 0.3, id: 'interior', label: 'Raw interiors', copy: 'Raw interiors', still: still('dcp-transformation', 2, 'v01') },
    { at: 0.37, id: 'work', label: 'Work', copy: 'Work', still: still('dcp-transformation', 3, 'v01') },
    { at: 0.54, id: 'movement', label: 'Movement', copy: 'Movement', still: still('dcp-transformation', 4, 'v01') },
    { at: 0.73, id: 'culture', label: 'Culture', copy: 'Culture', still: still('dcp-transformation', 5, 'v01') },
    { at: 0.91, id: 'life', label: 'Life', copy: 'Life', still: still('dcp-transformation', 6, 'v01') }
  ],
  copy: {
    eyebrow: 'From raw space',
    heading: 'Most places are built for one thing.',
    statement: 'This one was built for all of it.'
  }
};

const grid: InnerPage['grid'] = [
  { ...image('dcp-grid-city', [640, 1080], 3 / 2), alt: 'Sheikh Zayed Road towers in Dubai.' },
  { ...image('dcp-grid-al-quoz', [640, 1080], 3 / 2), alt: 'Aerial view over Al Quoz.' },
  { ...image('dcp-grid-plan', [640, 1080], 3 / 2), alt: 'The Dubai Creative Park warehouses seen from above.' },
  { ...image('dcp-grid-exterior', [640, 1080], 3 / 2), alt: 'The two-storey frontage of a Dubai Creative Park building.' },
  { ...image('dcp-grid-evening', [640, 1080], 3 / 2), alt: 'Dubai Creative Park at dusk, with its courts and the city skyline behind.' }
];

// ---------------------------------------------------------------------------
// Spaces — STATIC: the space types from the v1 stats ("Spaces across retail, office, F&B,
// fitness and wellness"). PROPOSED names until the client supplies a unit list.
// ---------------------------------------------------------------------------
const spaces: InnerPage['spaces'] = {
  id: 'dcp-spaces',
  code: 'DCP-05',
  title: 'Spaces',
  type: 'static',
  copy: {
    eyebrow: 'Spaces',
    heading: '54 spaces across retail, office, F&B, fitness and wellness.',
    items: [
      { name: 'Offices', meta: 'Office space', image: { ...image('dcp-space-offices', [480, 864], 4 / 5), alt: 'Offices: an open-plan workspace with a lounge.' } },
      { name: 'Wellness Center', meta: 'Fitness and wellness', image: { ...image('dcp-space-wellness', [480, 864], 4 / 5), alt: 'Wellness Center: a gym with a wall of windows at sunset.' } },
      { name: 'Sports Courts', meta: 'Sport', image: { ...image('dcp-space-courts', [480, 864], 4 / 5), alt: 'Sports Courts: indoor padel courts under a high steel roof.' } },
      { name: 'Food Market', meta: 'F&B', image: { ...image('dcp-space-market', [480, 864], 4 / 5), alt: 'Food Market: food trucks and shaded seating outdoors.' } }
    ]
  }
};

// ---------------------------------------------------------------------------
// Location — STATIC: Mapbox route mode from Creative Park (drive-times.json).
// ---------------------------------------------------------------------------
const location: InnerPage['location'] = {
  id: 'dcp-location',
  code: 'DCP-06',
  title: 'Location',
  type: 'static',
  track: { desktop: 230, mobile: 210 },
  steps: { expand: 0.015 },
  anchorProgress: 0.12,
  copy: {
    eyebrow: 'Location',
    heading: 'Connected across Dubai.',
    body: 'Choose a destination to trace the drive from Dubai Creative Park.',
    note: 'Mapbox estimates, driving in typical traffic.',
    routes: ['difc', 'downtown', 'businessBay', 'dubaiMarina', 'dxb'] as KeyLocationId[]
  }
};

// ---------------------------------------------------------------------------
// Next destination — STATIC (the homepage document's closing question).
// ---------------------------------------------------------------------------
const next: InnerPage['next'] = {
  id: 'dcp-next',
  code: 'DCP-07',
  title: 'Next destination',
  type: 'static',
  copy: {
    heading: 'Where would you like to go next?',
    links: [
      { label: 'Dubai Fintech District', destination: 'fintech-district' },
      { label: 'V8 District', destination: 'v8-district' },
      { label: 'Motor Garten', destination: 'motor-garten' }
    ],
    all: 'View our destinations',
    inquire: 'Inquire about Creative Park'
  }
};

export const creativeParkPage: InnerPage = {
  venue: 'creative-park',
  arrival,
  intro,
  everyday,
  transformation,
  grid,
  fallbacks: {
    location: '/media/images/dcp-grid-al-quoz-1080.jpg',
    transformation: '/media/posters/gulfalts-dcp-built-for-all-poster-desktop-v01.jpg'
  },
  spaces,
  location,
  next
};
