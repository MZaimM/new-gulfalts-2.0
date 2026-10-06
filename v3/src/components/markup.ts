/*
 * Shared, framework-free markup helpers. These run at build time (inside the Vite HTML
 * transform) so every heading, stat and link ships as crawlable static HTML.
 */
import type { ChapterCue, DestinationStat, MediaSources } from '../content/types';

export const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const pad = (value: number) => String(value).padStart(2, '0');

/** Visibility window on the chapter's scroll progress (0–1). */
export const show = (from: number, to = 1) => `data-show="${from}-${to}"`;

interface MediaOptions {
  kind: 'scrub' | 'autoplay';
  /** The hero poster is the LCP element and must not be lazy. */
  eager?: boolean;
  loop?: boolean;
  scrim?: 'even' | 'bottom' | 'left' | 'soft' | 'focus' | 'deep';
  /** Markup placed under the poster (H01 keeps H02's opening frame there). */
  underlay?: string;
}

/**
 * Poster first, video on top. The video carries no src in the HTML: the runtime picks the
 * desktop or mobile file when the chapter comes near, so nothing downloads early.
 */
export const chapterMedia = (media: MediaSources, { kind, eager = false, loop = false, scrim = 'even', underlay = '' }: MediaOptions) => `
  <div class="chapter_media-wrap" aria-hidden="true">${underlay}
    <picture class="chapter_poster">
      <source media="(max-width: 767px)" srcset="${media.posterMobile}" width="540" height="960" />
      <img src="${media.posterDesktop}" alt="" width="1280" height="720" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />
    </picture>
    <video class="chapter_video" muted playsinline ${loop ? 'loop' : ''} preload="none"
      disablepictureinpicture disableremoteplayback tabindex="-1"
      data-src-desktop="${media.desktop}" data-src-mobile="${media.mobile}" data-kind="${kind}"></video>
    <div class="chapter_scrim is-${scrim}"></div>
  </div>`;

/**
 * The same story as still frames: shown instead of the pinned scrub under reduced motion.
 */
export const chapterKeyframes = (title: string, cues: ChapterCue[]) => {
  const frames = cues.filter(cue => cue.still);
  if (!frames.length) return '';
  return `
  <ol class="chapter_keyframes" aria-label="${esc(title)} in stills">
    ${frames.map((cue, index) => `
    <li class="chapter_keyframe">
      <img src="${cue.still}" alt="" width="960" height="540" loading="lazy" decoding="async" />
      <p><span>${pad(index + 1)}</span>${esc(cue.copy ?? cue.label)}</p>
    </li>`).join('')}
  </ol>`;
};

export const arrow = '<span class="link-arrow" aria-hidden="true">→</span>';

export const statList = (stats: DestinationStat[], label: string) => {
  const pending = stats.some(stat => stat.status === 'unconfirmed');
  return `
  <dl class="destination_stats" aria-label="${esc(label)}">
    ${stats.map(stat => `
    <div class="destination_stat${stat.status === 'unconfirmed' ? ' is-unconfirmed' : ''}">
      <dt>${esc(stat.label)}</dt>
      <dd>
        <strong>${esc(stat.value)}</strong>${stat.unit ? `<span class="destination_stat-unit">${esc(stat.unit)}</span>` : ''}
        ${stat.status === 'unconfirmed' ? `<span class="destination_stat-flag" title="${esc(stat.note ?? 'Pending client confirmation')}">To be confirmed</span>` : ''}
      </dd>
    </div>`).join('')}
  </dl>
  ${pending ? '<p class="destination_stats-note">Figures marked “To be confirmed” are pending verification by Gulfalts and are not final.</p>' : ''}`;
};

export const externalLink = 'target="_blank" rel="noopener"';

/** gulfalts.com venue pages open in a new tab; pages of this site (e.g. /fintech-district/) do not. */
export const isExternal = (url: string) => /^https?:\/\//.test(url);
export const linkTarget = (url: string) => (isExternal(url) ? externalLink : '');
