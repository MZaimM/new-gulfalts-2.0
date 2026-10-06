/*
 * Our destinations: one destination at a time, seen through a circle. The gold ring around it
 * doubles as the autoplay timer; arrows, numbered tabs (between the eyebrow and the circle) and
 * swipe move between slides.
 * Behaviour in components/slider.ts. Every view and CTA is a real link, so it works without JS
 * (only the first slide shows until the script takes over).
 */
import type { ResponsiveImage } from '../content/types';
import { destinationById } from '../content/destinations';
import { esc, href, pad } from './markup';

interface SlideItem {
  destination: string;
  location: string;
  name: string;
  pillars: string[];
  cta: string;
  image: ResponsiveImage & { alt: string };
}

const srcset = (image: ResponsiveImage, format: 'avif' | 'jpg') =>
  image.widths.map(width => `/media/images/${image.name}-${width}.${format} ${width}w`).join(', ');

const chevron = (direction: 'prev' | 'next') => `
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path d="${direction === 'prev' ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;

const view = (item: SlideItem, index: number) => {
  const destination = destinationById(item.destination);
  const sizes = '(max-width: 767px) 80vw, min(46vw, 56vh, 560px)';
  return `
        <a class="dslider_view${index ? '' : ' is-active'}" href="${href(destination.url)}" data-slide-view tabindex="-1" aria-hidden="true">
          <picture>
            <source type="image/avif" srcset="${srcset(item.image, 'avif')}" sizes="${sizes}" />
            <img src="/media/images/${item.image.name}-${item.image.widths[0]}.jpg" srcset="${srcset(item.image, 'jpg')}" sizes="${sizes}"
              alt="${esc(item.image.alt)}" width="${item.image.widths[0]}" height="${item.image.widths[0]}" loading="lazy" decoding="async" />
          </picture>
        </a>`;
};

const panel = (id: string, item: SlideItem, index: number) => {
  const destination = destinationById(item.destination);
  return `
      <div class="dslider_panel${index ? '' : ' is-active'}" id="${id}-panel-${index}" role="tabpanel" aria-labelledby="${id}-tab-${index}" data-slide-panel>
        <p class="dslider_location">${esc(item.location)}</p>
        <h3 class="dslider_name">${esc(item.name)}</h3>
        <p class="dslider_pillars">${item.pillars.map(esc).join('<span aria-hidden="true">·</span>')}</p>
        <a class="dslider_cta" href="${href(destination.url)}" data-slide-cta>${esc(item.cta)} <span class="link-arrow" aria-hidden="true">→</span></a>
      </div>`;
};

export const destinationSlider = ({ id, eyebrow, items }: { id: string; eyebrow: string; items: SlideItem[] }) => `
<section class="chapter_component is-slider dslider" id="${id}" data-chapter="${id}" data-media="static" aria-labelledby="${id}-title" aria-roledescription="carousel" data-slider>
  <div class="dslider_inner">
    <h2 class="dslider_eyebrow" id="${id}-title" data-reveal>${esc(eyebrow)}</h2>
    <div class="dslider_tabs" role="tablist" aria-label="${esc(eyebrow)}">
      ${items.map((item, index) => `
      <button class="dslider_tab" type="button" role="tab" id="${id}-tab-${index}" aria-controls="${id}-panel-${index}" aria-selected="${index === 0}" tabindex="${index ? -1 : 0}" aria-label="${esc(item.name)}" data-slide-tab>
        <span class="dslider_tab-index" aria-hidden="true">${pad(index + 1)}</span>
        <span class="dslider_tab-bar" aria-hidden="true"><span class="dslider_tab-fill"></span></span>
      </button>`).join('')}
    </div>
    <div class="dslider_stage" data-reveal>
      <button class="dslider_arrow is-prev" type="button" aria-label="Previous destination" data-slide-prev>${chevron('prev')}</button>
      <div class="dslider_frame" data-slide-frame>
        <svg class="dslider_ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <circle class="dslider_ring-track" cx="50" cy="50" r="49.4" pathLength="1" />
          <circle class="dslider_ring-progress" cx="50" cy="50" r="49.4" pathLength="1" data-slide-timer />
        </svg>
        <div class="dslider_views">${items.map(view).join('')}
        </div>
      </div>
      <button class="dslider_arrow is-next" type="button" aria-label="Next destination" data-slide-next>${chevron('next')}</button>
    </div>
    <div class="dslider_panels" aria-live="polite">${items.map((item, index) => panel(id, item, index)).join('')}
    </div>
  </div>
</section>`;
