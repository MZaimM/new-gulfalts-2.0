import type { AutoplayChapter, MediaSources, ResponsiveImage, ScrubChapter, StaticChapter } from './types';

/*
 * Homepage chapters, V3: "From Space to Destination".
 *
 *   H01 Intro → H02 Dubai arrival → H04 The firm → Our destinations (slider) →
 *   H05 Dubai Creative Park → H08 Dubai Fintech District → H11 Our approach →
 *   H13 Our destinations → H14 Next destination
 *
 * Chapter codes keep the story-map numbering, so H06/H07, H09/H10 and H12 are simply absent
 * (removed in V3: their content now lives in H05, H08 and H11).
 *
 * Media versions: v03 = new homepage intro (H02), v02 = homepage outro (H13), v01 = production footage
 * (H11), v00 = V2 placeholder (H04 manifesto only). All built by scripts/build-media.sh.
 */

const media = (name: string, version: string): MediaSources => ({
  desktop: `/media/video/gulfalts-${name}-desktop-${version}.mp4`,
  mobile: `/media/video/gulfalts-${name}-mobile-${version}.mp4`,
  posterDesktop: `/media/posters/gulfalts-${name}-poster-desktop-${version}.jpg`,
  posterMobile: `/media/posters/gulfalts-${name}-poster-mobile-${version}.jpg`
});

const still = (name: string, frame: number, version: string) =>
  `/media/images/gulfalts-${name}-frame-${String(frame).padStart(2, '0')}-${version}.jpg`;

/** Mirrors the jobs in scripts/build-images.mjs. */
const image = (name: string, widths: number[], ratio: number): ResponsiveImage => ({ name, widths, ratio });

// ---------------------------------------------------------------------------
// H01 Intro — the logo animation over H02's opening frame (the Gulf), on a short pinned track.
//   1. The Gulfalts logo animates in (components/reveals.ts); the header waits for it.
//   2. First scroll: the logo slides out and H02's scrub takes over from the same frame.
// The step is scroll-triggered but time-animated (CSS transitions) and reverses on the way up.
// ---------------------------------------------------------------------------
export const h01 = {
  id: 'h01-brand-reveal',
  code: 'H01',
  title: 'Intro',
  type: 'intro',
  track: { desktop: 130, mobile: 125 },
  /** Story progress (0–1) at which each intro step fires. */
  steps: { 'brand-out': 0.2 },
  copy: {
    positioning: 'Dynamic Destinations',
    enter: 'Scroll to enter'
  }
} as const;

// ---------------------------------------------------------------------------
// H02 Dubai Arrival — SCRUB (new homepage intro: the Gulf and the UAE coast → down onto Dubai →
// along the coast from the Palms to Downtown).
// ---------------------------------------------------------------------------
export const h02 = {
  id: 'h02-dubai-arrival',
  code: 'H02',
  title: 'Dubai arrival',
  type: 'scrub',
  media: media('h02-dubai-arrival', 'v03'),
  duration: 14.2,
  // Its last ~100vh is H04 wiping in over the final frame, so the track carries that too.
  track: { desktop: 440, mobile: 340 },
  // Dissolves in from H01's final state, which already shows this chapter's first frame.
  joinPrevious: true,
  // The last cue is the caption on the final frame; the others build the path on the left.
  cues: [
    { at: 0.08, id: 'uae', label: 'UAE' },
    { at: 0.52, id: 'dubai', label: 'Dubai' },
    { at: 0.86, id: 'caption', label: 'Dubai · United Arab Emirates' }
  ],
  copy: {
    heading: 'From the Gulf to Dubai'
  }
} satisfies ScrubChapter & { copy: unknown };

// ---------------------------------------------------------------------------
// H04 Brand Manifesto (The firm) — AUTOPLAY, wipes in over H02's last frame
// ---------------------------------------------------------------------------
export const h04 = {
  id: 'h04-brand-manifesto',
  code: 'H04',
  title: 'Brand manifesto',
  type: 'autoplay',
  media: media('h04-brand-manifesto', 'v00'),
  loop: true,
  // Wipes up over H02's final frame (see the wipe join in chapters.css), then holds briefly.
  track: { desktop: 160, mobile: 150 },
  joinPrevious: true,
  joinStyle: 'wipe',
  copy: {
    eyebrow: 'The firm',
    heading: 'Spaces are more than structures.',
    lead: 'They shape how we move, meet and feel.',
    body: 'We curate dynamic environments where business, wellness and community thrive.'
  }
} satisfies AutoplayChapter & { copy: unknown };

// ---------------------------------------------------------------------------
// Our destinations — slider. One destination at a time, seen through a circle with a gold
// ring that doubles as the autoplay timer; arrows, numbered tabs and swipe move between them.
// ---------------------------------------------------------------------------
export const slider = {
  id: 'our-destinations',
  copy: { eyebrow: 'Our destinations' },
  items: [
    {
      destination: 'creative-park',
      location: 'Dubai · Al Quoz',
      name: 'Creative Park',
      pillars: ['Work', 'Train', 'Play', 'Dine', 'Heal'],
      cta: 'Explore Creative Park',
      image: {
        ...image('slide-creative-park', [640, 1100], 1),
        alt: 'Dubai Creative Park at dusk: food trucks, string lights and long tables along a tree-lined walk.'
      }
    },
    {
      destination: 'fintech-district',
      location: 'Dubai · Al Quoz',
      name: 'Fintech District',
      pillars: ['Work', 'Eat', 'Train', 'Unwind'],
      cta: 'Explore Fintech District',
      image: {
        ...image('slide-fintech-district', [640, 788], 1),
        alt: 'Dubai Fintech District: double-height glass frontages around a landscaped courtyard.'
      }
    }
  ]
};

// ---------------------------------------------------------------------------
// H05 Featured destinations — one STATIC section holding H05 (Creative Park) and H08 (Fintech
// District) side by side. Their copy stays below as two items.
// ---------------------------------------------------------------------------
export const featured = {
  id: 'featured-destinations',
  copy: {
    eyebrow: 'Featured destinations — Al Quoz',
    heading: 'Two destinations in Al Quoz, Dubai.'
  }
};

// ---------------------------------------------------------------------------
// H05 Dubai Creative Park — STATIC feature
// ---------------------------------------------------------------------------
export const h05 = {
  id: 'h05-creative-park',
  code: 'H05',
  title: 'Dubai Creative Park',
  type: 'static',
  copy: {
    destination: 'creative-park',
    eyebrow: 'Dubai Creative Park — Al Quoz',
    heading: 'A destination built around movement.',
    body: 'Sport, wellness, family activities, creative studios and F&B, brought together in one connected, walkable community.',
    cta: 'Explore Dubai Creative Park',
    image: {
      ...image('featured-creative-park', [640, 960, 1280, 1600], 4 / 3),
      alt: 'The long white facade of a Dubai Creative Park building at dusk, lit by rows of wall lights above landscaped parking.'
    }
  }
} satisfies StaticChapter & { copy: unknown };

// ---------------------------------------------------------------------------
// H08 Dubai Fintech District — STATIC feature (mirrors H05)
// ---------------------------------------------------------------------------
export const h08 = {
  id: 'h08-fintech-district',
  code: 'H08',
  title: 'Dubai Fintech District',
  type: 'static',
  copy: {
    destination: 'fintech-district',
    eyebrow: 'Dubai Fintech District — Al Quoz',
    heading: 'A business district with new standards.',
    body: 'A business district built to prioritize accessibility, customizable spaces and natural light: offices, showrooms, galleries, wellness and F&B. A curated tenant mix designed for a connected business community.',
    cta: 'Explore Dubai Fintech District',
    image: {
      ...image('featured-fintech-district', [640, 960, 1280, 1600], 4 / 3),
      alt: 'The curved glass frontage of a Dubai Fintech District building, with a café inside and palm-lined streets around it.'
    }
  }
} satisfies StaticChapter & { copy: unknown };

// ---------------------------------------------------------------------------
// H11 Our approach: Raw Space to Living Destination — SCRUB (DCP video)
// ---------------------------------------------------------------------------
const h11Name = 'h11-raw-to-destination';
export const h11 = {
  id: h11Name,
  code: 'H11',
  title: 'Raw space to living destination',
  type: 'scrub',
  media: media(h11Name, 'v01'),
  duration: 32.74,
  track: { desktop: 1000, mobile: 680 },
  cues: [
    { at: 0, id: 'raw', label: 'Raw warehouse', copy: 'Building is only the beginning.', still: still(h11Name, 1, 'v01') },
    { at: 0.29, id: 'curate', label: 'Transformation', copy: 'We curate what comes next.', still: still(h11Name, 2, 'v01') },
    { at: 0.37, id: 'architecture', label: 'Architecture', copy: 'Architecture.', still: still(h11Name, 3, 'v01') },
    { at: 0.43, id: 'operators', label: 'Operators', copy: 'Operators.', still: still(h11Name, 4, 'v01') },
    { at: 0.55, id: 'experiences', label: 'Experiences', copy: 'Experiences.', still: still(h11Name, 5, 'v01') },
    { at: 0.72, id: 'community', label: 'Community', copy: 'Community.', still: still(h11Name, 6, 'v01') }
  ],
  copy: {
    eyebrow: 'Our approach',
    heading: 'From raw space to living destination'
  }
} satisfies ScrubChapter & { copy: unknown };

// ---------------------------------------------------------------------------
// H13 Dubai Pull Out and Our Destinations — SCRUB (homepage outro, reversed)
// Starts on the drone view over Al Quoz, pulls up into the map and lands on the Dubai map,
// where the directory and the destination markers appear.
// ---------------------------------------------------------------------------
export const h13 = {
  id: 'h13-dubai-pull-out',
  code: 'H13',
  title: 'Our destinations',
  type: 'scrub',
  media: media('h13-dubai-pull-out', 'v02'),
  duration: 5.875,
  reverse: true,
  joinPrevious: true,
  track: { desktop: 400, mobile: 320 },
  // The pull-out plays over the first 60% of the track; at its last frame (the Dubai map) the
  // live Mapbox map dissolves in and holds for the rest, with the directory.
  videoSpan: [0, 0.6],
  // Menu / nav links land on the map with the directory and markers showing.
  anchorProgress: 0.85,
  cues: [
    { at: 0, id: 'exterior', label: 'Destination' },
    { at: 0.02, id: 'al-quoz', label: 'Al Quoz' },
    { at: 0.4, id: 'dubai', label: 'Dubai' }
  ],
  copy: {
    eyebrow: 'The Gulfalts ecosystem · Dubai',
    heading: 'Our destinations',
    cta: 'View our destinations'
  }
} satisfies ScrubChapter & { copy: unknown };

// ---------------------------------------------------------------------------
// H14 Next Destination — STATIC
// ---------------------------------------------------------------------------
export const h14 = {
  id: 'h14-next-destination',
  code: 'H14',
  title: 'Next destination',
  type: 'static',
  copy: {
    heading: 'Where would you like to go next?',
    links: [
      { label: 'Explore Creative Park', destination: 'creative-park' },
      { label: 'Explore Fintech District', destination: 'fintech-district' },
      { label: 'View all destinations', destination: 'all' }
    ]
  }
} satisfies StaticChapter & { copy: unknown };

export const chapters = [h01, h02, h04, h05, h08, h11, h13, h14];

export const chapterById = (id: string) => chapters.find(chapter => chapter.id === id);
