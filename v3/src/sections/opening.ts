/*
 * Opening act: H01 Brand Reveal → H02 Dubai Arrival → H03 Brand Spectrum → H04 Brand Manifesto.
 */
import { h01, h02, h03, h04 } from '../content/homepage';
import { destinationById } from '../content/destinations';
import { autoplayChapter, chapterHud, scrubChapter, sequenceChapter } from '../components/chapter';
import { logoSvg } from '../components/logo';
import { esc, show } from '../components/markup';

/**
 * H02's opening frame and scrim sit under the H01 aerial. Fading the aerial out reveals the exact
 * picture H02 starts on, so when H02 dissolves in on top there is nothing to see change.
 * The extra shade keeps the white logo legible over the bright clouds and leaves with it.
 */
const h01Underlay = () => `
    <div class="h01_next">
      <picture class="h01_next-frame">
        <source media="(max-width: 767px)" srcset="${h02.media.posterMobile}" width="608" height="1080" />
        <img src="${h02.media.posterDesktop}" alt="" width="1920" height="1080" fetchpriority="low" decoding="async" />
      </picture>
      <div class="chapter_scrim is-left"></div>
      <div class="h01_next-shade"></div>
    </div>`;

export const renderH01 = () => autoplayChapter({
  chapter: h01,
  className: 'h01',
  labelledBy: 'h01-title',
  eager: true,
  scrim: 'deep',
  underlay: h01Underlay(),
  steps: h01.steps,
  content: `
    <h1 class="h01_title" id="h01-title">
      ${logoSvg('h01_logo')}
      <span class="h01_positioning">${esc(h01.copy.positioning)}</span>
    </h1>
    <p class="h01_cue"><a class="h01_enter" href="#${h02.id}">${esc(h01.copy.enter)} <span aria-hidden="true">↓</span></a></p>`
});

export const renderH02 = () => {
  const path = h02.cues.slice(0, 3);
  const final = h02.cues[3];
  return scrubChapter({
    chapter: h02,
    className: 'h02',
    labelledBy: 'h02-title',
    scrim: 'left',
    overlay: `
      <h2 class="visually-hidden" id="h02-title">${esc(h02.copy.heading)}</h2>
      <ol class="h02_path" aria-hidden="true">
        ${path.map((cue, index) => `
        <li class="h02_place" style="--step:${index}" ${show(cue.at)} data-cue-mark="${cue.id}">
          ${index ? '<span class="h02_arrow">→</span>' : ''}${esc(cue.label)}
        </li>`).join('')}
      </ol>
      <ul class="chapter_markers h02_markers" ${show(final.at)} aria-label="${esc(final.label)}">
        ${h02.copy.markers.map(marker => `
        <li class="chapter_marker" data-x="${marker.x}" data-y="${marker.y}" data-x-mobile="${marker.xMobile}">
          <span class="chapter_marker-dot" aria-hidden="true"></span>
          <span class="chapter_marker-label">${esc(destinationById(marker.destination).name)}</span>
        </li>`).join('')}
      </ul>
      <p class="h02_caption" ${show(final.at)}>${esc(final.label)}</p>`
  });
};

export const renderH03 = () => sequenceChapter({
  chapter: h03,
  className: 'h03',
  labelledBy: 'h03-title',
  alts: h03.copy.alts,
  overlay: `
    <h2 class="visually-hidden" id="h03-title">${esc(h03.copy.heading)}</h2>
    <div class="h03_words" aria-hidden="true">
      ${h03.cues.map(cue => `<p class="h03_word" data-cue="${cue.id}">${esc(cue.copy!)}</p>`).join('')}
    </div>
    ${chapterHud('Gulfalts destinations', h03.cues)}`
});

export const renderH04 = () => autoplayChapter({
  chapter: h04,
  className: 'h04',
  labelledBy: 'h04-title',
  scrim: 'focus',
  id: 'the-firm',
  content: `
    <p class="chapter_eyebrow" data-reveal>${esc(h04.copy.eyebrow)}</p>
    <h2 class="chapter_heading h04_heading" id="h04-title" data-reveal-words>${esc(h04.copy.heading)}</h2>
    <p class="h04_lead" data-reveal>${esc(h04.copy.lead)}</p>
    <p class="chapter_body h04_body" data-reveal>${esc(h04.copy.body)}</p>`
});
