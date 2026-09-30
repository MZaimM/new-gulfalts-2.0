/*
 * The Gulfalts wordmark for the H01 intro, built the way gulfalts-logo-reveal.html builds it:
 * one white tile masked with the "G" and the "ALTS" letters cut out (so they are transparent and
 * the page shows through), plus the white "Gulf" shown only left of the tile's trailing edge.
 * The tile starts as the square G icon and unfolds into the ALTS block; see playBrandReveal.
 * Path data is copied verbatim from media/images/logo-light.svg; the ALTS letters, cut out of
 * the block there, are split out so they can appear one by one.
 * The markup is the finished logo, so without JS (or with reduced motion) it is simply static.
 */
const G = 'M0,275.06C0,140.14,114.12,57.49,251.17,57.49c101.85,0,191.98,49.05,224.51,127.99l-64.52,25.06c-28.27-53.86-85.33-89.59-159.99-89.59-95.98,0-177.05,57.59-177.05,155.71,0,109.85,99.19,150.92,183.98,150.92s150.38-41.06,159.97-101.85h-151.98v-55.47h222.91v211.71h-55.46c-1.07-24.53-2.13-48-3.2-71.99h-3.2c-34.66,51.73-95.99,81.06-180.78,81.06C102.39,491.03,0,401.45,0,275.06';

const REST = [
  'M1460.54,537.32h1583.04V0h-1583.04v537.32ZM1908.77,453.88l-59.33-118.66h-183.86l-58.07,118.66h-55.56l2.1-4.61,176.73-366.25h55.35l178.62,370.86h-55.98ZM2301.85,453.88h-272.33V83.02h53.04v323.9h219.29v46.96ZM2597.66,128.93h-146.75v324.95h-52.62V128.93h-146.75v-45.91h346.12v45.91ZM2796.83,461.85c-64.57,0-142.77-28.72-168.76-109.23l-1.05-2.93,49.48-16.56.84,2.93c16.35,49.9,61,79.67,119.5,79.67,46.96,0,97.28-19.08,97.28-60.8,0-37.95-42.56-48.64-80.3-58.28l-7.55-1.89-40.67-10.69c-33.33-8.38-121.81-30.82-121.81-105.45,0-67.72,73.38-103.14,146.12-103.14s129.77,34.8,148.64,88.68l1.05,2.72-47.8,18.66-1.05-2.94c-15.73-38.15-54.72-61.01-104.61-61.01s-88.05,22.64-88.05,53.88c0,40.04,58.07,55.76,85.95,63.1l52.2,14.05c45.49,12.16,114.26,30.61,114.26,96.65s-66.05,112.58-153.67,112.58',
  'M1758.03,143.19c18.45,40.25,41.51,88.89,68.76,144.45h-138.57c8.17-17.19,16.77-34.59,24.95-51.36,17.61-36.27,34.38-70.87,44.86-93.09',
  'M584.49,371.58v-186.1h66.66v163.71c0,54.39,35.19,82.11,79.99,82.11,58.12,0,91.19-39.99,91.19-84.25v-161.58h66.66v203.7c0,46.92,4.26,68.26,11.73,92.79h-66.66c-5.34-17.07-8-31.47-8-41.59h-1.07c-23.47,33.06-61.86,50.66-112.52,50.66-70.39,0-127.99-36.8-127.99-119.45',
  'M1199.9,242.52h-53.33v-57.05h53.33v-32.53c0-71.99,35.2-106.66,108.25-106.66,18.67,0,42.66,2.67,61.86,10.14v53.86c-19.73-7.47-33.6-9.6-49.06-9.6-54.39,0-54.39,30.92-54.39,58.66v26.13h92.25v57.05h-92.25v239.44h-66.66v-239.44Z',
];

const RECT = { x: 1001.52, y: 55.35, width: 66.13, height: 426.61 };

/** The ALTS block path is the block followed by one sub-path per letter (A, L, T, S). */
const [, A_OUTER, L, T, S] = REST[0].split(/(?=M)/);
const A_COUNTER = REST[1];
const U = REST[2];
const F = REST[3];

export const LOGO_VIEW = { width: 3043.58, height: 537.32 };
/** The white ALTS block the tile settles into. */
export const LOGO_BLOCK = { x: 1460.54, y: 0, width: 1583.04, height: 537.32 };
/** Left edges of "u", "l" and "f": they appear as the trailing edge passes them. */
export const LOGO_TRAIL_X = [584.49, 1001.52, 1146.57];

const BIG = 'x="-40000" y="-40000" width="80000" height="80000"';

export const logoIntroSvg = (className: string, label = 'Gulfalts') => `
  <svg class="${className}" viewBox="0 0 ${LOGO_VIEW.width} ${LOGO_VIEW.height}" role="img" aria-label="${label}" focusable="false">
    <defs>
      <mask id="${className}-tile" maskUnits="userSpaceOnUse" ${BIG}>
        <rect ${BIG} fill="#fff" />
        <path d="${G}" fill="#000" />
        <path class="logo_hole" d="${A_OUTER}${A_COUNTER}" fill="#000" fill-rule="evenodd" />
        <path class="logo_hole" d="${L}" fill="#000" />
        <path class="logo_hole" d="${T}" fill="#000" />
        <path class="logo_hole" d="${S}" fill="#000" />
      </mask>
      <mask id="${className}-left" maskUnits="userSpaceOnUse" ${BIG}>
        <rect class="logo_left" x="-40000" y="-40000" width="${40000 + LOGO_BLOCK.x}" height="80000" fill="#fff" />
      </mask>
    </defs>
    <g class="logo_cam">
      <rect class="logo_tile" x="${LOGO_BLOCK.x}" y="${LOGO_BLOCK.y}" width="${LOGO_BLOCK.width}" height="${LOGO_BLOCK.height}" mask="url(#${className}-tile)" />
      <g class="logo_word" mask="url(#${className}-left)">
        <path d="${G}" />
        <path class="logo_trail" d="${U}" />
        <rect class="logo_trail" x="${RECT.x}" y="${RECT.y}" width="${RECT.width}" height="${RECT.height}" />
        <path class="logo_trail" d="${F}" />
      </g>
    </g>
  </svg>`;
