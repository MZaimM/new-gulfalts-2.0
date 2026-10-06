import { defineConfig, type Plugin } from 'vite';
import { renderHomepage } from './src/sections/index';
import { renderFintechDistrict } from './src/sections/fintech-district';

/**
 * Renders each page's chapters from src/content into its HTML file, so every heading, stat and
 * link is static, crawlable HTML while copy and cue data stay in structured TypeScript files.
 * Vite restarts the dev server when the config or anything it imports changes, so edits to
 * content or section templates show up on reload.
 */
const pageSections = (): Plugin => {
  let base = '/';
  return {
    name: 'gulfalts-page-sections',
    configResolved: config => { base = config.base; },
    transformIndexHtml: {
      order: 'pre',
      handler: html => html
        .replace('<!-- homepage:sections -->', () => renderHomepage())
        .replace('<!-- fintech-district:sections -->', () => renderFintechDistrict())
        // Vite prefixes the deploy base on asset URLs but not on page links. Under a sub-path
        // (Webflow Cloud mounts the site at /new-home/), root links such as /fintech-district/
        // and /#h13-dubai-pull-out must carry it too.
        .replace(/(<a\b[^>]*?\shref=")\/(?!\/)/g, (_, start: string) => `${start}${base}`)
    }
  };
};

export default defineConfig({
  plugins: [pageSections()],
  build: {
    assetsInlineLimit: 0,
    // mapbox-gl is one ~1.9 MB chunk, loaded on demand by the location maps only.
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        // Relative to the project root (no @types/node here for path.resolve).
        main: 'index.html',
        'fintech-district': 'fintech-district/index.html'
      }
    }
  }
});
