import { creativeParkStats, fintechDistrictStats } from './destinations';
import type { MediaSources, Venue } from './types';

/*
 * Venue pages: copy, timings and media. Rendered by sections/venue.ts, driven by venue.ts.
 *
 * Scrub sections: scrolling moves the video, and copy is timed to the video in SECONDS
 * (`from` shows a line once the video reaches it, `to` hides it again; leave `to` off to keep it).
 * Lines whose time has passed get `.is-past` (used for the "For ..." roll and upward exits).
 * `track` sets how long a section scrolls, in viewport heights.
 * Add ?debug to the URL to see the current video time while scrolling.
 */

/** PLACEHOLDER footage (slow push-in on a DFD still): the DFD hero and the DCP footer share it. */
const fintechDistrictLoop: MediaSources = {
  desktop: '/media/video/dfd-placeholder-desktop.mp4',
  mobile: '/media/video/dfd-placeholder-mobile.mp4',
  posterDesktop: '/media/posters/dfd-placeholder-poster-desktop.jpg',
  posterMobile: '/media/posters/dfd-placeholder-poster-mobile.jpg'
};

const creativePark: Venue = {
  id: 'creative-park',
  hero: {
    eyebrow: ['500,000 sq ft', 'Al Quoz', 'Dubai'],
    heading: 'A destination built around movement.',
    lead: 'Sport, wellness, family activities, creative studios and F&B, brought together in one connected, walkable community.',
    stats: [...creativeParkStats, { value: '25+', label: 'Activation zones', status: 'confirmed' }],
    media: {
      desktop: '/media/video/dcp-hero-desktop.mp4',
      mobile: '/media/video/dcp-hero-mobile.mp4',
      posterDesktop: '/media/posters/dcp-hero-poster-desktop.jpg',
      posterMobile: '/media/posters/dcp-hero-poster-mobile.jpg'
    },
    enter: { label: 'Scroll to enter', target: 'our-approach' }
  },

  // PLACEHOLDER footage and timings: the homepage H11 film until the DCP cut is ready.
  approach: {
    id: 'our-approach',
    title: 'Most places are built for one thing. This one was built for all of it.',
    duration: 32.74,
    track: { desktop: 1000, mobile: 680 },
    media: {
      desktop: '/media/video/gulfalts-h11-raw-to-destination-desktop-v01.mp4',
      mobile: '/media/video/gulfalts-h11-raw-to-destination-mobile-v01.mp4',
      posterDesktop: '/media/posters/gulfalts-h11-raw-to-destination-poster-desktop-v01.jpg',
      posterMobile: '/media/posters/gulfalts-h11-raw-to-destination-poster-mobile-v01.jpg'
    },
    statements: [
      { from: 0, to: 6, text: 'Most places are built for one thing.' },
      { from: 6, to: 12.1, text: 'This one was built for all of it.' },
      { from: 28.4, text: 'Come and see.' }
    ],
    roll: {
      lead: 'For',
      from: 12.1,
      to: 28,
      words: [
        { from: 12.1, to: 14.1, text: 'Work' },
        { from: 14.1, to: 18, text: 'Movement' },
        { from: 18, to: 23.6, text: 'Culture' },
        { from: 23.6, to: 28, text: 'Life' }
      ]
    }
  },

  // PLACEHOLDER footage (hero video re-encoded for scrubbing), copy and timings.
  // One stop per place: it shows while the camera is settled there; the walk covers the move on.
  tour: {
    id: 'tour',
    title: 'A walk through Dubai Creative Park',
    duration: 10.05,
    track: { desktop: 800, mobile: 600 },
    media: {
      desktop: '/media/video/dcp-tour-placeholder-desktop.mp4',
      mobile: '/media/video/dcp-tour-placeholder-mobile.mp4',
      posterDesktop: '/media/posters/dcp-hero-poster-desktop.jpg',
      posterMobile: '/media/posters/dcp-hero-poster-mobile.jpg'
    },
    stops: [
      { from: 0, to: 1.7, label: 'The Loop', line: 'A morning run that starts at your office door.', walk: { from: 1.7, to: 2.3, text: '2 min walk' } },
      { from: 2.3, to: 3.7, label: 'Studios & Offices', line: 'Work where the energy is.', walk: { from: 3.7, to: 4.3, text: '1 min walk' } },
      { from: 4.3, to: 5.7, label: 'The Courtyard', line: 'Lunch is a two-minute walk.', walk: { from: 5.7, to: 6.3, text: '3 min walk' } },
      { from: 6.3, to: 7.7, label: 'The Courts', line: '[x] courts, open early till late.', walk: { from: 7.7, to: 8.3, text: '2 min walk' } },
      { from: 8.3, to: 9.1, label: 'Fitness & Wellness', line: 'Train, recover, reset.' }
    ],
    finale: {
      from: 9.2,
      line: '54 spaces. 25+ activation zones. One walk.',
      actions: [
        { label: 'Enquire about space', href: 'mailto:info@gulfalts.com?subject=Space%20enquiry%20%E2%80%94%20Dubai%20Creative%20Park', primary: true },
        { label: 'Book a visit', href: 'mailto:info@gulfalts.com?subject=Book%20a%20visit%20%E2%80%94%20Dubai%20Creative%20Park' }
      ]
    }
  },

  next: {
    destination: 'fintech-district',
    kicker: 'Keep scrolling to see',
    reducedKicker: 'Next destination',
    media: fintechDistrictLoop
  }
};

const fintechDistrict: Venue = {
  id: 'fintech-district',
  hero: {
    eyebrow: ['50,000 sq ft', 'Al Quoz', 'Dubai'],
    heading: 'A business district with new standards.',
    lead: 'Built to prioritise accessibility, customisable spaces and natural light: offices, showrooms, galleries, wellness and F&B.',
    stats: fintechDistrictStats,
    media: fintechDistrictLoop,
    handoff: true
  }
};

export const venues: Venue[] = [creativePark, fintechDistrict];

export const venueById = (id: string): Venue => {
  const venue = venues.find(item => item.id === id);
  if (!venue) throw new Error(`Unknown venue: ${id}`);
  return venue;
};
