"""Genera descargas/guion-defensa.pdf (documento interno, no se proyecta) a partir de index.html:
reparto de expositores, tiempos objetivo, notas por diapositiva y preguntas probables.
Uso: python3 tools/build-guion.py   (requiere playwright con Chromium)"""
import re, html, os, asyncio, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
h = (ROOT / 'index.html').read_text(encoding='utf-8')
slides = []
for m in re.finditer(r'<section class="slide[^"]*"[^>]*data-title="([^"]+)" data-speaker="([^"]+)" data-secs="(\d+)"[^>]*>(.*?)</section>', h, re.S):
    t, who, secs, body = m.group(1), m.group(2), int(m.group(3)), m.group(4)
    nm = re.search(r'<aside class="notes">(.*?)</aside>', body, re.S)
    notes = re.sub(r'<sup[^>]*>.*?</sup>', '', nm.group(1).strip()) if nm else ''
    slides.append((t, who, secs, notes))
qa = re.search(r'<aside id="qa" hidden>(.*?)</aside>', h, re.S).group(1)
qa_items = re.findall(r'<summary>(.*?)</summary><p>(.*?)</p>', qa, re.S)
fmt = lambda s: f"{s // 60}:{s % 60:02d}"
tot = sum(s for _, _, s, _ in slides)
per = {w: sum(s for _, ww, s, _ in slides if ww == w) for w in ['Agustín', 'Facundo', 'Ambos']}
rows, blocks, acc = [], [], 0
for i, (t, who, secs, notes) in enumerate(slides, 1):
    if not secs:
        continue
    acc += secs
    rows.append(f'<tr><td class="n">{i}</td><td>{html.escape(t)}</td><td class="w {who[0].lower()}">{who}</td><td class="r">{fmt(secs)}</td><td class="r">{fmt(acc)}</td></tr>')
    blocks.append(f'<section class="sl"><h3><span>{i}</span>{html.escape(t)}<em class="{who[0].lower()}">{who} · {fmt(secs)}</em></h3>{notes}</section>')
F = (ROOT / 'assets' / 'fonts').as_uri()
doc = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Guion de defensa · Grupo 8</title><style>
@font-face{{font-family:Archivo;src:url({F}/archivo-latin-standard-normal.woff2);font-weight:100 900;font-stretch:62% 125%}}
@font-face{{font-family:Spectral;src:url({F}/spectral-latin-400-normal.woff2);font-weight:400}}
@font-face{{font-family:Spectral;src:url({F}/spectral-latin-600-normal.woff2);font-weight:600}}
@page{{size:A4;margin:16mm 16mm 18mm}}
body{{font-family:Spectral,Georgia,serif;color:#13293d;font-size:10.5pt;line-height:1.45;margin:0}}
h1,h2,h3,th,.n,.w,.r,em,.k{{font-family:Archivo,sans-serif}}
h1{{font-size:24pt;font-weight:800;font-stretch:72%;line-height:1;margin:0 0 4pt}}
.sub{{color:#46596a;margin:0 0 14pt}}
h2{{font-size:13pt;font-weight:750;font-stretch:80%;border-bottom:1.5pt solid #13293d;padding-bottom:3pt;margin:18pt 0 8pt;break-after:avoid}}
h2.np{{break-before:page;margin-top:0}}
.kpis{{display:flex;gap:18pt;margin:6pt 0 4pt}} .kpis div{{border-top:2pt solid #13293d;padding-top:4pt;min-width:90pt}}
.kpis b{{display:block;font-family:Archivo;font-size:20pt;font-weight:800;font-stretch:70%;line-height:1}} .kpis span{{font-size:9pt;color:#46596a}}
table{{width:100%;border-collapse:collapse;font-size:10pt}} th{{text-align:left;font-weight:700;font-stretch:85%;border-bottom:1pt solid #13293d;padding:4pt 6pt}}
td{{padding:3.5pt 6pt;border-bottom:.5pt solid #c9d7db}} .n{{color:#8aa0ad;width:18pt}} .r{{text-align:right;font-variant-numeric:tabular-nums;width:46pt}}
.w{{font-weight:700;font-stretch:85%;width:60pt}} .a{{color:#b0176a}} .f{{color:#9a5d0c}} .s{{color:#46596a}}
.sl{{break-inside:avoid;margin:0 0 10pt;padding-top:6pt;border-top:.5pt solid #c9d7db}}
.sl h3{{font-size:11.5pt;font-weight:750;font-stretch:82%;margin:0 0 3pt;display:flex;gap:6pt;align-items:baseline}}
.sl h3 span{{color:#8aa0ad;width:16pt}} .sl h3 em{{margin-left:auto;font-style:normal;font-size:9.5pt;font-weight:700}} .sl p{{margin:0 0 4pt}}
.qa{{break-inside:avoid;margin:0 0 8pt}} .qa b{{font-family:Archivo;font-stretch:85%;font-weight:700;color:#b0176a;display:block}}
.k{{font-size:9.5pt;color:#46596a}} ul{{margin:4pt 0 0;padding-left:14pt}} li{{margin-bottom:2pt}}
</style></head><body>
<h1>Guion de defensa</h1>
<p class="sub">Del Estrecho de Ormuz al surtidor · Grupo 8, Facundo Carrera y Agustín Santilli · Estructura Económica Mundial y Argentina, UNMdP 2026. Documento interno: no se proyecta.</p>
<div class="kpis"><div><b>{fmt(tot)}</b><span>tiempo objetivo total</span></div><div><b class="a">{fmt(per["Agustín"])}</b><span>Agustín</span></div><div><b class="f">{fmt(per["Facundo"])}</b><span>Facundo</span></div><div><b class="s">{fmt(per["Ambos"])}</b><span>cierre conjunto</span></div></div>
<h2>Reparto y tiempos</h2>
<table><thead><tr><th></th><th>Diapositiva</th><th>Habla</th><th class="r">Tiempo</th><th class="r">Acumulado</th></tr></thead><tbody>{''.join(rows)}</tbody></table>
<p class="k">Bibliografía y anexo (diapositivas 15 y 16) quedan fuera del tiempo: se usan sólo si preguntan. El reparto es una propuesta; si lo cambian, conviene que cada uno tome bloques enteros para no pasarse la palabra en medio de un caso.</p>
<h2>Antes de empezar</h2>
<ul><li>Presentación en pantalla completa (F) en el proyector; vista de expositor (P) en la notebook, con notas, cronómetro y ritmo. La tecla Q abre las preguntas probables.</li>
<li>PDF de respaldo y repositorio descargado en un pendrive: la presentación funciona sin internet abriendo index.html.</li>
<li>En "El shock" (5) dejar unos 4 segundos para que el gráfico termine de dibujarse mientras se explica.</li></ul>
<h2 class="np">Notas por diapositiva</h2>{''.join(blocks)}
<h2>Preguntas probables de la cátedra</h2>{''.join(f'<div class="qa"><b>{q}</b>{a}</div>' for q, a in qa_items)}
</body></html>'''
async def main():
    from playwright.async_api import async_playwright
    tmp = ROOT / 'descargas' / '.guion.html'
    tmp.write_text(doc, encoding='utf-8')
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto(tmp.as_uri()); await pg.evaluate('document.fonts.ready')
        await pg.pdf(path=str(ROOT / 'descargas' / 'guion-defensa.pdf'), format='A4', print_background=True, prefer_css_page_size=True,
                     display_header_footer=True, header_template='<span></span>',
                     footer_template='<div style="font-size:8px;width:100%;text-align:center;color:#8aa0ad">Guion de defensa · Grupo 8 · <span class="pageNumber"></span>/<span class="totalPages"></span></div>')
        await b.close()
    tmp.unlink()
    print('ok', fmt(tot), {k: fmt(v) for k, v in per.items()})
asyncio.run(main())
