/*
 * Location map (Mapbox GL JS, the client's custom style).
 *
 * The outro video ends on the Dubai map; at the chapter's `map` step the live map dissolves in
 * over that frame and settles from top-down into a pitched overview of the venues and Dubai's key
 * locations.
 *
 * Venue markers: the page can ship them as static HTML (`[data-map-markers] .chapter_marker`,
 * the homepage: dot, leader label and hover card with drive times); they are handed to Mapbox and
 * their labels lined up in a column with leader lines. Without them, plain dots are drawn.
 *
 * Route mode (venue pages, per gulfalts-mapbox-dev-instructions.md): when the panel has
 * `[data-route]` rows and the stage a `data-origin` venue, picking a key location draws the road
 * route from that venue and reframes the camera; one route at a time. Drive times (drive-times.ts)
 * and the route geometry (routes.json) are precomputed.
 *
 * mapbox-gl (~540 kB gz) loads only once the visitor is part-way through H13 (`map-near` step),
 * or near the section under reduced motion.
 */
import type { LngLatBounds, Map as MapboxMap } from 'mapbox-gl';
import { destinationById } from '../content/destinations';
import { driveTime } from '../content/drive-times';
import { homeLocations, keyLocations, mapbox, mapCamera, mapVenues } from '../content/location-map';
import type { KeyLocationId, LngLat, RouteSet } from '../content/types';
import { spreadLabels } from '../lib/scroll-scrub';
import { isMobile } from '../lib/viewport';
import { esc } from './markup';

const ROUTE_SOURCE = 'active-route';
const INTRO_MS = 2600;
const CAMERA_MS = 1600;
const DRAW_MS = 1500;
const ROUTE_PITCH = 45;
/** Gulfalts burgundy (--button-primary) and the brief's cream route casing. */
const BURGUNDY = '#801b2b';
const CASING = '#f4efea';

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const emptyRoute = (coordinates: LngLat[] = []) => ({
  type: 'Feature' as const,
  properties: {},
  geometry: { type: 'LineString' as const, coordinates }
});

export const initLocationMap = (section: HTMLElement, reduced: boolean) => {
  const stage = section.querySelector<HTMLElement>('[data-location-map]');
  const canvas = stage?.querySelector<HTMLElement>('.h13_map-canvas');
  const panel = section.querySelector<HTMLElement>('[data-map-panel]');
  if (!stage || !canvas || !panel) return;
  const origin = mapVenues.find(venue => venue.id === stage.dataset.origin);

  const rows = [...panel.querySelectorAll<HTMLButtonElement>('[data-route]')];
  const routeMode = !!origin && rows.length > 0;
  const status = panel.querySelector<HTMLElement>('[data-route-status]');
  const places = routeMode ? rows.map(row => row.dataset.route as KeyLocationId) : [];
  const venueMarkers = [...stage.querySelectorAll<HTMLElement>('[data-map-markers] .chapter_marker[data-destination]')];
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  let mapboxgl: typeof import('mapbox-gl').default | null = null;
  let map: MapboxMap | null = null;
  let routes: RouteSet = {};
  let overview: LngLatBounds | null = null;
  let loading: Promise<void> | null = null;
  let shown = reduced;
  let selected: KeyLocationId | null = null;
  let drawFrame = 0;
  const placeMarkers = new Map<KeyLocationId, HTMLElement>();

  /**
   * Keep the framing clear of the panel: beside it on desktop (right, or left in the unpinned
   * reduced-motion layout), above it on phones (the map already stops at its top edge).
   */
  const padding = () => {
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 84;
    // Phones: room for half a centred marker label (~180px wide) at either edge.
    if (isMobile()) return { top: header + 24, right: 96, bottom: 40, left: 96 };
    const box = stage.getBoundingClientRect();
    const rect = panel.getBoundingClientRect();
    const onRight = rect.left + rect.width / 2 > box.left + box.width / 2;
    const beside = Math.max(64, onRight ? box.right - rect.left + 56 : rect.right - box.left + 56);
    // Labels sit above and to both sides of the dots; the open side gets the wider margin.
    const open = Math.min(120, Math.max(24, box.width - beside - 320));
    return { top: header + 40, bottom: 72, right: onRight ? beside : open, left: onRight ? open : beside };
  };

  /**
   * On phones the panel sits at the bottom, so the map stops at its top edge (the Mapbox logo and
   * attribution stay visible). Measured against the sticky stage, not the panel's transform.
   */
  const fitStage = () => {
    const before = stage.style.getPropertyValue('--map-bottom');
    if (!isMobile() || reduced) {
      stage.style.removeProperty('--map-bottom');
    } else {
      // Layout offsets ignore the panel's reveal transform: panel → overlay → sticky stage.
      const overlay = panel.offsetParent as HTMLElement;
      const inset = stage.parentElement!.clientHeight - overlay.offsetTop - panel.offsetTop;
      stage.style.setProperty('--map-bottom', `${Math.max(0, Math.round(inset))}px`);
    }
    const changed = stage.style.getPropertyValue('--map-bottom') !== before;
    if (changed) map?.resize();
    return changed;
  };


  /** The map is light: while it shows, the header switches to ink (site-chrome initHeaderTone). */
  const setTone = () => stage.classList.toggle('is-light', shown && stage.classList.contains('is-loaded'));

  /** Settle from straight down (matching the video's last frame) into the pitched overview. */
  const intro = () => {
    if (!map || !overview || selected) return;
    fitStage();
    map.stop();
    if (reduced) {
      map.fitBounds(overview, { padding: padding(), ...mapCamera, duration: 0 });
      return;
    }
    map.fitBounds(overview, { padding: padding(), pitch: 0, bearing: 0, duration: 0 });
    map.fitBounds(overview, { padding: padding(), ...mapCamera, duration: INTRO_MS, easing: easeInOut, essential: true });
  };

  const setTrim = (progress: number) => {
    if (!map) return;
    // line-trim-offset hides [start, end]; hiding [progress, 1] draws the line from the venue out.
    const trim: [number, number] = progress >= 1 ? [0, 0] : [progress, 1];
    map.setPaintProperty(`${ROUTE_SOURCE}-casing`, 'line-trim-offset', trim);
    map.setPaintProperty(ROUTE_SOURCE, 'line-trim-offset', trim);
  };

  const frameRoute = (line: LngLat[], duration: number) => {
    if (!map || !mapboxgl) return;
    const bounds = line.reduce((box, point) => box.extend(point), new mapboxgl.LngLatBounds(line[0], line[0]));
    map.stop();
    map.fitBounds(bounds, {
      padding: padding(), pitch: ROUTE_PITCH, bearing: mapCamera.bearing, maxZoom: 14,
      duration, easing: easeInOut, essential: true
    });
  };

  const showRoute = (id: KeyLocationId | null) => {
    if (!map) return;
    cancelAnimationFrame(drawFrame);
    placeMarkers.forEach((marker, place) => marker.classList.toggle('is-selected', place === id));
    const line = id && origin ? routes[origin.id]?.[id] : undefined;
    const source = map.getSource(ROUTE_SOURCE);
    if (source?.type !== 'geojson') return;
    source.setData(emptyRoute(line));
    if (!line || !id) {
      intro();
      return;
    }
    frameRoute(line, reduced ? 0 : CAMERA_MS);
    if (reduced) {
      setTrim(1);
      return;
    }
    setTrim(0);
    const start = performance.now();
    const step = (now: number) => {
      // rAF timestamps can predate `start` by a frame.
      const t = Math.min(1, Math.max(0, (now - start) / DRAW_MS));
      setTrim(easeInOut(t));
      if (t < 1) drawFrame = requestAnimationFrame(step);
    };
    drawFrame = requestAnimationFrame(step);
  };

  const select = (id: KeyLocationId | null) => {
    selected = id;
    rows.forEach(row => {
      const on = row.dataset.route === id;
      row.setAttribute('aria-pressed', String(on));
      row.classList.toggle('is-selected', on);
    });
    if (status && origin) {
      status.textContent = id
        ? `Route to ${keyLocations[id].name}: ${driveTime(origin.id, id)} from ${destinationById(origin.id).fullName}.`
        : 'Route cleared.';
    }
    showRoute(id);
  };

  rows.forEach(row => row.addEventListener('click', () => {
    const id = row.dataset.route as KeyLocationId;
    select(selected === id ? null : id);
  }));

  /** One reusable route source; a cream casing under the burgundy line (brief colours). */
  const addRouteLayers = () => {
    if (!map) return;
    map.addSource(ROUTE_SOURCE, { type: 'geojson', lineMetrics: true, data: emptyRoute() });
    const layout = { 'line-join': 'round', 'line-cap': 'round' } as const;
    map.addLayer({
      id: `${ROUTE_SOURCE}-casing`, type: 'line', source: ROUTE_SOURCE, slot: 'top', layout,
      paint: { 'line-color': CASING, 'line-width': 8, 'line-opacity': 0.9, 'line-emissive-strength': 1, 'line-trim-offset': [0, 0] }
    });
    map.addLayer({
      id: ROUTE_SOURCE, type: 'line', source: ROUTE_SOURCE, slot: 'top', layout,
      paint: { 'line-color': BURGUNDY, 'line-width': 4, 'line-opacity': 1, 'line-emissive-strength': 1, 'line-trim-offset': [0, 0] }
    });
  };

  const build = async () => {
    // Without a token the video's last frame and the directory stay, as when Mapbox fails.
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) throw new Error('VITE_MAPBOX_TOKEN is not set');
    const [{ default: gl }, routeData] = await Promise.all([
      import('mapbox-gl'),
      routeMode ? import('../content/routes.json') : null,
      import('mapbox-gl/dist/mapbox-gl.css')
    ]);
    mapboxgl = gl;
    if (routeData) routes = routeData.default as unknown as RouteSet;
    fitStage();

    // The overview frames the venues in their Dubai context: every key location this map shows
    // (the page's routes, or the homepage's set) fits in it.
    const keys = (routeMode ? places : homeLocations).map(id => keyLocations[id].coordinates);
    const points: LngLat[] = [...mapVenues.map(venue => venue.coordinates), ...keys];
    overview = points.reduce((box, point) => box.extend(point), new gl.LngLatBounds(points[0], points[0]));

    gl.accessToken = token;
    map = new gl.Map({
      container: canvas,
      style: mapbox.style,
      bounds: overview,
      fitBoundsOptions: { padding: padding() },
      antialias: true,
      attributionControl: false,
      // A scroll story: the wheel and touch always scroll the page. Desktop pointers may pan.
      interactive: finePointer,
      scrollZoom: false,
      boxZoom: false,
      doubleClickZoom: false,
      dragRotate: false,
      keyboard: false,
      touchZoomRotate: false,
      touchPitch: false,
      dragPan: finePointer
    });
    if (import.meta.env.DEV) Object.assign(window, { __locationMap: map });
    map.addControl(new gl.AttributionControl({ compact: true }), 'bottom-left');

    // Venues from the page's markup: same dot, leader label and hover card as before, now pinned
    // by Mapbox. The directory rows open the cards too (components/destination-directory.ts).
    venueMarkers.forEach(element => {
      const venue = mapVenues.find(item => item.id === element.dataset.destination);
      if (venue) new gl.Marker({ element }).setLngLat(venue.coordinates).addTo(map!);
    });
    if (venueMarkers.length) {
      const layoutLabels = () => {
        if (isMobile()) return;
        spreadLabels(venueMarkers.map(marker => {
          const point = map!.project(mapVenues.find(item => item.id === marker.dataset.destination)!.coordinates);
          return { marker, left: point.x, top: point.y };
        }));
      };
      map.on('move', layoutLabels);
      map.on('resize', layoutLabels);
      layoutLabels();
    }

    // Otherwise plain venue dots: the origin keeps its label; the others show theirs on hover or focus.
    if (!venueMarkers.length) mapVenues.forEach(venue => {
      const destination = destinationById(venue.id);
      const element = document.createElement('a');
      element.className = `map_venue${venue.id === origin?.id ? ' is-origin' : ''}`;
      // Pages of this site are paths relative to the deploy base (Webflow Cloud: /new-home/).
      const external = /^https?:/i.test(destination.url);
      element.href = external ? destination.url : `${import.meta.env.BASE_URL}${destination.url}`;
      if (external) {
        element.target = '_blank';
        element.rel = 'noopener';
      }
      element.setAttribute('aria-label', destination.fullName);
      element.innerHTML = `<span class="map_venue-label" aria-hidden="true">${destination.index} ${esc(destination.name)}</span>`;
      new gl.Marker({ element }).setLngLat(venue.coordinates).addTo(map!);
    });

    // Key locations: quiet dots; the selected one opens into a ring with its name and time.
    // The panel rows are the accessible control, so these are pointer-only shortcuts.
    places.forEach(id => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'map_place';
      element.tabIndex = -1;
      element.setAttribute('aria-hidden', 'true');
      element.innerHTML = `<span class="map_place-label">${esc(keyLocations[id].name)} <span>${esc(driveTime(origin!.id, id))}</span></span>`;
      element.addEventListener('click', () => select(selected === id ? null : id));
      placeMarkers.set(id, element);
      new gl.Marker({ element }).setLngLat(keyLocations[id].coordinates).addTo(map!);
    });

    map.on('load', () => {
      if (routeMode) addRouteLayers();
      stage.classList.add('is-loaded');
      setTone();
      if (selected) showRoute(selected);
      else if (shown) intro();
    });
    map.on('error', event => console.warn('[location-map]', event.error?.message ?? event.error));
  };

  const load = () => {
    loading ??= build().catch(error => console.warn('[location-map] unavailable', error));
    return loading;
  };

  section.addEventListener('chapter:step', event => {
    const { name, active } = (event as CustomEvent<{ name: string; active: boolean }>).detail;
    if (name === 'map-near' && active) load();
    if (name !== 'map') return;
    shown = active;
    setTone();
    if (!active) {
      map?.stop();
      return;
    }
    load();
    if (map?.loaded()) intro();
  });

  // The page may open already past the steps (restored scroll, deep link): catch up.
  if (section.classList.contains('is-map')) shown = true;
  if (shown || section.classList.contains('is-map-near')) load();

  if (reduced) {
    new IntersectionObserver((entries, observer) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      load();
    }, { rootMargin: '100% 0px' }).observe(section);
  }

  /** Re-measure after a resize (or the panel changing height) and reframe without animating. */
  let resizeFrame = 0;
  const relayout = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      fitStage();
      if (!map?.loaded() || map.isMoving()) return;
      const line = selected && origin ? routes[origin.id]?.[selected] : undefined;
      if (line) frameRoute(line, 0);
      else if (overview) map.fitBounds(overview, { padding: padding(), ...mapCamera, duration: 0 });
    });
  };
  window.addEventListener('resize', relayout);
  new ResizeObserver(relayout).observe(panel);
  // The canvas box can change without a window resize (a page restyling it, e.g. the Fintech
  // District map letting the canvas fill its card until the panel shows).
  new ResizeObserver(() => map?.resize()).observe(canvas);
};
