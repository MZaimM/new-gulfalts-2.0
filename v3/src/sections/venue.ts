/*
 * Renders a venue page into its HTML shell at build time (see vite.config.ts):
 * hero → our approach → tour into `<!-- venue:sections <id> -->`, and the next-venue footer
 * into `<!-- venue:next <id> -->`. Behaviour lives in venue.ts.
 */
import { destinationById } from '../content/destinations';
import { venueById } from '../content/venues';
import type { DestinationStat, MediaSources, TimedCopy, Venue, VenueApproach, VenueTour } from '../content/types';
import { esc, href, pad } from '../components/markup';

const dot = ' <span aria-hidden="true">·</span> ';

/** `data-from` / `data-to` in video seconds; `to` left off keeps the line on screen. */
const timed = ({ from, to }: Pick<TimedCopy, 'from' | 'to'>) =>
  `data-from="${from}"${to === undefined ? '' : ` data-to="${to}"`}`;

const poster = (media: MediaSources, eager = false) => `
          <picture>
            <source media="(max-width: 767px)" srcset="${media.posterMobile}" width="608" height="1080" />
            <img src="${media.posterDesktop}" alt="" width="1920" height="1080" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />
          </picture>`;

/** The video carries no src: the runtime picks the desktop or mobile file when it comes near. */
const deferredVideo = (media: MediaSources, className: string, loop = false) => `
          <video class="${className}" muted ${loop ? 'loop ' : ''}playsinline preload="none" disablepictureinpicture disableremoteplayback tabindex="-1"
            data-src-desktop="${media.desktop}" data-src-mobile="${media.mobile}"></video>`;

const heroStat = (stat: DestinationStat) => `
            <div class="hero_stat">
              <dt>${esc(stat.label)}</dt>
              <dd>${esc(stat.value)}${stat.unit ? ` <span>${esc(stat.unit)}</span>` : ''}${stat.status === 'unconfirmed' ? ` <span class="hero_stat-flag" title="${esc(stat.note ?? 'Pending client confirmation')}">To be confirmed</span>` : ''}</dd>
            </div>`;

const renderHero = ({ hero }: Venue) => `
    <section class="hero" id="hero" aria-labelledby="hero-heading"${hero.handoff ? ' data-venue-handoff' : ''}>
      <div class="hero_media" aria-hidden="true">${poster(hero.media, true)}
        <!-- Ambient background: the hero video autoplays (sources in the HTML), always muted and looping. -->
        <video class="hero_video" autoplay muted loop playsinline preload="auto" disablepictureinpicture disableremoteplayback tabindex="-1">
          <source media="(max-width: 767px)" src="${hero.media.mobile}" type="video/mp4" />
          <source src="${hero.media.desktop}" type="video/mp4" />
        </video>
        <div class="hero_shade"></div>
        <div class="hero_scrim"></div>
      </div>

      <div class="hero_overlay">
        <div class="hero_content">
          <p class="hero_eyebrow">${hero.eyebrow.map(esc).join(dot)}</p>
          <h1 class="hero_heading" id="hero-heading">${esc(hero.heading)}</h1>
          <p class="hero_lead">${esc(hero.lead)}</p>
          <dl class="hero_stats">${hero.stats.map(heroStat).join('')}
          </dl>
        </div>${hero.enter ? `
        <p class="hero_cue"><a class="hero_enter" href="#${hero.enter.target}">${esc(hero.enter.label)} <span aria-hidden="true">↓</span></a></p>` : ''}
      </div>
    </section>`;

/** Shell shared by the scrub sections: a tall track with a sticky stage of video and overlay. */
const scrubSection = (section: VenueApproach | VenueTour, className: string, name: string, overlay: string) => `
    <section class="scrub ${className}" id="${section.id}" aria-labelledby="${section.id}-title"
      data-scrub="${esc(name)}" data-duration="${section.duration}" style="--track: ${section.track.desktop}; --track-mobile: ${section.track.mobile}">
      <div class="scrub_track">
        <div class="scrub_sticky">
          <div class="scrub_media" aria-hidden="true">${poster(section.media)}${deferredVideo(section.media, 'scrub_video')}
            <div class="scrub_scrim"></div>
          </div>
          <div class="scrub_overlay">
            <h2 class="visually-hidden" id="${section.id}-title">${esc(section.title)}</h2>${overlay}
          </div>
        </div>
      </div>
    </section>`;

const renderApproach = (approach: VenueApproach) => scrubSection(approach, 'approach', 'Our approach', `
            <div class="approach_statements">${approach.statements.map(line => `
              <p class="approach_statement" ${timed(line)}>${esc(line.text)}</p>`).join('')}
            </div>
            <p class="approach_for">
              <span class="approach_for-fixed" ${timed(approach.roll)}>${esc(approach.roll.lead)}</span>
              <span class="approach_for-words">${approach.roll.words.map(word => `
                <span class="approach_for-word" ${timed(word)}>${esc(word.text)}</span>`).join('')}
              </span>
            </p>`);

const renderTour = (tour: VenueTour, venueName: string) => scrubSection(tour, 'tour', `${venueName} tour`, `
            <div class="tour_progress" aria-hidden="true"><span></span></div>

            <div class="tour_stops">${tour.stops.map((stop, index) => `
              <div class="tour_stop" ${timed(stop)}>
                <p class="tour_label"><span class="tour_index">${pad(index + 1)}</span>${esc(stop.label)}</p>
                <p class="tour_line">${esc(stop.line)}</p>
              </div>${stop.walk ? `
              <p class="tour_walk" ${timed(stop.walk)} aria-hidden="true">${esc(stop.walk.text)}</p>` : ''}`).join('')}
            </div>

            <div class="tour_finale" ${timed(tour.finale)}>
              <p class="tour_finale-line">${esc(tour.finale.line)}</p>
              <div class="tour_actions">${tour.finale.actions.map(action => action.primary ? `
                <a class="button" href="${href(action.href)}">${esc(action.label)}</a>` : `
                <a class="tour_link" href="${href(action.href)}">${esc(action.label)} <span aria-hidden="true">→</span></a>`).join('')}
              </div>
            </div>`);

export const renderVenueSections = (id: string) => {
  const venue = venueById(id);
  const name = destinationById(id).fullName;
  return [
    renderHero(venue),
    venue.approach ? renderApproach(venue.approach) : '',
    venue.tour ? renderTour(venue.tour, name) : ''
  ].join('\n');
};

/*
 * Next-venue footer. The page lifts off it, then scrolling further fills the ring clockwise.
 * Past 51% (on release) or at 100%, it plays out and hands over to the next venue's page.
 * The spacer's height (footer + pull distance) is set by components/next-venue.ts.
 */
export const renderNextVenue = (id: string) => {
  const { next } = venueById(id);
  if (!next) return '';
  const destination = destinationById(next.destination);
  return `
  <div class="next-venue-spacer" aria-hidden="true"></div>
  <footer class="next-venue" id="site-footer" aria-label="Next destination">
    <div class="next-venue_media" aria-hidden="true">${poster(next.media)}${deferredVideo(next.media, 'next-venue_video', true)}
      <div class="next-venue_shade"></div>
      <div class="next-venue_scrim"></div>
    </div>

    <a class="next-venue_ring" href="${href(destination.url)}" data-next-venue>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle class="next-venue_track" cx="100" cy="100" r="99" />
        <circle class="next-venue_progress" cx="100" cy="100" r="99" pathLength="1" />
      </svg>
      <span class="next-venue_kicker" data-reduced-text="${esc(next.reducedKicker)}">${esc(next.kicker)}</span>
      <span class="next-venue_name">${esc(destination.fullName)}</span>
    </a>

    <div class="next-venue_bottom">
      <span>Next destination · ${destination.index}</span>
      <span>© 2026 Gulf Alternatives. All rights reserved.</span>
    </div>
  </footer>`;
};
