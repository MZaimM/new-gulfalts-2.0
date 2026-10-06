import './styles/tokens.css';
import './styles/global.css';
import './styles/site-chrome.css';
import './styles/chapters.css';
import './styles/sections.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { chapterById } from './content/homepage';
import { ChapterMedia } from './lib/media-loader';
import { ChapterTrack, layoutMarkers, observeAutoplay } from './lib/scroll-scrub';
import { prefersReducedMotion } from './lib/viewport';
import { initAnchors, initFooter, initHeader, initMenu, initNavDropdown, initNavState } from './components/site-chrome';
import { initReveals, playBrandReveal } from './components/reveals';
import { initDirectory } from './components/destination-directory';
import { initLocationMap } from './components/location-map';
import { initContact } from './components/contact';
import { initSlider } from './components/slider';

gsap.registerPlugin(ScrollTrigger);
const reduced = prefersReducedMotion();

// ---------------------------------------------------------------------------
// Smooth scrolling (native input, never hijacked). Off under reduced motion.
// ---------------------------------------------------------------------------
const lenis = reduced ? null : new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.9 });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------
const sections = [...document.querySelectorAll<HTMLElement>('.chapter_component')];
const media = new Map<HTMLElement, ChapterMedia>();
sections.forEach(section => {
  if (section.querySelector('.chapter_video')) media.set(section, new ChapterMedia(section));
});

const tracks: ChapterTrack[] = [];
if (!reduced) {
  sections.forEach(section => {
    if (!section.querySelector('.chapter_track')) return;
    const config = chapterById(section.dataset.chapter ?? '');
    const scrub = config?.type === 'scrub' ? config : undefined;
    tracks.push(new ChapterTrack(section, scrub, scrub ? media.get(section) : undefined));
  });

  // Only the hero and the next chapter are buffered ahead of time.
  const videoSections = sections.filter(section => media.has(section));
  tracks.forEach(track => {
    const next = videoSections.find(section => track.section.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (next) track.next = { media: media.get(next) };
  });
  const nearby = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) media.get(entry.target as HTMLElement)?.load();
  }), { rootMargin: '100% 0px' });
  media.forEach((item, section) => {
    if (item.kind === 'autoplay') observeAutoplay(item);
    else nearby.observe(section);
  });
}

let viewport = window.innerHeight;
const update = () => {
  const y = window.scrollY;
  for (const track of tracks) track.update(y, viewport);
};
const measure = () => {
  viewport = window.innerHeight;
  if (reduced) sections.forEach(layoutMarkers);
  tracks.forEach(track => track.measure());
  update();
};

if (lenis) lenis.on('scroll', update);
else window.addEventListener('scroll', update, { passive: true });
gsap.ticker.add(() => { for (const track of tracks) track.tick(); });

let resizeFrame = 0;
const scheduleMeasure = () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(measure);
};
window.addEventListener('resize', scheduleMeasure);
new ResizeObserver(scheduleMeasure).observe(document.querySelector('main')!);
media.forEach(item => item.video.addEventListener('loadedmetadata', scheduleMeasure, { once: true }));
measure();

// ---------------------------------------------------------------------------
// Navigation, header, footer (from V1)
// ---------------------------------------------------------------------------
const scrollToHash = (hash: string, { immediate = false } = {}) => {
  const target = hash ? document.querySelector<HTMLElement>(hash) : null;
  if (!target) return;
  let top = target.getBoundingClientRect().top + window.scrollY;
  // A joined chapter starts under the previous one; land where its dissolve has finished.
  const stage = target.querySelector<HTMLElement>('.chapter_sticky')?.offsetHeight ?? 0;
  const lead = !reduced && target.classList.contains('is-joined')
    ? Math.max(0, (-parseFloat(getComputedStyle(target).marginTop) || 0) - stage)
    : 0;
  top += lead;
  // Some anchors land part-way into a pinned chapter (H13: once the directory is showing).
  const progress = Number(target.dataset.anchorProgress);
  const track = target.querySelector<HTMLElement>('.chapter_track');
  if (!reduced && progress && track) top += (track.offsetHeight - stage - lead) * progress;
  // Leave room for the fixed header on in-flow targets (CSS scroll-margin-top).
  top -= parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  if (lenis) lenis.scrollTo(top, { immediate, duration: immediate ? 0 : 1.4 });
  else window.scrollTo({ top });
};

const menu = initMenu(lenis);
initAnchors(scrollToHash, menu);
const hero = document.querySelector<HTMLElement>('.h01')!;
// The logo animation plays once; the header waits for it (see initHeader).
const logoDone = reduced ? Promise.resolve() : playBrandReveal(hero);
initHeader(hero, logoDone);
initNavDropdown();
initNavState({
  destinations: ['our-destinations', 'h05-creative-park', 'h08-fintech-district', 'h13-dubai-pull-out', 'h14-next-destination'],
  '#h05-creative-park': ['h05-creative-park'],
  '#h13-dubai-pull-out': ['h13-dubai-pull-out', 'h14-next-destination']
});
initFooter(lenis);
initContact(lenis);
initSlider(reduced);
initDirectory(document.querySelector<HTMLElement>('.h13')!);
initLocationMap(document.querySelector<HTMLElement>('.h13')!, reduced);

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------
if (!reduced) {
  initReveals();
}

document.fonts.ready.then(() => { measure(); ScrollTrigger.refresh(); });

if (import.meta.env.DEV) {
  Object.assign(window, { __gulfalts: { gsap, ScrollTrigger, lenis, tracks, media } });
  // Dev only: `?at=h11-raw-to-destination:0.5` jumps to 50% of a chapter's track for QA screenshots.
  const at = new URLSearchParams(location.search).get('at');
  if (at) {
    const [id, fraction = '0'] = at.split(':');
    const section = document.getElementById(id);
    const track = section?.querySelector<HTMLElement>('.chapter_track') ?? section;
    if (track) {
      history.scrollRestoration = 'manual';
      const top = track.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(0, track.offsetHeight - window.innerHeight);
      window.scrollTo(0, top + distance * Number(fraction));
      lenis?.scrollTo(top + distance * Number(fraction), { immediate: true });
    }
  }
}
