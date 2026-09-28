/*
 * Featured destinations: Dubai Creative Park and Dubai Fintech District in one section.
 * Two equal columns whose rows (image, eyebrow, heading, body, figures, link) line up across
 * both destinations via CSS subgrid. Each column keeps its own anchor id, so nav links to either
 * destination still land on it.
 */
import type { DestinationStat, ResponsiveImage } from '../content/types';
import { destinationById } from '../content/destinations';
import { arrow, esc, externalLink, statList } from './markup';
import { picture } from './responsive-image';

export interface FeaturedItem {
  id: string;
  destinationId: string;
  eyebrow: string;
  heading: string;
  body: string;
  cta: string;
  image: ResponsiveImage & { alt: string };
  stats: DestinationStat[];
  /** Rendered width hint for the responsive image at desktop sizes. */
  sizes: string;
}

interface FeaturedOptions {
  id: string;
  eyebrow: string;
  heading: string;
  items: FeaturedItem[];
}

const featuredItem = (item: FeaturedItem) => {
  const destination = destinationById(item.destinationId);
  const titleId = `${item.id}-title`;
  return `
    <article class="featured_item" id="${item.id}" aria-labelledby="${titleId}">
      <figure class="featured_figure" data-reveal-media>
        ${picture({ image: item.image, alt: item.image.alt, sizes: item.sizes })}
      </figure>
      <div class="featured_copy">
        <p class="chapter_eyebrow featured_eyebrow" data-reveal>
          <span class="featured_index" aria-hidden="true">${destination.index}</span>
          <span>${esc(item.eyebrow)}</span>
        </p>
        <h3 class="featured_heading" id="${titleId}" data-reveal-words>${esc(item.heading)}</h3>
        <p class="featured_body" data-reveal>${esc(item.body)}</p>
        <div class="featured_data" data-reveal>
          ${statList(item.stats, `${destination.fullName} in numbers`)}
        </div>
        <div class="featured_action" data-reveal>
          <a class="primary-button" href="${destination.url}" ${externalLink}>${esc(item.cta)} ${arrow}</a>
          <span class="featured_location">${esc(destination.location)}</span>
        </div>
      </div>
    </article>`;
};

export const featuredDestinations = ({ id, eyebrow, heading, items }: FeaturedOptions) => `
<section class="chapter_component is-static featured" id="${id}" data-chapter="${id}" data-media="static" aria-labelledby="${id}-title">
  <div class="featured_inner">
    <header class="featured_head">
      <p class="chapter_eyebrow" data-reveal>${esc(eyebrow)}</p>
      <h2 class="section-display featured_title" id="${id}-title" data-reveal-words>${esc(heading)}</h2>
    </header>
    <div class="featured_grid">
      ${items.map(featuredItem).join('')}
    </div>
  </div>
</section>`;
