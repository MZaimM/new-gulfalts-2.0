/*
 * Header, menu and footer behaviour, carried over from V1 (v1/src/main.js).
 */
import type Lenis from 'lenis';

type ScrollTo = (hash: string, options?: { immediate?: boolean }) => void;

export const initHeader = (hero: HTMLElement) => {
  const header = document.querySelector<HTMLElement>('.site-header')!;
  // Transparent only over the intro's dark aerial: once it fades onto the bright H02 frame
  // (the `bg-out` step) or the intro has scrolled away, the header resolves to the solid bar.
  let heroVisible = true;
  let introDone = false;
  const sync = () => header.classList.toggle('is-solid', !heroVisible || introDone);
  const observer = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    sync();
  }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });
  observer.observe(hero);
  const onStep = (event: Event) => {
    const { name, active } = (event as CustomEvent<{ name: string; active: boolean }>).detail;
    if (name !== 'bg-out') return;
    introDone = active;
    sync();
  };
  hero.addEventListener('chapter:step', onStep);
  return () => { observer.disconnect(); hero.removeEventListener('chapter:step', onStep); };
};

/** Marks the nav link whose chapter group is on screen. */
export const initNavState = (groups: Record<string, string[]>) => {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a[href^="#"]')];
  // The root is a zero-height line across the middle of the screen, so ratios are always 0.
  const visible = new Set<string>();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    });
    const current = Object.entries(groups).find(([, ids]) => ids.some(id => visible.has(id)));
    links.forEach(link => {
      if (current && link.getAttribute('href') === current[0]) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  Object.values(groups).flat().forEach(id => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
  return () => observer.disconnect();
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
