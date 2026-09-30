/*
 * Entrance motion for static copy and the H01 logo reveal. Only loaded without reduced motion;
 * every element is fully visible in the HTML, so nothing depends on this running.
 */
import { gsap } from 'gsap';
import { LOGO_BLOCK, LOGO_TRAIL_X, LOGO_VIEW } from './logo';

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
      .fromTo(target, { clipPath: 'inset(10% 0% 0% 0% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.1, ease: 'power3.out' })
      .fromTo(image, { scale: 1.08 }, { scale: 1, duration: 1.4, ease: 'power3.out' }, 0);
  });
};

/*
 * H01 logo animation — a port of gulfalts-logo-reveal.html (the reference motion). Every frame is
 * computed from one clock, t, so the camera, both tile edges and the letters move on shared,
 * continuous curves rather than chained tweens:
 *   0–750 ms     the G icon fades in and settles (slight scale-up), zoomed in on the G;
 *   1150 ms →    the tile's leading edge runs right (and trims to wordmark height) while the
 *                trailing edge follows 170 ms later, uncovering "Gulf" in white; the camera
 *                zooms out (log-space) and pans from the icon to the whole wordmark;
 *   2330 ms →    the A-L-T-S cut-outs open one by one, rising into place.
 * Geometry is the reference's (a 2000 × 353 wordmark) scaled into our 3043.58 × 537.32 viewBox.
 */
const K = LOGO_VIEW.height / 353;
const ICON = { x: (-34.29 / 0.824) * K, y: (-17.99 / 0.824) * K, size: (333 / 0.824) * K };
const ICON_C = { x: ICON.x + ICON.size / 2, y: ICON.y + ICON.size / 2 };
const WORD_C = { x: LOGO_VIEW.width / 2, y: LOGO_VIEW.height / 2 };
const RISE = 34 * K;

const T_INTRO = 750;
const T_MOVE = 1150;
const R_DUR = 1300;
const L_DELAY = 170;
const L_DUR = 1330;
const T_ALTS = 2330;
const ALTS_STEP = 80;
const ALTS_DUR = 700;
const ULF_DUR = 620;
const T_END = T_ALTS + 3 * ALTS_STEP + ALTS_DUR;

/** CSS-style cubic-bezier easing (Newton–Raphson with a bisection fallback). */
const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x, d = dx(t);
      if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    if (Math.abs(sx(t) - x) > 1e-5) {
      let lo = 0, hi = 1;
      t = x;
      while (hi - lo > 1e-6) { if (sx(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    }
    return sy(t);
  };
};
const lead = bezier(0.72, 0, 0.18, 1);  // leading edge: decisive start, long soft landing
const trail = bezier(0.78, 0, 0.22, 1); // trailing edge: a beat later, slightly firmer
const out = bezier(0.16, 1, 0.3, 1);    // letters and intro: expo out, no overshoot
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const prog = (t: number, start: number, dur: number) => clamp01((t - start) / dur);
const mix = (a: number, b: number, e: number) => a + (b - a) * e;

const edgeR = (t: number) => mix(ICON.x + ICON.size, LOGO_BLOCK.x + LOGO_BLOCK.width, lead(prog(t, T_MOVE, R_DUR)));
const edgeT = (t: number) => mix(ICON.y, LOGO_BLOCK.y, lead(prog(t, T_MOVE, R_DUR)));
const edgeB = (t: number) => mix(ICON.y + ICON.size, LOGO_BLOCK.y + LOGO_BLOCK.height, lead(prog(t, T_MOVE, R_DUR)));
const edgeL = (t: number) => mix(ICON.x, LOGO_BLOCK.x, trail(prog(t, T_MOVE + L_DELAY, L_DUR)));

/** When each of "u", "l", "f" starts rising: as the trailing edge gets within reach of it. */
const TRAIL_START = LOGO_TRAIL_X.map(x0 => {
  for (let t = T_MOVE; t <= T_MOVE + L_DELAY + L_DUR; t += 2) if (edgeL(t) >= x0 - 60 * K) return t;
  return T_MOVE + L_DELAY + L_DUR;
});

/**
 * Icon-to-wordmark zoom, sized like the reference: the icon tile is ~230px on a desktop where
 * the wordmark is ~860px, proportionally more on narrow screens.
 */
const iconZoom = () => {
  const w = window.innerWidth, h = window.innerHeight;
  const wordPx = Math.min(w * 0.8, 860, h * 3.2);
  const tilePx = Math.min(w * 0.36, h * 0.46, 230);
  return (tilePx / ICON.size) / (wordPx / LOGO_VIEW.width);
};

/** Resolves once the wordmark and positioning line are in place (the header waits for it). */
export const playBrandReveal = (hero: HTMLElement): Promise<void> => {
  const logo = hero.querySelector<SVGSVGElement>('.h01_logo');
  if (!logo) return Promise.resolve();
  const cam = logo.querySelector<SVGGElement>('.logo_cam')!;
  const tile = logo.querySelector<SVGRectElement>('.logo_tile')!;
  const left = logo.querySelector<SVGRectElement>('.logo_left')!;
  const trailEls = [...logo.querySelectorAll<SVGGraphicsElement>('.logo_trail')];
  const holes = [...logo.querySelectorAll<SVGPathElement>('.logo_hole')];
  const positioning = hero.querySelector('.h01_positioning');
  // Animate the link, not its wrapper: the wrapper's opacity belongs to the scroll step.
  const cue = hero.querySelector('.h01_enter');
  const zoom = iconZoom();

  const render = (t: number) => {
    const intro = out(prog(t, 0, T_INTRO));
    const eCam = lead(prog(t, T_MOVE, L_DELAY + L_DUR));
    const s = Math.exp(mix(Math.log(zoom), 0, eCam)) * mix(0.94, 1, intro);
    const cx = mix(ICON_C.x, WORD_C.x, eCam), cy = mix(ICON_C.y, WORD_C.y, eCam);
    cam.setAttribute('transform', `translate(${WORD_C.x} ${WORD_C.y}) scale(${s}) translate(${-cx} ${-cy})`);
    cam.setAttribute('opacity', intro.toFixed(4));

    const L = edgeL(t), R = edgeR(t), top = edgeT(t), bottom = edgeB(t);
    tile.setAttribute('x', String(L));
    tile.setAttribute('y', String(top));
    tile.setAttribute('width', String(Math.max(0, R - L)));
    tile.setAttribute('height', String(bottom - top));
    left.setAttribute('width', String(L + 40000));

    trailEls.forEach((el, i) => {
      const e = out(prog(t, TRAIL_START[i], ULF_DUR));
      el.setAttribute('transform', `translate(0 ${(RISE * (1 - e)).toFixed(3)})`);
      el.setAttribute('opacity', e.toFixed(4));
    });
    holes.forEach((el, i) => {
      const e = out(prog(t, T_ALTS + i * ALTS_STEP, ALTS_DUR));
      el.setAttribute('transform', `translate(0 ${(RISE * (1 - e)).toFixed(3)})`);
      el.setAttribute('fill-opacity', e.toFixed(4));
    });
  };

  render(0);
  gsap.set([positioning, cue], { autoAlpha: 0, y: 12 });

  return new Promise(resolve => {
    const start = performance.now() + 300;
    const frame = (now: number) => {
      const t = Math.max(0, now - start);
      render(Math.min(t, T_END));
      if (t < T_END) {
        requestAnimationFrame(frame);
        return;
      }
      gsap.timeline({ onComplete: resolve })
        .to(positioning, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' })
        .to(cue, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.45');
    };
    requestAnimationFrame(frame);
  });
};
