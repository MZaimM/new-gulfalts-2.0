/*
 * Build-time shells for the three chapter types. Sections pass their own overlay markup in.
 */
import type { AutoplayChapter, ScrubChapter } from '../content/types';
import { chapterMedia } from './markup';

type Scrim = 'even' | 'bottom' | 'left' | 'soft' | 'focus' | 'deep';

const trackStyle = (track: { desktop: number; mobile: number }) =>
  `style="--track:${track.desktop};--track-mobile:${track.mobile}"`;

interface ScrubShell {
  chapter: ScrubChapter;
  className: string;
  labelledBy: string;
  overlay: string;
  after?: string;
  scrim?: Scrim;
}

export const scrubChapter = ({ chapter, className, labelledBy, overlay, after = '', scrim = 'even' }: ScrubShell) => `
<section class="chapter_component is-scrub ${className}${chapter.joinPrevious ? ' is-joined' : ''}" id="${chapter.id}"
  data-chapter="${chapter.id}" data-media="scrub" data-scrub-duration="${chapter.duration}"${chapter.anchorProgress ? ` data-anchor-progress="${chapter.anchorProgress}"` : ''}
  data-scrub-ready="false" data-state="idle" data-reduced-motion="fallback" aria-labelledby="${labelledBy}">
  <div class="chapter_track" ${trackStyle(chapter.track)}>
    <div class="chapter_sticky">
      ${chapterMedia(chapter.media, { kind: 'scrub', scrim })}
      <div class="chapter_overlay">${overlay}</div>
    </div>
  </div>
  ${after}
</section>`;

interface AutoplayShell {
  chapter: AutoplayChapter;
  className: string;
  labelledBy: string;
  content: string;
  eager?: boolean;
  scrim?: Scrim;
  id?: string;
  underlay?: string;
  /** Scroll-triggered steps, as story progress thresholds (see ChapterTrack). */
  steps?: Record<string, number>;
}

export const autoplayChapter = ({ chapter, className, labelledBy, content, eager = false, scrim = 'even', id = chapter.id, underlay, steps }: AutoplayShell) => {
  const media = chapterMedia(chapter.media, { kind: 'autoplay', eager, loop: chapter.loop, scrim, underlay });
  const stepAttr = steps ? ` data-steps="${Object.entries(steps).map(([name, at]) => `${name}:${at}`).join(' ')}"` : '';
  const body = chapter.track
    ? `<div class="chapter_track" ${trackStyle(chapter.track)}>
        <div class="chapter_sticky">${media}<div class="chapter_overlay">${content}</div></div>
      </div>`
    : `${media}<div class="chapter_content">${content}</div>`;
  return `
<section class="chapter_component is-autoplay ${className}${chapter.track ? ' has-track' : ''}${chapter.joinPrevious ? ' is-joined' : ''}${chapter.joinStyle === 'wipe' ? ' is-wipe' : ''}" id="${id}"
  data-chapter="${chapter.id}" data-media="autoplay" data-state="idle" data-reduced-motion="poster"${stepAttr} aria-labelledby="${labelledBy}">
  ${body}
</section>`;
};
