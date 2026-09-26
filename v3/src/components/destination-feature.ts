/*
 * H05 / H08: one editorial layout for both featured destinations, mirrored so the two read as a
 * pair without repeating: an architectural image on one side, the story, verified figures
 * and a single project link on the other.
 */
import type { DestinationStat, ResponsiveImage } from '../content/types';
import { destinationById } from '../content/destinations';
import { arrow, esc, externalLink, statList } from './markup';
import { picture } from './responsive-image';

interface FeatureOptions {
  id: string;
  destinationId: string;
  eyebrow: string;
  heading: string;
  body: string;
  cta: string;
  image: ResponsiveImage & { alt: string };
  stats: DestinationStat[];
  /** Image on the left instead of the right. */
  mirrored?: boolean;
}

export const destinationFeature = ({ id, destinationId, eyebrow, heading, body, cta, image, stats, mirrored = false }: FeatureOptions) => {
  const destination = destinationById(destinationId);
  const titleId = `${id}-title`;
  return `
<section class="chapter_component is-static destination_feature${mirrored ? ' is-mirrored' : ''}" id="${id}" data-chapter="${id}" data-media="static" aria-labelledby="${titleId}">
  <div class="feature_inner">
    <p class="chapter_eyebrow feature_eyebrow" data-reveal><span>${esc(eyebrow)}</span><span class="feature_index" aria-hidden="true">${destination.index}</span></p>
    <div class="feature_grid">
      <figure class="feature_figure" data-reveal-media>
        ${picture({ image, alt: image.alt, sizes: '(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 40vw, 560px' })}
      </figure>
      <div class="feature_copy">
        <h2 class="section-display feature_heading" id="${titleId}" data-reveal-words>${esc(heading)}</h2>
        <p class="lead feature_body" data-reveal>${esc(body)}</p>
        <div class="feature_data" data-reveal>
          ${statList(stats, `${destination.fullName} in numbers`)}
        </div>
        <div class="feature_action" data-reveal>
          <a class="primary-button feature_link" href="${destination.url}" ${externalLink}>${esc(cta)} ${arrow}</a>
          <span class="feature_location">${esc(destination.location)}</span>
        </div>
      </div>
    </div>
  </div>
</section>`;
};
