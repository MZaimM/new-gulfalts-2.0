/*
 * Scroll-driven chapters.
 *
 * Every chapter with a `.chapter_track` gets a ChapterTrack: it measures the track, turns the
 * scroll position into a story progress (0–1), toggles the overlay states and, for scrub
 * chapters, maps that progress onto the video's currentTime (sequence chapters cross-fade stills
 * on each cue instead). Native scrolling is never
 * intercepted; the stage is plain `position: sticky`.
 */
import type { ChapterCue, ScrubChapter, TrackedChapter } from '../content/types';
import { ChapterMedia } from './media-loader';
import { clamp, coverPoint, isMobile, objectAlign, sourceFrame } from './viewport';

interface Range { el: HTMLElement; from: number; to: number; interactive: boolean }

const parseRange = (value: string): [number, number] => {
  const [from, to = '1'] = value.split('-');
  return [Number(from), Number(to)];
};

/** A joined chapter is pulled up by (stage + --join); whatever exceeds the stage is the dissolve. */
const joinDistance = (section: HTMLElement) => {
  const stage = section.querySelector<HTMLElement>('.chapter_sticky')?.offsetHeight ?? 0;
  const pull = -parseFloat(getComputedStyle(section).marginTop) || 0;
  return Math.max(0, pull - stage);
};

/** Light smoothing on the video only; overlays follow the scroll exactly. */
const SEEK_EASE = 0.22;
/** Start buffering the next video chapter once this far through the current one. */
const PRELOAD_NEXT_AT = 0.55;

export class ChapterTrack {
  readonly section: HTMLElement;
  readonly config?: TrackedChapter;
  readonly media?: ChapterMedia;
  next?: ChapterTrack | { media?: ChapterMedia };

  private track: HTMLElement;
  private sticky: HTMLElement;
  private joined: boolean;
  private ranges: Range[];
  private cueEls: HTMLElement[];
  private markEls: HTMLElement[];
  private frameEls: HTMLElement[];
  private counter: HTMLElement | null;
  private cues: ChapterCue[];
  /** Named steps from `data-steps="name:0.1 other:0.5"`; `.is-<name>` is set once passed. */
  private steps: { name: string; at: number; active: boolean }[];

  private overlay: HTMLElement;
  private top = 0;
  private distance = 1;
  /** Scroll (px) spent dissolving in over the previous chapter. */
  private lead = 0;
  /** Scroll (px) at the end handed to the next chapter's dissolve. */
  private tail = 0;
  private inView = false;
  private progress = -1;
  private activeCue = '';
  private targetVideo = 0;
  private smoothVideo = 0;
  private pendingSeek: number | null = null;

  constructor(section: HTMLElement, config?: TrackedChapter, media?: ChapterMedia) {
    this.section = section;
    this.config = config;
    this.media = media;
    this.track = section.querySelector<HTMLElement>('.chapter_track')!;
    this.sticky = section.querySelector<HTMLElement>('.chapter_sticky')!;
    this.overlay = section.querySelector<HTMLElement>('.chapter_overlay')!;
    this.joined = section.classList.contains('is-joined');
    this.cues = config?.cues ?? [];
    this.ranges = [...section.querySelectorAll<HTMLElement>('.chapter_overlay [data-show]')].map(el => {
      const [from, to] = parseRange(el.dataset.show!);
      return { el, from, to, interactive: !!el.querySelector('a, button') };
    });
    this.cueEls = [...section.querySelectorAll<HTMLElement>('.chapter_overlay [data-cue]')];
    this.markEls = [...section.querySelectorAll<HTMLElement>('.chapter_overlay [data-cue-mark]')];
    this.frameEls = [...section.querySelectorAll<HTMLElement>('[data-cue-frame]')];
    this.counter = section.querySelector('.chapter_count-current');
    this.steps = (section.dataset.steps ?? '').split(' ').filter(Boolean).map(step => {
      const [name, at] = step.split(':');
      return { name, at: Number(at), active: false };
    });
    this.ranges.filter(range => range.interactive).forEach(range => range.el.setAttribute('inert', ''));

    if (media && config) {
      media.video.addEventListener('seeked', this.handleSeeked);
      media.onReady(() => {
        if (media.duration) this.section.dataset.scrubDuration = media.duration.toFixed(2);
        media.setActive(this.inView);
        this.smoothVideo = this.targetVideo;
        this.seek(this.targetVideo);
      });
    }
  }

  /** Cache geometry; called on load, resize and whenever the page height changes. */
  measure() {
    const rect = this.track.getBoundingClientRect();
    this.top = rect.top + window.scrollY;
    this.distance = Math.max(1, this.track.offsetHeight - this.sticky.offsetHeight);
    this.lead = this.joined ? joinDistance(this.section) : 0;
    const next = this.section.nextElementSibling;
    this.tail = next instanceof HTMLElement && next.classList.contains('is-joined') ? joinDistance(next) : 0;
    this.layoutMarkers();
  }

  /** Turns the scroll position into story progress and applies it. Called on every scroll frame. */
  update(scrollY: number, viewport: number) {
    const start = this.top;
    const end = this.top + this.distance + viewport;
    const inView = scrollY + viewport > start - viewport * 0.25 && scrollY < end;
    if (inView !== this.inView) {
      this.inView = inView;
      this.media?.setActive(inView);
      if (inView) this.media?.load();
    }
    if (!inView && this.progress !== -1) {
      // Settle into the nearest end state once, then stop touching the DOM.
      const settled = scrollY < start ? 0 : 1;
      if (settled === this.progress) return;
    }

    const offset = clamp(scrollY - start, 0, this.distance);
    if (this.lead) this.section.style.setProperty('--join-opacity', clamp(offset / this.lead).toFixed(3));
    if (this.tail) {
      // The next chapter dissolves over this one; let the copy step aside first.
      const exit = clamp((offset - (this.distance - this.tail)) / (this.tail * 0.35));
      this.overlay.style.opacity = exit ? (1 - exit).toFixed(3) : '';
    }
    const story = clamp((offset - this.lead) / Math.max(1, this.distance - this.lead - this.tail));
    if (story === this.progress) return;
    this.progress = story;
    this.apply(story);

    if (story > PRELOAD_NEXT_AT) this.next?.media?.load();
  }

  private apply(story: number) {
    this.section.style.setProperty('--p', story.toFixed(4));

    for (const step of this.steps) {
      const active = story >= step.at;
      if (active === step.active) continue;
      step.active = active;
      this.section.classList.toggle(`is-${step.name}`, active);
      this.section.dispatchEvent(new CustomEvent('chapter:step', { detail: { name: step.name, active } }));
    }

    for (const range of this.ranges) {
      const active = story >= range.from && story <= range.to && (story > 0 || range.from === 0);
      if (range.el.classList.contains('is-active') === active) continue;
      range.el.classList.toggle('is-active', active);
      if (range.interactive) range.el.toggleAttribute('inert', !active);
    }

    if (!this.config) return;
    const [spanStart, spanEnd] = this.config.videoSpan ?? [0, 1];
    const videoProgress = clamp((story - spanStart) / (spanEnd - spanStart));
    this.setCue(videoProgress);
    this.targetVideo = videoProgress;
  }

  private setCue(videoProgress: number) {
    let index = 0;
    this.cues.forEach((cue, i) => { if (videoProgress >= cue.at) index = i; });
    const cue = this.cues[index];
    if (!cue || cue.id === this.activeCue) return;
    this.activeCue = cue.id;
    this.section.dataset.cue = cue.id;
    this.cueEls.forEach(el => el.classList.toggle('is-current', el.dataset.cue === cue.id));
    this.markEls.forEach(el => el.classList.toggle('is-current', el.dataset.cueMark === cue.id));
    this.frameEls.forEach(el => el.classList.toggle('is-current', el.dataset.cueFrame === cue.id));
    if (this.counter) this.counter.textContent = String(index + 1).padStart(2, '0');
  }

  /** Per-frame video easing, driven by the shared ticker. */
  tick() {
    if (!this.media || !this.config || !this.inView || !this.media.isReady) return;
    const delta = this.targetVideo - this.smoothVideo;
    if (Math.abs(delta) < 0.0005) {
      if (this.smoothVideo === this.targetVideo) return;
      this.smoothVideo = this.targetVideo;
    } else {
      this.smoothVideo += delta * SEEK_EASE;
    }
    this.seek(this.smoothVideo);
  }

  private seek(videoProgress: number) {
    const media = this.media!;
    const config = this.config as ScrubChapter;
    const duration = media.duration || config.duration;
    const position = config.reverse ? 1 - videoProgress : videoProgress;
    const time = clamp(position) * Math.max(0, duration - 0.05);
    if (media.video.seeking) {
      this.pendingSeek = time;
      return;
    }
    if (Math.abs(media.video.currentTime - time) > 0.004) media.video.currentTime = time;
  }

  private handleSeeked = () => {
    if (this.pendingSeek === null) return;
    const time = this.pendingSeek;
    this.pendingSeek = null;
    if (Math.abs(this.media!.video.currentTime - time) > 0.004) this.media!.video.currentTime = time;
  };

  layoutMarkers() {
    layoutMarkers(this.section);
  }
}

/** Pins HTML markers to the same point in the picture whatever the crop. */
export const layoutMarkers = (section: HTMLElement) => {
  const markers = section.querySelectorAll<HTMLElement>('.chapter_marker[data-x]');
  if (!markers.length) return;
  const stage = section.querySelector<HTMLElement>('.chapter_media-wrap')!;
  const box = { width: stage.clientWidth, height: stage.clientHeight };
  const video = section.querySelector<HTMLVideoElement>('.chapter_video');
  const frame = video?.videoWidth ? { width: video.videoWidth, height: video.videoHeight } : sourceFrame();
  const mobile = isMobile();
  const align = objectAlign(video);
  markers.forEach(marker => {
    // The mobile file is a crop of the desktop frame, so a marker can carry its own x for it.
    const x = mobile && marker.dataset.xMobile ? marker.dataset.xMobile : marker.dataset.x;
    const point = coverPoint(box, frame, { x: Number(x), y: Number(marker.dataset.y) }, align);
    marker.style.setProperty('--mx', `${point.left}px`);
    marker.style.setProperty('--my', `${point.top}px`);
    marker.hidden = !point.visible;
  });
};

/**
 * Autoplay chapters play muted while on screen and pause when they are far away.
 */
export const observeAutoplay = (media: ChapterMedia, { eager = false } = {}) => {
  const play = () => {
    if (!media.isReady) return;
    // A one-shot reveal (H01) holds its final frame instead of replaying on return.
    if (!media.video.loop && media.video.ended) return;
    media.setActive(true);
    media.video.play().catch(() => media.setActive(false));
  };
  const pause = () => {
    if (!media.video.paused) media.video.pause();
    media.setActive(false);
  };
  let visible = eager;
  if (eager) media.load();
  media.onReady(() => (visible ? play() : pause()));

  const nearby = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) media.load(); }, { rootMargin: '100% 0px' });
  const onScreen = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else pause();
  }, { threshold: 0.05 });
  nearby.observe(media.section);
  onScreen.observe(media.section);
  return () => { nearby.disconnect(); onScreen.disconnect(); };
};
