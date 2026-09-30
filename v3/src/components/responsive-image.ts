/*
 * <picture> markup for the stills built by scripts/build-images.mjs: AVIF first, mozjpeg as
 * the fallback, one srcset per format so the browser picks the width it needs.
 */
import type { ResponsiveImage } from '../content/types';
import { esc } from './markup';

const srcset = (image: ResponsiveImage, format: 'avif' | 'jpg') =>
  image.widths.map(width => `/media/images/${image.name}-${width}.${format} ${width}w`).join(', ');

const largest = (image: ResponsiveImage) => Math.max(...image.widths);

interface PictureOptions {
  image: ResponsiveImage;
  /** Art-directed crop served below 768px. */
  mobile?: ResponsiveImage;
  alt: string;
  sizes: string;
  mobileSizes?: string;
  className?: string;
  lazy?: boolean;
  attrs?: string;
}

export const picture = ({ image, mobile, alt, sizes, mobileSizes = '100vw', className = '', lazy = true, attrs = '' }: PictureOptions) => {
  const width = largest(image);
  const height = Math.round(width / image.ratio);
  const mobileSources = mobile ? `
      <source media="(max-width: 767px)" type="image/avif" srcset="${srcset(mobile, 'avif')}" sizes="${mobileSizes}" width="${largest(mobile)}" height="${Math.round(largest(mobile) / mobile.ratio)}" />
      <source media="(max-width: 767px)" type="image/jpeg" srcset="${srcset(mobile, 'jpg')}" sizes="${mobileSizes}" width="${largest(mobile)}" height="${Math.round(largest(mobile) / mobile.ratio)}" />` : '';
  return `
    <picture${className ? ` class="${className}"` : ''} ${attrs}>${mobileSources}
      <source type="image/avif" srcset="${srcset(image, 'avif')}" sizes="${sizes}" />
      <img src="/media/images/${image.name}-${image.widths[Math.min(1, image.widths.length - 1)]}.jpg" srcset="${srcset(image, 'jpg')}" sizes="${sizes}"
        alt="${esc(alt)}" width="${width}" height="${height}" ${lazy ? 'loading="lazy"' : ''} decoding="async" />
    </picture>`;
};
