/*
 * Video lifecycle shared by scrub and autoplay chapters.
 *
 *   idle → loading → ready → active ⇄ paused
 *                  ↘ error → fallback
 *
 * The state is mirrored to `data-state` on the chapter so CSS can react (the poster stays
 * visible until a frame is decoded, and remains the fallback if anything fails).
 */
import { isMobile, prefersReducedMotion } from './viewport';

export type MediaState = 'idle' | 'loading' | 'ready' | 'active' | 'paused' | 'error' | 'fallback';

const LOAD_TIMEOUT = 20000;

export class ChapterMedia {
  readonly section: HTMLElement;
  readonly video: HTMLVideoElement;
  readonly kind: 'scrub' | 'autoplay';
  state: MediaState = 'idle';
  duration = 0;
  private timeout = 0;
  private readyCallbacks: Array<() => void> = [];

  constructor(section: HTMLElement) {
    this.section = section;
    this.video = section.querySelector<HTMLVideoElement>('.chapter_video')!;
    this.kind = this.video.dataset.kind === 'autoplay' ? 'autoplay' : 'scrub';
    this.video.muted = true;
    this.video.defaultMuted = true;
    if (prefersReducedMotion()) this.setState('fallback');
  }

  get isReady() {
    return this.state === 'ready' || this.state === 'active' || this.state === 'paused';
  }

  setState(state: MediaState) {
    this.state = state;
    this.section.dataset.state = state;
  }

  onReady(callback: () => void) {
    if (this.isReady) callback();
    else this.readyCallbacks.push(callback);
  }

  /** Picks the desktop or mobile file and starts buffering. Safe to call repeatedly. */
  load() {
    if (this.state !== 'idle') return;
    const src = isMobile() ? this.video.dataset.srcMobile : this.video.dataset.srcDesktop;
    if (!src) {
      this.setState('fallback');
      return;
    }
    this.setState('loading');
    this.video.addEventListener('loadedmetadata', this.handleMetadata, { once: true });
    this.video.addEventListener('loadeddata', this.handleData, { once: true });
    this.video.addEventListener('error', this.handleError, { once: true });
    this.timeout = window.setTimeout(this.handleError, LOAD_TIMEOUT);
    this.video.preload = 'auto';
    this.video.src = src;
    this.video.load();
  }

  private handleMetadata = () => {
    if (Number.isFinite(this.video.duration)) this.duration = this.video.duration;
    if (this.kind === 'scrub') this.prime();
  };

  private handleData = () => {
    window.clearTimeout(this.timeout);
    if (this.state === 'error' || this.state === 'fallback') return;
    this.setState('ready');
    this.section.classList.add('has-frame');
    this.section.dataset.scrubReady = String(this.kind === 'scrub');
    this.readyCallbacks.splice(0).forEach(callback => callback());
  };

  private handleError = () => {
    window.clearTimeout(this.timeout);
    if (this.isReady) return;
    this.setState('error');
    this.video.removeAttribute('src');
    this.video.load();
    this.setState('fallback');
  };

  /** Safari only paints seeked frames once playback has been started at least once. */
  private prime() {
    const attempt = this.video.play();
    if (attempt && typeof attempt.then === 'function') attempt.then(() => this.video.pause()).catch(() => {});
    else this.video.pause();
  }

  setActive(active: boolean) {
    if (!this.isReady) return;
    this.setState(active ? 'active' : 'paused');
  }
}
