# Del Estrecho de Ormuz al surtidor

**Influencia de los costos de la energía en un sistema global: el shock de 2026 y las respuestas de Argentina, China, India y Japón.**

Presentación interactiva del trabajo final de investigación del Grupo 8 (Facundo Carrera y Agustín Santilli) para **Estructura Económica Mundial y Argentina** (Cód. 946), Universidad Nacional de Mar del Plata, 2.º cuatrimestre 2026. Docentes: Claudia B. Malamud y Rosana R. Zuanetti.

La presentación acompaña al documento escrito (tercer parcial y horas de investigación). Su formato es una carta náutica narrativa: un único mapa funciona como hilo de la exposición y su "cámara" se mueve de la escala global al estrecho, de ahí a cada país y finalmente al surtidor.

La carta usa la proyección Mercator (la de la navegación), cubre toda la pantalla y se repite hacia los costados. Cada país tiene su tono, los casos llevan bandera y cada diapositiva enciende sus áreas de interés: exportadores del Golfo, zonas de alto riesgo, cuellos de botella, la Cuenca Neuquina y Rusia como proveedor alternativo.

## Estructura

| Parte | Diapositivas |
|---|---|
| Introducción | Contexto y motivación · Qué es Ormuz y por qué importa · Casos a analizar |
| Desarrollo | El shock (Brent ene–jun 2026) · Implicancias de la guerra · Canales de transmisión e impacto efectivo · Argentina · China e India · Japón |
| Conclusiones | Comparación de los cuatro casos y escalas de la organización territorial · Lecciones para Argentina (gestión territorial) · Vínculo con los núcleos del programa · Cierre con la tesis y preguntas |
| Fuentes y anexo | Bibliografía y referencias · Anexo metodológico (regla práctica, SVAR, GARCH, proyecciones locales) |

Corte temporal del análisis: enero a junio de 2026. Todas las cifras tienen su fuente numerada (pasar el cursor sobre los superíndices rojos).

## Correspondencia con el Plan de Trabajo Docente

- **Núcleos temáticos:** 1b (nuevas relaciones de fuerza, organismos internacionales), 1c (multipolaridad, China, India, BRICS), 1e (ODS y Agenda 2030), 2a (petróleo y gas), 2b y 2c (cambio climático y desarrollo sustentable del territorio argentino), 2d (redes de transporte y globalización).
- **Criterios de evaluación:** enfoque globalizador y análisis a escala global, regional, nacional y local; vocabulario específico de la organización territorial.
- **Objetivo del curso:** aproximación a propuestas de gestión territorial (diapositiva "Lecciones para Argentina").
- **Modalidad del 3.er parcial:** presentación grupal con género elegido (mosaico de géneros): carta náutica interactiva.
- **Bibliografía de cátedra citada:** Ferrer, Friedman, Knox y Agnew, Krugman, Méndez, Roccatagliata y Sohr.

## Cómo presentar

| Tecla | Acción |
|---|---|
| `→`, `espacio`, `PgDn` | Siguiente paso o diapositiva |
| `←`, `PgUp` | Paso o diapositiva anterior |
| `P` | Vista de expositor en otra ventana: notas grandes, cronómetro, lo que sigue y lista de diapositivas. Controla la presentación desde ahí |
| `N` | Notas de exposición sobre la misma pantalla |
| `I` | Índice |
| `F` | Pantalla completa |
| `Inicio` / `Fin` | Primera / última diapositiva |

Cada diapositiva puede tener pasos internos (el gráfico del Brent se dibuja por etapas, los canales aparecen uno por uno). El contador de la barra inferior indica cuántos pasos quedan. Se puede enlazar directo a una diapositiva con `#n` (por ejemplo `…/#10` abre Japón). En el celular se navega deslizando.

## Archivos

```
index.html            diapositivas y notas de exposición
assets/styles.css     estética de carta náutica
assets/app.js         cámara del mapa, pasos, gráfico, referencias y anexo
assets/presenter.js   vista de expositor (index.html?expositor)
assets/fonts/         fuentes locales con sus licencias
assets/map-data.js    geometría generada (no editar a mano)
tools/build-map.mjs   genera map-data.js desde Natural Earth (world-atlas): Mercator, países, áreas de interés
```

Es un sitio estático y autocontenido: las fuentes (Archivo y Spectral, licencia OFL) están en `assets/fonts`, así que funciona sin internet. Para el aula alcanza con descargar el repositorio y abrir `index.html`; también se publica en Vercel con cada push a `main`.

Para exponer con dos pantallas: la presentación va al proyector en pantalla completa (`F`) y la vista de expositor (`P`) queda en la notebook.

Para regenerar el mapa: `cd tools && npm install && npm run build`.

## Fase cuantitativa

El anexo describe la estrategia econométrica (SVAR con instrumento externo, GARCH y proyecciones locales de Jordà) que sostiene el documento escrito. La presentación sólo muestra datos observados y cifras de las fuentes; los ejemplos numéricos del anexo están marcados como ilustrativos.

---

*Trabajo en evaluación académica. Citar con permiso de los autores.*
