/* Vista de expositor: se abre con la tecla P desde la presentación (index.html?expositor).
   Muestra notas, cronómetro, la diapositiva actual y la siguiente, y controla la ventana principal.
   La comunicación usa postMessage entre las dos ventanas (funciona también abriendo el archivo local). */
(() => {
  'use strict';
  if (!new URLSearchParams(location.search).has('expositor')) return;
  window.PRESENTER = true;
  document.documentElement.classList.add('presenter');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  document.addEventListener('DOMContentLoaded', () => {
    const slides = $$('.slide');
    const info = slides.map((s, i) => ({
      i,
      title: s.dataset.title,
      part: ($('.part', s) || {}).textContent || '',
      notes: ($('aside.notes', s) || {}).innerHTML || '<p>Sin notas.</p>',
      steps: $$('[data-step]', s).map((el) => {
        const h = el.querySelector('h3, b, time');
        return (h ? h.textContent : el.textContent).trim().replace(/\s+/g, ' ').slice(0, 60);
      }),
    }));

    document.title = 'Expositor · Del Estrecho de Ormuz al surtidor';
    const root = document.createElement('div');
    root.id = 'pv';
    root.innerHTML = `
      <header>
        <div class="pv-where"><span id="pvNum"></span><b id="pvTitle"></b><span id="pvPart"></span></div>
        <div class="pv-time">
          <button id="pvTimer" title="Clic: pausar o reanudar">00:00</button>
          <button id="pvReset" title="Reiniciar el cronómetro">Reiniciar</button>
          <button id="pvQa" aria-pressed="false" title="Preguntas probables de la cátedra (Q)">Preguntas</button>
          <span id="pvClock"></span>
        </div>
      </header>
      <main>
        <section class="pv-notes"><div id="pvSteps"></div><div id="pvNotes"></div><div id="pvQaList" hidden><h3>Preguntas probables</h3></div></section>
        <aside class="pv-side">
          <div class="pv-next"><span>Lo que sigue</span><b id="pvNext"></b><em id="pvNextSub"></em></div>
          <ol id="pvList"></ol>
        </aside>
      </main>
      <footer>
        <button id="pvPrev">← Anterior</button>
        <span id="pvStatus">Conectando con la presentación…</span>
        <button id="pvFwd">Siguiente →</button>
      </footer>`;
    document.body.appendChild(root);

    const qa = document.getElementById('qa');
    if (qa) $('#pvQaList').insertAdjacentHTML('beforeend', qa.innerHTML);
    const setQa = (on) => {
      $('#pvQaList').hidden = !on; $('#pvNotes').hidden = on; $('#pvSteps').hidden = on;
      $('#pvQa').setAttribute('aria-pressed', on);
    };
    $('#pvQa').addEventListener('click', () => setQa($('#pvQaList').hidden));
    $('#pvList').innerHTML = info.map((s) => `<li><button data-go="${s.i}"><span>${s.i + 1}</span>${s.title}</button></li>`).join('');

    const main = window.opener;
    const send = (msg) => { try { main && main.postMessage({ ns: 'ormuz', ...msg }, '*'); } catch (e) { /* ventana cerrada */ } };
    let cur = 0, shown = 0, connected = false, lastState = 0;

    function render() {
      const s = info[cur];
      $('#pvNum').textContent = `${cur + 1} / ${info.length}`;
      $('#pvTitle').textContent = s.title;
      $('#pvPart').textContent = s.part;
      $('#pvNotes').innerHTML = s.notes;
      $('#pvSteps').innerHTML = s.steps.length
        ? `<div class="pv-dots">${s.steps.map((t, k) => `<span class="${k < shown ? 'done' : ''}" title="${t}"></span>`).join('')}<em>${shown} de ${s.steps.length} pasos</em></div>`
        : '';
      if (shown < s.steps.length) {
        $('#pvNext').textContent = s.steps[shown];
        $('#pvNextSub').textContent = 'Paso dentro de esta diapositiva';
      } else if (cur < info.length - 1) {
        $('#pvNext').textContent = info[cur + 1].title;
        $('#pvNextSub').textContent = `Diapositiva ${cur + 2}`;
      } else {
        $('#pvNext').textContent = 'Fin de la presentación';
        $('#pvNextSub').textContent = '';
      }
      $$('#pvList button').forEach((b) => b.classList.toggle('cur', +b.dataset.go === cur));
      const curBtn = $(`#pvList button[data-go="${cur}"]`);
      if (curBtn) curBtn.scrollIntoView({ block: 'nearest' });
    }

    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || d.ns !== 'ormuz' || d.t !== 'state') return;
      if (!connected) { connected = true; $('#pvStatus').textContent = 'Conectado'; }
      if (d.cur !== cur && running === null && d.cur > 0) startTimer();
      cur = d.cur; shown = d.shown; lastState = Date.now();
      render();
    });
    // Saludo periódico: si la presentación se recarga, se reconecta sola
    const hello = () => {
      if (!main || main.closed) { $('#pvStatus').textContent = 'La presentación está cerrada. Abrila y presioná P.'; connected = false; return; }
      send({ t: 'hello' });
      if (connected && Date.now() - lastState > 8000) { connected = false; $('#pvStatus').textContent = 'Reconectando…'; }
    };
    hello(); setInterval(hello, 3000);

    const cmd = (a, i) => send({ t: 'cmd', a, i });
    $('#pvPrev').addEventListener('click', () => cmd('prev'));
    $('#pvFwd').addEventListener('click', () => cmd('next'));
    $('#pvList').addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) cmd('go', +b.dataset.go); });
    document.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { if (e.target.closest('button') && e.key !== 'ArrowRight' && e.key !== 'PageDown') return; e.preventDefault(); cmd('next'); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); cmd('prev'); }
      else if (e.key === 'Home') cmd('go', 0);
      else if (e.key === 'End') cmd('go', info.length - 1);
      else if (e.key === 'q' || e.key === 'Q') $('#pvQa').click();
    });

    // Cronómetro: arranca al pasar de la portada; clic para pausar
    let running = null, acc = 0;
    const fmt = (ms) => { const t = Math.floor(ms / 1000); return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
    function startTimer() { if (running === null) running = Date.now(); }
    const elapsed = () => acc + (running !== null ? Date.now() - running : 0);
    $('#pvTimer').addEventListener('click', () => {
      if (running === null) running = Date.now(); else { acc += Date.now() - running; running = null; }
    });
    $('#pvReset').addEventListener('click', () => { acc = 0; running = null; });
    setInterval(() => {
      const t = $('#pvTimer');
      t.textContent = fmt(elapsed());
      t.classList.toggle('paused', running === null);
      $('#pvClock').textContent = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }, 250);

    render();
  });
})();
