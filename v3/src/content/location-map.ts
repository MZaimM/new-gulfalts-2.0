/*
 * Location map (Mapbox). Brief: ../gulfalts-mapbox-dev-instructions.md (client, October 2026).
 *
 * Coordinates are Mapbox order: [longitude, latitude].
 * Drive times are Mapbox Directions ETAs (driving, typical traffic): `npm run routes`
 * (scripts/build-routes.mjs) computes them for every venue × key location into drive-times.json,
 * with the route geometry in routes.json, so the page makes no Directions calls. The venue pages
 * show the client's own figures instead (drive-times.ts).
 *
 * To add a venue: add it to `mapVenues` (and destinations.ts), then run `npm run routes`.
 */
import type { KeyLocation, KeyLocationId, MapVenue } from './types';

/**
 * Custom style supplied by the client (account gius03). The public access token is not in the
 * source: it comes from VITE_MAPBOX_TOKEN (v3/.env locally, the host's environment in production).
 */
export const mapbox = {
  style: 'mapbox://styles/gius03/cmuolk2l0005001sk1j6jg3ku'
};

/**
 * Overview camera: slightly isometric, framed to every venue and key location (fitBounds, so it
 * adapts to the screen). Routes reframe at a gentler 45° pitch with the same bearing.
 */
export const mapCamera = {
  pitch: 52,
  bearing: -24
};

export const keyLocations: Record<KeyLocationId, KeyLocation> = {
  difc: { name: 'DIFC', coordinates: [55.275442716534684, 25.209251934115965] },
  downtown: { name: 'Downtown Dubai', coordinates: [55.27568944484563, 25.186926222651653] },
  businessBay: { name: 'Business Bay', coordinates: [55.26388443689402, 25.181143471947816] },
  dubaiMarina: { name: 'Dubai Marina', coordinates: [55.14837870197148, 25.084700575228933] },
  dxb: { name: 'DXB Airport', coordinates: [55.35985197621044, 25.24390324420729] },
  // The venue pages' list (client, October 2026). Mapbox Search pins; Jumeirah Road is the
  // Jumeirah 3 stretch of Jumeirah Street.
  dubaiHills: { name: 'Dubai Hills', coordinates: [55.23942647, 25.10193551] },
  mallOfTheEmirates: { name: 'Mall of the Emirates', coordinates: [55.20062679, 25.11806434] },
  jumeirahRoad: { name: 'Jumeirah Road', coordinates: [55.22684, 25.183868] },
  dubaiMall: { name: 'Dubai Mall', coordinates: [55.2791902, 25.19762017] }
};

/** The homepage map (H13) frames these and lists them in its marker cards. */
export const homeLocations: KeyLocationId[] = ['difc', 'downtown', 'businessBay', 'dubaiMarina', 'dxb'];

/** The venue pages' routes, in the client's order. */
export const venueLocations: KeyLocationId[] = ['dubaiHills', 'mallOfTheEmirates', 'businessBay', 'jumeirahRoad', 'dubaiMall'];

/**
 * Gulfalts venues on the map; every one is also a route origin. Fintech District uses the client's
 * exact coordinates; the others are their Google Maps pins (September 2026).
 */
export const mapVenues: MapVenue[] = [
  { id: 'fintech-district', coordinates: [55.25108498757604, 25.13674033759347] },
  { id: 'creative-park', coordinates: [55.23549, 25.12257] },
  { id: 'v8-district', coordinates: [55.23079, 25.11879] },
  { id: 'motor-garten', coordinates: [55.22356, 25.13056] }
];
