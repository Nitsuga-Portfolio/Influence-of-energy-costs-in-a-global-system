# Influence of Energy Cost Shocks on the Global Economic and Financial System
### Case Study: Strait of Hormuz Crisis (2026)

[![Status](https://img.shields.io/badge/Status-Research%20in%20Progress-blue)]()
[![Institution](https://img.shields.io/badge/UNMdP-Estructura%20Econ%C3%B3mica%20Mundial%20y%20Argentina-green)]()
[![Target](https://img.shields.io/badge/Target-MEXT%20Research%20Plan%20Bridge-orange)]()

---

## Overview

This repository hosts the empirical and methodological core of a final research paper for the course **Estructura Económica Mundial y Argentina** (Universidad Nacional de Mar del Plata).  
The work examines the transmission of energy cost shocks — triggered by the 2026 Strait of Hormuz disruption — into the global macroeconomic and financial system, with particular attention to inflation dynamics, asset pricing volatility, and differential regional impacts (emphasis on Asia, especially Japan).

The project is deliberately structured under the **“Iceberg Strategy”**:

- **Surface layer** (course-facing narrative): clear, accessible macroeconomic and geopolitical analysis suitable for traditional economics faculty.
- **Submerged base** (quant/thesis layer): rigorous time-series econometrics, volatility modelling and reproducible Python pipelines that will later feed a MEXT Research Plan in Quantitative Finance.

---

## Research Question

How do sharp, geopolitically driven shocks in energy costs (oil and LNG) transmit into:
1. Global and regional inflation and growth,
2. Equity and corporate-bond market volatility and risk premia, and
3. Differential resilience across economies — with special focus on energy-import-dependent Asian economies (Japan, and secondarily China and India)?

---

## Planned Structure (≈ 20 pages + technical annex)

| Section | Approx. pages | Layer |
|---------|---------------|-------|
| 1. Introduction & Motivation | 2 | Surface |
| 2. Theoretical Framework (Energy shocks, pass-through, financial amplification) | 2.5 | Surface + light quant |
| 3. The 2026 Hormuz Shock: Stylised Facts | 3 | Surface |
| 4. Macroeconomic Transmission Channels | 3 | Surface |
| 5. **Econometric Analysis of the Shock** | 4–5 | **Submerged base** |
| 6. Financial Market Implications (volatility, pricing, risk) | 2.5 | Surface + quant bridge |
| 7. Regional Asymmetries: Focus on Japan & Asia | 2 | Surface |
| 8. Conclusions & Policy Implications | 1.5 | Surface |
| Technical Annex (data, code, robustness) | — | Submerged |

---

## Econometric Strategy (Core Options under Evaluation)

Three complementary modelling routes are being assessed for implementation in Python:

1. **Structural / Bayesian VAR** with external instrument (oil/LNG price or Hormuz flow proxy)  
   → Impulse responses of inflation, industrial production, equity indices and credit spreads.

2. **GARCH / EGARCH / GJR-GARCH** family on equity and energy-futures returns  
   → Quantify the increase in conditional volatility and leverage effects during the shock window.

3. **Local Projections (Jordà) or Smooth Local Projections** around the March 2026 event date  
   → Flexible, non-parametric impulse responses that accommodate potential non-linearities.

All specifications will use publicly available high-frequency and monthly series (EIA, IEA, FRED, ECB SDW, BOJ, etc.).

---

## Key Data Sources (Preliminary)

- **Energy**: EIA (Strait of Hormuz transit volumes), IEA Oil Market Report, Platts/Argus proxies, JODI.
- **Macro**: FRED, ECB Statistical Data Warehouse, BOJ, IMF IFS, national statistical offices (Japan, China, India, Euro Area, US).
- **Financial**: Equity indices (S&P 500, Nikkei 225, Euro Stoxx, Shanghai Composite), corporate bond spreads (ICE BofA), VIX / implied vol surfaces, energy futures (Brent, TTF, JKM).
- **Institutional reports**: Federal Reserve Financial Stability Report (May 2026), European Commission / ECB analyses, METI / JOGMEC Japan energy security notes.

---

## Repository Roadmap

```
├── README.md                 ← you are here
├── paper/                    ← main manuscript (LaTeX / Word)
├── notebooks/                ← exploratory & final analysis notebooks
├── src/                      ← reusable Python modules (data, models, plots)
├── data/
│   ├── raw/
│   └── processed/
├── figures/
├── tables/
└── annex/                    ← technical appendix & robustness checks
```

---

## Academic Context

- **Course**: Estructura Económica Mundial y Argentina (Cód. 946) – 2º cuatrimestre 2026  
- **Instructors**: Claudia Beatriz Malamud & Rosana Renata Zuanetti  
- **Institution**: Universidad Nacional de Mar del Plata – Departamento de Economía  
- **Strategic goal**: Empirical foundation for a future MEXT Research Plan in Quantitative Finance (Japan).

---

## Licence & Citation

This work is currently under development for academic evaluation.  
Please do not cite without permission until the final version is deposited.

---

*Last updated: September 2026*
