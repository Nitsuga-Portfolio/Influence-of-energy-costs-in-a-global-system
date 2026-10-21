// Genera assets/map-data.js: carta náutica en proyección Mercator (la de las cartas de navegación),
// países con tono propio, detalle 10 m del Golfo, rutas, áreas de interés, rótulos y cuadros de cámara.
// Datos: Natural Earth vía world-atlas (dominio público). Uso: node build-map.mjs <ruta-salida>
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { geoMercator, geoPath, geoGraticule, geoInterpolate, geoDistance } from 'd3-geo';
import { line, curveCatmullRom } from 'd3-shape';
import * as topo from 'topojson-client';
import { presimplify, simplify, quantile } from 'topojson-simplify';

const require = createRequire(import.meta.url);
const read = (f) => JSON.parse(readFileSync(require.resolve('world-atlas/' + f), 'utf8'));
const out = process.argv[2] || 'map-data.js';
const r1 = (v) => Math.round(v * 10) / 10;

/* ---------- Proyección: Mercator centrada en 30° E, recortada entre 85° N y 78° S ---------- */
const W = 2000, LAT_N = 85, LAT_S = -78, CENTER = 30;
const base = () => geoMercator().rotate([-CENTER, 0]).scale(W / (2 * Math.PI)).translate([W / 2, 0]);
const TY = -base()([CENTER, LAT_N])[1];
const H = Math.round(base()([CENTER, LAT_S])[1] + TY);
const makeProj = (extent = [[0, 0], [W, H]]) => base().translate([W / 2, TY]).clipExtent(extent);
const proj = makeProj();
const P = (ll) => proj(ll).map(r1);

/* ---------- Países (50 m simplificado; los casos de estudio a resolución completa) ---------- */
const ISO = { ARG: '032', CHN: '156', IND: '356', JPN: '392', KOR: '410', IRN: '364', IRQ: '368', KWT: '414', SAU: '682', BHR: '048', QAT: '634', ARE: '784', OMN: '512', RUS: '643', USA: '840' };
const FULL = new Set(['032', '156', '356', '392']); // casos de estudio a resolución completa
const c50raw = read('countries-50m.json');
let c50 = presimplify(read('countries-50m.json'));
c50 = simplify(c50, quantile(c50, Number(process.env.Q || 0.2)));
const geoms = c50.objects.countries.geometries;
const keep = geoms.map((g, i) => [g, i]);

// Coloreo de mapa: países vecinos nunca comparten tono (5 tonos)
const nb = topo.neighbors(geoms);
const color = new Array(geoms.length).fill(-1);
const order = keep.map(([, i]) => i).sort((a, b) => nb[b].length - nb[a].length);
for (const i of order) {
  const used = new Set(nb[i].map((j) => color[j]));
  let c = 0; while (used.has(c)) c++;
  color[i] = c % 5;
}
geoms.forEach((g, i) => { if (g.id === '010') color[i] = 5; }); // Antártida: hielo
const path1 = geoPath(proj).digits(1);
const countries = keep.map(([g, i]) => {
  const src = FULL.has(g.id) ? c50raw : c50;
  const geom = FULL.has(g.id) ? c50raw.objects.countries.geometries.find((x) => x.id === g.id) : g;
  return [g.id || '', color[i], path1(topo.feature(src, geom))];
}).filter((c) => c[2]);
const colorById = Object.fromEntries(countries.map(([id, c]) => [id, c]));

const keptObj = { type: 'GeometryCollection', geometries: keep.map(([g]) => g) };
const land = path1(topo.merge(c50, keptObj.geometries));
const borders = path1(topo.mesh(c50, keptObj, (a, b) => a !== b));
const grat = path1(geoGraticule().step([10, 10]).extent([[-180, LAT_S - 1], [180.01, LAT_N + 1]])());
const sphere = `M0,0H${W}V${H}H0Z`;

/* ---------- Detalle 10 m del Golfo y el Estrecho ---------- */
const ga = P([45.5, 32.5]), gb = P([63.5, 19.5]);
const gulfRect = [Math.min(ga[0], gb[0]), Math.min(ga[1], gb[1]), Math.max(ga[0], gb[0]), Math.max(ga[1], gb[1])];
const projG = makeProj([[gulfRect[0], gulfRect[1]], [gulfRect[2], gulfRect[3]]]);
const pathG = geoPath(projG).digits(2);
const dropRect = (d) => (d || '').split('M').filter(Boolean).filter((sp) => (sp.match(/L/g) || []).length > 4).map((sp) => 'M' + sp).join('');
const c10 = read('countries-10m.json');
const gulfCountries = c10.objects.countries.geometries
  .map((g) => [g.id || '', colorById[g.id] ?? 0, dropRect(pathG(topo.feature(c10, g)))])
  .filter((c) => c[2]);
const gulfBorders = pathG(topo.mesh(c10, c10.objects.countries, (a, b) => a !== b)) || '';
const l10 = read('land-10m.json');
const gulfCoast = pathG(topo.mesh(l10, l10.objects.land)) || '';

/* ---------- Rutas de tanqueros (trazado estilizado) ---------- */
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
const lineGen = line().curve(curveCatmullRom.alpha(0.5)).digits(1);
const routes = {};
for (const [k, pts] of Object.entries(routesLL)) routes[k] = lineGen(pts.map((p) => proj(p)));
const BA = [-58.38, -34.6];
const geoArc = (to, n = 64) => {
  const f = geoInterpolate(HZ, to);
  return line()(Array.from({ length: n }, (_, i) => P(f(i / (n - 1)))));
};
routes.geoArg = geoArc(BA);
routes.arcARG = routes.geoArg;
routes.arcCHN = geoArc([116.4, 39.9], 48);
routes.arcIND = geoArc([77.2, 28.6], 32);
routes.arcJPN = geoArc([139.75, 35.68], 48);
const kmArg = Math.round(geoDistance(HZ, BA) * 6371);

/* ---------- Áreas de interés ---------- */
const poly = (pts) => 'M' + pts.map((p) => P(p).join(',')).join('L') + 'Z';
const aoi = {
  // Aguas: se dibujan debajo de la tierra, así que alcanza con un contorno aproximado
  risk: poly([[47.6, 30.2], [48.8, 30.6], [50.5, 30.2], [53, 28.2], [56.2, 27.3], [57.8, 26.6], [59.6, 25.6], [61.8, 25.1], [62.4, 22.6], [59.8, 21.4], [58.6, 23.4], [56.9, 24.6], [55.6, 25.3], [54, 24.1], [52, 23.9], [50.6, 24.4], [49.9, 26.4], [48.5, 28]]),
  redsea: poly([[38.2, 20.4], [41.6, 16.2], [43.1, 12.7], [45, 12.4], [51.4, 11.7], [52.2, 13.8], [45.2, 14.3], [43.6, 14.1], [42.4, 17.4], [40.2, 20.8]]),
  // Tierra: Cuenca Neuquina, donde está Vaca Muerta (contorno aproximado)
  vaca: poly([[-71, -36.2], [-69.6, -35.4], [-68.2, -36.1], [-67.3, -37.6], [-67.6, -39.2], [-68.8, -40.2], [-70.4, -39.6], [-71.2, -38]]),
};
const prodIds = ['364', '368', '414', '682', '048', '634', '784', '512'];

/* ---------- Puntos ---------- */
const ptsLL = {
  hormuz: [56.35, 26.55], rasLaffan: [51.53, 25.9], yanbu: [38.06, 24.09], fujairah: [56.35, 25.12], abqaiq: [49.7, 25.95],
  tokyo: [139.75, 35.45], ningbo: [122.3, 29.9], jamnagar: [69.7, 22.45], ulsan: [129.4, 35.4], rotterdam: [4.1, 51.95],
  novorossiysk: [37.8, 44.7], kozmino: [132.9, 42.75], buenosAires: BA, vacaMuerta: [-68.9, -38.4], marDelPlata: [-57.55, -38.0],
  bandarAbbas: [56.27, 27.18], musandam: [56.25, 26.2], malacca: [101, 2.6], suez: [32.4, 30.2], babElMandeb: [43.4, 12.6],
  capeGood: [18.5, -34.6], tehran: [51.4, 35.7], beijing: [116.4, 39.9], delhi: [77.2, 28.6],
};
const pts = Object.fromEntries(Object.entries(ptsLL).map(([k, p]) => [k, P(p)]));
pts.geoMid = P(geoInterpolate(HZ, BA)(0.5));

/* ---------- Rótulos: [texto, tipo, lon, lat, zoom mín, zoom máx, bandera, área] ---------- */
const labelsLL = [
  ['Golfo Pérsico', 'sea', 51.2, 27.7, 4, 99], ['Golfo de Omán', 'sea', 59.6, 24.6, 6, 99], ['Mar Arábigo', 'sea', 64, 14.5, 1.4, 9],
  ['Océano Índico', 'sea', 76, -12, 0, 4.5], ['Mar de China Meridional', 'sea', 114.5, 13, 1.6, 9], ['Océano Pacífico', 'sea', 160, 22, 0, 9],
  ['Océano Pacífico', 'sea', -120, -18, 0, 4], ['Océano Atlántico', 'sea', -32, -22, 0, 5], ['Océano Atlántico', 'sea', -42, 30, 0, 5],
  ['Mar Rojo', 'sea', 38.6, 20.6, 3, 12], ['Mar Mediterráneo', 'sea', 18, 34.4, 1.6, 9], ['Mar de Japón', 'sea', 134.5, 40.5, 3.2, 99],
  ['Océano Glacial Ártico', 'sea', 60, 78, 0, 3], ['Océano Austral', 'sea', 40, -58, 0, 3], ['Mar de China Oriental', 'sea', 126, 29, 3, 99],
  ['Estrecho de Ormuz', 'sea', 57.25, 26.25, 14, 99],
  ['Irán', 'land', 54.5, 31.6, 3.5, 99, 'ir'], ['Arabia Saudita', 'land', 44.3, 24.8, 3.5, 99, 'sa'], ['Irak', 'land', 43.8, 33.2, 4, 99, 'iq'],
  ['Omán', 'land', 56.9, 21.2, 4, 99, 'om'], ['Emiratos', 'land', 54.3, 23.4, 7, 99, 'ae'], ['Qatar', 'land', 51.1, 25.15, 9, 99, 'qa'],
  ['Kuwait', 'land', 47.6, 29.4, 7, 99, 'kw'], ['Musandam (Omán)', 'land', 56.2, 25.85, 14, 99],
  ['Argentina', 'land', -66, -33, 0, 99, 'ar'], ['China', 'land', 104, 33.5, 0, 99, 'cn'], ['India', 'land', 78.6, 21.5, 0, 99, 'in'],
  ['Japón', 'land', 139.4, 38.6, 0, 99, 'jp'], ['Rusia', 'land', 95, 62, 0, 6, 'ru'], ['Corea del Sur', 'land', 128, 36.4, 4, 99, 'kr'],
  ['Estados Unidos', 'land', -99, 39.5, 0, 5, 'us'], ['Brasil', 'land', -52, -10, 0, 5], ['Australia', 'land', 134, -25, 0, 5],
  ['África', 'land', 20, 5, 0, 2.6], ['Europa', 'land', 15, 50.5, 0, 2.2],
  // Áreas de interés (sólo visibles cuando el área está activa)
  ['Exportadores del Golfo', 'aoi-prod', 50.4, 20.2, 0, 99, null, 'prod'],
  ['Zona de alto riesgo', 'aoi-risk', 53.2, 26.75, 4, 99, null, 'risk'],
  ['Riesgo en Bab el-Mandeb', 'aoi-risk', 48.6, 13.1, 1.6, 99, null, 'redsea'],
  ['Cuenca Neuquina · Vaca Muerta', 'aoi-prod', -69.2, -41.6, 0, 99, null, 'vaca'],
  ['Proveedor alternativo', 'aoi-rus', 62, 55.5, 0, 99, null, 'rus'],
];
const labels = labelsLL.map(([t, c, lo, la, a, b, f = null, z = null]) => [t, c, ...P([lo, la]), a, b, f, z]);

/* ---------- Cuadros de cámara ---------- */
const boxLL = {
  world: [-80, -48, 150, 60],
  gulf: [47.5, 22.3, 60.5, 30.6],
  strait: [53.8, 24.2, 58.6, 27.6],
  asia: [30, -6, 140, 42],
  argentina: [-78, -55, 62, 33],
  chinaIndia: [28, 4, 136, 52],
  japan: [116, 20, 149, 45.5],
};
const boxes = {};
for (const [k, [x0, y0, x1, y1]] of Object.entries(boxLL)) {
  const a = P([x0, y1]), b = P([x1, y0]);
  boxes[k] = [Math.round(a[0]), Math.round(a[1]), Math.round(b[0]), Math.round(b[1])];
}

const data = { w: W, h: H, sphere, grat, land, borders, countries, gulfRect, gulfCountries, gulfBorders, gulfCoast, routes, aoi, prodIds, iso: ISO, pts, labels, boxes, kmArg };
const json = JSON.stringify(data);
writeFileSync(out, '/* Generado por tools/build-map.mjs — no editar a mano */\nwindow.MAP=' + json + ';\n');
const kb = (s) => (s.length / 1024).toFixed(0);
console.log('ok', out, kb(json) + ' KB', 'W×H', W, H, 'países', countries.length, 'golfo', gulfCountries.length,
  { countries: kb(countries.map((c) => c[2]).join('')), land: kb(land), borders: kb(borders), gulf: kb(gulfCountries.map((c) => c[2]).join('')) + '+' + kb(gulfCoast) });
