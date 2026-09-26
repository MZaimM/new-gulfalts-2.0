/*
 * H08 Dubai Fintech District: the Creative Park feature, mirrored.
 * V3 replaces the match cut (H08), journey (H09) and snapshot (H10) with this single chapter.
 */
import { h08 } from '../content/homepage';
import { fintechDistrictStats } from '../content/destinations';
import { destinationFeature } from '../components/destination-feature';

export const renderH08 = () => destinationFeature({
  id: h08.id,
  destinationId: h08.copy.destination,
  eyebrow: h08.copy.eyebrow,
  heading: h08.copy.heading,
  body: h08.copy.body,
  cta: h08.copy.cta,
  image: h08.copy.image,
  stats: fintechDistrictStats,
  mirrored: true
});
