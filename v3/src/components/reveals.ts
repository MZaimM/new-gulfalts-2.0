/*
 * Entrance motion for static copy and the H01 logo reveal. Only loaded without reduced motion;
 * every element is fully visible in the HTML, so nothing depends on this running.
 */
import { gsap } from 'gsap';

/** Wraps each word in a mask so headings can rise line by line (from V1). */
const splitWords = (element: HTMLElement) => {
  if (element.dataset.revealReady) return;
  element.dataset.revealReady = 'true';
  element.setAttribute('aria-label', element.textContent?.trim() ?? '');
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    (node.textContent ?? '').split(/(\s+)/).forEach(piece => {
      if (!piece) return;
      if (/^\s+$/.test(piece)) {
        fragment.append(document.createTextNode(piece));
        return;
      }
      const mask = document.createElement('span');
      const word = document.createElement('span');
      mask.className = 'reveal-word';
      mask.setAttribute('aria-hidden', 'true');
      word.className = 'reveal-word-inner';
      word.textContent = piece;
      mask.append(word);
      fragment.append(mask);
    });
    node.replaceWith(fragment);
  });
};

export const initReveals = () => {
  gsap.utils.toArray<HTMLElement>('[data-reveal-words]').forEach(target => {
    splitWords(target);
    const words = target.querySelectorAll('.reveal-word-inner');
    gsap.set(words, { yPercent: 110, opacity: 0 });
    gsap.to(words, {
      yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.03, ease: 'power4.out',
      scrollTrigger: { trigger: target, start: 'top 86%', once: true }
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(target => {
    gsap.from(target, {
      autoAlpha: 0, y: 16, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: target, start: 'top 90%', once: true }
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal-media]').forEach(target => {
    const image = target.querySelector('img');
    gsap.timeline({ scrollTrigger: { trigger: target, start: 'top 85%', once: true } })
      .fromTo(target, { clipPath: 'inset(10% 0% 0% 0% round 6px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', duration: 1.1, ease: 'power3.out' })
      .fromTo(image, { scale: 1.08 }, { scale: 1, duration: 1.4, ease: 'power3.out' }, 0);
  });
};

/**
 * H01: the "G" forms first, then the rest of the wordmark grows out of it and the
 * positioning line settles underneath. The logo is HTML/SVG so it stays sharp.
 */
export const playBrandReveal = (hero: HTMLElement) => {
  const logo = hero.querySelector<SVGElement>('.h01_logo');
  if (!logo) return;
  const g = logo.querySelector('.logo_g');
  const rest = logo.querySelectorAll('.logo_rest > *');
  const positioning = hero.querySelector('.h01_positioning');
  const enter = hero.querySelector('.h01_enter');

  // The G sits at ~7.8% of the wordmark's width; shift the whole mark so it starts centred.
  gsap.set(logo, { xPercent: 42.2 });
  gsap.set(g, { opacity: 0, scale: 0.82, transformOrigin: '50% 50%' });
  gsap.set(rest, { opacity: 0, x: -260 });
  gsap.set([positioning, enter], { autoAlpha: 0, y: 12 });

  gsap.timeline({ delay: 0.35 })
    .to(g, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' })
    .to(logo, { xPercent: 0, duration: 1.25, ease: 'power3.inOut' }, '+=0.1')
    .to(rest, { opacity: 1, x: 0, duration: 1, stagger: 0.08, ease: 'power3.out' }, '<0.3')
    .to(positioning, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.45')
    .to(enter, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
};
