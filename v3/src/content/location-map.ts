/*
 * H13 location map (Mapbox). Brief: ../gulfalts-mapbox-dev-instructions.md (client, October 2026).
 *
 * Coordinates are Mapbox order: [longitude, latitude].
 * Drive times are fixed marketing copy from the client and are shown exactly as written; they are
 * never replaced by a Mapbox ETA. Route geometry is precomputed once by `npm run routes`
 * (scripts/build-routes.mjs → src/content/routes.json), so the page makes no Directions calls.
 *
 * To add a venue as a route origin: add an entry to `mapVenues` with its coordinates and times,
 * then run `npm run routes`. The map, panel and route switching pick it up without code changes.
 */
import type { MapVenue, KeyLocation, KeyLocationId } from './types';

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
  dxb: { name: 'DXB Airport', coordinates: [55.35985197621044, 25.24390324420729] }
};

/**
 * Gulfalts venues on the map. Every venue gets a marker; only venues with `times` are route
 * origins. Fintech District uses the client's exact coordinates; the others are their Google Maps
 * pins (September 2026, see destinations.ts).
 */
export const mapVenues: MapVenue[] = [
  {
    id: 'fintech-district',
    coordinates: [55.25108498757604, 25.13674033759347],
    times: {
      difc: '12 minutes',
      downtown: '14 minutes',
      businessBay: '10 minutes',
      dubaiMarina: '10 minutes',
      dxb: '20 minutes'
    }
  },
  { id: 'creative-park', coordinates: [55.23549, 25.12257] },
  { id: 'v8-district', coordinates: [55.23079, 25.11879] },
  { id: 'motor-garten', coordinates: [55.22356, 25.13056] }
];

/** The venue the homepage map routes from. */
export const mapOrigin = 'fintech-district';
