import '@fontsource-variable/dm-sans';
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
import { initAnchors, initFooter, initHeader, initMenu, initNavState } from './components/site-chrome';
import { initReveals, playBrandReveal } from './components/reveals';
import { initDirectory } from './components/destination-directory';

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
    const tracked = config?.type === 'scrub' || config?.type === 'sequence' ? config : undefined;
    tracks.push(new ChapterTrack(section, tracked, config?.type === 'scrub' ? media.get(section) : undefined));
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
    if (item.kind === 'autoplay') observeAutoplay(item, { eager: section.classList.contains('h01') });
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
  if (!reduced && target.classList.contains('is-joined')) {
    const stage = target.querySelector<HTMLElement>('.chapter_sticky')?.offsetHeight ?? 0;
    const pull = -parseFloat(getComputedStyle(target).marginTop) || 0;
    top += Math.max(0, pull - stage);
  }
  if (lenis) lenis.scrollTo(top, { immediate, duration: immediate ? 0 : 1.4 });
  else window.scrollTo({ top });
};

const menu = initMenu(lenis);
initAnchors(scrollToHash, menu);
initHeader(document.querySelector<HTMLElement>('.h01')!);
initNavState({
  '#the-firm': ['the-firm'],
  '#h05-creative-park': ['h05-creative-park'],
  '#h08-fintech-district': ['h08-fintech-district'],
  '#h13-dubai-pull-out': ['h11-raw-to-destination', 'h13-dubai-pull-out', 'h14-next-destination']
});
initFooter(lenis);
initDirectory(document.querySelector<HTMLElement>('.h13')!);

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------
if (!reduced) {
  playBrandReveal(document.querySelector<HTMLElement>('.h01')!);
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
