/*
 * Closing act: H11 Our approach (raw space to living destination) →
 * H13 Dubai Pull Out, the location map and Our Destinations → H14 Next Destination.
 * V3 drops H12: its four words (architecture, operators, experiences, community) are H11's layers.
 */
import { h11, h13, h14 } from '../content/homepage';
import { allDestinationsUrl, destinationById, destinations } from '../content/destinations';
import { scrubChapter } from '../components/chapter';
import { arrow, chapterKeyframes, esc, externalLink, pad, show } from '../components/markup';
import type { Destination } from '../content/types';

export const renderH11 = () => {
  const [raw, curate, ...layers] = h11.cues;
  return scrubChapter({
    chapter: h11,
    className: 'h11',
    labelledBy: 'h11-title',
    scrim: 'left',
    overlay: `
      <p class="chapter_eyebrow h11_eyebrow">${esc(h11.copy.eyebrow)}</p>
      <h2 class="visually-hidden" id="h11-title">${esc(h11.copy.heading)}</h2>
      <div class="h11_statements">
        <p class="h11_statement" data-cue="${raw.id}">${esc(raw.copy!)}</p>
        <p class="h11_statement" data-cue="${curate.id}">${esc(curate.copy!)}</p>
      </div>
      <ol class="h11_layers">
        ${layers.map((cue, index) => `
        <li class="h11_layer" ${show(cue.at)} data-cue-mark="${cue.id}">
          <span class="h11_layer-index">${pad(index + 1)}</span>${esc(cue.copy!)}
        </li>`).join('')}
      </ol>`,
    after: chapterKeyframes(h11.copy.heading, h11.cues)
  });
};

/**
 * Hover / focus card on an H13 map marker: the dot opens into a photo of the venue, with its name
 * and drive times beside it. It lives inside the marker link, so moving onto it keeps it open.
 */
const markerCard = (destination: Destination) => `
            <span class="marker_card" id="marker-card-${destination.id}">
              <span class="marker_card-thumb" aria-hidden="true">${destination.preview ? `<img src="${destination.preview}" alt="" width="320" height="180" loading="lazy" decoding="async" />` : ''}</span>
              <span class="marker_card-panel">
                <span class="marker_card-name" aria-hidden="true">${esc(destination.fullName)}</span>
                <span class="marker_card-times">
                  ${destination.commute.map(time => `
                  <span class="marker_card-time"><span class="marker_card-place">${esc(time.place)}</span> <span class="marker_card-minutes">${time.minutes} minutes</span></span>`).join('')}
                  <span class="marker_card-flag" title="Estimated drive times, Mapbox Directions (typical traffic)">Mapbox estimate</span>
                </span>
              </span>
            </span>`;

/*
 * H13: the outro pulls out from Al Quoz to the Dubai map; on its last frame the live Mapbox map
 * (components/location-map.ts) dissolves in at the `map` step and holds with the directory.
 * The venue markers ship here as static HTML (hidden) and are handed to Mapbox once the map
 * loads; if it never does, the directory alone still lists every destination.
 */
export const renderH13 = () => {
  const [, alQuoz, dubai] = h13.cues;
  const hold = h13.videoSpan[1];
  return scrubChapter({
    chapter: h13,
    className: 'h13',
    labelledBy: 'h13-title',
    scrim: 'soft',
    // map-near: start loading Mapbox while the pull-out plays; map: dissolve it in.
    steps: { 'map-near': 0.25, map: hold },
    stage: `
      <div class="h13_map" data-location-map data-light-stage>
        <div class="h13_map-canvas" role="img" aria-label="Map of Dubai showing the four Gulfalts destinations in Al Quoz"></div>
        <div class="h13_markers" hidden data-map-markers>
          ${destinations.map(destination => `
          <div class="chapter_marker" data-destination="${destination.id}">
            <a href="${destination.url}" ${externalLink} aria-label="${esc(destination.fullName)}" aria-describedby="marker-card-${destination.id}">
              <span class="chapter_marker-dot" aria-hidden="true"></span>
              <span class="chapter_marker-leader" aria-hidden="true"></span>
              <span class="chapter_marker-label"><span aria-hidden="true">${destination.index}</span> ${esc(destination.name)}</span>
              ${markerCard(destination)}
            </a>
          </div>`).join('')}
        </div>
      </div>`,
    overlay: `
      <div class="h13_places" aria-hidden="true" ${show(0, hold - 0.02)}>
        <p class="h13_place" data-cue="${alQuoz.id}">${esc(alQuoz.label)}</p>
        <p class="h13_place" data-cue="${dubai.id}">${esc(dubai.label)}</p>
      </div>
      <div class="h13_directory" ${show(hold + 0.02)} data-map-panel>
        <p class="chapter_eyebrow">${esc(h13.copy.eyebrow)}</p>
        <h2 class="feature-heading h13_heading" id="h13-title">${esc(h13.copy.heading)}</h2>
        <ol class="destination_directory">
          ${destinations.map(destination => `
          <li>
            <a class="destination_row" href="${destination.url}" ${externalLink} data-destination="${destination.id}">
              <span class="destination_row-index">${destination.index}</span>
              <span class="destination_row-name">${esc(destination.name)}</span>
              <span class="destination_row-tags${destination.tagsConfirmed ? '' : ' is-pending'}">${esc(destination.tags)}</span>
              ${arrow}
            </a>
          </li>`).join('')}
        </ol>
        <div class="h13_foot">
          <a class="text-link" href="${allDestinationsUrl}" ${externalLink}>${esc(h13.copy.cta)} ${arrow}</a>
          <figure class="h13_preview" aria-hidden="true">
            ${destinations.filter(destination => destination.preview).map(destination => `
            <img src="${destination.preview}" alt="" width="1600" height="900" loading="lazy" decoding="async" data-preview="${destination.id}" />`).join('')}
          </figure>
        </div>
      </div>`
  });
};

export const renderH14 = () => `
<section class="chapter_component is-static h14" id="${h14.id}" data-chapter="${h14.id}" data-media="static" aria-labelledby="h14-title">
  <div class="h14_inner">
  <h2 class="section-display h14_heading" id="h14-title" data-reveal-words>${esc(h14.copy.heading)}</h2>
  <ul class="h14_links">
    ${h14.copy.links.map((link, index) => {
      const destination = link.destination === 'all' ? null : destinationById(link.destination);
      const href = destination ? destination.url : allDestinationsUrl;
      const meta = destination ? destination.location : `${pad(destinations.length)} destinations · Dubai`;
      return `
    <li data-reveal>
      <a class="h14_link" href="${href}" ${externalLink}>
        <span class="h14_index">${pad(index + 1)}</span>
        <span class="h14_label">${esc(link.label)}</span>
        <span class="h14_meta">${esc(meta)}</span>
        ${arrow}
      </a>
    </li>`;
    }).join('')}
  </ul>
  </div>
</section>`;
