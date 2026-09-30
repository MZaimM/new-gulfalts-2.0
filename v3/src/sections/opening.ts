/*
 * Opening act: H01 Intro → H02 Dubai Arrival → H04 Brand Manifesto (The firm).
 * H03 (brand spectrum) was removed; it is kept as a standalone file in backups/brand-spectrum.
 */
import { h01, h02, h04 } from '../content/homepage';
import { autoplayChapter, scrubChapter } from '../components/chapter';
import { logoIntroSvg } from '../components/logo';
import { esc, show } from '../components/markup';

/**
 * H01 sits on H02's opening frame and scrim, so when H02 dissolves in on top there is nothing
 * to see change. The shade keeps the white logo legible over the bright clouds and leaves
 * with it. This frame is the first image on the page (the LCP), so it loads eagerly.
 */
const h01Stage = () => `
    <div class="chapter_media-wrap" aria-hidden="true">
      <picture class="h01_next-frame">
        <source media="(max-width: 767px)" srcset="${h02.media.posterMobile}" width="608" height="1080" />
        <img src="${h02.media.posterDesktop}" alt="" width="1920" height="1080" fetchpriority="high" decoding="async" />
      </picture>
      <div class="chapter_scrim is-left"></div>
      <div class="h01_next-shade"></div>
    </div>`;

export const renderH01 = () => `
<section class="chapter_component is-intro h01" id="${h01.id}" data-chapter="${h01.id}" data-media="intro"
  data-steps="${Object.entries(h01.steps).map(([name, at]) => `${name}:${at}`).join(' ')}" aria-labelledby="h01-title">
  <div class="chapter_track" style="--track:${h01.track.desktop};--track-mobile:${h01.track.mobile}">
    <div class="chapter_sticky">
      ${h01Stage()}
      <div class="chapter_overlay">
        <h1 class="h01_title" id="h01-title">
          ${logoIntroSvg('h01_logo')}
          <span class="h01_positioning">${esc(h01.copy.positioning)}</span>
        </h1>
        <p class="h01_cue"><a class="h01_enter" href="#${h02.id}">${esc(h01.copy.enter)} <span aria-hidden="true">↓</span></a></p>
      </div>
    </div>
  </div>
</section>`;

export const renderH02 = () => {
  const path = h02.cues.slice(0, -1);
  const final = h02.cues[h02.cues.length - 1];
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
      <p class="h02_caption" ${show(final.at)}>${esc(final.label)}</p>`
  });
};

export const renderH04 = () => autoplayChapter({
  chapter: h04,
  className: 'h04',
  labelledBy: 'h04-title',
  scrim: 'focus',
  id: 'the-firm',
  content: `
    <div class="h04_copy">
      <p class="chapter_eyebrow">${esc(h04.copy.eyebrow)}</p>
      <h2 class="chapter_heading h04_heading" id="h04-title">${esc(h04.copy.heading)}</h2>
      <p class="h04_lead">${esc(h04.copy.lead)}</p>
      <p class="chapter_body h04_body">${esc(h04.copy.body)}</p>
    </div>`
});
