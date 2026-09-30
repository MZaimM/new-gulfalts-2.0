/*
 * Our destinations (slider), between The firm (H04) and Featured destinations (H05).
 */
import { slider } from '../content/homepage';
import { destinationSlider } from '../components/destination-slider';

export const renderSlider = () => destinationSlider({
  id: slider.id,
  eyebrow: slider.copy.eyebrow,
  items: slider.items
});
