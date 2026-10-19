// Genera assets/map-data.js: geometría del mapa base (Natural Earth vía world-atlas),
// rutas marítimas estilizadas, puntos y "cuadros de cámara" de cada diapositiva.
// Uso: node build-map.mjs <ruta-salida>
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { geoNaturalEarth1, geoPath, geoGraticule10, geoInterpolate, geoDistance, geoClipRectangle } from 'd3-geo';
import { line, curveCatmullRom } from 'd3-shape';
import * as topo from 'topojson-client';
import { presimplify, simplify, quantile } from 'topojson-simplify';

const require = createRequire(import.meta.url);
const read = (f) => JSON.parse(readFileSync(require.resolve('world-atlas/' + f), 'utf8'));
const out = process.argv[2] || 'map-data.js';

const W = 2000;
const proj = geoNaturalEarth1().rotate([-30, 0]);
proj.fitWidth(W, { type: 'Sphere' });
const H = Math.ceil(geoPath(proj).bounds({ type: 'Sphere' })[1][1]);

const c50raw = read('countries-50m.json');
let c50 = presimplify(read('countries-50m.json'));
c50 = simplify(c50, quantile(c50, Number(process.env.Q || 0.2)));
const geoms = c50.objects.countries.geometries.filter((g) => g.id !== '010'); // sin Antártida
const objs = { type: 'GeometryCollection', geometries: geoms };
const path1 = geoPath(proj).digits(1);

const land = path1(topo.merge(c50, geoms));
const borders = path1(topo.mesh(c50, objs, (a, b) => a !== b));
const grat = path1(geoGraticule10());
const sphere = path1({ type: 'Sphere' });

const focus = {
  IRN: '364', OMN: '512', ARE: '784', SAU: '682', QAT: '634', KWT: '414', IRQ: '368', BHR: '048',
  JPN: '392', CHN: '156', IND: '356', KOR: '410', ARG: '032',
};
const countries = {};
for (const [k, id] of Object.entries(focus)) {
  const g = c50raw.objects.countries.geometries.find((x) => x.id === id);
  if (g) countries[k] = path1(topo.feature(c50raw, g));
}

// Detalle 10m sólo para el Golfo / Estrecho (zoom alto)
const c10 = read('land-10m.json');
const pa = proj([45.5, 32.5]), pb = proj([63.5, 19.5]);
const projClip = geoNaturalEarth1().rotate([-30, 0]).fitWidth(W, { type: 'Sphere' })
  .postclip(geoClipRectangle(Math.min(pa[0], pb[0]), Math.min(pa[1], pb[1]), Math.max(pa[0], pb[0]), Math.max(pa[1], pb[1])));
// El recorte rectangular agrega un anillo igual al recuadro completo (artefacto del polo); se descarta
const gulf = geoPath(projClip).digits(2)(topo.feature(c10, c10.objects.land))
  .split('M').filter(Boolean).filter((sp) => (sp.match(/L/g) || []).length > 4).map((sp) => 'M' + sp).join('');

const gulfCoast = geoPath(projClip).digits(2)(topo.mesh(c10, c10.objects.land));

// Rutas (lon, lat) — trazados estilizados de las principales rutas de tanqueros
const HZ = [56.4, 26.5];
const trunk = [HZ, [57.6, 25.5], [60.2, 23.4], [66, 17], [76, 7.4], [80.6, 5.5], [86, 5.9], [94.5, 6.3], [98, 4.6], [101, 2.6], [103.9, 1.25], [107, 5], [112, 11], [115.5, 17.5], [118, 21.3]];
const routesLL = {
  china: [...trunk, [120.4, 25.2], [122.3, 29.9]],
  japan: [...trunk, [121.6, 22.3], [125.2, 26.2], [131, 31], [135.4, 33.3], [139.75, 35.3]],
  korea: [...trunk, [121.6, 22.3], [124.6, 28.3], [127, 33.2], [129.4, 35.4]],
  india: [HZ, [57.6, 25.5], [61, 24.2], [66, 23], [69.7, 22.45]],
  europe: [HZ, [57.6, 25.5], [59.6, 22.4], [55, 14], [49, 12.4], [43.4, 12.6], [40, 16], [37.4, 20.5], [34.6, 27], [32.6, 29.8], [32.3, 31.4], [28, 33.4], [18, 35], [10, 37.6], [0, 37.2], [-6.2, 35.9], [-10, 39.5], [-9.6, 43.6], [-4.5, 48.4], [1.6, 50.9], [4.1, 51.95]],
  rusIndia: [[37.8, 44.7], [35.8, 43], [29.1, 41.25], [26, 39.7], [25, 36.2], [29, 33.2], [32.3, 31.4], [32.6, 29.8], [34.6, 27], [37.4, 20.5], [40, 16], [43.4, 12.6], [50, 12.6], [58, 15.5], [66, 20.5], [69.7, 22.45]],
  rusChina: [[132.9, 42.75], [131.5, 40], [128.2, 34.4], [125.4, 32], [122.3, 29.9]],
  pipeEW: [[49.7, 25.95], [46.8, 24.8], [42.5, 24.4], [38.1, 24.1]],
  pipeHF: [[53.6, 23.8], [55.2, 24.4], [56.35, 25.12]],
};
const lineGen = line().curve(curveCatmullRom.alpha(0.5)).digits ? line().curve(curveCatmullRom.alpha(0.5)).digits(1) : line().curve(curveCatmullRom.alpha(0.5));
const routes = {};
for (const [k, pts] of Object.entries(routesLL)) routes[k] = lineGen(pts.map((p) => proj(p)));

// Geodésica Ormuz → Buenos Aires
const BA = [-58.38, -34.6];
const interp = geoInterpolate(HZ, BA);
const geo = Array.from({ length: 64 }, (_, i) => proj(interp(i / 63)));
routes.geoArg = line()(geo.map((p) => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]));
const kmArg = Math.round(geoDistance(HZ, BA) * 6371);

const ptsLL = {
  hormuz: [56.35, 26.55], rasLaffan: [51.53, 25.9], yanbu: [38.06, 24.09], fujairah: [56.35, 25.12], abqaiq: [49.7, 25.95],
  tokyo: [139.75, 35.45], ningbo: [122.3, 29.9], jamnagar: [69.7, 22.45], ulsan: [129.4, 35.4], rotterdam: [4.1, 51.95],
  novorossiysk: [37.8, 44.7], kozmino: [132.9, 42.75], buenosAires: BA, vacaMuerta: [-68.9, -38.4], marDelPlata: [-57.55, -38.0],
  bandarAbbas: [56.27, 27.18], musandam: [56.25, 26.2], malacca: [101, 2.6], suez: [32.4, 30.2], babElMandeb: [43.4, 12.6],
  geneva: [6.15, 46.2], islamabad: [73.05, 33.7], tehran: [51.4, 35.7], beijing: [116.4, 39.9], delhi: [77.2, 28.6],
};
const pts = {};
for (const [k, p] of Object.entries(ptsLL)) pts[k] = proj(p).map((v) => Math.round(v * 10) / 10);

pts.geoMid = proj(interp(0.5)).map((v) => Math.round(v * 10) / 10);
// Rótulos: [texto, tipo, lon, lat, zoom mínimo, zoom máximo]
const labelsLL = [
  ['Golfo Pérsico', 'sea', 51.2, 27.6, 4, 99], ['Golfo de Omán', 'sea', 58.9, 24.4, 6, 99], ['Mar Arábigo', 'sea', 64, 14.5, 1.6, 9],
  ['Océano Índico', 'sea', 76, -10, 0, 4.5], ['Mar de China Meridional', 'sea', 114.5, 13, 1.6, 9], ['Océano Pacífico', 'sea', 152, 24, 0, 9],
  ['Océano Atlántico', 'sea', -28, -22, 0, 5], ['Mar Rojo', 'sea', 38.6, 20.5, 3, 12], ['Mar Mediterráneo', 'sea', 18, 34.6, 2, 9], ['Mar de Japón', 'sea', 134.5, 40.5, 4, 99],
  ['Estrecho de Ormuz', 'sea', 57.4, 26.15, 14, 99],
  ['Irán', 'land', 54.5, 31.2, 3.5, 99], ['Arabia Saudita', 'land', 45.5, 23.8, 3.5, 99], ['Irak', 'land', 44, 32.8, 4, 99], ['Omán', 'land', 57.2, 21.5, 4, 99],
  ['Emiratos', 'land', 54.3, 23.5, 7, 99], ['Qatar', 'land', 51.15, 25.2, 7, 99], ['Kuwait', 'land', 47.6, 29.4, 7, 99], ['Musandam (Omán)', 'land', 56.2, 25.85, 14, 99],
  ['Argentina', 'land', -66, -33, 0, 99], ['China', 'land', 104, 33, 0, 99], ['India', 'land', 79, 21, 0, 99], ['Japón', 'land', 138.5, 38, 0, 99], ['Rusia', 'land', 95, 61, 1.2, 6],
];
const labels = labelsLL.map(([t, c, lo, la, a, b]) => [t, c, ...proj([lo, la]).map((v) => Math.round(v * 10) / 10), a, b]);

const boxLL = {
  world: [-82, -52, 150, 60],
  gulf: [47.5, 22.3, 60.5, 30.6],
  strait: [53.8, 24.2, 58.6, 27.6],
  asia: [32, -2, 143, 44],
  argentina: [-80, -56, 62, 34],
  chinaIndia: [28, 2, 136, 50],
  japan: [116, 19, 149, 45.5],
  europe: [-12, 10, 62, 56],
};
const boxes = {};
for (const [k, [x0, y0, x1, y1]] of Object.entries(boxLL)) {
  let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
  for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) {
    const p = proj([x0 + (x1 - x0) * i / 20, y0 + (y1 - y0) * j / 20]);
    mnx = Math.min(mnx, p[0]); mxx = Math.max(mxx, p[0]); mny = Math.min(mny, p[1]); mxy = Math.max(mxy, p[1]);
  }
  boxes[k] = [mnx, mny, mxx, mxy].map((v) => Math.round(v));
}

const data = { w: W, h: H, labels, gulfCoast, sphere, grat, land, borders, gulf, countries, routes, pts, boxes, kmArg };
writeFileSync(out, '/* Generado por tools/build-map.mjs — no editar a mano */\nwindow.MAP=' + JSON.stringify(data) + ';\n');
console.log('ok', out, (JSON.stringify(data).length / 1024).toFixed(0) + ' KB', 'H=', H, 'kmArg=', kmArg,
  Object.fromEntries(Object.entries({ land, borders, gulf, ...countries }).map(([k, v]) => [k, (v.length / 1024).toFixed(0)])));
