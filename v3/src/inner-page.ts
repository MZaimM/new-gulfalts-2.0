import './styles/tokens.css';
import './styles/global.css';
import './styles/site-chrome.css';
import './styles/chapters.css';
import './styles/sections.css';
import './styles/inner-page.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { fintechDistrictPage } from './content/fintech-district';
import { creativeParkPage } from './content/creative-park';
import { innerChapters } from './content/inner-page';
import { ChapterMedia } from './lib/media-loader';
import { ChapterTrack } from './lib/scroll-scrub';
import { clamp, isMobile, prefersReducedMotion } from './lib/viewport';
import { initAnchors, initFooter, initHeader, initMenu, initNavDropdown } from './components/site-chrome';
import { initReveals } from './components/reveals';
import { initLocationMap } from './components/location-map';
import { initContact } from './components/contact';
import type { ScrubChapter } from './content/types';

/*
 * Inner pages (Dubai Fintech District, Dubai Creative Park). Same runtime as the homepage (src/main.ts): Lenis smooths native
 * scrolling, ChapterTrack pins the chapters and scrubs their video, GSAP drives the entrances.
 * Page-specific motion from the inner page template lives here: the scale grid that zooms into
 * the transformation video, the word-by-word fill of the intro and the count-up figures.
 */

gsap.registerPlugin(ScrollTrigger);
const reduced = prefersReducedMotion();

const chapters = [fintechDistrictPage, creativeParkPage].flatMap(innerChapters);
const chapterById = (id: string) => chapters.find(chapter => chapter.id === id);

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
    const scrub = config?.type === 'scrub' ? (config as ScrubChapter) : undefined;
    tracks.push(new ChapterTrack(section, scrub, scrub ? media.get(section) : undefined));
  });
  // The hero buffers straight away; the transformation once the hero is half way through.
  const videoSections = sections.filter(section => media.has(section));
  tracks.forEach(track => {
    const next = videoSections.find(section => track.section.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (next) track.next = { media: media.get(next) };
  });
  const nearby = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) media.get(entry.target as HTMLElement)?.load();
  }), { rootMargin: '100% 0px' });
  media.forEach((_, section) => nearby.observe(section));
}

// ---------------------------------------------------------------------------
// Scale grid (template "scale-grid"): the mosaic zooms until the video tile fills the screen.
// Desktop scales the whole grid around the tile; phones grow the tile alone (CSS, from --z).
// ---------------------------------------------------------------------------
const transform = document.querySelector<HTMLElement>('.inner-transform');
const grid = transform?.querySelector<HTMLElement>('[data-scale-grid]');
const gridContent = transform?.querySelector<HTMLElement>('[data-scale-content]');
const gridRef = transform?.querySelector<HTMLElement>('[data-scale-ref]');
const [zoomFrom, zoomTo] = (transform?.dataset.zoom ?? '0-0.2').split('-').map(Number);
const smoothstep = (t: number) => t * t * (3 - 2 * t);
let gridMax = 1;
let gridEm = 1;

const measureGrid = () => {
  if (!grid || !gridRef) return;
  gridEm = parseFloat(getComputedStyle(grid).fontSize) || 1;
  gridMax = Math.max(window.innerWidth / gridRef.offsetWidth, window.innerHeight / gridRef.offsetHeight);
};

const updateGrid = () => {
  if (!transform || !gridContent) return;
  const story = Number(transform.style.getPropertyValue('--p')) || 0;
  const z = smoothstep(clamp((story - zoomFrom) / (zoomTo - zoomFrom)));
  transform.style.setProperty('--z', z.toFixed(4));
  if (isMobile()) {
    gridContent.style.transform = '';
    return;
  }
  const scale = 1 + z * (gridMax - 1);
  // The grid sits 8em low at rest (template); it centres on the tile as it zooms.
  const offset = 8 * gridEm * (1 - z);
  gridContent.style.transform = `translate3d(-50%, calc(-50% + ${offset.toFixed(1)}px), 0) scale(${scale.toFixed(4)})`;
};

// ---------------------------------------------------------------------------
// Intro: each word of the description fills in as it scrolls through (template "fill-text").
// ---------------------------------------------------------------------------
const fill = document.querySelector<HTMLElement>('[data-fill-text]');
let fillWords: HTMLElement[] = [];
if (fill && !reduced) {
  const text = fill.textContent?.trim() ?? '';
  fill.setAttribute('aria-label', text);
  fill.innerHTML = text.split(/\s+/).map(word => `<span class="fill-word" aria-hidden="true">${word}</span>`).join(' ');
  fillWords = [...fill.querySelectorAll<HTMLElement>('.fill-word')];
}
const updateFill = () => {
  if (!fill || !fillWords.length) return;
  const rect = fill.getBoundingClientRect();
  const progress = clamp((window.innerHeight * 0.85 - rect.top) / (rect.height + window.innerHeight * 0.4));
  const band = 1 / fillWords.length;
  fillWords.forEach((word, index) => {
    word.style.opacity = (0.2 + clamp((progress - index * band) / band) * 0.8).toFixed(3);
  });
};

// ---------------------------------------------------------------------------
// Scroll loop
// ---------------------------------------------------------------------------
let viewport = window.innerHeight;
const update = () => {
  const y = window.scrollY;
  for (const track of tracks) track.update(y, viewport);
  if (!reduced) {
    updateGrid();
    updateFill();
  }
};
const measure = () => {
  viewport = window.innerHeight;
  tracks.forEach(track => track.measure());
  measureGrid();
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
// Navigation, header, footer, contact
// ---------------------------------------------------------------------------
const scrollToHash = (hash: string, { immediate = false } = {}) => {
  const target = hash ? document.querySelector<HTMLElement>(hash) : null;
  if (!target) return;
  let top = target.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
  // Pinned sections can ask to land part-way in (the location map: once it has opened).
  const progress = Number(target.dataset.anchorProgress);
  const track = target.querySelector<HTMLElement>('.chapter_track');
  if (!reduced && progress && track) top += (track.offsetHeight - window.innerHeight) * progress;
  if (lenis) lenis.scrollTo(top, { immediate, duration: immediate ? 0 : 1.4 });
  else window.scrollTo({ top });
};

const menu = initMenu(lenis);
initAnchors(scrollToHash, menu);
initHeader(document.querySelector<HTMLElement>('.inner-hero')!, Promise.resolve());
initNavDropdown();
initFooter(lenis);
initContact(lenis);

// ---------------------------------------------------------------------------
// Location map: route mode from the venue. Mapbox loads once the section is near and
// the map dissolves in once it is on screen (the `map-near` / `map` steps of location-map.ts).
// ---------------------------------------------------------------------------
const locationSection = document.querySelector<HTMLElement>('.inner-location');
if (locationSection) {
  const step = (name: string, active: boolean) => {
    locationSection.classList.toggle(`is-${name}`, active);
    locationSection.dispatchEvent(new CustomEvent('chapter:step', { detail: { name, active } }));
  };
  initLocationMap(locationSection, reduced);
  // Dark backdrop (data-light-stage): light for the header until the photo opens to full screen.
  if (locationSection.hasAttribute('data-light-stage')) {
    const tone = () => {
      const light = !locationSection.classList.contains('is-expand');
      if (locationSection.classList.contains('is-light') !== light) locationSection.classList.toggle('is-light', light);
    };
    new MutationObserver(tone).observe(locationSection, { attributeFilter: ['class'] });
    tone();
  }
  new IntersectionObserver((entries, observer) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    step('map-near', true);
  }, { rootMargin: '150% 0px' }).observe(locationSection);
  new IntersectionObserver(([entry]) => step('map', entry.isIntersecting), { threshold: 0.25 })
    .observe(locationSection.querySelector('.inner-location_frame')!);
}

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------
if (!reduced) {
  initReveals();

  // Figures count up once (template "metrics"): "500,000" → 0…500,000; words stay as they are.
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach(element => {
    const text = element.textContent ?? '';
    const match = text.match(/^([\d,.]+)$/);
    if (!match) return;
    const target = Number(match[1].replace(/,/g, ''));
    const state = { value: 0 };
    const format = (value: number) => (text.includes(',') ? Math.round(value).toLocaleString('en-US') : String(Math.round(value)));
    element.textContent = format(0);
    // An observer, not a `once` ScrollTrigger: on a page restored below the figures that trigger
    // fires while it is still being created and throws inside ScrollTrigger.refresh.
    new IntersectionObserver((entries, observer) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      gsap.to(state, {
        value: target, duration: 1.4, ease: 'power2.out',
        onUpdate: () => { element.textContent = format(state.value); }
      });
    }, { rootMargin: '0px 0px -12% 0px' }).observe(element);
  });
}

document.fonts.ready.then(() => { measure(); ScrollTrigger.refresh(); });

if (import.meta.env.DEV) {
  Object.assign(window, { __gulfalts: { gsap, ScrollTrigger, lenis, tracks, media } });
  // Dev only: `?at=dfd-transformation:0.5` jumps to 50% of a chapter's track for QA screenshots.
  const at = new URLSearchParams(window.location.search).get('at');
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
