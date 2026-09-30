/*
 * Our destinations (portals), between The firm (H04) and Featured destinations (H05).
 */
import { portals } from '../content/homepage';
import { destinationPortals } from '../components/destination-portals';

export const renderPortals = () => destinationPortals({
  id: portals.id,
  eyebrow: portals.copy.eyebrow,
  items: portals.items
});
