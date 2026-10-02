import { defineConfig, type Plugin } from 'vite';
import { renderHomepage } from './src/sections/index';
import { renderNextVenue, renderVenueSections } from './src/sections/venue';
import { renderSiteChrome } from './src/components/site-chrome-markup';
import { setBase } from './src/components/markup';

/**
 * Renders each page's sections from src/content into its HTML, so every heading, stat and
 * link is static, crawlable HTML while copy and cue data stay in structured TypeScript files.
 * Vite restarts the dev server when the config or anything it imports changes, so edits to
 * content or section templates show up on reload.
 *
 *   <!-- site:chrome [venue-id] -->     header, menu and contact drawer (every page)
 *   <!-- homepage:sections -->          H01–H14
 *   <!-- venue:sections <venue-id> -->  venue hero and scrub sections
 *   <!-- venue:next <venue-id> -->      next-venue footer
 */
const pageSections = (): Plugin => ({
  name: 'gulfalts-page-sections',
  configResolved: config => setBase(config.base),
  transformIndexHtml: {
    order: 'pre',
    handler: html => html
      .replace(/<!-- site:chrome(?: ([a-z-]+))? -->/, (_, venue?: string) => renderSiteChrome(venue))
      .replace('<!-- homepage:sections -->', () => renderHomepage())
      .replace(/<!-- venue:sections ([a-z-]+) -->/, (_, venue: string) => renderVenueSections(venue))
      .replace(/<!-- venue:next ([a-z-]+) -->/, (_, venue: string) => renderNextVenue(venue))
  }
});

export default defineConfig({
  plugins: [pageSections()],
  build: {
    assetsInlineLimit: 0,
    // mapbox-gl is one ~1.9 MB chunk, loaded on demand by the H13 location map only.
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      // One entry per page, relative to the project root (v3/).
      input: {
        main: 'index.html',
        'dubai-creative-park': 'dubai-creative-park/index.html',
        'fintech-district': 'fintech-district/index.html'
      }
    }
  }
});
