/*
 * Destination portals (behaviour; markup in components/destination-portals.ts), after the
 * `.ga-portal` script in gulfalts-homepage-preview.html:
 *   - mouse: the view inside the opened circle shifts against the cursor, like a window;
 *   - touch: there is no hover, so the first tap opens the portal and the second goes through;
 *   - click: the circle grows past the corners of the screen, then the destination page opens.
 * Modifier-clicks and reduced motion keep the plain link behaviour.
 */
const TAP_AGAIN = 'Tap again to enter';
const GROW_MS = 820;

export const initPortals = (reduced: boolean) => {
  const portals = [...document.querySelectorAll<HTMLAnchorElement>('[data-portal]')];
  if (!portals.length) return;

  portals.forEach(portal => {
    const view = portal.querySelector<HTMLElement>('.portal_view')!;
    const img = portal.querySelector<HTMLImageElement>('.portal_img')!;
    const cta = portal.querySelector<HTMLElement>('[data-portal-cta]');
    const ctaText = cta?.textContent ?? '';
    let lastPointer = 'mouse';

    const close = () => {
      portal.classList.remove('is-open');
      if (cta) cta.textContent = ctaText;
    };

    portal.addEventListener('pointermove', event => {
      lastPointer = event.pointerType;
      if (reduced || event.pointerType !== 'mouse') return;
      const rect = view.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      img.style.setProperty('--px', `${(-x * 36).toFixed(1)}px`);
      img.style.setProperty('--py', `${(-y * 36).toFixed(1)}px`);
    });
    portal.addEventListener('pointerleave', () => {
      img.style.setProperty('--px', '0px');
      img.style.setProperty('--py', '0px');
    });
    portal.addEventListener('pointerdown', event => { lastPointer = event.pointerType; });
    document.addEventListener('pointerdown', event => {
      if (portal.classList.contains('is-open') && !portal.contains(event.target as Node)) close();
    });

    portal.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
      if (lastPointer === 'touch' && !portal.classList.contains('is-open')) {
        event.preventDefault();
        portals.forEach(other => { if (other !== portal) other.classList.remove('is-open'); });
        portal.classList.add('is-open');
        if (cta) cta.textContent = TAP_AGAIN;
        return;
      }
      if (reduced) return;
      event.preventDefault();
      stepInside(portal.href, view, img);
    });
  });

  // Coming back with the Back button: clear the transition and close any open portal.
  window.addEventListener('pageshow', () => {
    document.querySelectorAll('.portal_overlay').forEach(overlay => overlay.remove());
    portals.forEach(portal => portal.classList.remove('is-open'));
  });
};

/** Grow the portal's circle to fill the screen, then open the destination. */
const stepInside = (href: string, view: HTMLElement, img: HTMLImageElement) => {
  const rect = view.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const overlay = document.createElement('div');
  overlay.className = 'portal_overlay';
  overlay.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
  overlay.style.setProperty('--cx', `${cx}px`);
  overlay.style.setProperty('--cy', `${cy}px`);
  overlay.style.setProperty('--r', `${rect.width / 2}px`);
  document.body.append(overlay);
  const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.style.setProperty('--r', `${far}px`)));
  window.setTimeout(() => { window.location.href = href; }, GROW_MS);
};
