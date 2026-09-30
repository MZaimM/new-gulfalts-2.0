import { defineConfig, type Plugin } from 'vite';
import { renderHomepage } from './src/sections/index';

/**
 * Renders the homepage chapters from src/content into index.html, so every heading, stat and
 * link is static, crawlable HTML while copy and cue data stay in structured TypeScript files.
 * Vite restarts the dev server when the config or anything it imports changes, so edits to
 * content or section templates show up on reload.
 */
const homepageSections = (): Plugin => ({
  name: 'gulfalts-homepage-sections',
  transformIndexHtml: {
    order: 'pre',
    handler: html => html.replace('<!-- homepage:sections -->', renderHomepage())
  }
});

export default defineConfig({
  plugins: [homepageSections()],
  build: { assetsInlineLimit: 0 }
});
