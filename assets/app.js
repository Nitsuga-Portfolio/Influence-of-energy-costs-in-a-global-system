/* Del Estrecho de Ormuz al surtidor — motor de la presentación
   Mapa con "cámara" que se mueve entre diapositivas, pasos internos, notas, índice y referencias. */
(() => {
  'use strict';
  const M = window.MAP;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mk = (tag, attrs = {}, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (parent) parent.appendChild(el);
    return el;
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => matchMedia('(max-width: 860px)').matches;

  /* ---------------- Referencias ---------------- */
  const REFS = [
    null,
    ['Fuentes del caso', 'U.S. Energy Information Administration (EIA). <i>World Oil Transit Chokepoints</i>.', 'https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints'],
    ['Fuentes del caso', 'Gross, S. y Beane, R. (8 de junio de 2026). <i>From chokepoint to crisis: The Strait of Hormuz and global oil markets</i>. Brookings Institution.', 'https://www.brookings.edu/articles/from-chokepoint-to-crisis-the-strait-of-hormuz-and-global-oil-markets/'],
    ['Fuentes del caso', 'Agencia Internacional de Energía (11 de marzo de 2026). Liberación coordinada de 400 millones de barriles; contribuciones por país. Reseña de Enerdata, 13/03/2026.', 'https://www.enerdata.net/publications/daily-energy-news/iea-member-countries-agree-release-400-mbl-oil-stocks.html'],
    ['Cronologías de verificación', 'Cronología consolidada del conflicto y del tránsito marítimo (UKMTO, OMI, Kpler): <i>2026 Strait of Hormuz crisis</i>. Consultado en octubre de 2026.', 'https://en.wikipedia.org/wiki/2026_Strait_of_Hormuz_crisis'],
    ['Cronologías de verificación', 'Cierres diarios del Brent y eventos de mercado: <i>2026–2028 world oil market chronology</i>. Consultado en octubre de 2026.', 'https://en.wikipedia.org/wiki/2026%E2%80%932028_world_oil_market_chronology'],
    ['Cronologías de verificación', 'Medidas nacionales frente a la crisis de combustibles: <i>2026 Iran war fuel crisis</i>. Consultado en octubre de 2026.', 'https://en.wikipedia.org/wiki/2026_Iran_war_fuel_crisis'],
    ['Fuentes del caso', 'EIA (31 de julio de 2026). <i>China’s crude oil imports fell in the second quarter</i>. Today in Energy.', 'https://www.eia.gov/TODAYinENERGY/detail.php?id=67905'],
    ['Fuentes del caso', 'Downs, E. y Meidan, M. (13 de agosto de 2026). <i>How China is managing lower oil imports</i>. Center on Global Energy Policy, Columbia University.', 'https://www.energypolicy.columbia.edu/how-china-is-managing-lower-oil-imports/'],
    ['Fuentes del caso', 'Enerdata (10 de marzo de 2026). <i>US grants one-month waiver for India’s Russian oil imports amid Middle East crisis</i>.', 'https://www.enerdata.net/publications/daily-energy-news/us-grants-one-month-waiver-indias-russian-oil-import-amid-middle-east-crisis.html'],
    ['Fuentes del caso', 'Datos de Kpler sobre importaciones de crudo de India, junio de 2026. Citado en Superkalam, 20/06/2026.', 'https://superkalam.com/current-affairs/20-06-2026/india-s-russian-oil-imports-at-record-high-set-to-remain-core-of-crude-diet-pg3-8bf7ab59-48cf-4c58-917b-89f1a6a98d19'],
    ['Fuentes del caso', 'Atlantic Council (2026). <i>How Japan is managing the energy shock</i>. Issue brief.', 'https://www.atlanticcouncil.org/in-depth-research-reports/issue-brief/how-japan-is-managing-the-energy-shock/'],
    ['Fuentes del caso', 'Jiji Press, vía Adnkronos (18 y 19 de marzo de 2026). Récord de ¥190,8 por litro y reanudación de los subsidios a la nafta en Japón.', 'https://english.adnkronos.com/2026/03/19/japan-resumes-gasoline-subsidies-amid-middle-east-tensions/'],
    ['Argentina', 'LM Neuquén (2 de abril de 2026). YPF congela los combustibles 45 días y activa un buffer para amortiguar la suba del petróleo.', 'https://mase.lmneuquen.com/pais/ypf-congela-los-combustibles-45-dias-y-activa-un-buffer-amortiguar-la-suba-del-petroleo-n1233720'],
    ['Argentina', 'Perfil (29 de abril de 2026). YPF aumentó el precio de sus combustibles 27 días después de anunciar un congelamiento por 45 días.', 'https://www.perfil.com/noticias/sociedad/ypf-aumento-el-precio-de-sus-combustibles-apenas-27-dias-despues-de-anunciar-un-congelamiento-por-45-dias.phtml'],
    ['Argentina', 'Bolsa de Comercio de Rosario, reseñado por Crónica (2026). Argentina registró el mayor superávit comercial energético para un primer semestre.', 'https://www.cronica.com.ar/politica/argentina-registro-el-mayor-superavit-comercial-energetico-para-un-primer-semestre-7856/'],
    ['Argentina', 'Boletín Oficial de la República Argentina. Decretos 617/2025, 562/2026 y 829/2026: postergación de la actualización del Impuesto a los Combustibles Líquidos y al Dióxido de Carbono.', ''],
    ['Argentina', 'Secretaría de Energía de la Nación (marzo de 2026). Resolución sobre corte voluntario de bioetanol; reseña de Reuters.', ''],
    ['Organismos', 'Federal Reserve (mayo de 2026). <i>Financial Stability Report</i>.', 'https://www.federalreserve.gov/publications/financial-stability-report.htm'],
    ['Organismos', 'Daiwa Institute of Research (marzo de 2026) y Oxford Energy Forum n.º 149 (mayo de 2026): escenarios de impacto en el PIB y dependencia energética de Japón.', ''],
    ['Organismos', 'Fondo Monetario Internacional (julio de 2026). <i>World Economic Outlook Update</i>.', ''],
    ['Literatura económica', 'Hamilton, J. D. (1983). Oil and the macroeconomy since World War II. <i>Journal of Political Economy</i>, 91(2), 228–248.', ''],
    ['Literatura económica', 'Kilian, L. (2009). Not all oil price shocks are alike. <i>American Economic Review</i>, 99(3), 1053–1069.', ''],
    ['Literatura económica', 'Jordà, Ò. (2005). Estimation and inference of impulse responses by local projections. <i>American Economic Review</i>, 95(1), 161–182.', ''],
    ['Literatura económica', 'Bollerslev, T. (1986). Generalized autoregressive conditional heteroskedasticity. <i>Journal of Econometrics</i>, 31(3), 307–327.', ''],
    ['Literatura económica', 'Baumeister, C. y Hamilton, J. D. (2019). Structural interpretation of vector autoregressions with incomplete identification: Revisiting the role of oil supply and demand shocks. <i>American Economic Review</i>, 109(5), 1873–1910.', ''],
    ['Bibliografía de la cátedra', 'Ferrer, A. (1998). <i>Hechos y ficciones de la globalización. Argentina y el Mercosur en el sistema internacional</i>. FCE.', ''],
    ['Bibliografía de la cátedra', 'Krugman, P. (1997). <i>Desarrollo, geografía y teoría económica</i>. Antoni Bosch.', ''],
    ['Bibliografía de la cátedra', 'Méndez, R. (1997). <i>Geografía económica. La lógica espacial del capitalismo global</i>. Ariel.', ''],
    ['Bibliografía de la cátedra', 'Sohr, R. (2010). <i>Chao petróleo. El mundo y las energías del futuro</i>. Debate.', ''],
    ['Bibliografía de la cátedra', 'Knox, P. y Agnew, J. (1999). <i>Geografía económica mundial</i>. Fundación Hernandarias.', ''],
  ];

  const refsEl = $('#refs');
  if (refsEl) {
    const groups = new Map();
    REFS.forEach((r, i) => { if (r) { if (!groups.has(r[0])) groups.set(r[0], []); groups.get(r[0]).push([i, r]); } });
    let html = '';
    for (const [g, items] of groups) {
      html += `<h3>${g}</h3><ol>` + items.map(([i, r]) => `<li value="${i}">${r[1]}${r[2] ? ` <a href="${r[2]}" target="_blank" rel="noopener">enlace</a>` : ''}</li>`).join('') + '</ol>';
    }
    refsEl.innerHTML = html;
  }
  $$('sup.r').forEach((s) => { s.textContent = s.dataset.r; s.tabIndex = 0; s.setAttribute('aria-label', 'Fuente ' + s.dataset.r); });
  const tip = $('#tip');
  const showTip = (e) => {
    const s = e.target.closest('sup.r'); if (!s) return;
    const r = REFS[+s.dataset.r]; if (!r) return;
    tip.innerHTML = `<b>[${s.dataset.r}]</b> ${r[1]}`;
    tip.style.display = 'block';
    const b = s.getBoundingClientRect();
    const x = Math.min(innerWidth - tip.offsetWidth - 10, Math.max(10, b.left - 20));
    const y = b.top - tip.offsetHeight - 8 < 8 ? b.bottom + 8 : b.top - tip.offsetHeight - 8;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  };
  document.addEventListener('mouseover', showTip);
  document.addEventListener('focusin', showTip);
  document.addEventListener('mouseout', (e) => { if (e.target.closest('sup.r')) tip.style.display = 'none'; });
  document.addEventListener('focusout', (e) => { if (e.target.closest('sup.r')) tip.style.display = 'none'; });

  /* ---------------- Mapa base ---------------- */
  const svg = $('#map');
  const world = $('#world');
  const overlay = $('#overlay');
  mk('path', { d: M.sphere, class: 'sea' }, world);
  mk('path', { d: M.grat, class: 'grat' }, world);
  const masked = mk('g', { mask: 'url(#gulfHole)' }, world);
  mk('path', { d: M.land, class: 'band' }, masked);
  mk('path', { d: M.land, class: 'band2' }, masked);
  mk('path', { d: M.land, class: 'land' }, masked);
  const gulfG = mk('g', {}, world);
  mk('path', { d: M.gulfCoast, class: 'band' }, gulfG);
  mk('path', { d: M.gulfCoast, class: 'band2' }, gulfG);
  const gulfLand = mk('path', { d: M.gulf, class: 'land' }, gulfG);
  const ctryEls = {};
  for (const [k, d] of Object.entries(M.countries)) ctryEls[k] = mk('path', { d, class: 'ctry', 'data-c': k, mask: 'url(#gulfHole)' }, world);
  mk('path', { d: M.borders, class: 'borders', mask: 'url(#gulfHole)' }, world);
  mk('path', { d: M.gulfCoast, class: 'coast' }, gulfG);
  // Máscara: el detalle 10 m reemplaza al 50 m dentro del recuadro del Golfo
  requestAnimationFrame(() => {
    const b = gulfLand.getBBox();
    const all = $('#maskAll'), hole = $('#maskGulf'), mask = $('#gulfHole');
    mask.setAttribute('x', -100); mask.setAttribute('y', -100); mask.setAttribute('width', M.w + 200); mask.setAttribute('height', M.h + 200);
    all.setAttribute('x', -100); all.setAttribute('y', -100); all.setAttribute('width', M.w + 200); all.setAttribute('height', M.h + 200);
    hole.setAttribute('x', b.x + 0.15); hole.setAttribute('y', b.y + 0.15); hole.setAttribute('width', b.width - 0.3); hole.setAttribute('height', b.height - 0.3);
  });

  const routesG = mk('g', {}, world);
  const oilRoutes = ['europe', 'india', 'korea', 'china', 'japan'];
  const routeEls = {};
  oilRoutes.forEach((k) => mk('path', { d: M.routes[k], class: 'route oil-base' }, routesG));
  oilRoutes.forEach((k) => { routeEls[k] = mk('path', { d: M.routes[k], class: 'route oil' }, routesG); });
  ['rusIndia', 'rusChina'].forEach((k) => { routeEls[k] = mk('path', { d: M.routes[k], class: 'route alt' }, routesG); });
  ['pipeEW', 'pipeHF'].forEach((k) => mk('path', { d: M.routes[k], class: 'route pipe' }, routesG));
  const geoEl = mk('path', { d: M.routes.geoArg, class: 'route geo' }, routesG);

  /* Capa superpuesta: rótulos, ciudades, barcos y el punto crítico */
  const labG = mk('g', {}, overlay);
  const labels = M.labels.map(([t, c, x, y, a, b]) => {
    const el = mk('text', { class: c === 'sea' ? 'lbl-sea' : 'lbl-land', 'text-anchor': 'middle' }, labG);
    el.textContent = t;
    return { el, x, y, a, b };
  });
  const CITY = {
    tokyo: 'Tokio', ningbo: 'Ningbo', jamnagar: 'Jamnagar', rotterdam: 'Róterdam', ulsan: 'Ulsan', bandarAbbas: 'Bandar Abbas',
    yanbu: 'Yanbu', fujairah: 'Fujairah', abqaiq: 'Abqaiq', rasLaffan: 'Ras Laffan', malacca: 'Estrecho de Malaca', babElMandeb: 'Bab el-Mandeb',
    suez: 'Suez', novorossiysk: 'Novorossiysk', kozmino: 'Kozmino', vacaMuerta: 'Vaca Muerta', marDelPlata: 'Mar del Plata', buenosAires: 'Buenos Aires', tehran: 'Teherán',
  };
  const cityG = mk('g', {}, overlay);
  const cities = {};
  for (const [k, name] of Object.entries(CITY)) {
    const g = mk('g', { class: 'fx' }, cityG);
    mk('circle', { r: 3.6, class: 'city' }, g);
    const t = mk('text', { class: 'lbl-city', x: 7, y: 4 }, g);
    t.textContent = name;
    cities[k] = { g, p: M.pts[k] };
  }
  const shipG = mk('g', {}, overlay);
  const ships = [];
  const addShips = (key, n, cls) => {
    const path = routeEls[key];
    const L = path.getTotalLength();
    for (let i = 0; i < n; i++) ships.push({ path, L, s: (i / n) * L + Math.random() * 20, el: mk('circle', { r: 3, class: 'ship ' + cls }, shipG), key });
  };
  oilRoutes.forEach((k) => addShips(k, k === 'india' ? 1 : 3, 'oilship'));
  addShips('rusIndia', 3, 'altship'); addShips('rusChina', 1, 'altship');

  const chokeG = mk('g', {}, overlay);
  const pulse = mk('circle', { r: 6, class: 'pulse' }, chokeG);
  mk('circle', { r: 9, class: 'choke' }, chokeG);
  mk('circle', { r: 3.5, class: 'choke-core' }, chokeG);
  const xm = mk('g', { class: 'xmark' }, chokeG);
  mk('line', { x1: -9, y1: -9, x2: 9, y2: 9 }, xm); mk('line', { x1: -9, y1: 9, x2: 9, y2: -9 }, xm);
  if (reduced) pulse.remove();

  /* ---------------- Cámara ---------------- */
  let cam = null; // {cx, cy, lk, ax, ay}
  let tween = null;
  const view = { k: 1, tx: 0, ty: 0 };

  function areaFor(slide) {
    const W = svg.clientWidth, H = svg.clientHeight;
    const bar = small() ? 0 : 54;
    const panel = $('.panel', slide);
    if (small() || slide.classList.contains('full') || !panel) return { x: 0, y: 0, w: W, h: H - bar };
    const r = panel.getBoundingClientRect();
    if (slide.classList.contains('right')) return { x: 0, y: 0, w: Math.max(200, r.left - 16), h: H - bar };
    const x = r.right + 16;
    return { x, y: 0, w: Math.max(200, W - x), h: H - bar };
  }
  function targetFor(slide, camName) {
    const b = M.boxes[camName] || M.boxes.world;
    const a = areaFor(slide);
    const bw = b[2] - b[0], bh = b[3] - b[1];
    const k = Math.min(a.w / bw, a.h / bh) * 0.9;
    return { cx: (b[0] + b[2]) / 2, cy: (b[1] + b[3]) / 2, lk: Math.log(k), ax: a.x + a.w / 2, ay: a.y + a.h / 2 };
  }
  function applyCam(c) {
    const k = Math.exp(c.lk);
    view.k = k; view.tx = c.ax - k * c.cx; view.ty = c.ay - k * c.cy;
    world.setAttribute('transform', `translate(${view.tx.toFixed(2)} ${view.ty.toFixed(2)}) scale(${k.toFixed(5)})`);
  }
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  // Trayectoria de zoom "suave y eficiente" (van Wijk y Nuij, 2003): aleja lo justo para viajar y vuelve a acercar
  function zoomPath(p0, p1) {
    const rho = 1.25, rho2 = rho * rho, rho4 = rho2 * rho2;
    const [ux0, uy0, w0] = p0, [ux1, uy1, w1] = p1;
    const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy;
    if (d2 < 1e-9) {
      const S = Math.log(w1 / w0) / rho;
      const f = (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
      f.S = Math.abs(S); return f;
    }
    const d1 = Math.sqrt(d2);
    const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
    const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    const S = (r1 - r0) / rho;
    const f = (t) => {
      const s = t * S, c0 = Math.cosh(r0);
      const u = (w0 / (rho2 * d1)) * (c0 * Math.tanh(rho * s + r0) - Math.sinh(r0));
      return [ux0 + u * dx, uy0 + u * dy, (w0 * c0) / Math.cosh(rho * s + r0)];
    };
    f.S = Math.abs(S); return f;
  }
  const REF = 1000; // ancho de referencia en pantalla para expresar el zoom como "ancho visible"
  function moveCam(target, instant) {
    if (!cam || instant || reduced) { cam = target; applyCam(cam); tween = null; camMoving(false); return; }
    const from = { ...cam };
    const same = Math.abs(from.cx - target.cx) < .5 && Math.abs(from.cy - target.cy) < .5 && Math.abs(from.lk - target.lk) < .01 && Math.abs(from.ax - target.ax) < 2;
    if (same) return;
    const path = zoomPath([from.cx, from.cy, REF / Math.exp(from.lk)], [target.cx, target.cy, REF / Math.exp(target.lk)]);
    const dur = Math.max(900, Math.min(2300, 700 + path.S * 700));
    const t0 = performance.now();
    camMoving(true);
    tween = (now) => {
      const t = Math.min(1, (now - t0) / dur), e = easeSine(t), e2 = ease(t);
      const [cx, cy, w] = path(e);
      cam = { cx, cy, lk: Math.log(REF / w), ax: from.ax + (target.ax - from.ax) * e2, ay: from.ay + (target.ay - from.ay) * e2 };
      applyCam(cam);
      if (t >= 1) { tween = null; camMoving(false); }
    };
  }
  // Las llamadas sobre el mapa esperan a que la cámara se detenga
  let calloutTimer = null;
  function camMoving(moving) {
    clearTimeout(calloutTimer);
    const active = slides && slides[cur];
    const els = active ? $$('.callout', active) : [];
    if (moving) els.forEach((el) => el.classList.remove('show'));
    else calloutTimer = setTimeout(() => els.forEach((el) => el.classList.add('show')), 120);
  }
  const toScreen = (p) => [view.k * p[0] + view.tx, view.k * p[1] + view.ty];

  /* ---------------- Bucle de animación ---------------- */
  let state = { layers: new Set(), cities: new Set() };
  let throttle = 1;
  let last = performance.now();
  const callouts = [];
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (tween) tween(now);
    const k = view.k;
    // Rótulos según nivel de zoom
    for (const l of labels) {
      const [x, y] = toScreen([l.x, l.y]);
      const on = k >= l.a && k <= l.b;
      l.el.setAttribute('x', x.toFixed(1)); l.el.setAttribute('y', y.toFixed(1));
      l.el.style.opacity = on ? 1 : 0;
    }
    for (const [key, c] of Object.entries(cities)) {
      const [x, y] = toScreen(c.p);
      c.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      c.g.classList.toggle('on', state.cities.has(key));
    }
    const [hx, hy] = toScreen(M.pts.hormuz);
    chokeG.setAttribute('transform', `translate(${hx.toFixed(1)} ${hy.toFixed(1)})`);
    // Barcos
    const flowing = state.layers.has('flows');
    const blocked = state.layers.has('blocked');
    const russia = state.layers.has('russia');
    const speed = 22 / Math.pow(Math.max(1, k), 0.75);
    const goal = flowing ? 1 : 0;
    throttle += (goal - throttle) * Math.min(1, dt * 1.6); // inercia: los barcos frenan y arrancan de a poco
    for (const s of ships) {
      const alt = s.key.startsWith('rus');
      const visible = alt ? russia : (flowing || blocked);
      s.el.style.opacity = visible ? 1 : 0;
      if (!visible) continue;
      const v = alt ? 1 : throttle;
      if (!reduced && v > 0.002) s.s = (s.s + speed * dt * 10 * v) % s.L;
      const p = s.path.getPointAtLength(s.s);
      const [x, y] = toScreen([p.x, p.y]);
      s.el.setAttribute('cx', x.toFixed(1)); s.el.setAttribute('cy', y.toFixed(1));
      s.el.classList.toggle('halt', !alt && blocked && !flowing && throttle < 0.5);
      if (alt) s.el.style.fill = 'var(--ink)';
    }
    for (const c of callouts) {
      if (!c.slide.classList.contains('active')) continue;
      const p = M.pts[c.anchor]; if (!p) continue;
      const [x, y] = toScreen(p);
      c.el.style.transform = `translate(${(x + c.dx).toFixed(0)}px, ${(y + c.dy).toFixed(0)}px)`;
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- Diapositivas y pasos ---------------- */
  const slides = $$('.slide');
  const N = slides.length;
  let cur = -1;
  slides.forEach((s) => {
    $$('.callout', s).forEach((el) => {
      el.style.left = '0px'; el.style.top = '0px';
      callouts.push({ el, slide: s, anchor: el.dataset.anchor, dx: +el.dataset.dx || 0, dy: +el.dataset.dy || 0 });
    });
  });
  const stepsOf = (s) => $$('[data-step]', s);

  function computeState(slide) {
    const st = { cam: slide.dataset.cam, layers: slide.dataset.layers || '', cities: slide.dataset.cities || '', focus: slide.dataset.focus || '', dim: slide.dataset.dim, upto: null };
    for (const el of stepsOf(slide)) {
      if (el.classList.contains('pending')) break;
      for (const key of ['cam', 'layers', 'cities', 'focus', 'upto']) if (el.dataset[key] !== undefined) st[key] = el.dataset[key];
    }
    return st;
  }
  function applyState(slide, instant, entering) {
    const st = computeState(slide);
    state.layers = new Set(st.layers.split(/\s+/).filter(Boolean));
    state.cities = new Set(st.cities.split(',').filter(Boolean));
    svg.setAttribute('class', [...state.layers].map((l) => 'L-' + l).join(' ') + (st.dim ? ' dim' : ''));
    const focus = new Set(st.focus.split(',').filter(Boolean));
    for (const [k, el] of Object.entries(ctryEls)) el.classList.toggle('on', focus.has(k));
    moveCam(targetFor(slide, st.cam), instant);
    if (slide.querySelector('#brent')) brentTo(st.upto || '2026-02-28', instant || entering);
  }

  function countUp(slide) {
    $$('[data-count]', slide).forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const dec = +(el.dataset.dec || 0);
      const node = el.firstChild;
      if (!node || node.nodeType !== 3) return;
      const fmt = (v) => v.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.thousands ? ' km' : '');
      if (reduced) { node.textContent = fmt(target); return; }
      const t0 = performance.now(), dur = 1500;
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        node.textContent = fmt(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function go(i, opts = {}) {
    i = Math.max(0, Math.min(N - 1, i));
    const prev = slides[cur];
    const s = slides[i];
    const back = opts.back;
    if (prev && prev !== s) {
      prev.classList.remove('active');
      prev.classList.add('leaving');
      $$('.callout', prev).forEach((el) => el.classList.remove('show'));
      clearTimeout(prev._leave);
      prev._leave = setTimeout(() => prev.classList.remove('leaving'), 420);
    }
    s.classList.remove('leaving'); clearTimeout(s._leave);
    stepsOf(s).forEach((el) => el.classList.toggle('pending', !(back || small() || opts.all)));
    s.classList.add('active');
    const panel = $('.panel', s); if (panel) panel.scrollTop = 0;
    cur = i;
    applyState(s, opts.instant, true);
    if (!tween) camMoving(false);
    setTimeout(() => countUp(s), 260);
    updateChrome();
    if (location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));
  }
  function next() {
    const s = slides[cur];
    const pend = stepsOf(s).find((el) => el.classList.contains('pending'));
    if (pend) {
      pend.classList.remove('pending');
      applyState(s);
      if (!small()) pend.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
      updateChrome();
      return;
    }
    if (cur < N - 1) go(cur + 1);
  }
  function prev() {
    const s = slides[cur];
    const shown = stepsOf(s).filter((el) => !el.classList.contains('pending'));
    if (shown.length && !small()) {
      shown[shown.length - 1].classList.add('pending');
      applyState(s); updateChrome();
      return;
    }
    if (cur > 0) go(cur - 1, { back: true });
  }

  /* ---------------- Interfaz: barra de ruta, índice y notas ---------------- */
  const PARTS = ['Portada', 'Introducción', 'Desarrollo', 'Conclusiones', 'Cierre'];
  const track = $('#track');
  const pos = (i) => (N === 1 ? 0 : (i / (N - 1)) * 100);
  const secBtns = [];
  PARTS.forEach((name, p) => {
    const first = slides.findIndex((s) => +s.dataset.part === p);
    if (first < 0 || p === 0) return;
    const b = document.createElement('button');
    b.className = 'sec'; b.textContent = name; b.style.left = pos(first) + '%';
    b.addEventListener('click', () => go(first));
    track.appendChild(b); secBtns.push({ b, p });
  });
  const ticks = slides.map((s, i) => {
    const t = document.createElement('button');
    t.className = 'tick'; t.style.left = pos(i) + '%';
    t.title = (i + 1) + '. ' + s.dataset.title; t.setAttribute('aria-label', t.title);
    t.addEventListener('click', () => go(i));
    track.appendChild(t); return t;
  });
  const boat = $('#boat'); track.appendChild(boat);
  const notes = $('#notes');
  function updateChrome() {
    const s = slides[cur];
    $('#done').style.width = pos(cur) + '%';
    boat.style.left = pos(cur) + '%';
    ticks.forEach((t, i) => t.classList.toggle('seen', i <= cur));
    secBtns.forEach(({ b, p }) => b.classList.toggle('cur', +s.dataset.part === p));
    const pend = stepsOf(s).filter((el) => el.classList.contains('pending')).length;
    $('#count').textContent = `${cur + 1} / ${N}` + (pend && !small() ? ` · +${pend}` : '');
    $('#notesTitle').textContent = `${cur + 1}. ${s.dataset.title}`;
    const n = $('aside.notes', s);
    $('#notesBody').innerHTML = n ? n.innerHTML : '<p>Sin notas.</p>';
  }
  const tocBody = $('#tocBody');
  PARTS.forEach((name, p) => {
    const items = slides.map((s, i) => [s, i]).filter(([s]) => +s.dataset.part === p);
    if (!items.length) return;
    const g = document.createElement('div'); g.className = 'grp';
    g.innerHTML = `<b>${name}</b><ol>${items.map(([s, i]) => `<li><button data-go="${i}"><span>${i + 1}</span>${s.dataset.title}</button></li>`).join('')}</ol>`;
    tocBody.appendChild(g);
  });
  const toc = $('#toc');
  const setToc = (on) => { toc.classList.toggle('on', on); $('#btnToc').setAttribute('aria-pressed', on); if (on) $('button', toc)?.focus(); };
  toc.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (b) { setToc(false); go(+b.dataset.go, { all: true }); } else if (e.target === toc) setToc(false);
  });
  const setNotes = (on) => { notes.classList.toggle('on', on); $('#btnNotes').setAttribute('aria-pressed', on); };
  $('#btnToc').addEventListener('click', () => setToc(!toc.classList.contains('on')));
  $('#btnNotes').addEventListener('click', () => setNotes(!notes.classList.contains('on')));
  const fs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.());
  $('#btnFs').addEventListener('click', fs);
  $('#next').addEventListener('click', next);
  $('#prev').addEventListener('click', prev);

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (toc.classList.contains('on') && k === 'Escape') { setToc(false); return; }
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) {
      if (k === 'Enter' && e.target.closest('button, a')) return;
      if (k === ' ' && e.target.closest('button')) return;
      e.preventDefault(); next();
    } else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(N - 1, { all: true });
    else if (k === 'n' || k === 'N') setNotes(!notes.classList.contains('on'));
    else if (k === 'i' || k === 'I') setToc(!toc.classList.contains('on'));
    else if (k === 'f' || k === 'F') fs();
  });
  let tx0 = null, ty0 = null;
  document.addEventListener('touchstart', (e) => { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (tx0 === null) return;
    const dx = e.changedTouches[0].clientX - tx0, dy = e.changedTouches[0].clientY - ty0;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) (dx < 0 ? next : prev)();
    tx0 = null;
  }, { passive: true });
  addEventListener('resize', () => { if (cur >= 0) applyState(slides[cur], true); });
  addEventListener('hashchange', () => { const h = parseInt(location.hash.slice(1), 10); if (h && h - 1 !== cur) go(h - 1, { all: true }); });

  /* ---------------- Gráfico del Brent ---------------- */
  const BRENT = [
    ['2026-01-09', 63.34], ['2026-01-14', 66.82], ['2026-01-15', 63.76], ['2026-01-30', 70.69], ['2026-02-05', 67.55], ['2026-02-12', 67.52],
    ['2026-02-19', 71.66], ['2026-02-27', 72.48], ['2026-03-03', 81.49], ['2026-03-06', 92.69], ['2026-03-09', 88.43], ['2026-03-20', 112.19],
    ['2026-03-27', 112.57], ['2026-04-02', 109.03], ['2026-04-08', 94.75], ['2026-04-09', 95.92], ['2026-04-17', 90.38], ['2026-04-23', 105.07],
    ['2026-04-29', 118.03], ['2026-04-30', 114.01], ['2026-05-04', 114.40], ['2026-05-12', 107.27], ['2026-05-19', 111.28], ['2026-05-27', 94.29],
    ['2026-06-03', 97.81], ['2026-06-05', 93.09], ['2026-06-12', 87.33], ['2026-06-19', 80.57], ['2026-06-24', 73.74],
  ];
  const EVENTS = [['2026-02-28', 'Guerra', 'end', 0], ['2026-03-11', 'AIE libera reservas', 'start', 1], ['2026-04-08', 'Alto el fuego', 'end', 0], ['2026-04-13', 'Bloqueo de EE.UU.', 'start', 1], ['2026-06-17', 'Acuerdo', 'end', 0]];
  const d0 = Date.parse('2026-01-01'), d1 = Date.parse('2026-06-30');
  const X = (d) => 50 + ((Date.parse(d) - d0) / (d1 - d0)) * 830;
  const Y = (v) => 236 - ((v - 55) / (132 - 55)) * 205;
  const brentClip = { w: X('2026-02-28') };
  function buildBrent() {
    const c = $('#brent'); if (!c) return;
    const defs = mk('defs', {}, c);
    const gr = mk('linearGradient', { id: 'brentFill', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    mk('stop', { offset: '0', 'stop-color': '#9a5d0c', 'stop-opacity': '.28' }, gr);
    mk('stop', { offset: '1', 'stop-color': '#9a5d0c', 'stop-opacity': '0' }, gr);
    const cp = mk('clipPath', { id: 'brentClip' }, defs);
    brentClip.rect = mk('rect', { x: 0, y: 0, width: brentClip.w, height: 262 }, cp);
    mk('rect', { class: 'war', x: X('2026-02-28'), y: 8, width: X('2026-06-24') - X('2026-02-28'), height: 228 }, c);
    for (const v of [60, 80, 100, 120]) {
      mk('line', { class: 'gridl', x1: 50, x2: 880, y1: Y(v), y2: Y(v) }, c);
      mk('text', { x: 42, y: Y(v) + 4, 'text-anchor': 'end' }, c).textContent = v;
    }
    mk('line', { class: 'axis', x1: 50, x2: 880, y1: 236, y2: 236 }, c);
    ['ene', 'feb', 'mar', 'abr', 'may', 'jun'].forEach((m, i) => {
      const x = X(`2026-0${i + 1}-15`);
      mk('text', { x, y: 253, 'text-anchor': 'middle' }, c).textContent = m;
    });
    const g = mk('g', { 'clip-path': 'url(#brentClip)' }, c);
    const pts = BRENT.map(([d, v]) => [X(d), Y(v)]);
    mk('path', { class: 'area', d: 'M' + pts.map((p) => p.join(',')).join('L') + `L${pts[pts.length - 1][0]},236L${pts[0][0]},236Z` }, g);
    mk('path', { class: 'line', d: 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L') }, g);
    const at = (d) => { // valor interpolado en una fecha
      const t = Date.parse(d);
      for (let i = 1; i < BRENT.length; i++) {
        const a = Date.parse(BRENT[i - 1][0]), b = Date.parse(BRENT[i][0]);
        if (t <= b) return BRENT[i - 1][1] + (BRENT[i][1] - BRENT[i - 1][1]) * ((t - a) / (b - a));
      }
      return BRENT[BRENT.length - 1][1];
    };
    EVENTS.forEach(([d, name, anchor, row]) => {
      const e = mk('g', { class: 'evt' }, g);
      const x = X(d), yv = Y(at(d));
      const top = 18 + row * 20;
      mk('line', { x1: x, x2: x, y1: top - 12, y2: yv - 5 }, e);
      mk('circle', { cx: x, cy: yv, r: 4 }, e);
      mk('text', { x: x + (anchor === 'end' ? -6 : 6), y: top, 'text-anchor': anchor }, e).textContent = name;
    });
    const lab = (d, v, txt, dx, dy, anchor = 'middle') => mk('text', { class: 'peak', x: X(d) + dx, y: Y(v) + dy, 'text-anchor': anchor }, g).textContent = txt;
    lab('2026-02-27', 72.48, '72,5', -4, 18, 'end');
    lab('2026-03-27', 112.57, '112,6', 0, -10);
    lab('2026-04-29', 118.03, '118,0', -10, -6, 'end');
    lab('2026-06-24', 73.74, '73,7', 6, 16, 'start');
  }
  let brentAnim = null;
  function brentTo(d, instant) {
    if (!brentClip.rect) return;
    const target = d === 'all' ? 900 : X(d) + (d >= '2026-06-30' ? 30 : 6);
    const from = brentClip.w;
    if (instant || reduced) { brentClip.w = target; brentClip.rect.setAttribute('width', target); return; }
    const t0 = performance.now(), dur = 1400;
    cancelAnimationFrame(brentAnim);
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      brentClip.w = from + (target - from) * ease(t);
      brentClip.rect.setAttribute('width', brentClip.w);
      if (t < 1) brentAnim = requestAnimationFrame(tick);
    };
    brentAnim = requestAnimationFrame(tick);
  }
  buildBrent();

  /* ---------------- Anexo: pestañas y calculadora ---------------- */
  $$('.tabs [data-tab]').forEach((b) => b.addEventListener('click', () => {
    const box = b.closest('.panel');
    $$('.tabs [data-tab]', box).forEach((x) => x.setAttribute('aria-selected', x === b));
    $$('.tabpane', box).forEach((p) => p.classList.toggle('on', p.id === b.dataset.tab));
  }));
  const pct = $('#pct');
  const fmt1 = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  function calc() {
    const p = +pct.value / 10;
    $('#pctv').textContent = pct.value;
    $('#outG').textContent = fmt1(-0.10 * p); $('#outG2').textContent = fmt1(-0.15 * p);
    $('#outI').textContent = fmt1(0.3 * p); $('#outI2').textContent = fmt1(0.4 * p);
  }
  if (pct) {
    pct.addEventListener('input', calc);
    const war = BRENT.filter(([d]) => d >= '2026-03-01');
    const avg = war.reduce((a, [, v]) => a + v, 0) / war.length;
    $$('[data-pct]').forEach((b) => b.addEventListener('click', () => {
      pct.value = b.dataset.pct === 'avg' ? Math.round((avg / 72.48 - 1) * 100) : b.dataset.pct;
      calc();
    }));
    const avgBtn = $('[data-pct="avg"]');
    if (avgBtn) avgBtn.textContent = `Promedio mar–jun de los cierres (US$${avg.toFixed(1).replace('.', ',')})`;
    calc();
  }

  /* ---------------- Inicio ---------------- */
  const h = parseInt(location.hash.slice(1), 10);
  go(h ? h - 1 : 0, { instant: true, all: !!h });
  requestAnimationFrame(frame);
})();
