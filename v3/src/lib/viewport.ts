/** Breakpoints shared with the CSS. */
export const mobileQuery = window.matchMedia('(max-width: 767px)');
export const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

export const isMobile = () => mobileQuery.matches;
export const prefersReducedMotion = () => reducedMotionQuery.matches;

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Intrinsic frame size of the current source, used before metadata is available. */
export const sourceFrame = () => (isMobile() ? { width: 608, height: 1080 } : { width: 1920, height: 1080 });

/**
 * Maps a point in video-frame space (0–1) to pixels inside a box that shows the video
 * with `object-fit: cover`, so HTML markers stay pinned to the same spot in the picture.
 * `align` mirrors the element's `object-position` (0–1 per axis, centred by default).
 */
export const coverPoint = (
  box: { width: number; height: number },
  frame: { width: number; height: number },
  point: { x: number; y: number },
  align = { x: 0.5, y: 0.5 }
) => {
  const scale = Math.max(box.width / frame.width, box.height / frame.height);
  const width = frame.width * scale;
  const height = frame.height * scale;
  const left = (box.width - width) * align.x + point.x * width;
  const top = (box.height - height) * align.y + point.y * height;
  return { left, top, visible: left >= 0 && left <= box.width && top >= 0 && top <= box.height };
};

/** Reads a percentage `object-position` ("100% 50%") as fractions; anything else counts as centred. */
export const objectAlign = (element: Element | null) => {
  const [x = '50%', y = '50%'] = element ? getComputedStyle(element).objectPosition.split(' ') : [];
  const fraction = (value: string) => (value.endsWith('%') ? Number.parseFloat(value) / 100 : 0.5);
  return { x: fraction(x), y: fraction(y) };
};
