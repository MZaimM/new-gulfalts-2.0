import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initLiquidHover } from './liquid-hover.js';

gsap.registerPlugin(ScrollTrigger);
const header = document.querySelector('.site-header');
const menu = document.querySelector('#menu-dialog');
const toggle = document.querySelector('.menu-toggle');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const narrowScreen = window.matchMedia('(max-width: 767px)');

// The hero video is scrubbed, never played, so it ships as all-keyframe H.264 for instant seeking.
const heroMedia = document.querySelector('.hero-media');
const heroVideo = document.querySelector('.hero-video');
let heroDuration = 6.04;
if (!prefersReducedMotion.matches) {
  heroVideo.src = narrowScreen.matches ? '/assets/hero-scrub-sm.mp4' : '/assets/hero-scrub.mp4';
  heroVideo.load();
}

// Safari decodes seeked frames only after playback has been unlocked once.
const primeHeroVideo = () => {
  if (!heroVideo.src) return;
  const started = heroVideo.play();
  if (started && typeof started.then === 'function') started.then(() => heroVideo.pause()).catch(() => {});
  else heroVideo.pause();
};
heroVideo.addEventListener('loadedmetadata', () => {
  if (heroVideo.duration) heroDuration = heroVideo.duration;
  primeHeroVideo();
}, { once: true });
window.addEventListener('pointerdown', primeHeroVideo, { once: true, passive: true });
window.addEventListener('touchstart', primeHeroVideo, { once: true, passive: true });

const seekHero = progress => {
  if (heroVideo.readyState < 1) return;
  const target = Math.min(Math.max(progress, 0), 1) * (heroDuration - .04);
  if (Math.abs(heroVideo.currentTime - target) > .003) heroVideo.currentTime = target;
};
const lenis = prefersReducedMotion.matches ? null : new Lenis({
  lerp: .1,
  smoothWheel: true,
  syncTouch: false,
  wheelMultiplier: .9,
  anchors: true
});

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const scrollToAnchor = (hash, { immediate = false } = {}) => {
  const target = hash && document.querySelector(hash);
  if (!target || !lenis) return;
  lenis.scrollTo(target, { offset: 0, immediate, duration: immediate ? 0 : 1.15 });
};

document.querySelectorAll('a[href^="#"]:not([data-destination-goto])').forEach(link => link.addEventListener('click', event => {
  const hash = link.getAttribute('href');
  if (!lenis || !hash || hash === '#') return;
  event.preventDefault();
  history.pushState(null, '', hash);
  const menuWasOpen = menu.open;
  window.setTimeout(() => scrollToAnchor(hash), menuWasOpen ? 540 : 0);
}));
window.addEventListener('popstate', () => scrollToAnchor(location.hash));
if (location.hash) requestAnimationFrame(() => scrollToAnchor(location.hash, { immediate: true }));

let menuClosingTimer;
const finishCloseMenu = () => {
  menu.close();
  toggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  lenis?.start();
  toggle.focus({ preventScroll: true });
};
const closeMenu = () => {
  if (!menu.open || menu.classList.contains('is-closing')) return;
  menu.classList.remove('is-visible');
  menu.classList.add('is-closing');
  window.clearTimeout(menuClosingTimer);
  menuClosingTimer = window.setTimeout(finishCloseMenu, 520);
};
toggle.addEventListener('click', () => {
  if (menu.open) {
    closeMenu();
    return;
  }
  menu.showModal();
  menu.classList.remove('is-closing');
  toggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
  lenis?.stop();
  requestAnimationFrame(() => menu.classList.add('is-visible'));
});
menu.querySelector('.menu-close').addEventListener('click', closeMenu);
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
menu.addEventListener('click', event => { if (event.target === menu && event.clientX < menu.getBoundingClientRect().left) closeMenu(); });
menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
menu.addEventListener('close', () => {
  window.clearTimeout(menuClosingTimer);
  menu.classList.remove('is-visible', 'is-closing');
  toggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  lenis?.start();
});

const splitReveal = element => {
  if (element.dataset.revealReady) return;
  element.dataset.revealReady = 'true';
  element.setAttribute('aria-label', element.textContent.trim());
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(textNode => {
    const pieces = textNode.textContent.split(/(\s+)/);
    const fragment = document.createDocumentFragment();
    pieces.forEach(piece => {
      if (!piece) return;
      if (/^\s+$/.test(piece)) {
        fragment.append(document.createTextNode(piece));
        return;
      }
      const mask = document.createElement('span');
      const word = document.createElement('span');
      mask.className = 'reveal-word';
      word.className = 'reveal-word-inner';
      word.textContent = piece;
      mask.append(word);
      fragment.append(mask);
    });
    textNode.replaceWith(fragment);
  });
};

const revealTargets = ['.about-summary', '.what-we-do-heading h2', '.destination-copy h3', '.venues-intro h2'];
document.querySelectorAll(revealTargets.join(',')).forEach(splitReveal);

const heroObserver = new IntersectionObserver(([entry]) => {
  header.classList.toggle('is-solid', !entry.isIntersecting);
}, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });
heroObserver.observe(document.querySelector('.hero'));

const media = gsap.matchMedia();
media.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('.hero-kicker,.hero h1', { y: 18, opacity: 0, duration: .9, stagger: .08, ease: 'power2.out' });
  gsap.from('.hero-bottom-line', { y: 14, opacity: 0, duration: .8, delay: .15, ease: 'power2.out' });
  gsap.utils.toArray('[data-reveal-ready]:not(.about-summary)').forEach(target => {
    const words = target.querySelectorAll('.reveal-word-inner');
    gsap.set(words, { yPercent: 115, opacity: 0 });
    gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: .9,
      stagger: .026,
      ease: 'power4.out',
      scrollTrigger: { trigger: target, start: 'top 84%', once: true }
    });
  });
});

media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  const centerTile = document.querySelector('.about-tile-center');
  const surroundingTiles = gsap.utils.toArray('.about-tile:not(.about-tile-center)');
  const aboutWords = gsap.utils.toArray('.about-summary .reveal-word-inner');
  // One timeline unit == one viewport height of scroll, so the storyboard below reads in screens.
  const SCRUB_END = 2.5;  // the video runs across the first two and a half screens
  const FOLD = 2.95;      // then the last frame folds into the About constellation

  // About is pulled a screen into the hero's pinned runway so it rises behind the folding video.
  document.documentElement.classList.add('has-hero-scrub');

  // The morph target is measured live: the tile is still travelling while the video folds onto it.
  const clipState = { p: 0 };
  const applyHeroClip = () => {
    const p = clipState.p;
    if (!p) {
      if (heroMedia.style.clipPath) heroMedia.style.clipPath = '';
      return;
    }
    const tile = centerTile.getBoundingClientRect();
    const inset = [
      tile.top * p,
      (window.innerWidth - tile.right) * p,
      (window.innerHeight - tile.bottom) * p,
      tile.left * p
    ].map(value => `${value}px`).join(' ');
    heroMedia.style.clipPath = `inset(${inset} round ${14 * p}px)`;
  };

  gsap.set('.about-statement', { autoAlpha: 0, y: 32 });
  gsap.set(surroundingTiles, { autoAlpha: 0, scale: .82, y: 24 });
  gsap.set(centerTile, { autoAlpha: 0 });
  gsap.set(aboutWords, { opacity: .18 });
  const videoScrub = { p: 0 };
  const heroToAbout = gsap.timeline({ paused: true })
    .to(videoScrub, { p: 1, duration: SCRUB_END, ease: 'none', onUpdate: () => seekHero(videoScrub.p) }, 0)
    .fromTo('.hero-progress span', { scaleX: 0 }, { scaleX: 1, duration: SCRUB_END, ease: 'none' }, 0)
    .to('.hero-content,.hero-scroll', { autoAlpha: 0, y: -72, duration: .7, ease: 'power1.in' }, .3)
    .to('.hero-grid', { autoAlpha: 0, duration: .7, ease: 'none' }, .3)
    .to('.hero-scrim', { opacity: .1, duration: .8, ease: 'none' }, .35)
    .to('.hero-blur', { autoAlpha: 0, duration: .7, ease: 'none' }, .3)
    .to('.hero-scrim', { opacity: 0, duration: .55, ease: 'none' }, SCRUB_END - .1)
    .to('.hero-progress', { autoAlpha: 0, duration: .25, ease: 'none' }, SCRUB_END + .05)
    .to(clipState, { p: 1, duration: .6, ease: 'power2.inOut', onUpdate: applyHeroClip }, FOLD)
    .to(surroundingTiles, { autoAlpha: 1, scale: 1, y: 0, duration: .4, stagger: .022, ease: 'power2.out' }, FOLD + .25)
    .to('.about-statement', { autoAlpha: 1, y: 0, duration: .28, ease: 'none' }, FOLD + .5)
    .to(aboutWords, { opacity: 1, duration: .3, stagger: .006, ease: 'none' }, FOLD + .57)
    .to(centerTile, { autoAlpha: 1, duration: .13, ease: 'none' }, FOLD + .6)
    .to(heroMedia, { autoAlpha: 0, duration: .13, ease: 'none' }, FOLD + .6);

  // The pin is as long as the storyboard, so one unit really is one screen of scrolling.
  const TOTAL = heroToAbout.duration();
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', end: `+=${TOTAL * 100}%`, pin: true, scrub: .55,
    animation: heroToAbout, invalidateOnRefresh: true,
    onUpdate: self => {
      applyHeroClip();
      const hasReachedAbout = self.progress > FOLD / TOTAL;
      header.classList.toggle('is-about-transition', hasReachedAbout);
      header.classList.toggle('is-solid', hasReachedAbout);
    },
    onLeave: () => header.classList.remove('is-about-transition'),
    onLeaveBack: () => { header.classList.remove('is-about-transition'); header.classList.remove('is-solid'); }
  });

  const tileParallax = [38, 54, 22, -28, 34, -32, 40, -48, -28, -58, -66];
  gsap.utils.toArray('.about-tile').forEach((tile, index) => {
    gsap.to(tile, {
      yPercent: tileParallax[index],
      ease: 'none',
      scrollTrigger: {
        trigger: '.about',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
        invalidateOnRefresh: true
      }
    });
  });

  return () => {
    header.classList.remove('is-about-transition');
    heroMedia.style.clipPath = '';
    document.documentElement.classList.remove('has-hero-scrub');
  };
});

media.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
  // Phones get the same scrubbed take, over a shorter runway and with regular pin spacing.
  const mobileScrub = { p: 0 };
  const heroTimeline = gsap.timeline({ scrollTrigger: {
    trigger: '.hero', start: 'top top', end: '+=190%', pin: true, scrub: .4, invalidateOnRefresh: true
  }});
  heroTimeline
    .to(mobileScrub, { p: 1, duration: 1, ease: 'none', onUpdate: () => seekHero(mobileScrub.p) }, 0)
    .fromTo('.hero-progress span', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'none' }, 0)
    .to('.hero-content,.hero-scroll', { autoAlpha: 0, y: -40, duration: .34, ease: 'power1.in' }, .2)
    .to('.hero-scrim', { opacity: .1, duration: .4, ease: 'none' }, .22)
    .to('.hero-blur', { autoAlpha: 0, duration: .34, ease: 'none' }, .2)
    .to('.hero-progress', { autoAlpha: 0, duration: .1, ease: 'none' }, .9);

  gsap.from('.about-tile', {
    autoAlpha: 0, y: 22, scale: .9, duration: .7, stagger: .06, ease: 'power2.out',
    scrollTrigger: { trigger: '.about-gallery', start: 'top 80%', once: true }
  });
  gsap.from('.about-statement', {
    autoAlpha: 0, y: 24, duration: .7, ease: 'power2.out',
    scrollTrigger: { trigger: '.about-statement', start: 'top 88%', once: true }
  });
});

media.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('.what-we-do-heading', {
    autoAlpha: 0,
    y: 28,
    duration: .8,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.what-we-do', start: 'top 72%', once: true }
  });
  gsap.from('.what-card', {
    autoAlpha: 0,
    y: 36,
    duration: .7,
    stagger: .08,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.what-we-do-cards', start: 'top 84%', once: true }
  });
  gsap.from('.what-we-do-stat', {
    autoAlpha: 0,
    y: 22,
    duration: .7,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.what-we-do-stat', start: 'top 92%', once: true }
  });
});

// Portfolio size counts up once when it scrolls into view.
const statNumber = document.querySelector('.what-we-do-stat strong');
media.add('(prefers-reduced-motion: no-preference)', () => {
  const finalText = statNumber.textContent.trim();
  const finalValue = Number(finalText.replace(/,/g, ''));
  statNumber.style.minWidth = `${statNumber.getBoundingClientRect().width}px`;
  const counter = { value: 0 };
  statNumber.textContent = '0';
  // The section is pinned during the hand-off, so watch the number itself rather than scroll offsets.
  let tween;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    tween = gsap.to(counter, {
      value: finalValue, duration: 2.2, ease: 'power3.out', delay: .15,
      onUpdate: () => { statNumber.textContent = Math.round(counter.value).toLocaleString('en-US'); },
      onComplete: () => { statNumber.textContent = finalText; }
    });
  }, { threshold: .6 });
  observer.observe(statNumber);
  return () => { observer.disconnect(); tween?.kill(); statNumber.textContent = finalText; statNumber.style.minWidth = ''; };
});

// Section 3 stays put while the portfolio rises over it, then dims and drifts back as it is covered.
media.add('(min-width: 768px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)', () => {
  const whatWeDo = document.querySelector('.what-we-do');
  const portfolio = document.querySelector('.destinations');
  ScrollTrigger.create({
    trigger: whatWeDo, start: 'bottom bottom', endTrigger: portfolio, end: 'top top',
    pin: true, pinSpacing: false, invalidateOnRefresh: true
  });
  gsap.fromTo('.what-we-do-content', { yPercent: 0, opacity: 1 }, {
    yPercent: -6, opacity: .35, ease: 'none', immediateRender: false,
    scrollTrigger: { trigger: portfolio, start: 'top bottom', end: 'top top', scrub: true }
  });
});

// Portfolio: each destination loops its own muted film, but only while it is actually on screen.
const destinations = document.querySelector('.destinations');
const destinationSlides = gsap.utils.toArray('.destination');
const destinationVideos = destinationSlides.map(slide => slide.querySelector('.destination-video'));
const destinationWanted = destinationSlides.map(() => false);
let destinationsInView = false;
let destinationTrigger = null;
let destinationStops = [];

const syncDestinationVideos = () => {
  destinationVideos.forEach((video, index) => {
    const shouldPlay = !prefersReducedMotion.matches && destinationsInView && destinationWanted[index];
    if (shouldPlay && video.paused) video.play().catch(() => {});
    else if (!shouldPlay && !video.paused) video.pause();
  });
};
const measureStackedDestinations = () => {
  destinationSlides.forEach((slide, index) => {
    const box = slide.getBoundingClientRect();
    destinationWanted[index] = box.bottom > 0 && box.top < window.innerHeight;
  });
  syncDestinationVideos();
};

// Start buffering a screen early so the first film is already moving when it arrives.
new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting || prefersReducedMotion.matches) return;
  destinationVideos.forEach(video => { if (video.preload !== 'auto') { video.preload = 'auto'; video.load(); } });
}, { rootMargin: '100% 0px' }).observe(destinations);
new IntersectionObserver(([entry]) => {
  destinationsInView = entry.isIntersecting;
  syncDestinationVideos();
}).observe(destinations);
const destinationSlideObserver = new IntersectionObserver(entries => {
  if (destinationTrigger) return;
  entries.forEach(entry => { destinationWanted[destinationSlides.indexOf(entry.target)] = entry.isIntersecting; });
  syncDestinationVideos();
}, { threshold: .12 });
destinationSlides.forEach(slide => destinationSlideObserver.observe(slide));

document.querySelectorAll('[data-destination-goto]').forEach(link => link.addEventListener('click', event => {
  const index = Number(link.dataset.destinationGoto);
  event.preventDefault();
  event.stopPropagation();
  const target = destinationTrigger
    ? destinationTrigger.start + (destinationTrigger.end - destinationTrigger.start) * destinationStops[index]
    : destinationSlides[index];
  if (lenis) lenis.scrollTo(target, { duration: 1.4 });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else target.scrollIntoView();
}));

media.add({
  pinned: '(min-width: 768px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)'
}, context => {
  const { pinned, motion } = context.conditions;
  if (!motion) return;
  const entryParts = slide => slide.querySelectorAll('.destination-tag, .destination-copy>p, .destination-stats li, .destination-cta, .destination-next');

  if (!pinned) {
    // Stacked: every destination is a full screen of its own that settles in as it arrives.
    destinationSlides.forEach(slide => {
      gsap.from(entryParts(slide), {
        autoAlpha: 0, y: 26, duration: .8, stagger: .06, ease: 'power3.out',
        scrollTrigger: { trigger: slide.querySelector('.destination-copy'), start: 'top 88%', once: true }
      });
      gsap.fromTo(slide.querySelector('.destination-video'), { yPercent: -6, scale: 1.12 }, {
        yPercent: 6, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: slide, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    measureStackedDestinations();
    return;
  }

  // Pinned: one timeline unit == one screen of scroll, like the hero storyboard.
  destinations.classList.add('is-pinned');
  const [first, second] = destinationSlides;
  const HOLD = .55;  // read the first destination before anything moves
  const WIPE = 1.05; // the second film wipes up from the bottom edge
  const secondParts = second.querySelectorAll('.destination-index, .destination-tag, .destination-label, .destination-copy>*, .destination-next');

  gsap.from(entryParts(first), {
    autoAlpha: 0, y: 30, duration: .85, stagger: .06, ease: 'power3.out',
    scrollTrigger: { trigger: destinations, start: 'top 62%', once: true }
  });

  const timeline = gsap.timeline({ paused: true })
    .fromTo(first.querySelectorAll('.destination-head, .destination-body'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -70, duration: .5, stagger: .05, ease: 'power1.in', immediateRender: false }, HOLD)
    .fromTo(first.querySelector('.destination-media'), { yPercent: 0 }, { yPercent: -16, duration: WIPE, ease: 'none', immediateRender: false }, HOLD)
    .fromTo(second, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: WIPE, ease: 'power2.inOut' }, HOLD + .05)
    .fromTo(second.querySelector('.destination-video'), { scale: 1.18 }, { scale: 1, duration: WIPE + .35, ease: 'power2.out' }, HOLD + .05)
    .fromTo(secondParts, { autoAlpha: 0, y: 56 }, { autoAlpha: 1, y: 0, duration: .55, stagger: .04, ease: 'power3.out' }, HOLD + WIPE * .55)
    .to({}, { duration: .5 });
  const TOTAL = timeline.duration();
  timeline.fromTo('.destinations-progress span', { scaleX: 0 }, { scaleX: 1, duration: TOTAL, ease: 'none' }, 0);

  const wipeStart = (HOLD + .05) / TOTAL;
  const wipeEnd = (HOLD + .05 + WIPE) / TOTAL;
  destinationStops = [0, Math.min(1, (HOLD + WIPE * .55 + .7) / TOTAL)];
  destinationTrigger = ScrollTrigger.create({
    trigger: destinations, start: 'top top', end: `+=${TOTAL * 100}%`, pin: true, scrub: .6,
    animation: timeline, invalidateOnRefresh: true,
    onUpdate: self => {
      destinationWanted[0] = self.progress < wipeEnd;
      destinationWanted[1] = self.progress > wipeStart * .6;
      syncDestinationVideos();
    }
  });
  destinationWanted[0] = true;
  syncDestinationVideos();

  return () => {
    destinationTrigger = null;
    destinationStops = [];
    destinations.classList.remove('is-pinned');
    requestAnimationFrame(measureStackedDestinations);
  };
});

// Venues: the photo melts into its alternate on hover (or on its own on touch screens).
const disposeLiquid = initLiquidHover(gsap.utils.toArray('.venue'), { reducedMotion: prefersReducedMotion });
media.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('.venues-kicker', {
    autoAlpha: 0, y: 16, duration: .7, ease: 'power3.out',
    scrollTrigger: { trigger: '.venues', start: 'top 78%', once: true }
  });
  gsap.from('.venues-rule', {
    autoAlpha: 0, y: 18, duration: .7, ease: 'power3.out',
    scrollTrigger: { trigger: '.venues-rule', start: 'top 90%', once: true }
  });
  gsap.from('.venue-media, .venue-card', {
    autoAlpha: 0, y: 40, duration: .9, stagger: .08, ease: 'power3.out',
    scrollTrigger: { trigger: '.venues-grid', start: 'top 86%', once: true }
  });
});

// Footer: the spacer tracks the fixed footer's live height (the wordmark scales with width).
// Measured against 100svh so iOS toolbars collapsing mid-scroll can't flip the layout.
const siteFooter = document.querySelector('.site-footer');
const footerSpacer = document.querySelector('.footer-spacer');
const viewportProbe = document.createElement('div');
viewportProbe.setAttribute('aria-hidden', 'true');
viewportProbe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
document.body.append(viewportProbe);
const syncFooter = () => {
  const tooTall = siteFooter.scrollHeight > viewportProbe.offsetHeight;
  siteFooter.classList.toggle('is-static', tooTall);
  footerSpacer.style.height = tooTall ? '0px' : `${siteFooter.offsetHeight}px`;
};
syncFooter();
new ResizeObserver(syncFooter).observe(siteFooter);
window.addEventListener('resize', syncFooter);

// Keyboard focus can land on the footer while it is still hidden behind the page.
siteFooter.addEventListener('focusin', () => {
  if (siteFooter.classList.contains('is-static')) return;
  const bottom = document.documentElement.scrollHeight - window.innerHeight;
  if (window.scrollY >= bottom - 2) return;
  if (lenis) lenis.scrollTo(bottom, { immediate: true });
  else window.scrollTo({ top: bottom });
});

// No newsletter service is wired up yet, so a valid address opens a pre-filled email instead.
const footerSignup = document.querySelector('.footer-signup');
const footerEmail = footerSignup.querySelector('input');
const footerNote = document.querySelector('.footer-signup-note');
const footerNoteText = footerNote.textContent;
footerSignup.addEventListener('submit', event => {
  event.preventDefault();
  const email = footerEmail.value.trim();
  const valid = footerEmail.checkValidity() && email;
  footerEmail.setAttribute('aria-invalid', String(!valid));
  footerNote.classList.toggle('is-error', !valid);
  if (!valid) {
    footerNote.textContent = 'Please enter a valid email address.';
    footerEmail.focus();
    return;
  }
  footerNote.textContent = 'Thanks. Your email app will open to confirm the subscription.';
  const subject = encodeURIComponent('Subscribe to Gulfalts updates');
  const body = encodeURIComponent(`Please add ${email} to the Gulfalts updates list.`);
  window.location.href = `mailto:info@gulfalts.com?subject=${subject}&body=${body}`;
});
footerEmail.addEventListener('input', () => {
  if (footerEmail.getAttribute('aria-invalid') !== 'true') return;
  footerEmail.removeAttribute('aria-invalid');
  footerNote.classList.remove('is-error');
  footerNote.textContent = footerNoteText;
});

// Refresh geometry when the local font is ready. Media has reserved layout dimensions.
document.fonts.ready.then(() => ScrollTrigger.refresh());
if (import.meta.env.DEV) window.__gulfalts = { gsap, ScrollTrigger, lenis, heroVideo };
if (import.meta.hot) import.meta.hot.dispose(() => { media.revert(); disposeLiquid(); heroObserver.disconnect(); lenis?.destroy(); });
