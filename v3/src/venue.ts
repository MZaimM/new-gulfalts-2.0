/*
 * Entry for the venue pages (dubai-creative-park/, fintech-district/). They share the site
 * chrome with the homepage but scroll natively (no Lenis): the scrub sections and the
 * next-venue footer read window.scrollY directly.
 */
import './styles/tokens.css';
import './styles/global.css';
import './styles/site-chrome.css';
import './styles/venue.css';

import { prefersReducedMotion } from './lib/viewport';
import { initTimeScrub } from './lib/time-scrub';
import { initMenu, initNavDropdown } from './components/site-chrome';
import { initContact } from './components/contact';
import { initVenueHero } from './components/venue-hero';
import { initNextVenue } from './components/next-venue';

const reduced = prefersReducedMotion();

initMenu(null);
initNavDropdown();
initContact(null);

initVenueHero(reduced);
initTimeScrub(reduced);
initNextVenue(reduced);
