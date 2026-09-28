/*
 * Renders the V3 homepage chapters into index.html at build time (see vite.config.ts).
 * Order follows the story map: Dubai → brand → destinations → approach → ecosystem.
 */
import { renderH01, renderH02, renderH03, renderH04 } from './opening';
import { renderFeatured } from './featured';
import { renderH11, renderH13, renderH14 } from './ecosystem';

export const renderHomepage = () => [
  renderH01(),
  renderH02(),
  renderH03(),
  renderH04(),
  renderFeatured(),
  renderH11(),
  renderH13(),
  renderH14()
].join('\n');
