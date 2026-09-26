/*
 * H05 Dubai Creative Park: one feature (image, story, figures, link).
 * V3 folds the former journey (H06) and snapshot (H07) into this single chapter.
 */
import { h05 } from '../content/homepage';
import { creativeParkStats } from '../content/destinations';
import { destinationFeature } from '../components/destination-feature';

export const renderH05 = () => destinationFeature({
  id: h05.id,
  destinationId: h05.copy.destination,
  eyebrow: h05.copy.eyebrow,
  heading: h05.copy.heading,
  body: h05.copy.body,
  cta: h05.copy.cta,
  image: h05.copy.image,
  stats: creativeParkStats
});
