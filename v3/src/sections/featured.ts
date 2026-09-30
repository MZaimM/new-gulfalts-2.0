/*
 * H05 Featured destinations: Dubai Creative Park and Dubai Fintech District in one section.
 * V3 first showed them as two mirrored features (H05, H08); they now share a two-column spread.
 */
import { featured, h05, h08 } from '../content/homepage';
import { creativeParkStats, fintechDistrictStats } from '../content/destinations';
import { featuredDestinations } from '../components/featured-destinations';

export const renderFeatured = () => featuredDestinations({
  id: featured.id,
  eyebrow: featured.copy.eyebrow,
  heading: featured.copy.heading,
  items: [
    {
      id: h05.id,
      destinationId: h05.copy.destination,
      eyebrow: h05.copy.eyebrow,
      heading: h05.copy.heading,
      body: h05.copy.body,
      cta: h05.copy.cta,
      image: h05.copy.image,
      stats: creativeParkStats,
      sizes: '(max-width: 767px) calc(100vw - 32px), (max-width: 1440px) 46vw, 660px'
    },
    {
      id: h08.id,
      destinationId: h08.copy.destination,
      eyebrow: h08.copy.eyebrow,
      heading: h08.copy.heading,
      body: h08.copy.body,
      cta: h08.copy.cta,
      image: h08.copy.image,
      stats: fintechDistrictStats,
      sizes: '(max-width: 767px) calc(100vw - 32px), (max-width: 1440px) 46vw, 660px'
    }
  ]
});
