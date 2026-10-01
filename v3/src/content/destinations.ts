import type { CommuteTime, Destination, DestinationStat } from './types';

/*
 * Destination data used by H05, H13 and H14. V8 District and Motor Garten copy and previews follow
 * gulfalts.com (category "Specialized Commercial Facilities").
 * Figures come from the client's V3 brief (September 2026). Any figure set to `unconfirmed`
 * renders with a visible "To be confirmed" flag until Gulfalts verifies it.
 */

export const venueBase = 'https://www.gulfalts.com/venue';

/** No all-destinations page exists yet on gulfalts.com; the live homepage lists every venue. */
export const allDestinationsUrl = 'https://www.gulfalts.com/';

/*
 * Drive times for the H13 marker cards. Dubai Fintech District's come from the client's
 * reference (September 2026). The other venues have no figures yet: they borrow the Al Quoz
 * times as indicative values and the card flags them "To be confirmed".
 */
const alQuozTimes: CommuteTime[] = [
  { place: 'DIFC', minutes: 12 },
  { place: 'Downtown Dubai', minutes: 14 },
  { place: 'Business Bay', minutes: 10 },
  { place: 'Dubai Marina', minutes: 10 },
  { place: 'DXB Airport', minutes: 20 }
];

/*
 * Markers sit on the H13 hold frame: the first frame of the homepage outro (the Dubai map).
 * Positions are the venues' Google Maps pins (Sept 2026) projected onto
 * that frame with a homography fitted to OpenStreetMap roads and coastline (Sheikh Zayed Road,
 * Al Khail Road, their interchanges, the coast from the Palm to Jumeirah Bay), accurate to a few
 * pixels at 1920 wide. Pins: Creative Park 25.12257, 55.23549 · Fintech District 25.13684,
 * 55.25110 · Motör Garten 25.13056, 55.22356 · V8 District 25.11879, 55.23079.
 */
export const destinations: Destination[] = [
  {
    id: 'creative-park',
    index: '01',
    name: 'Creative Park',
    fullName: 'Dubai Creative Park',
    tags: 'Movement · Wellness · Community',
    tagsConfirmed: true,
    url: `${venueBase}/dubai-creative-park`,
    location: 'Al Quoz · Dubai',
    preview: '/media/images/preview-creative-park-320.jpg',
    marker: { x: 0.5894, y: 0.4921, xMobile: 0.593 },
    commute: { times: alQuozTimes, status: 'unconfirmed' }
  },
  {
    id: 'fintech-district',
    index: '02',
    name: 'Fintech District',
    fullName: 'Dubai Fintech District',
    tags: 'Work · Business · Community',
    tagsConfirmed: true,
    url: `${venueBase}/fintech-district`,
    location: 'Al Quoz · Dubai',
    preview: '/media/images/preview-fintech-district-320.jpg',
    marker: { x: 0.615, y: 0.4496, xMobile: 0.674 },
    commute: { times: alQuozTimes, status: 'confirmed' }
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
    marker: { x: 0.5817, y: 0.5033, xMobile: 0.569 },
    commute: { times: alQuozTimes, status: 'unconfirmed' }
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
    marker: { x: 0.571, y: 0.4683, xMobile: 0.535 },
    commute: { times: alQuozTimes, status: 'unconfirmed' }
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
