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
  /** Groups cues into acts (inner-page transformation): the raw space, then what it becomes. */
  act?: number;
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
  /** Another site's URL, or a path on this one (e.g. `fintech-district/`) resolved against the base. */
  url: string;
  location: string;
  preview?: string;
  /** Mapbox drive times shown in the H13 map marker card. */
  commute: CommuteTime[];
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

/** A venue on the location map (and a route origin). */
export interface MapVenue {
  /** Matches a Destination id. */
  id: string;
  coordinates: LngLat;
}

/** Mapbox ETA in minutes: venue id → key location id → minutes. */
export type DriveTimes = Record<string, Partial<Record<KeyLocationId, number>>>;

/** Precomputed road geometry (Mapbox Directions): venue id → key location id → line coordinates. */
export type RouteSet = Record<string, Partial<Record<KeyLocationId, LngLat[]>>>;

/*
 * Venue pages (dubai-creative-park/, fintech-district/). Their scrub sections time copy in video
 * SECONDS rather than track progress, so lines can be read straight off the footage's timecode.
 */

/** Overlay copy shown once the video reaches `from` seconds and hidden again at `to` (if set). */
export interface TimedCopy {
  from: number;
  to?: number;
  text: string;
}

export interface VenueHero {
  /** Short facts above the heading, joined with a middle dot. */
  eyebrow: string[];
  heading: string;
  lead: string;
  stats: DestinationStat[];
  /** Ambient loop behind the copy: always muted, no controls. */
  media: MediaSources;
  /** Link to the first scroll section; left out on a hero-only page. */
  enter?: { label: string; target: string };
  /**
   * Arriving from the previous venue's next-venue footer, the hero picks its video up from the
   * frame the footer was showing. Only works when both use the same files.
   */
  handoff?: boolean;
}

interface VenueScrub {
  /** Section id, also the anchor. */
  id: string;
  /** Visually hidden section heading. */
  title: string;
  /** Seconds; replaced by the real duration once the video's metadata loads. */
  duration: number;
  /** Scroll length in viewport heights. */
  track: { desktop: number; mobile: number };
  media: MediaSources;
  /**
   * The next section slides up over this one: the stage stays pinned on its last frame for one
   * more screen and dims as it's covered.
   */
  coverNext?: boolean;
}

export interface VenueApproach extends VenueScrub {
  statements: TimedCopy[];
  /** "For <word>": the lead word holds still while the words roll up through a clipped window. */
  roll: { lead: string; from: number; to?: number; words: TimedCopy[] };
}

/** One beat of the tour story: a headline and a line, at the left of the screen. */
export interface VenueTourStory {
  from: number;
  to?: number;
  headline: string;
  text: string;
}

export interface VenueTour extends VenueScrub {
  /** Centred title over a darkened first frame, shown as the section slides in. */
  intro: TimedCopy;
  stories: VenueTourStory[];
}

export interface NextVenue {
  /** Destination id of the venue the footer hands over to. */
  destination: string;
  /** Shown in the ring; `reducedKicker` replaces it when there is nothing to scroll for. */
  kicker: string;
  reducedKicker: string;
  /** Must be the same files as the next venue's hero video so playback can carry over. */
  media: MediaSources;
}

export interface Venue {
  /** Destination id (content/destinations.ts). */
  id: string;
  hero: VenueHero;
  approach?: VenueApproach;
  tour?: VenueTour;
  next?: NextVenue;
}
