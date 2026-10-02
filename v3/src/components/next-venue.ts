/*
 * Next-venue footer: fixed behind the page and revealed as main scrolls off it. Scrolling further
 * fills the ring clockwise; past THRESHOLD (on release) or at 100% it plays out and hands over to
 * the next venue's page, whose hero picks the video up from the same frame (venue-hero.ts).
 */
import { withBase } from '../lib/media-loader';
import { clamp, isMobile } from '../lib/viewport';
import { HANDOFF_KEY, type VenueHandoff } from './venue-hero';

/** Release past this and it carries on to the next venue. */
const THRESHOLD = 0.51;
/** How long scrolling must stop before it counts as "let go". */
const IDLE_MS = 180;
/** Extra scroll that fills the ring. */
const pull = () => Math.round(window.innerHeight * 0.9);

export const initNextVenue = (reduced: boolean) => {
  const footer = document.querySelector<HTMLElement>('.next-venue');
  const spacer = document.querySelector<HTMLElement>('.next-venue-spacer');
  if (!footer || !spacer) return;

  const link = footer.querySelector<HTMLAnchorElement>('[data-next-venue]')!;
  const kicker = footer.querySelector<HTMLElement>('.next-venue_kicker')!;
  const video = footer.querySelector<HTMLVideoElement>('.next-venue_video')!;

  // Warm the next page's HTML so the hand-over doesn't wait on the network. Added here rather than
  // in the HTML, where Vite would try to bundle the page as an asset.
  const prefetch = document.createElement('link');
  prefetch.rel = 'prefetch';
  prefetch.href = link.href;
  document.head.append(prefetch);

  let revealEnd = 0; // scrollY at which the footer is fully uncovered
  let pullLength = 1;
  let target = 0;    // ring progress from scroll position
  let shown = 0;     // eased ring progress actually drawn
  let committed = false;
  let touching = false;
  let idleTimer = 0;
  let drawing = false;
  let armed = false; // only real input (not scroll restoration) may trigger the hand-over
  let footerVisible = false;

  const measure = () => {
    spacer.style.height = `${footer.offsetHeight + (reduced ? 0 : pull())}px`;
    revealEnd = spacer.getBoundingClientRect().top + window.scrollY + footer.offsetHeight - window.innerHeight;
    pullLength = Math.max(1, document.documentElement.scrollHeight - window.innerHeight - revealEnd);
  };

  // Ease the drawn ring toward its target so wheel steps don't look jumpy.
  const draw = () => {
    shown += (target - shown) * 0.2;
    if (Math.abs(target - shown) < 0.001) shown = target;
    footer.style.setProperty('--ring', shown.toFixed(4));
    drawing = shown !== target;
    if (drawing) requestAnimationFrame(draw);
  };
  const setRing = (value: number) => {
    target = value;
    if (!drawing) {
      drawing = true;
      requestAnimationFrame(draw);
    }
  };

  // Hand-over: complete the ring, lift the overlay off the video, then go to the venue page.
  const commit = () => {
    if (committed) return;
    committed = true;
    window.clearTimeout(idleTimer);
    setRing(1);
    window.setTimeout(() => footer.classList.add('is-leaving'), 350);
    window.setTimeout(() => {
      // Let the next page pick the video up from the same frame.
      if (video.currentSrc) {
        const handoff: VenueHandoff = { src: new URL(video.currentSrc, location.href).pathname, time: video.currentTime, at: Date.now() };
        try { sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff)); } catch {}
      }
      location.href = link.href;
    }, 1100);
  };

  const onRelease = () => {
    if (committed || touching || !armed) return;
    if (target >= THRESHOLD) commit();
    else if (target > 0) window.scrollTo({ top: revealEnd, behavior: 'smooth' }); // not far enough: ease back
  };

  const onScroll = () => {
    if (committed) return;
    setRing(clamp((window.scrollY - revealEnd) / pullLength));
    if (!armed) return;
    if (target >= 0.999) return commit(); // reached the end: no need to wait for release
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(onRelease, IDLE_MS);
  };

  // Clicking or pressing Enter on the ring does the same hand-over.
  link.addEventListener('click', event => {
    if (reduced || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    commit();
  });

  // Tabbing into the footer while it's still covered: scroll it fully into view.
  footer.addEventListener('focusin', () => {
    if (window.scrollY < revealEnd) window.scrollTo({ top: revealEnd });
  });

  // Video: load a screen ahead, play only while the footer is uncovered. A plain src (no blob),
  // so the next page can match the file by its path.
  let loaded = false;
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || loaded || reduced) return;
    const path = isMobile() ? video.dataset.srcMobile : video.dataset.srcDesktop;
    if (!path) return;
    loaded = true;
    video.src = withBase(path);
    video.addEventListener('playing', () => footer.classList.add('is-video-playing'), { once: true });
    if (footerVisible) video.play().catch(() => {});
  }, { rootMargin: '100% 0px' }).observe(spacer);
  new IntersectionObserver(([entry]) => {
    footerVisible = entry.isIntersecting;
    if (!loaded) return;
    if (footerVisible) video.play().catch(() => {});
    else video.pause();
  }).observe(spacer);

  if (reduced) {
    kicker.textContent = kicker.dataset.reducedText ?? kicker.textContent; // nothing to scroll for: a plain link
  } else {
    const arm = () => { armed = true; };
    (['wheel', 'touchstart', 'keydown', 'pointerdown'] as const).forEach(type => window.addEventListener(type, arm, { passive: true }));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', () => { touching = true; }, { passive: true });
    window.addEventListener('touchend', () => {
      touching = false;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(onRelease, IDLE_MS);
    }, { passive: true });
  }

  // Coming back (bfcache restore, or a reload where the browser restores the scroll position):
  // never land mid-pull, and wait for real input before the ring can trigger again.
  const reset = () => {
    committed = false;
    armed = false;
    footer.classList.remove('is-leaving');
    measure();
    if (window.scrollY > revealEnd) window.scrollTo({ top: revealEnd });
    target = shown = 0;
    footer.style.setProperty('--ring', '0');
  };
  window.addEventListener('pageshow', event => { if (event.persisted) reset(); });
  window.addEventListener('load', () => requestAnimationFrame(reset)); // after the browser's own scroll restoration

  window.addEventListener('resize', measure);
  new ResizeObserver(measure).observe(document.querySelector('main')!);
  measure();
};
