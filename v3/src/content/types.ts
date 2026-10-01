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
  /** Still used for the reduced-motion keyframe sequence. */
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
  /** Play the file backwards (H13 plays DFD scene 2 as a pull-out). */
  reverse?: boolean;
  /** Where a link to this chapter lands, as story progress (H13: once the directory shows). */
  anchorProgress?: number;
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
  /**
   * How a joined chapter arrives: `dissolve` (default) fades in over the previous one; `wipe`
   * uncovers it bottom-up with a hard edge while the previous picture drifts up and dims.
   */
  joinStyle?: 'dissolve' | 'wipe';
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

export type Chapter = ScrubChapter | AutoplayChapter | StaticChapter;

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
  /** Drive times shown in the H13 map marker card. */
  commute: { times: CommuteTime[]; status: StatStatus };
}

export interface CommuteTime {
  place: string;
  minutes: number;
}

/** [longitude, latitude], Mapbox order. */
export type LngLat = [number, number];

export type KeyLocationId = 'difc' | 'downtown' | 'businessBay' | 'dubaiMarina' | 'dxb';

export interface KeyLocation {
  name: string;
  coordinates: LngLat;
}

/** A venue on the H13 location map. With `times` it is a route origin. */
export interface MapVenue {
  /** Matches a Destination id. */
  id: string;
  coordinates: LngLat;
  /** Fixed marketing drive times per key location, shown exactly as written. */
  times?: Partial<Record<KeyLocationId, string>>;
}

/** Precomputed road geometry: venue id → key location id → line coordinates. */
export type RouteSet = Record<string, Partial<Record<KeyLocationId, LngLat[]>>>;
