/*
 * Renders an inner page (content/inner-page.ts) into its HTML at build time (see vite.config.ts):
 * Dubai Fintech District and Dubai Creative Park. Same chapter shells and runtime as the homepage:
 * scrub chapters are driven by ChapterTrack, `[data-show]` windows by story progress (src/lib/scroll-scrub.ts).
 */
import type { InnerPage } from '../content/inner-page';
import { destinationById, destinations } from '../content/destinations';
import { driveTime } from '../content/drive-times';
import { keyLocations } from '../content/location-map';
import { scrubChapter } from '../components/chapter';
import { arrow, chapterKeyframes, chapterMedia, esc, linkAttrs, pad, page, show } from '../components/markup';
import { picture } from '../components/responsive-image';

const trackStyle = (track: { desktop: number; mobile: number }) =>
  `style="--track:${track.desktop};--track-mobile:${track.mobile}"`;

/** Story progress of a cue inside the video span (cues are measured on the video alone). */
const storyAt = (at: number, [from, to]: [number, number]) => Number((from + at * (to - from)).toFixed(4));

// ---------------------------------------------------------------------------
// Arrival: the flight in, then the frame shrinks into a card on the canvas (template hero).
// ---------------------------------------------------------------------------
const renderArrival = (content: InnerPage) => {
  const { copy, cues } = content.arrival;
  return scrubChapter({
    chapter: content.arrival,
    className: 'inner-hero',
    labelledBy: `${content.arrival.id}-title`,
    scrim: 'bottom',
    steps: content.arrival.steps,
    overlay: `
      <div class="inner-hero_intro" ${show(0, 0.07)}>
        <p class="chapter_eyebrow${copy.eyebrowLarge ? ' is-large' : ''}">${esc(copy.eyebrow)}</p>
        <h1 class="hero-display inner-hero_title" id="${content.arrival.id}-title">${esc(copy.title)}</h1>
      </div>
      <p class="inner-hero_cue" ${show(0, 0.04)} aria-hidden="true">${esc(copy.enter)} <span>↓</span></p>
      <div class="inner-hero_places" aria-hidden="true">
        ${cues.filter(cue => cue.copy).map(cue => `<p class="inner-hero_place" data-cue="${cue.id}">${esc(cue.copy!)}</p>`).join('')}
      </div>`
  }).replace('class="chapter_component', 'data-light-stage class="chapter_component');
};

// ---------------------------------------------------------------------------
// Intro: the description fills in word by word as it scrolls through, then the figures.
// ---------------------------------------------------------------------------
const renderIntro = (content: InnerPage) => {
  const { id, copy } = content.intro;
  return `
<section class="chapter_component is-static inner-intro" id="${id}" data-chapter="${id}" data-media="static" aria-labelledby="${id}-title">
  <div class="inner-intro_inner">
    <p class="chapter_eyebrow" id="${id}-title" data-reveal>${esc(copy.eyebrow)}</p>
    <p class="inner-intro_body" data-fill-text>${esc(copy.body)}</p>
    <dl class="inner-intro_stats" aria-label="${esc(destinationById(content.venue).fullName)} in numbers">
      ${copy.stats.map(stat => `
      <div class="inner-intro_stat" data-reveal>
        <dt class="visually-hidden">${esc(stat.label)}</dt>
        <dd><strong data-count>${esc(stat.value)}</strong><span>${esc(stat.label)}</span>${stat.detail ? `<small>${esc(stat.detail).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</small>` : ''}</dd>
      </div>`).join('')}
    </dl>
  </div>
</section>`;
};

// ---------------------------------------------------------------------------
// Work · Eat · Train · Unwind: one word at a time, its pictures wiping up over the previous.
// ---------------------------------------------------------------------------
const renderEveryday = (content: InnerPage) => {
  const { id, copy, track } = content.everyday;
  const count = copy.items.length;
  const slot = (index: number) => show(Number((index / count).toFixed(4)), Number(((index + 1) / count).toFixed(4)));
  // Pictures stay once shown, so scrolling back uncovers the previous one (never the background).
  const from = (index: number) => show(Number((index / count).toFixed(4)), 1);
  return `
<section class="chapter_component is-static inner-everyday" id="${id}" data-chapter="${id}" data-media="static" aria-labelledby="${id}-title">
  <div class="chapter_track" ${trackStyle(track)}>
    <div class="chapter_sticky">
      <div class="chapter_overlay inner-everyday_stage">
        <p class="chapter_eyebrow inner-everyday_eyebrow">${esc(copy.eyebrow)}</p>
        <h2 class="visually-hidden" id="${id}-title">${esc(copy.heading)}</h2>
        <ol class="inner-everyday_words">
          ${copy.items.map((item, index) => `
          <li class="inner-everyday_word" ${slot(index)}><span class="inner-everyday_index">${pad(index + 1)}</span>${esc(item.word)}</li>`).join('')}
        </ol>
        <div class="inner-everyday_bodies">
          ${copy.items.map((item, index) => `<p class="inner-everyday_body" ${slot(index)}>${esc(item.body)}</p>`).join('')}
        </div>
        <div class="inner-everyday_main">
          ${copy.items.map((item, index) => `
          <figure class="inner-everyday_figure" ${from(index)}>
            ${picture({ image: item.main, alt: item.main.alt, sizes: '(max-width: 767px) 92vw, 34vw' })}
          </figure>`).join('')}
        </div>
        <div class="inner-everyday_detail">
          ${copy.items.map((item, index) => `
          <figure class="inner-everyday_figure" ${from(index)}>
            ${picture({ image: item.detail, alt: item.detail.alt, sizes: '18vw' })}
          </figure>`).join('')}
        </div>
        <div class="inner-everyday_progress" aria-hidden="true"><span></span></div>
      </div>
    </div>
  </div>
</section>`;
};

// ---------------------------------------------------------------------------
// Transformation: the template's scale grid zooms into the video tile; the stages of the
// document's sequence light up as the footage reaches them; "Building is only the beginning."
// ---------------------------------------------------------------------------
const renderTransformation = (content: InnerPage) => {
  const chapter = content.transformation;
  const { copy, cues, videoSpan, zoom } = chapter;
  const span = videoSpan as [number, number];
  const tiles = content.grid.map(tile => `
          <div class="inner-grid_item">${picture({ image: tile, alt: tile.alt, sizes: '34vw' })}</div>`);
  // The video is the third tile: the one the grid zooms into.
  tiles.splice(2, 0, `
          <div class="inner-grid_item is-ref" data-scale-ref>${chapterMedia(chapter.media, { kind: 'scrub', scrim: 'soft' })}</div>`);
  return `
<section class="chapter_component is-scrub inner-transform" id="${chapter.id}" data-chapter="${chapter.id}" data-media="scrub"
  data-scrub-duration="${chapter.duration}" data-scrub-ready="false" data-state="idle" data-reduced-motion="fallback"
  data-zoom="${zoom.join('-')}" style="--fallback:url('${content.fallbacks.transformation}')" aria-labelledby="${chapter.id}-title">
  <div class="chapter_track" ${trackStyle(chapter.track)}>
    <div class="chapter_sticky">
      <div class="inner-grid" data-scale-grid>
        <div class="inner-grid_content" data-scale-content>${tiles.join('')}
        </div>
      </div>
      <div class="inner-transform_shade" aria-hidden="true"></div>
      <div class="chapter_overlay">
        <div class="inner-transform_intro" ${show(0, 0.03)}>
          <p class="chapter_eyebrow">${esc(copy.eyebrow)}</p>
          <h2 class="section-display" id="${chapter.id}-title">${esc(copy.heading)}</h2>
        </div>
        <ol class="inner-transform_stages" ${show(span[0], span[1])}>
          ${cues.map((cue, index) => `
          <li class="inner-transform_stage" ${show(storyAt(cue.at, span), 1)} data-cue-mark="${cue.id}">
            <span class="inner-transform_index">${pad(index + 1)}</span>${esc(cue.copy!)}
          </li>`).join('')}
        </ol>
        <p class="inner-transform_statement section-display" ${show(Number((span[1] + 0.015).toFixed(3)), 1)}>${esc(copy.statement)}</p>
      </div>
    </div>
  </div>
  ${chapterKeyframes(copy.heading, cues)}
</section>`;
};

// ---------------------------------------------------------------------------
// Spaces: the loft types, an editorial grid (template "portfolio").
// ---------------------------------------------------------------------------
const renderSpaces = (content: InnerPage) => {
  const { id, copy } = content.spaces;
  return `
<section class="chapter_component is-static inner-spaces" id="${id}" data-chapter="${id}" data-media="static" aria-labelledby="${id}-title">
  <div class="inner-spaces_inner">
    <header class="inner-spaces_head">
      <p class="chapter_eyebrow" data-reveal>${esc(copy.eyebrow)}</p>
      <h2 class="section-display" id="${id}-title" data-reveal-words>${esc(copy.heading)}</h2>
    </header>
    <ul class="inner-spaces_grid">
      ${copy.items.map(item => `
      <li class="inner-spaces_card">
        <figure class="inner-spaces_figure" data-reveal-media>
          ${picture({ image: item.image, alt: item.image.alt, sizes: '(max-width: 767px) 92vw, 24vw' })}
        </figure>
        <h3 class="inner-spaces_name" data-reveal>${esc(item.name)}</h3>
        <p class="inner-spaces_meta" data-reveal>${esc(item.meta)}</p>
      </li>`).join('')}
    </ul>
  </div>
</section>`;
};

// ---------------------------------------------------------------------------
// Location: Mapbox route mode. Rows are the accessible control; the map mirrors them.
// ---------------------------------------------------------------------------
const renderLocation = (content: InnerPage) => {
  const { id, copy, track, steps, anchorProgress, dark } = content.location;
  const venueName = destinationById(content.venue).fullName;
  const stepsAttr = Object.entries(steps).map(([name, at]) => `${name}:${at}`).join(' ');
  // Over a dark backdrop the section and the map are light stages (site-chrome initHeaderTone):
  // light while the card sits on the canvas or the map shows, dark once the photo fills the screen.
  const lightStage = dark ? ' data-light-stage' : '';
  // Pinned: the map arrives as a card under the heading and, once the stage reaches the top,
  // opens to full screen by itself (`expand` step, a timed transition that reverses on the way up).
  return `
<section class="chapter_component is-static inner-location" id="${id}" data-chapter="${id}" data-media="static"${lightStage}
  data-steps="${stepsAttr}" data-anchor-progress="${anchorProgress}"
  style="--fallback:url('${content.fallbacks.location}')" aria-labelledby="${id}-title">
  <div class="chapter_track" ${trackStyle(track)}>
  <div class="chapter_sticky inner-location_stage">
  <header class="inner-location_head">
    <p class="chapter_eyebrow">${esc(copy.eyebrow)}</p>
    <h2 class="section-display" id="${id}-title">${esc(copy.heading)}</h2>
  </header>
  <div class="inner-location_frame">
    <div class="h13_map"${lightStage} data-location-map data-origin="${content.venue}">
      <div class="h13_map-canvas" role="img" aria-label="Map of Dubai with ${esc(venueName)} in Al Quoz and the drive to the selected destination"></div>
    </div>
    <div class="inner-location_overlay">
      <div class="inner-location_panel" data-map-panel>
        <p class="inner-location_body">${esc(copy.body)}</p>
        <div class="route_list" role="group" aria-label="Drive from ${esc(venueName)}">
          ${copy.routes.map(place => `
          <button type="button" class="route_row" data-route="${place}" aria-pressed="false">
            <span class="route_row-place">${esc(keyLocations[place].name)}</span>
            <span class="route_row-time">${esc(driveTime(content.venue, place))}</span>
          </button>`).join('')}
        </div>
        <p class="inner-location_note">${esc(copy.note)}</p>
        <p class="visually-hidden" data-route-status aria-live="polite"></p>
      </div>
    </div>
  </div>
  </div>
  </div>
</section>`;
};

// ---------------------------------------------------------------------------
// Next destination (homepage H14 pattern) and the inquiry.
// ---------------------------------------------------------------------------
const renderNext = (content: InnerPage) => {
  const { id, copy } = content.next;
  const all = page('#h13-dubai-pull-out');
  return `
<section class="chapter_component is-static h14 inner-next" id="${id}" data-chapter="${id}" data-media="static" aria-labelledby="${id}-title">
  <div class="h14_inner">
    <h2 class="section-display h14_heading" id="${id}-title" data-reveal-words>${esc(copy.heading)}</h2>
    <ul class="h14_links">
      ${copy.links.map(link => {
        const destination = destinationById(link.destination);
        return `
      <li data-reveal>
        <a class="h14_link" ${linkAttrs(destination.url)}>
          <span class="h14_index">${destination.index}</span>
          <span class="h14_label">${esc(link.label)}</span>
          <span class="h14_meta">${esc(destination.location)}</span>
          ${arrow}
        </a>
      </li>`;
      }).join('')}
      <li data-reveal>
        <a class="h14_link" href="${all}">
          <span class="h14_index" aria-hidden="true"></span>
          <span class="h14_label">${esc(copy.all)}</span>
          <span class="h14_meta">${pad(destinations.length)} destinations · Dubai</span>
          ${arrow}
        </a>
      </li>
    </ul>
    <div class="inner-next_action" data-reveal>
      <button type="button" class="primary-button" data-contact-open aria-haspopup="dialog" aria-controls="contact-dialog">${esc(copy.inquire)} ${arrow}</button>
    </div>
  </div>
</section>`;
};

export const renderInnerPage = (content: InnerPage) => [
  renderArrival(content),
  renderIntro(content),
  renderEveryday(content),
  renderTransformation(content),
  renderSpaces(content),
  renderLocation(content),
  renderNext(content)
].join('\n');
