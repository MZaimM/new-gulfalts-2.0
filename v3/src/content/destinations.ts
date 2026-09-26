import type { Destination, DestinationStat } from './types';

/*
 * Destination data used by H05, H08, H13 and H14.
 * Figures come from the client's V3 brief (September 2026). Any figure set to `unconfirmed`
 * renders with a visible "To be confirmed" flag until Gulfalts verifies it.
 */

export const venueBase = 'https://www.gulfalts.com/venue';

/** No all-destinations page exists yet on gulfalts.com; the live homepage lists every venue. */
export const allDestinationsUrl = 'https://www.gulfalts.com/';

/*
 * Markers sit in Al Quoz on the H13 hold frame (the Dubai coastline from DFD scene 2). The
 * footage is a stylised render, so positions are indicative, not surveyed.
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
    marker: { x: 0.56, y: 0.53, xMobile: 0.627 }
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
    marker: { x: 0.545, y: 0.59, xMobile: 0.58 }
  },
  {
    id: 'v8-district',
    index: '03',
    name: 'V8 District',
    fullName: 'V8 District',
    tags: 'Details to be confirmed',
    tagsConfirmed: false,
    url: `${venueBase}/v8-district`,
    location: 'Dubai',
    marker: { x: 0.575, y: 0.47, xMobile: 0.674 }
  },
  {
    id: 'motor-garten',
    index: '04',
    name: 'Motor Garten',
    fullName: 'Motor Garten',
    tags: 'Details to be confirmed',
    tagsConfirmed: false,
    url: `${venueBase}/motor-garten`,
    location: 'Dubai',
    marker: { x: 0.53, y: 0.65, xMobile: 0.532 }
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
