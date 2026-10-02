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

/** DFD hero loop: the DCP footer shares it so playback carries over. */
const fintechDistrictLoop: MediaSources = {
  desktop: '/media/video/dfd-hero-desktop.mp4',
  mobile: '/media/video/dfd-hero-mobile.mp4',
  posterDesktop: '/media/posters/dfd-hero-poster-desktop.jpg',
  posterMobile: '/media/posters/dfd-hero-poster-mobile.jpg'
};

/** DCP hero loop: the DFD footer hands back to it. */
const creativeParkLoop: MediaSources = {
  desktop: '/media/video/dcp-hero-desktop.mp4',
  mobile: '/media/video/dcp-hero-mobile.mp4',
  posterDesktop: '/media/posters/dcp-hero-poster-desktop.jpg',
  posterMobile: '/media/posters/dcp-hero-poster-mobile.jpg'
};

const creativePark: Venue = {
  id: 'creative-park',
  hero: {
    eyebrow: ['500,000 sq ft', 'Al Quoz', 'Dubai'],
    heading: 'A destination built around movement.',
    lead: 'Sport, wellness, family activities, creative studios and F&B, brought together in one connected, walkable community.',
    stats: [...creativeParkStats, { value: '25+', label: 'Activation zones', status: 'confirmed' }],
    media: creativeParkLoop,
    enter: { label: 'Scroll to enter', target: 'our-approach' },
    handoff: true
  },

  // Roll timings set against the footage; the two statements before it are still provisional.
  // The tour slides up over this section's last frame (coverNext).
  approach: {
    id: 'our-approach',
    title: 'Most places are built for one thing. This one was built for all of it.',
    duration: 12.05,
    track: { desktop: 1000, mobile: 680 },
    coverNext: true,
    media: {
      desktop: '/media/video/gulfalts-dcp-built-for-all-desktop-v01.mp4',
      mobile: '/media/video/gulfalts-dcp-built-for-all-mobile-v01.mp4',
      posterDesktop: '/media/posters/gulfalts-dcp-built-for-all-poster-desktop-v01.jpg',
      posterMobile: '/media/posters/gulfalts-dcp-built-for-all-poster-mobile-v01.jpg'
    },
    statements: [
      { from: 0, to: 2.2, text: 'Most places are built for one thing.' },
      { from: 2.2, to: 4.45, text: 'This one was built for all of it.' }
    ],
    roll: {
      lead: 'For',
      from: 4.45,
      words: [
        { from: 4.45, to: 6.5, text: 'Work' },
        { from: 6.5, to: 8.8, text: 'Movement' },
        { from: 8.8, to: 11, text: 'Culture' },
        { from: 11, text: 'Life' }
      ]
    }
  },

  // Story timings set against the footage; the intro's end and the first story's start are provisional.
  // The intro sits over a darkened first frame while the section slides in; the stories follow.
  tour: {
    id: 'tour',
    title: 'Take a Journey to Dubai Creative Park',
    duration: 12.05,
    track: { desktop: 800, mobile: 600 },
    media: {
      desktop: '/media/video/gulfalts-dcp-final-tour-desktop-v01.mp4',
      mobile: '/media/video/gulfalts-dcp-final-tour-mobile-v01.mp4',
      posterDesktop: '/media/posters/gulfalts-dcp-final-tour-poster-desktop-v01.jpg',
      posterMobile: '/media/posters/gulfalts-dcp-final-tour-poster-mobile-v01.jpg'
    },
    intro: { from: 0, to: 1.5, text: 'Take a Journey to Dubai Creative Park' },
    stories: [
      { from: 1.8, to: 5.2, headline: 'Located in Al Quoz, Dubai.', text: "Right in the city's creative and industrial heartland." },
      { from: 5.2, to: 6.5, headline: 'Offices to Support Productivity', text: 'Bright, open spaces built for focus and collaboration.' },
      { from: 6.5, to: 9, headline: 'Wellness Center', text: 'Train, swim, play and recharge, all without leaving the park.' },
      { from: 9, to: 10.2, headline: 'Become Part of the Community.', text: 'Run, ride and connect with people who share your pace.' },
      { from: 10.2, headline: 'Relax In the Evening.', text: 'Good food, great company and sunsets to share.' }
    ]
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
    eyebrow: ['50,000 sq ft', '65 spaces', 'Al Quoz', 'Dubai'],
    heading: 'Where business finds its space.',
    lead: 'Loft-style workspaces, showrooms and galleries within a curated business destination built around work, wellness and community.',
    stats: fintechDistrictStats,
    media: fintechDistrictLoop,
    enter: { label: 'Scroll to enter', target: 'our-approach' },
    handoff: true
  },

  // Timed to the footage: door → plain office (the desk) → lobby (Work) → café terrace (Eat)
  // → dojo (Train) → arcade (Unwind, hard cut at 7.17). The tour slides up over the last frame.
  approach: {
    id: 'our-approach',
    title: 'Most spaces give your business a desk. This one gives it a destination.',
    duration: 8.04,
    track: { desktop: 800, mobile: 560 },
    coverNext: true,
    media: {
      desktop: '/media/video/gulfalts-dfd-approach-desktop-v01.mp4',
      mobile: '/media/video/gulfalts-dfd-approach-mobile-v01.mp4',
      posterDesktop: '/media/posters/gulfalts-dfd-approach-poster-desktop-v01.jpg',
      posterMobile: '/media/posters/gulfalts-dfd-approach-poster-mobile-v01.jpg'
    },
    statements: [
      { from: 0, to: 1.75, text: 'Most spaces give your business a desk.' },
      { from: 1.75, to: 2.75, text: 'This one gives it a destination.' }
    ],
    roll: {
      lead: 'For',
      from: 2.75,
      words: [
        { from: 2.75, to: 4.6, text: 'Work' },
        { from: 4.6, to: 6, text: 'Eat' },
        { from: 6, to: 7.15, text: 'Train' },
        { from: 7.15, text: 'Unwind' }
      ]
    }
  },

  // Four clips joined (scripts/build-media.sh): space → Al Quoz → dojo (0–8.95), entrance → lobby
  // (8.95–17), hall → yoga (17–23.7), loft → diner (23.7–31.75). Stories sit between the cuts.
  tour: {
    id: 'tour',
    title: 'Take a Journey to Dubai Fintech District',
    duration: 31.75,
    track: { desktop: 1700, mobile: 1250 },
    media: {
      desktop: '/media/video/gulfalts-dfd-tour-desktop-v02.mp4',
      mobile: '/media/video/gulfalts-dfd-tour-mobile-v02.mp4',
      posterDesktop: '/media/posters/gulfalts-dfd-tour-poster-desktop-v02.jpg',
      posterMobile: '/media/posters/gulfalts-dfd-tour-poster-mobile-v02.jpg'
    },
    intro: { from: 0, to: 1.5, text: 'Take a Journey to Dubai Fintech District' },
    stories: [
      { from: 1.8, to: 5.1, headline: 'Located in Al Quoz, Dubai.', text: '13 minutes from Business Bay, in the heart of the city\'s creative quarter.' },
      { from: 5.4, to: 8.8, headline: 'Train With Purpose.', text: 'Martial arts and fitness studios, a few steps from your desk.' },
      { from: 9.6, to: 16.7, headline: 'A Community Space.', text: 'Open lounges and shared floors where neighbours become collaborators.' },
      { from: 18, to: 23.4, headline: 'Room to Breathe.', text: 'Sunlit studios for yoga and meditation, for when the day needs a pause.' },
      { from: 28.6, headline: 'Unwind After Hours.', text: 'Pull up a booth: good food, cold drinks and better company once the work is done.' }
    ]
  },

  // Loops back to the first venue until V8 District has a page here.
  next: {
    destination: 'creative-park',
    kicker: 'Keep scrolling to see',
    reducedKicker: 'Next destination',
    media: creativeParkLoop
  }
};

export const venues: Venue[] = [creativePark, fintechDistrict];

export const venueById = (id: string): Venue => {
  const venue = venues.find(item => item.id === id);
  if (!venue) throw new Error(`Unknown venue: ${id}`);
  return venue;
};
