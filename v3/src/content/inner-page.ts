import type { KeyLocationId, MediaSources, ResponsiveImage, ScrubChapter, StaticChapter } from './types';

/*
 * Inner page template (v3/inner page): pinned hero that shrinks into the page → intro text +
 * figures → an everyday mix → an immersive scroll that zooms into the footage → spaces →
 * location map → next destination.
 *
 * Each venue fills one InnerPage (content/fintech-district.ts, content/creative-park.ts);
 * sections/inner-page.ts renders it and src/inner-page.ts runs it. Chapter ids must be unique
 * across pages: the runtime looks chapters up by id (innerChapterById).
 */

type Track = { desktop: number; mobile: number };
type Captioned = ResponsiveImage & { alt: string };

export const scrubMedia = (name: string, version: string): MediaSources => ({
  desktop: `/media/video/gulfalts-${name}-desktop-${version}.mp4`,
  mobile: `/media/video/gulfalts-${name}-mobile-${version}.mp4`,
  posterDesktop: `/media/posters/gulfalts-${name}-poster-desktop-${version}.jpg`,
  posterMobile: `/media/posters/gulfalts-${name}-poster-mobile-${version}.jpg`
});

export const still = (name: string, frame: number, version: string) =>
  `/media/images/gulfalts-${name}-frame-${String(frame).padStart(2, '0')}-${version}.jpg`;

/** Mirrors the jobs in scripts/build-images.mjs. */
export const image = (name: string, widths: number[], ratio: number): ResponsiveImage => ({ name, widths, ratio });

export interface EverydayItem {
  word: string;
  body: string;
  main: Captioned;
  detail: Captioned;
}

export interface InnerPage {
  /** Destination id (content/destinations.ts): map origin, drive times, names. */
  venue: string;
  arrival: ScrubChapter & {
    steps: Record<string, number>;
    copy: {
      eyebrow: string;
      /** Larger, full-opacity eyebrow (the venue name above the headline). */
      eyebrowLarge?: boolean;
      title: string;
      enter: string;
    };
  };
  intro: StaticChapter & {
    copy: {
      eyebrow: string;
      body: string;
      /** `detail`: an optional sentence-case line under the label; **bold** marks emphasis. */
      stats: { value: string; label: string; detail?: string }[];
    };
  };
  everyday: StaticChapter & {
    track: Track;
    copy: { eyebrow: string; heading: string; items: EverydayItem[] };
  };
  transformation: ScrubChapter & {
    zoom: [number, number];
    copy: { eyebrow: string; heading: string; statement: string };
  };
  /** The tiles around the video in the scale grid (the video is the third, centre tile). */
  grid: Captioned[];
  /** Background behind the location card before the map loads, and the reduced-motion still. */
  fallbacks: { location: string; transformation: string };
  spaces: StaticChapter & {
    copy: { eyebrow: string; heading: string; items: { name: string; meta: string; image: Captioned }[] };
  };
  location: StaticChapter & {
    track: Track;
    /** The location backdrop is a dark photo: the header turns white while it fills the screen. */
    dark?: boolean;
    steps: Record<string, number>;
    anchorProgress: number;
    copy: { eyebrow: string; heading: string; body: string; note: string; routes: KeyLocationId[] };
  };
  next: StaticChapter & {
    copy: { heading: string; links: { label: string; destination: string }[]; all: string; inquire: string };
  };
}

export const innerChapters = (page: InnerPage) => [
  page.arrival, page.intro, page.everyday, page.transformation, page.spaces, page.location, page.next
];
