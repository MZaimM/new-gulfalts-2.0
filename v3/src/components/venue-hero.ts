/*
 * Venue hero: one screen of copy over an ambient video. It stays pinned while the next section
 * slides up over it, and on a page reached from another venue's footer it carries the footer's
 * video on from the same frame (see components/next-venue.ts).
 */
import { clamp } from '../lib/viewport';

/** Written by the previous page's next-venue footer just before it navigates here. */
export const HANDOFF_KEY = 'venue-handoff';
const HANDOFF_MAX_AGE = 10000;

export interface VenueHandoff {
  /** Pathname of the video file the footer was playing. */
  src: string;
  time: number;
  at: number;
}

export const initVenueHero = (reduced: boolean) => {
  const hero = document.querySelector<HTMLElement>('.hero')!;
  const header = document.querySelector<HTMLElement>('.site-header')!;
  const video = hero.querySelector<HTMLVideoElement>('.hero_video')!;

  // Background video: fade it in over the poster once frames are actually playing.
  if (reduced) {
    video.pause();
    video.removeAttribute('autoplay');
  } else {
    const reveal = () => hero.classList.add('is-video-playing');
    if (!video.paused && video.readyState >= 3) reveal(); // autoplay started before this ran
    else video.addEventListener('playing', reveal, { once: true });
    video.play().catch(() => {}); // blocked (e.g. iOS Low Power Mode): the poster stays
  }

  // Arriving from another venue's footer: carry on from the frame it was showing.
  let handoff: VenueHandoff | null = null;
  try {
    handoff = JSON.parse(sessionStorage.getItem(HANDOFF_KEY) ?? 'null');
    sessionStorage.removeItem(HANDOFF_KEY);
  } catch {}
  if (handoff && !reduced && Date.now() - handoff.at < HANDOFF_MAX_AGE) {
    const { src, time, at } = handoff;
    header.classList.remove('is-waiting'); // the header carries over unchanged; don't re-animate it
    const resume = () => {
      if (new URL(video.currentSrc, location.href).pathname !== src) return; // different footage
      const t = time + (Date.now() - at) / 1000;
      video.currentTime = video.duration ? t % video.duration : t;
    };
    if (video.readyState >= 1) resume();
    else video.addEventListener('loadedmetadata', resume, { once: true });
  }

  // As the next section slides over the pinned hero: dim it, and pause the video once it's hidden.
  if (hero.nextElementSibling && !reduced) {
    let ticking = false;
    let hidden = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const cover = clamp(window.scrollY / hero.offsetHeight);
        hero.style.setProperty('--cover', cover.toFixed(3));
        if ((cover >= 1) !== hidden) {
          hidden = cover >= 1;
          if (hidden) video.pause();
          else video.play().catch(() => {});
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Header slides in, then the copy rises in (staggered in CSS).
  const settle = () => {
    header.classList.remove('is-waiting');
    hero.classList.add('is-settled');
  };
  if (reduced) settle();
  else requestAnimationFrame(() => window.setTimeout(settle, 150)); // let the hidden state paint first
};
