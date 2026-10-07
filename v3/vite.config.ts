import { defineConfig, type Plugin } from 'vite';
import { renderHomepage } from './src/sections/index';
import { renderNextVenue, renderVenueSections } from './src/sections/venue';
import { renderInnerPage } from './src/sections/inner-page';
import { fintechDistrictPage } from './src/content/fintech-district';
import { creativeParkPage } from './src/content/creative-park';
import type { InnerPage } from './src/content/inner-page';
import { renderSiteChrome } from './src/components/site-chrome-markup';
import { setBase } from './src/components/markup';

/**
 * Renders each page's sections from src/content into its HTML, so every heading, stat and
 * link is static, crawlable HTML while copy and cue data stay in structured TypeScript files.
 * Vite restarts the dev server when the config or anything it imports changes, so edits to
 * content or section templates show up on reload.
 *
 *   <!-- site:chrome [venue-id] -->      header, menu and contact drawer (every page)
 *   <!-- homepage:sections -->           H01–H14
 *   <!-- inner-page:sections <venue-id> --> inner page template (sections/inner-page.ts): DFD, DCP
 *   <!-- venue:sections <venue-id> -->   v1 venue hero and scrub sections (archive/dubai-creative-park-v1)
 *   <!-- venue:next <venue-id> -->       next-venue footer
 */
const innerPages: Record<string, InnerPage> = {
  'fintech-district': fintechDistrictPage,
  'creative-park': creativeParkPage
};

const pageSections = (): Plugin => ({
  name: 'gulfalts-page-sections',
  configResolved: config => setBase(config.base),
  transformIndexHtml: {
    order: 'pre',
    handler: html => html
      .replace(/<!-- site:chrome(?: ([a-z-]+))? -->/, (_, venue?: string) => renderSiteChrome(venue))
      .replace('<!-- homepage:sections -->', () => renderHomepage())
      .replace(/<!-- inner-page:sections ([a-z-]+) -->/, (_, venue: string) => renderInnerPage(innerPages[venue]))
      .replace(/<!-- venue:sections ([a-z-]+) -->/, (_, venue: string) => renderVenueSections(venue))
      .replace(/<!-- venue:next ([a-z-]+) -->/, (_, venue: string) => renderNextVenue(venue))
  }
});

export default defineConfig({
  plugins: [pageSections()],
  build: {
    assetsInlineLimit: 0,
    // mapbox-gl is one ~1.9 MB chunk, loaded on demand by the location maps only.
    chunkSizeWarningLimit: 2000
  },
  environments: {
    // The pages are entries of the client (browser) build only. Webflow Cloud wraps this config
    // with a Cloudflare worker environment that has its own entry (src/worker.ts); top-level
    // build.rollupOptions.input would leak into it and fail ("index.html cannot be external").
    client: {
      build: {
        rollupOptions: {
          // One entry per page, relative to the project root (v3/).
          input: {
            main: 'index.html',
            'dubai-creative-park': 'dubai-creative-park/index.html',
            'fintech-district': 'fintech-district/index.html',
            'archive-dubai-creative-park-v1': 'archive/dubai-creative-park-v1/index.html'
          }
        }
      }
    }
  }
});
