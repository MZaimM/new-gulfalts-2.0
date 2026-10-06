import { driveTimes } from './drive-times';
import { keyLocations } from './location-map';
import type { CommuteTime, Destination, DestinationStat, KeyLocationId } from './types';

/*
 * Destination data used by H05, H13 (map markers and directory) and H14. V8 District and Motor
 * Garten copy and previews follow gulfalts.com (category "Specialized Commercial Facilities").
 * Figures come from the client's V3 brief (September 2026). Any figure set to `unconfirmed`
 * renders with a visible "To be confirmed" flag until Gulfalts verifies it.
 */

export const venueBase = 'https://www.gulfalts.com/venue';

/*
 * Venues with a page on this site link there (paths are resolved against the deploy base, see
 * `href` in components/markup.ts); the others still open their page on gulfalts.com.
 */

/** No all-destinations page exists yet on gulfalts.com; the live homepage lists every venue. */
export const allDestinationsUrl = 'https://www.gulfalts.com/';

/** Mapbox drive times from a venue to each key location, for the H13 map marker cards. */
const commute = (venue: string): CommuteTime[] =>
  (Object.keys(keyLocations) as KeyLocationId[])
    .filter(place => driveTimes[venue]?.[place] !== undefined)
    .map(place => ({ place: keyLocations[place].name, minutes: driveTimes[venue]![place]! }));

/* Map pins (Google Maps, September 2026) for the H13 map are in location-map.ts. */
export const destinations: Destination[] = [
  {
    id: 'creative-park',
    index: '01',
    name: 'Creative Park',
    fullName: 'Dubai Creative Park',
    tags: 'Movement · Wellness · Community',
    tagsConfirmed: true,
    url: 'dubai-creative-park/',
    location: 'Al Quoz · Dubai',
    preview: '/media/images/preview-creative-park-320.jpg',
    commute: commute('creative-park')
  },
  {
    id: 'fintech-district',
    index: '02',
    name: 'Fintech District',
    fullName: 'Dubai Fintech District',
    tags: 'Work · Business · Community',
    tagsConfirmed: true,
    url: 'fintech-district/',
    location: 'Al Quoz · Dubai',
    preview: '/media/images/preview-fintech-district-320.jpg',
    commute: commute('fintech-district')
  },
  {
    id: 'v8-district',
    index: '03',
    name: 'V8 District',
    fullName: 'V8 District',
    tags: 'Specialized commercial facilities',
    tagsConfirmed: true,
    url: `${venueBase}/v8-district`,
    location: 'Dubai',
    preview: '/media/images/preview-v8-district-320.jpg',
    commute: commute('v8-district')
  },
  {
    id: 'motor-garten',
    index: '04',
    name: 'Motor Garten',
    fullName: 'Motor Garten',
    tags: 'Specialized commercial facilities',
    tagsConfirmed: true,
    url: `${venueBase}/motor-garten`,
    location: 'Dubai',
    preview: '/media/images/preview-motor-garten-320.jpg',
    commute: commute('motor-garten')
  }
];

export const creativeParkStats: DestinationStat[] = [
  { value: '160,000+', unit: 'sq ft', label: 'Open land for activations', status: 'confirmed' },
  { value: '54', label: 'Spaces across retail, office, F&B, fitness and wellness', status: 'confirmed' }
];

export const fintechDistrictStats: DestinationStat[] = [
  { value: '50,000', unit: 'sq ft', label: 'Total area', status: 'confirmed' },
  { value: '65', label: 'Units for offices, showrooms, lifestyle brands and boutique F&B concepts', status: 'confirmed' }
];

export const destinationById = (id: string): Destination => {
  const destination = destinations.find(item => item.id === id);
  if (!destination) throw new Error(`Unknown destination: ${id}`);
  return destination;
};
