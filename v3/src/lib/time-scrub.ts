/*
 * Venue scrub sections: the scroll position through a `[data-scrub]` section's track sets its
 * video's currentTime, and copy is timed to the video in seconds (`data-from` / `data-to`).
 * The homepage chapters use lib/scroll-scrub.ts instead, which times everything as track
 * progress. Native scrolling is never intercepted; the stage is plain `position: sticky`.
 */
import { withBase } from './media-loader';
import { clamp, isMobile } from './viewport';

/** Share of the remaining distance the playhead covers each frame. */
const SMOOTHING = 0.22;

interface Timed { el: HTMLElement; from: number; to: number; interactive: boolean }

const setupScrub = (section: HTMLElement, debug: HTMLElement | null) => {
  const name = section.dataset.scrub || section.id;
  const track = section.querySelector<HTMLElement>('.scrub_track')!;
  const sticky = section.querySelector<HTMLElement>('.scrub_sticky')!;
  const video = section.querySelector<HTMLVideoElement>('.scrub_video')!;
  const timed: Timed[] = [...section.querySelectorAll<HTMLElement>('[data-from]')].map(el => ({
    el,
    from: Number(el.dataset.from),
    to: el.dataset.to === undefined ? Infinity : Number(el.dataset.to),
    interactive: !!el.querySelector('a, button')
  }));

  let duration = Number(section.dataset.duration) || 0;
  let top = 0;
  let distance = 1;
  let targetTime = 0;
  let smoothTime = 0;
  let pendingSeek: number | null = null;
  let videoReady = false;
  let inView = false;
  let lastTime = -1;

  const measure = () => {
    top = track.getBoundingClientRect().top + window.scrollY;
    distance = Math.max(1, track.offsetHeight - sticky.offsetHeight);
  };

  // Show/hide copy for the current video time (driven by scroll, not by playback lag).
  const applyCopy = (time: number) => {
    timed.forEach(({ el, from, to, interactive }) => {
      const active = time >= from && time < to;
      el.classList.toggle('is-active', active);
      el.classList.toggle('is-past', time >= to);
      if (interactive) el.inert = !active; // hidden links can't be tabbed to or clicked
    });
  };

  const seek = (time: number) => {
    const t = clamp(time, 0, Math.max(0, duration - 0.05));
    if (video.seeking) {
      pendingSeek = t;
      return;
    }
    if (Math.abs(video.currentTime - t) > 0.004) video.currentTime = t;
  };
  video.addEventListener('seeked', () => {
    if (pendingSeek === null) return;
    const t = pendingSeek;
    pendingSeek = null;
    if (Math.abs(video.currentTime - t) > 0.004) video.currentTime = t;
  });

  const frame = () => {
    const progress = clamp((window.scrollY - top) / distance);
    targetTime = progress * duration;

    if (targetTime !== lastTime) {
      lastTime = targetTime;
      section.style.setProperty('--p', progress.toFixed(4));
      applyCopy(targetTime);
      if (debug) debug.textContent = `${name}  ${targetTime.toFixed(2)}s / ${duration.toFixed(2)}s`;
    }

    if (videoReady) {
      const gap = targetTime - smoothTime;
      smoothTime = Math.abs(gap) < 0.01 ? targetTime : smoothTime + gap * SMOOTHING;
      seek(smoothTime);
    }

    if (inView) requestAnimationFrame(frame);
  };

  // Fetch the whole file up front so every frame is buffered and seeks are instant (some hosts,
  // Webflow Cloud among them, ignore Range requests; see lib/media-loader.ts).
  let loading = false;
  const loadVideo = () => {
    if (loading) return;
    loading = true;
    const path = isMobile() ? video.dataset.srcMobile : video.dataset.srcDesktop;
    if (!path) return;
    const src = withBase(path);

    video.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(video.duration)) duration = video.duration;
    }, { once: true });
    video.addEventListener('loadeddata', () => {
      // iOS only paints seeked frames after the video has played once.
      const play = video.play();
      if (play?.then) play.then(() => video.pause()).catch(() => {});
      else video.pause();
      videoReady = true;
      smoothTime = targetTime;
      seek(smoothTime);
      section.classList.add('is-video-ready');
    }, { once: true });

    video.preload = 'auto';
    fetch(src)
      .then(response => {
        if (!response.ok) throw new Error(`${response.status} ${src}`);
        return response.blob();
      })
      .then(blob => { video.src = URL.createObjectURL(blob.type ? blob : new Blob([blob], { type: 'video/mp4' })); })
      .catch(() => { video.src = src; }) // fall back to streaming; the poster stays until it's ready
      .finally(() => video.load());
  };

  // Start loading a screen ahead; run the loop only while the section is on screen.
  new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadVideo(); }, { rootMargin: '100% 0px' }).observe(section);
  new IntersectionObserver(([entry]) => {
    const wasInView = inView;
    inView = entry.isIntersecting;
    if (inView && !wasInView) {
      measure();
      requestAnimationFrame(frame);
    }
  }).observe(section);

  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  document.fonts?.ready.then(measure);
  measure();
  applyCopy(0);
};

/** Reduced motion: no scrubbing at all; CSS lays every line out over the poster. */
export const initTimeScrub = (reduced: boolean) => {
  if (reduced) return;
  // `?debug` shows the current video time while scrolling, for timing copy against the footage.
  let debug: HTMLElement | null = null;
  if (new URLSearchParams(location.search).has('debug')) {
    debug = document.createElement('div');
    debug.className = 'scrub-debug';
    document.body.append(debug);
  }
  document.querySelectorAll<HTMLElement>('[data-scrub]').forEach(section => setupScrub(section, debug));
};
