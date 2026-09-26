/**
 * The contract between video production and the website.
 * Video files, posters and cue timings live here; components never hard-code frames.
 */

export interface MediaSources {
  desktop: string;
  mobile: string;
  posterDesktop: string;
  posterMobile: string;
}

/** A moment in the video, as a fraction (0–1) of its duration. Taken from the cue sheet. */
export interface ChapterCue {
  at: number;
  id: string;
  /** Short beat name for the counter and reduced-motion captions. */
  label: string;
  /** Optional overlay line shown while this cue is active. */
  copy?: string;
  /** Still used for the mobile / reduced-motion keyframe sequence. */
  still?: string;
}

interface ChapterBase {
  id: string;
  /** Chapter number from the story map, e.g. "H06". */
  code: string;
  title: string;
}

export interface ScrubChapter extends ChapterBase {
  type: 'scrub';
  media: MediaSources;
  /** Source duration in seconds (updated from metadata once the video loads). */
  duration: number;
  /** Scroll track length in viewport heights. */
  track: { desktop: number; mobile: number };
  /**
   * Portion of the track that scrubs the video; the rest holds the final frame.
   * All progress values (cues, overlay windows) are measured after any join dissolve.
   */
  videoSpan?: [number, number];
  /** Play the file backwards (H13 re-uses the H02 aerial as a pull-out). */
  reverse?: boolean;
  /**
   * Dissolve over the previous chapter instead of scrolling it away. The dissolve adds its
   * own lead-in to the track (see --join in chapters.css), so story timings are unaffected.
   */
  joinPrevious?: boolean;
  cues: ChapterCue[];
}

export interface AutoplayChapter extends ChapterBase {
  type: 'autoplay';
  media: MediaSources;
  loop: boolean;
  /** Optional scroll track (in viewport heights) for copy that changes as the visitor advances. */
  track?: { desktop: number; mobile: number };
  joinPrevious?: boolean;
}

export interface StaticChapter extends ChapterBase {
  type: 'static';
}

/** A responsive still: `<name>-<width>.{avif,jpg}` files from scripts/build-images.mjs. */
export interface ResponsiveImage {
  name: string;
  widths: number[];
  /** Intrinsic aspect ratio (width / height) of every file in the set. */
  ratio: number;
}

/** One beat of an image sequence: its own desktop and mobile crop. */
export interface SequenceFrame {
  cue: string;
  desktop: ResponsiveImage;
  mobile: ResponsiveImage;
}

/**
 * Scroll-driven like a scrub chapter, but the picture is a stack of HD stills that cross-fade on
 * each cue instead of a video. Sharper than a montage encode and a fraction of the weight.
 */
export interface SequenceChapter extends ChapterBase {
  type: 'sequence';
  track: { desktop: number; mobile: number };
  joinPrevious?: boolean;
  videoSpan?: [number, number];
  cues: ChapterCue[];
  frames: SequenceFrame[];
}

/** Chapters whose cues follow the scroll position. */
export type TrackedChapter = ScrubChapter | SequenceChapter;

export type Chapter = ScrubChapter | SequenceChapter | AutoplayChapter | StaticChapter;

export type StatStatus = 'confirmed' | 'unconfirmed';

export interface DestinationStat {
  value: string;
  unit?: string;
  label: string;
  /** Unconfirmed figures render with a visible "pending confirmation" flag. */
  status: StatStatus;
  note?: string;
}

export interface Destination {
  id: string;
  index: string;
  name: string;
  fullName: string;
  tags: string;
  /** False when the short copy is still to be supplied by the client. */
  tagsConfirmed: boolean;
  url: string;
  location: string;
  preview?: string;
  /**
   * Marker position on the H13 hold frame, in video-frame coordinates (0–1). The mobile file is
   * a 608×1080 crop of that frame, so it has its own x.
   */
  marker: { x: number; y: number; xMobile: number };
}
