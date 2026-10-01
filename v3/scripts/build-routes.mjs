/*
 * Precomputes the H13 map routes (Mapbox Directions, driving profile) for every venue that has
 * drive times in src/content/location-map.ts, and writes the road geometry to
 * src/content/routes.json. Only the geometry is kept: the drive times on the page are the
 * client's fixed copy, never Mapbox's ETA.
 *
 *   npm run routes   (reads VITE_MAPBOX_TOKEN from v3/.env or the environment)
 */
import { writeFile } from 'node:fs/promises';
import { keyLocations, mapVenues } from '../src/content/location-map.ts';

const token = process.env.VITE_MAPBOX_TOKEN;
if (!token) throw new Error('Set VITE_MAPBOX_TOKEN (v3/.env) to the Mapbox public token.');

const out = new URL('../src/content/routes.json', import.meta.url);

/** Douglas–Peucker in degrees; 0.00001° ≈ 1 m, invisible at any zoom the section uses. */
const simplify = (points, tolerance = 0.00001) => {
  if (points.length < 3) return points;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const dx = bx - ax, dy = by - ay;
  const length = Math.hypot(dx, dy) || 1;
  let max = 0, index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const distance = Math.abs(dy * px - dx * py + bx * ay - by * ax) / length;
    if (distance > max) { max = distance; index = i; }
  }
  if (max <= tolerance) return [points[0], points[points.length - 1]];
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
};

const round = ([lng, lat]) => [Number(lng.toFixed(6)), Number(lat.toFixed(6))];

const routes = {};
for (const venue of mapVenues.filter(item => item.times)) {
  routes[venue.id] = {};
  for (const id of Object.keys(venue.times)) {
    const to = keyLocations[id].coordinates;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${venue.coordinates.join(',')};${to.join(',')}`
      + `?geometries=geojson&overview=full&access_token=${token}`;
    const response = await fetch(url);
    const body = await response.json();
    if (!response.ok || body.code !== 'Ok') throw new Error(`${venue.id} → ${id}: ${body.message ?? body.code}`);
    // Start and end on the exact pins; the route snaps to the nearest road in between.
    const line = [venue.coordinates, ...body.routes[0].geometry.coordinates, to].map(round);
    routes[venue.id][id] = simplify(line);
    console.log(`${venue.id} → ${id}: ${line.length} → ${routes[venue.id][id].length} points`);
  }
}

await writeFile(out, `${JSON.stringify(routes)}\n`);
console.log(`Wrote ${out.pathname}`);
