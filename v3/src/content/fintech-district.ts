import type { KeyLocationId, ResponsiveImage, ScrubChapter, StaticChapter } from './types';
import { image, scrubMedia as media, still, type EverydayItem, type InnerPage } from './inner-page';

/*
 * Dubai Fintech District page (fintech-district/index.html), V3 inner page (content/inner-page.ts).
 * Copy follows the client document "Website 2.0", tab "Fintech District" (October 2026):
 *
 *   Fintech District · "Loft-style workspaces, showrooms and galleries within a curated business
 *   destination built around work, wellness and community." · 500000 sq.ft · 65 spaces · Al Quoz ·
 *   Dubai · Work / Eat / Train / Unwind · raw warehouse exteriors → raw interiors → interiors
 *   start to change → people → café → fitness → activity · "Building is only the beginning."
 *
 * Lines marked PROPOSED are not in the document (supporting copy for the template's slots) and
 * need client sign-off.
 *
 * Media: scripts/build-media.sh `dfd` job (video concept/DFD/Video 1–4). Images:
 * scripts/build-images.mjs `dfd-*` jobs (Website Material/DFD).
 */

// ---------------------------------------------------------------------------
// Arrival — SCRUB (Video 1: from orbit → Sheikh Zayed Road → Al Quoz → the DFD warehouse → the
// studio inside). The template hero: once the flight lands, the frame shrinks into a rounded
// card on the canvas (`shrink`) and the header turns ink (`light`).
// ---------------------------------------------------------------------------
export const dfdArrival = {
  id: 'dfd-arrival',
  code: 'DFD-01',
  title: 'Arrival',
  type: 'scrub',
  media: media('dfd-arrival', 'v01'),
  duration: 14.2,
  track: { desktop: 560, mobile: 460 },
  videoSpan: [0, 0.84],
  steps: { light: 0.95 },
  cues: [
    { at: 0, id: 'orbit', label: 'Arrival' },
    { at: 0.15, id: 'dubai', label: 'Dubai', copy: 'Dubai' },
    { at: 0.36, id: 'al-quoz', label: 'Al Quoz', copy: 'Al Quoz' },
    { at: 0.57, id: 'district', label: 'Fintech District', copy: 'Fintech District' },
    { at: 0.9, id: 'inside', label: 'Inside' }
  ],
  copy: {
    eyebrow: 'Al Quoz · Dubai',
    title: 'Dubai Fintech District',
    enter: 'Scroll to explore'
  }
} satisfies ScrubChapter & { copy: unknown; steps: Record<string, number> };

// ---------------------------------------------------------------------------
// Intro — STATIC: the document's description, filled word by word, then the figures.
// The document gives 500,000 sq ft; the homepage (destinations.ts) still says 50,000 sq ft.
// ---------------------------------------------------------------------------
export const dfdIntro = {
  id: 'dfd-intro',
  code: 'DFD-02',
  title: 'Intro',
  type: 'static',
  copy: {
    eyebrow: 'Dubai Fintech District',
    body: 'Loft-style workspaces, showrooms and galleries within a curated business destination built around work, wellness and community.',
    stats: [
      { value: '500,000', label: 'sq ft' },
      { value: '65', label: 'spaces' },
      { value: 'Al Quoz', label: 'Dubai' }
    ]
  }
} satisfies StaticChapter & { copy: unknown };

// ---------------------------------------------------------------------------
// Work · Eat · Train · Unwind — STATIC, pinned: each word replaces the previous one as the
// visitor scrolls, and its pictures wipe up over the last ones. The `body` lines are PROPOSED.
// ---------------------------------------------------------------------------
export const dfdEveryday = {
  id: 'dfd-everyday',
  code: 'DFD-03',
  title: 'Work, eat, train, unwind',
  type: 'static',
  track: { desktop: 420, mobile: 380 },
  copy: {
    eyebrow: 'Built around the day',
    heading: 'Work, eat, train and unwind at Dubai Fintech District',
    items: [
      {
        word: 'Work',
        body: 'High-ceiling lofts, offices and showrooms for companies that want space, privacy and presence.',
        main: { ...image('dfd-work', [640, 960, 1280], 4 / 5), alt: 'A two-storey start-up office with a mezzanine meeting floor and a lounge below.' },
        detail: { ...image('dfd-work-detail', [480, 720], 1), alt: 'A glass-walled private office with a view of the city.' }
      },
      {
        word: 'Eat',
        body: 'Cafés and boutique F&B between the lofts, for the first coffee and the last meeting.',
        main: { ...image('dfd-eat', [640, 960, 1280], 4 / 5), alt: 'A double-height café with a coffee bar, olive trees and a timber ceiling.' },
        detail: { ...image('dfd-eat-detail', [480, 720], 1), alt: 'The curved glass frontage of a café building among palms.' }
      },
      {
        word: 'Train',
        body: 'Gyms and studios a few steps from the desk.',
        main: { ...image('dfd-train', [640, 960, 1280], 4 / 5), alt: 'A loft gym with a climbing wall, a planted wall and a cardio mezzanine.' },
        detail: { ...image('dfd-train-detail', [480, 720], 1), alt: 'A glass-fronted gym pavilion at sunset.' }
      },
      {
        word: 'Unwind',
        body: 'Spa, wellness and shaded courtyards to slow the day down.',
        main: { ...image('dfd-unwind', [640, 960, 1280], 4 / 5), alt: 'A warm-lit spa reception with a mezzanine above.' },
        detail: { ...image('dfd-unwind-detail', [480, 720], 1), alt: 'People talking in a landscaped courtyard between the lofts.' }
      }
    ] satisfies EverydayItem[]
  }
} satisfies StaticChapter & { copy: unknown; track: { desktop: number; mobile: number } };

// ---------------------------------------------------------------------------
// Transformation — SCRUB (Videos 4 → 3 → 2, one master): the template's scale grid zooms into
// the video tile, then each sequence runs from a raw warehouse to a living interior, "almost
// like the development is being constructed around the visitor while they scroll".
// Three acts, one per sequence: the raw space, then what it becomes. Cues sit on the frames where
// the picture changes, as fractions of the 25.17 s master: the diner lights up at 5.2 s, the
// dissolve to the second unit at 7.8 s, the studio floor at 11.6 s, the third unit at 17.4 s and
// its doors open on the workspace at 20.0 s.
// ---------------------------------------------------------------------------
export const dfdTransformation = {
  id: 'dfd-transformation',
  code: 'DFD-04',
  title: 'Transformation',
  type: 'scrub',
  media: media('dfd-transformation', 'v02'),
  duration: 25.17,
  track: { desktop: 1080, mobile: 1000 },
  /** 0 → 0.2: the grid zooms into the video tile; the scrub runs to 0.9, then holds. */
  videoSpan: [0.22, 0.9],
  zoom: [0.02, 0.2],
  cues: [
    { at: 0, act: 1, id: 'warehouse', label: 'A raw warehouse', copy: 'A raw warehouse', still: still('dfd-transformation', 1, 'v01') },
    { at: 0.207, act: 1, id: 'diner', label: 'Becomes a diner and bar', copy: 'becomes a diner and bar.', still: still('dfd-transformation', 3, 'v01') },
    { at: 0.31, act: 2, id: 'hall', label: 'An empty hall', copy: 'An empty hall' },
    { at: 0.461, act: 2, id: 'wellness', label: 'Becomes a wellness studio', copy: 'becomes a wellness studio.', still: still('dfd-transformation', 4, 'v01') },
    { at: 0.691, act: 3, id: 'door', label: 'Another door', copy: 'Another door' },
    { at: 0.795, act: 3, id: 'workspace', label: 'Opens onto a workspace', copy: 'opens onto a workspace.', still: still('dfd-transformation', 5, 'v01') }
  ],
  copy: {
    eyebrow: 'From raw space',
    /** PROPOSED: paraphrases the document's direction for this chapter. */
    heading: 'A district constructed around you as you move through it.',
    statement: 'Building is only the beginning.'
  }
} satisfies ScrubChapter & { copy: unknown; zoom: [number, number] };

/** The tiles around the video in the scale grid (the video is the third, centre tile). */
export const dfdGrid: (ResponsiveImage & { alt: string })[] = [
  { ...image('dfd-grid-aerial', [640, 1080], 3 / 2), alt: 'Aerial view of the Dubai Fintech District warehouses in Al Quoz.' },
  { ...image('dfd-grid-courtyard', [640, 1080], 3 / 2), alt: 'A courtyard frontage of two-storey loft units.' },
  { ...image('dfd-grid-galleria', [640, 1080], 3 / 2), alt: 'The curved glass Galleria building with an ivy-covered roof.' },
  { ...image('dfd-grid-corner', [640, 1080], 3 / 2), alt: 'A curved glass corner building among palms.' },
  { ...image('dfd-grid-masterplan', [640, 1080], 3 / 2), alt: 'Masterplan of Dubai Fintech District: rows of loft units around landscaped courtyards.' }
];

// ---------------------------------------------------------------------------
// Spaces — STATIC: the loft types, from the client's renders (names as supplied).
// ---------------------------------------------------------------------------
export const dfdSpaces = {
  id: 'dfd-spaces',
  code: 'DFD-05',
  title: 'Spaces',
  type: 'static',
  copy: {
    eyebrow: 'Spaces',
    heading: 'Loft-style workspaces, showrooms and galleries.',
    items: [
      { name: 'Penthouse Loft', meta: 'Loft space', image: { ...image('dfd-loft-penthouse', [480, 800, 1200], 4 / 5), alt: 'Penthouse Loft: a double-height loft with a gallery level and lounge.' } },
      { name: 'Burj View Loft', meta: 'Loft space', image: { ...image('dfd-loft-burj-view', [480, 800, 1200], 4 / 5), alt: 'Burj View Loft: a warm double-height loft with a mezzanine office.' } },
      { name: 'Galleria Loft', meta: 'Loft space', image: { ...image('dfd-loft-galleria', [480, 800, 1200], 4 / 5), alt: 'Galleria Loft: a bright loft café and lounge under a mezzanine.' } },
      { name: 'Courtyard Loft', meta: 'Loft space', image: { ...image('dfd-loft-courtyard', [480, 800, 1200], 4 / 5), alt: 'Courtyard Loft: an open-plan loft workspace with a glass gallery above.' } }
    ]
  }
} satisfies StaticChapter & { copy: unknown };

// ---------------------------------------------------------------------------
// Location — STATIC: Mapbox route mode (components/location-map.ts), from this venue to the five
// key locations of the client's map brief. Drive times are Mapbox ETAs (drive-times.json).
// ---------------------------------------------------------------------------
export const dfdLocation = {
  id: 'dfd-location',
  code: 'DFD-06',
  title: 'Location',
  type: 'static',
  /** Pinned stage; `expand` opens the map card to full screen once the stage reaches the top. */
  track: { desktop: 230, mobile: 210 },
  steps: { expand: 0.015 },
  /** Menu links land with the map already open. */
  anchorProgress: 0.12,
  copy: {
    eyebrow: 'Location',
    heading: 'Connected across Dubai.',
    body: 'Choose a destination to trace the drive from Dubai Fintech District.',
    note: 'Mapbox estimates, driving in typical traffic.',
    routes: ['difc', 'downtown', 'businessBay', 'dubaiMarina', 'dxb'] as KeyLocationId[]
  }
} satisfies StaticChapter & { copy: unknown; track: { desktop: number; mobile: number }; steps: Record<string, number>; anchorProgress: number };

// ---------------------------------------------------------------------------
// Next destination — STATIC (the homepage document's closing question).
// ---------------------------------------------------------------------------
export const dfdNext = {
  id: 'dfd-next',
  code: 'DFD-07',
  title: 'Next destination',
  type: 'static',
  copy: {
    heading: 'Where would you like to go next?',
    links: [
      { label: 'Dubai Creative Park', destination: 'creative-park' },
      { label: 'V8 District', destination: 'v8-district' },
      { label: 'Motor Garten', destination: 'motor-garten' }
    ],
    all: 'View our destinations',
    inquire: 'Inquire about Fintech District'
  }
} satisfies StaticChapter & { copy: unknown };

export const fintechDistrictPage: InnerPage = {
  venue: 'fintech-district',
  arrival: dfdArrival,
  intro: dfdIntro,
  everyday: dfdEveryday,
  transformation: dfdTransformation,
  grid: dfdGrid,
  fallbacks: {
    location: '/media/images/dfd-grid-aerial-1080.jpg',
    transformation: '/media/posters/gulfalts-dfd-transformation-poster-desktop-v02.jpg'
  },
  spaces: dfdSpaces,
  location: dfdLocation,
  next: dfdNext
};
