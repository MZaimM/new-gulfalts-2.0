/*
 * Header, menu and footer behaviour, carried over from V1 (v1/src/main.js).
 */
import type Lenis from 'lenis';

type ScrollTo = (hash: string, options?: { immediate?: boolean }) => void;

/**
 * The header (logo + nav) waits until the intro logo animation has finished, then fades in. It
 * also appears straight away if the visitor scrolls past the intro first, or lands part-way down
 * the page. It stays transparent; over light sections it switches to ink (see initHeaderTone).
 */
export const initHeader = (hero: HTMLElement, logoDone: Promise<void>) => {
  const header = document.querySelector<HTMLElement>('.site-header')!;
  const show = () => header.classList.remove('is-waiting');
  logoDone.then(show);
  if (window.scrollY > 0) show();
  hero.addEventListener('chapter:step', event => {
    const { name, active } = (event as CustomEvent<{ name: string; active: boolean }>).detail;
    if (name === 'brand-out' && active) show();
  });
  initHeaderTone(header);
};

/**
 * Watches a one-pixel line through the middle of the header and marks the header
 * `.is-on-light` while a light section (static chapters on the off-white canvas) passes under it.
 */
const initHeaderTone = (header: HTMLElement) => {
  const light = [...document.querySelectorAll<HTMLElement>('.chapter_component.is-static')];
  if (!light.length) return;
  const under = new Set<Element>();
  let observer: IntersectionObserver | null = null;
  const observe = () => {
    observer?.disconnect();
    under.clear();
    const middle = Math.round(header.offsetHeight / 2);
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) under.add(entry.target);
        else under.delete(entry.target);
      });
      header.classList.toggle('is-on-light', under.size > 0);
    }, { rootMargin: `-${middle}px 0px -${Math.max(0, window.innerHeight - middle - 1)}px 0px` });
    light.forEach(section => observer!.observe(section));
  };
  observe();
  let frame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(observe);
  });
};

/**
 * Marks every nav item whose chapter group is on screen. Items carry `data-nav="<key>"`, so the
 * Destinations toggle and the matching submenu link can both be current at once.
 */
export const initNavState = (groups: Record<string, string[]>) => {
  const items = [...document.querySelectorAll<HTMLElement>('.desktop-nav [data-nav]')];
  // The root is a zero-height line across the middle of the screen, so ratios are always 0.
  const visible = new Set<string>();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    });
    items.forEach(item => {
      const ids = groups[item.dataset.nav ?? ''] ?? [];
      if (ids.some(id => visible.has(id))) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  Object.values(groups).flat().forEach(id => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
  return () => observer.disconnect();
};

/**
 * Desktop Destinations dropdown (disclosure pattern): opens on click, on hover for fine
 * pointers, and from the keyboard; Escape, an outside click or leaving it closes it.
 */
export const initNavDropdown = () => {
  const root = document.querySelector<HTMLElement>('.nav-dropdown');
  if (!root) return;
  const toggle = root.querySelector<HTMLButtonElement>('.nav-dropdown_toggle')!;
  const links = [...root.querySelectorAll<HTMLAnchorElement>('.nav-dropdown_link')];
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let leaveTimer = 0;
  // A click that lands right after a hover opened the panel should not close it again.
  let hoverOpenedAt = 0;

  const setOpen = (open: boolean) => {
    window.clearTimeout(leaveTimer);
    root.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  const isOpen = () => root.classList.contains('is-open');

  toggle.addEventListener('click', () => {
    if (isOpen() && performance.now() - hoverOpenedAt < 600) return;
    setOpen(!isOpen());
  });
  root.addEventListener('mouseenter', () => {
    if (!hover.matches || isOpen()) return;
    hoverOpenedAt = performance.now();
    setOpen(true);
  });
  root.addEventListener('mouseleave', () => {
    if (!hover.matches) return;
    leaveTimer = window.setTimeout(() => setOpen(false), 160);
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    } else if (event.key === 'ArrowDown' && event.target === toggle) {
      event.preventDefault();
      setOpen(true);
      links[0]?.focus();
    }
  });
  root.addEventListener('focusout', event => {
    if (!root.contains(event.relatedTarget as Node | null)) setOpen(false);
  });
  document.addEventListener('pointerdown', event => {
    if (isOpen() && !root.contains(event.target as Node)) setOpen(false);
  });
  links.forEach(link => link.addEventListener('click', () => setOpen(false)));
};

export const initMenu = (lenis: Lenis | null) => {
  const menu = document.querySelector<HTMLDialogElement>('#menu-dialog')!;
  const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
  let closingTimer = 0;

  const finishClose = () => {
    menu.close();
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    lenis?.start();
    toggle.focus({ preventScroll: true });
  };
  const close = () => {
    if (!menu.open || menu.classList.contains('is-closing')) return;
    menu.classList.remove('is-visible');
    menu.classList.add('is-closing');
    window.clearTimeout(closingTimer);
    closingTimer = window.setTimeout(finishClose, 520);
  };
  toggle.addEventListener('click', () => {
    if (menu.open) {
      close();
      return;
    }
    menu.showModal();
    menu.classList.remove('is-closing');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    lenis?.stop();
    requestAnimationFrame(() => menu.classList.add('is-visible'));
  });
  menu.querySelector('.menu-close')!.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  menu.addEventListener('cancel', event => { event.preventDefault(); close(); });
  menu.addEventListener('close', () => {
    window.clearTimeout(closingTimer);
    menu.classList.remove('is-visible', 'is-closing');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    lenis?.start();
  });
  return menu;
};

export const initAnchors = (scrollTo: ScrollTo, menu: HTMLDialogElement) => {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#' || !document.querySelector(hash)) return;
    event.preventDefault();
    history.pushState(null, '', hash);
    const menuWasOpen = menu.open;
    window.setTimeout(() => scrollTo(hash), menuWasOpen ? 540 : 0);
  }));
  window.addEventListener('popstate', () => scrollTo(location.hash));
  if (location.hash) requestAnimationFrame(() => scrollTo(location.hash, { immediate: true }));
};

/*
 * Footer: fixed behind the page and revealed by the spacer. The spacer tracks the footer's
 * live height (the wordmark scales with width), measured against 100svh so iOS toolbars
 * collapsing mid-scroll can't flip the layout.
 */
export const initFooter = (lenis: Lenis | null) => {
  const footer = document.querySelector<HTMLElement>('.site-footer')!;
  const spacer = document.querySelector<HTMLElement>('.footer-spacer')!;
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
  document.body.append(probe);
  const sync = () => {
    const tooTall = footer.scrollHeight > probe.offsetHeight;
    footer.classList.toggle('is-static', tooTall);
    spacer.style.height = tooTall ? '0px' : `${footer.offsetHeight}px`;
  };
  sync();
  new ResizeObserver(sync).observe(footer);
  window.addEventListener('resize', sync);

  // Keyboard focus can land on the footer while it is still hidden behind the page.
  footer.addEventListener('focusin', () => {
    if (footer.classList.contains('is-static')) return;
    const bottom = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= bottom - 2) return;
    if (lenis) lenis.scrollTo(bottom, { immediate: true });
    else window.scrollTo({ top: bottom });
  });

  // No newsletter service is wired up yet, so a valid address opens a pre-filled email instead.
  const form = footer.querySelector<HTMLFormElement>('.footer-signup')!;
  const email = form.querySelector<HTMLInputElement>('input')!;
  const note = footer.querySelector<HTMLElement>('.footer-signup-note')!;
  const noteText = note.textContent ?? '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = email.value.trim();
    const valid = email.checkValidity() && !!value;
    email.setAttribute('aria-invalid', String(!valid));
    note.classList.toggle('is-error', !valid);
    if (!valid) {
      note.textContent = 'Please enter a valid email address.';
      email.focus();
      return;
    }
    note.textContent = 'Thanks. Your email app will open to confirm the subscription.';
    const subject = encodeURIComponent('Subscribe to Gulfalts updates');
    const body = encodeURIComponent(`Please add ${value} to the Gulfalts updates list.`);
    window.location.href = `mailto:info@gulfalts.com?subject=${subject}&body=${body}`;
  });
  email.addEventListener('input', () => {
    if (email.getAttribute('aria-invalid') !== 'true') return;
    email.removeAttribute('aria-invalid');
    note.classList.remove('is-error');
    note.textContent = noteText;
  });
};
