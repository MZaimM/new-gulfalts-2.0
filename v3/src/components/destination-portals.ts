/*
 * Our destinations: floating logo discs that open into a view of each destination on hover or
 * focus (first tap on touch), and grow to fill the screen when the visitor steps inside.
 * Markup after the `.ga-portal` component in gulfalts-homepage-preview.html; behaviour in
 * components/portals.ts. Every portal is a real link, so it works without JS.
 */
import type { ResponsiveImage } from '../content/types';
import { destinationById } from '../content/destinations';
import { esc } from './markup';

interface PortalItem {
  destination: string;
  tag: string;
  name: string;
  cta: string;
  mark: { src: string; width: number; height: number; className: string };
  image: ResponsiveImage;
}

const srcset = (image: ResponsiveImage, format: 'avif' | 'jpg') =>
  image.widths.map(width => `/media/images/${image.name}-${width}.${format} ${width}w`).join(', ');

const portal = (item: PortalItem) => {
  const destination = destinationById(item.destination);
  const sizes = '(max-width: 767px) 52vw, 450px';
  return `
    <a class="portal" href="${destination.url}" data-portal aria-label="Enter ${esc(item.name)}" data-reveal>
      <span class="portal_stage">
        <span class="portal_float">
          <span class="portal_disc">
            <span class="portal_rim"></span>
            <span class="portal_view">
              <picture>
                <source type="image/avif" srcset="${srcset(item.image, 'avif')}" sizes="${sizes}" />
                <img class="portal_img" src="/media/images/${item.image.name}-${item.image.widths[0]}.jpg" srcset="${srcset(item.image, 'jpg')}" sizes="${sizes}"
                  alt="" width="800" height="800" loading="lazy" decoding="async" />
              </picture>
            </span>
          </span>
          <img class="portal_mark ${item.mark.className}" src="${item.mark.src}" alt="" width="${item.mark.width}" height="${item.mark.height}" decoding="async" />
        </span>
      </span>
      <span class="portal_caption">
        <span class="portal_tag">${esc(item.tag)}</span>
        <span class="portal_name">${esc(item.name)}</span>
        <span class="portal_cta" data-portal-cta>${esc(item.cta)}</span>
      </span>
    </a>`;
};

export const destinationPortals = ({ id, eyebrow, items }: { id: string; eyebrow: string; items: PortalItem[] }) => `
<section class="chapter_component is-portals portals" id="${id}" data-chapter="${id}" data-media="static" aria-labelledby="${id}-title">
  <div class="portals_inner">
    <h2 class="chapter_eyebrow portals_eyebrow" id="${id}-title" data-reveal>${esc(eyebrow)}</h2>
    <div class="portals_list">
      ${items.map(portal).join('')}
    </div>
  </div>
  <svg class="portals_defs" width="0" height="0" aria-hidden="true" focusable="false">
    <filter id="portal-warp" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="4">
        <animate attributeName="baseFrequency" dur="9s" values="0.012;0.022;0.012" repeatCount="indefinite" />
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" scale="16" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
</section>`;
