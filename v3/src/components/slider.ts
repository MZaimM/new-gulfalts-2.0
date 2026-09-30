/*
 * Our destinations slider (behaviour; markup in components/destination-slider.ts).
 *   - autoplay: the gold ring fills as a CSS animation; its `animationend` moves to the next
 *     slide, so pausing the animation (hover, focus, off screen, hidden tab) pauses the timer;
 *   - arrows, tabs (Arrow keys / Home / End, tablist pattern) and horizontal swipe;
 *   - clicking the view or the CTA grows the circle to fill the screen, then opens the venue.
 * Reduced motion: no autoplay and no circle transition; slides still change on request.
 */
const GROW_MS = 820;
const SWIPE_PX = 48;

export const initSlider = (reduced: boolean) => {
  const root = document.querySelector<HTMLElement>('[data-slider]');
  if (!root) return;
  const views = [...root.querySelectorAll<HTMLAnchorElement>('[data-slide-view]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-slide-panel]')];
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-slide-tab]')];
  const timer = root.querySelector<SVGCircleElement>('[data-slide-timer]')!;
  const frame = root.querySelector<HTMLElement>('[data-slide-frame]')!;
  const live = root.querySelector<HTMLElement>('.dslider_panels')!;
  const count = views.length;
  let current = 0;
  const holds = new Set<string>();

  root.classList.add('is-ready');
  if (!reduced && count > 1) root.classList.add('is-autoplay');

  const syncPause = () => {
    root.classList.toggle('is-paused', holds.size > 0);
    // Announce slide changes only when the visitor made them, not on every autoplay step.
    live.setAttribute('aria-live', root.classList.contains('is-autoplay') && !holds.has('focus') ? 'off' : 'polite');
  };
  const hold = (reason: string, on: boolean) => {
    if (on) holds.add(reason);
    else holds.delete(reason);
    syncPause();
  };

  /** Restart the ring and the active tab's fill from zero. */
  const restartTimer = () => {
    root.classList.remove('is-timing');
    void timer.getBoundingClientRect();
    root.classList.add('is-timing');
  };

  const go = (next: number, { focusTab = false } = {}) => {
    const target = (next + count) % count;
    const direction = target > current || (current === count - 1 && target === 0 && count > 2) ? 1 : -1;
    root.style.setProperty('--dir', String(direction));
    if (target !== current) {
      views[current].classList.remove('is-active');
      views[current].classList.add('is-leaving');
      const leaving = views[current];
      window.setTimeout(() => leaving.classList.remove('is-leaving'), 900);
    }
    current = target;
    views.forEach((view, index) => view.classList.toggle('is-active', index === target));
    panels.forEach((panel, index) => {
      const active = index === target;
      panel.classList.toggle('is-active', active);
      panel.inert = !active;
    });
    tabs.forEach((tab, index) => {
      const active = index === target;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (focusTab) tabs[target].focus();
    restartTimer();
  };

  panels.forEach((panel, index) => { panel.inert = index !== current; });
  restartTimer();

  timer.addEventListener('animationend', () => go(current + 1));
  root.querySelector('[data-slide-prev]')!.addEventListener('click', () => go(current - 1));
  root.querySelector('[data-slide-next]')!.addEventListener('click', () => go(current + 1));
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => go(index));
    tab.addEventListener('keydown', event => {
      const keys: Record<string, number> = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: count - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      go(keys[event.key], { focusTab: true });
    });
  });

  // Pause while the visitor is looking closely, reading, or away.
  const stage = root.querySelector<HTMLElement>('.dslider_inner')!;
  stage.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hold('hover', true); });
  stage.addEventListener('pointerleave', () => hold('hover', false));
  root.addEventListener('focusin', () => hold('focus', true));
  root.addEventListener('focusout', event => { if (!root.contains(event.relatedTarget as Node | null)) hold('focus', false); });
  new IntersectionObserver(([entry]) => hold('offscreen', !entry.isIntersecting), { threshold: 0.35 }).observe(root);
  document.addEventListener('visibilitychange', () => hold('hidden', document.hidden));

  // Swipe on the circle. A swipe must not also follow the link underneath.
  let startX = 0;
  let startY = 0;
  let swiped = false;
  frame.addEventListener('pointerdown', event => {
    startX = event.clientX;
    startY = event.clientY;
    swiped = false;
  });
  frame.addEventListener('pointerup', event => {
    const dx = event.clientX - startX;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(event.clientY - startY)) return;
    swiped = true;
    go(current + (dx < 0 ? 1 : -1));
  });
  frame.addEventListener('dragstart', event => event.preventDefault());

  // Stepping inside: the circle grows past the corners of the screen, then the venue opens.
  const enter = (event: MouseEvent, href: string) => {
    if (swiped) {
      event.preventDefault();
      swiped = false;
      return;
    }
    if (reduced || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault();
    stepInside(href, views[current]);
  };
  views.forEach(view => view.addEventListener('click', event => enter(event, view.href)));
  panels.forEach(panel => {
    const cta = panel.querySelector<HTMLAnchorElement>('[data-slide-cta]')!;
    cta.addEventListener('click', event => enter(event, cta.href));
  });

  // Coming back with the Back button: clear the transition.
  window.addEventListener('pageshow', () => document.querySelectorAll('.dslider_overlay').forEach(overlay => overlay.remove()));
};

const stepInside = (href: string, view: HTMLElement) => {
  const img = view.querySelector('img')!;
  const rect = view.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const overlay = document.createElement('div');
  overlay.className = 'dslider_overlay';
  overlay.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
  overlay.style.setProperty('--cx', `${cx}px`);
  overlay.style.setProperty('--cy', `${cy}px`);
  overlay.style.setProperty('--r', `${rect.width / 2}px`);
  document.body.append(overlay);
  const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.style.setProperty('--r', `${far}px`)));
  window.setTimeout(() => { window.location.href = href; }, GROW_MS);
};
