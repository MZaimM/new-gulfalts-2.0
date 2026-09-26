import type { AutoplayChapter, MediaSources, ResponsiveImage, ScrubChapter, SequenceChapter, StaticChapter } from './types';

/*
 * Homepage chapters, V3: "From Space to Destination".
 *
 *   H01 Brand reveal → H02 Dubai arrival → H03 Brand spectrum → H04 The firm →
 *   H05 Dubai Creative Park → H08 Dubai Fintech District → H11 Our approach →
 *   H13 Our destinations → H14 Next destination
 *
 * Chapter codes keep the story-map numbering, so H06/H07, H09/H10 and H12 are simply absent
 * (removed in V3: their content now lives in H05, H08 and H11).
 *
 * Media versions: v01 = production footage (scripts/build-media.sh), v00 = V2 placeholder
 * (H04 manifesto only).
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
const spectrumFrame = (cue: string) => ({
  cue,
  desktop: image(`h03-${cue}-desktop`, [1280, 1920, 2560], 16 / 9),
  mobile: image(`h03-${cue}-mobile`, [720, 1080], 9 / 16)
});

// ---------------------------------------------------------------------------
// H01 Intro — AUTOPLAY loop on a short pinned track
//   1. The logo reveals over a moving aerial.
//   2. First scroll: the aerial fades out onto H02's opening frame; the logo stays.
//   3. Further scroll: the logo slides out and H02 takes over (same frame, so no cut).
// The steps are scroll-triggered but time-animated (CSS transitions), and reverse on the way up.
// ---------------------------------------------------------------------------
export const h01 = {
  id: 'h01-brand-reveal',
  code: 'H01',
  title: 'Intro',
  type: 'autoplay',
  media: media('h01-brand-reveal', 'v01'),
  loop: true,
  track: { desktop: 170, mobile: 160 },
  /** Story progress (0–1) at which each intro step fires. */
  steps: { 'bg-out': 0.05, 'brand-out': 0.5 },
  copy: {
    positioning: 'Dynamic destinations',
    enter: 'Scroll to enter'
  }
} satisfies AutoplayChapter & { steps: Record<string, number>; copy: unknown };

// ---------------------------------------------------------------------------
// H02 Dubai Arrival — SCRUB (DFD scene 1 & 2: clouds → Dubai coast → Al Quoz → Fintech District)
// ---------------------------------------------------------------------------
export const h02 = {
  id: 'h02-dubai-arrival',
  code: 'H02',
  title: 'Dubai arrival',
  type: 'scrub',
  media: media('h02-dubai-arrival', 'v01'),
  duration: 9.08,
  track: { desktop: 400, mobile: 300 },
  // Dissolves in from H01's final state, which already shows this chapter's first frame.
  joinPrevious: true,
  cues: [
    { at: 0.03, id: 'uae', label: 'UAE' },
    { at: 0.33, id: 'dubai', label: 'Dubai' },
    { at: 0.72, id: 'al-quoz', label: 'Al Quoz' },
    { at: 0.9, id: 'destinations', label: 'Dubai Fintech District · Al Quoz' }
  ],
  copy: {
    heading: 'From the UAE to Al Quoz, Dubai',
    // Marker positions on the final frame (video-frame fractions). The mobile file is a
    // 608×1080 crop starting at x = 560px, so its x differs.
    markers: [
      { destination: 'fintech-district', x: 0.43, y: 0.57, xMobile: 0.437 }
    ]
  }
} satisfies ScrubChapter & { copy: unknown };

// ---------------------------------------------------------------------------
// H03 Brand Spectrum — SEQUENCE (HD stills cross-fading on scroll)
// ---------------------------------------------------------------------------
export const h03 = {
  id: 'h03-brand-spectrum',
  code: 'H03',
  title: 'Brand spectrum',
  type: 'sequence',
  // Longer than the beats need: the last ~100vh is H04 wiping in over the final still.
  track: { desktop: 420, mobile: 320 },
  joinPrevious: true,
  cues: [
    { at: 0, id: 'work', label: 'Workspace', copy: 'For work.' },
    { at: 0.25, id: 'movement', label: 'Movement', copy: 'For movement.' },
    { at: 0.5, id: 'culture', label: 'Culture', copy: 'For culture.' },
    { at: 0.75, id: 'life', label: 'Life', copy: 'For life.' }
  ],
  frames: [spectrumFrame('work'), spectrumFrame('movement'), spectrumFrame('culture'), spectrumFrame('life')],
  copy: {
    heading: 'Destinations for work, movement, culture and life.',
    alts: {
      work: 'A daylit Gulfalts office with a lounge, desks and tall windows onto a landscaped park.',
      movement: 'An indoor padel hall with a row of glass-walled courts under a steel roof.',
      culture: 'A double-height galleria with a café, an olive tree and a mezzanine lined with greenery.',
      life: 'An evening food court between the buildings, with food trucks, string lights and shared tables.'
    } as Record<string, string>
  }
} satisfies SequenceChapter & { copy: unknown };

// ---------------------------------------------------------------------------
// H04 Brand Manifesto (The firm) — AUTOPLAY, wipes in over H03
// ---------------------------------------------------------------------------
export const h04 = {
  id: 'h04-brand-manifesto',
  code: 'H04',
  title: 'Brand manifesto',
  type: 'autoplay',
  media: media('h04-brand-manifesto', 'v00'),
  loop: true,
  // Wipes up over H03's last still (see the wipe join in chapters.css), then holds briefly.
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
      ...image('h05-creative-park', [640, 960, 1280, 1600], 3 / 4),
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
      ...image('h08-fintech-district', [640, 960, 1280, 1600], 3 / 4),
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
// H13 Dubai Pull Out and Our Destinations — SCRUB (DFD scene 2, reversed)
// Starts on the Fintech District site, rises through Al Quoz and the clouds, and lands on the
// Dubai coastline, where the directory and the destination markers appear.
// ---------------------------------------------------------------------------
export const h13 = {
  id: 'h13-dubai-pull-out',
  code: 'H13',
  title: 'Our destinations',
  type: 'scrub',
  media: media('h13-dubai-pull-out', 'v01'),
  duration: 7.71,
  reverse: true,
  joinPrevious: true,
  track: { desktop: 400, mobile: 320 },
  // The pull-out plays over the first 60% of the track; the directory sits on the hold frame.
  videoSpan: [0, 0.6],
  cues: [
    { at: 0, id: 'exterior', label: 'Destination' },
    { at: 0.22, id: 'al-quoz', label: 'Al Quoz' },
    { at: 0.62, id: 'dubai', label: 'Dubai' }
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

export const chapters = [h01, h02, h03, h04, h05, h08, h11, h13, h14];

export const chapterById = (id: string) => chapters.find(chapter => chapter.id === id);
