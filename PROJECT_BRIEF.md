# Project Brief: Austin Joshua — Engineering Portfolio (AJ Cosmic Universe)

**Document Status:** Updated Baseline (`feat/aj-cosmic-universe`)  
**Owner:** Austin Joshua  
**Live Preview / URL:** `https://aj-portfolio-two-iota.vercel.app/`  
**Repository:** `https://github.com/Austin-Joshua/Austin-Portfolio`  
**Hosting:** Vercel

---

## 1. Project Overview and Vision

This project establishes the interactive engineering portfolio for **Austin Joshua**, a Computer Science Engineering student at Rajalakshmi Institute of Technology (RIT), President of the Infinitus Mathematics Club (2026–2027), and aspiring Software & AI Engineer.

**Vision:** Build an unmistakable, cinematic **AJ Cosmic Universe** solar-system portfolio that unites an interactive Three.js / React Three Fiber celestial environment with disciplined Swiss Experimental typography, glassmorphic planes, and Austin Joshua's personal identity—demonstrating systems and AI engineering craft directly through the medium of the web experience itself.

---

## 2. Problem Statement and Objectives

### Problem Statement
Generic developer templates fail to differentiate early-career engineers or reflect technical depth across software systems and AI applications, while gratuitous WebGL showcases often break readability, keyboard accessibility, mobile layout stability, and load speed.

### Core Objectives
- **Immersive Cosmic Universe Metaphor:** Orbit Austin Joshua's central Solar identity (**Sun · Austin Joshua**) with six color-coded destinations (**About**, **Skills**, **Projects**, **Experience**, **Achievements**, **Contact**), subtle pointer parallax, and scroll-velocity-reactive hyperspace starflight.
- **Unmistakable Single-Theme Atmospheric Identity:** Enforce a focused permanent dark cosmic aesthetic (`#020307` void, silver chrome metallic accents `#DCE4F0`, and six harmonized planetary color signatures) tuned strictly for WCAG 2.2 AA contrast without a distracting light-mode toggle.
- **Bespoke Brand & First-Visit Experience:** Anchor visual identity around the processed circular silver metallic `AJ` emblem (`public/assets/brand/aj-emblem.png`) and a first-visit horizontal split-curtain loader (`CosmicIntroLoader`).
- **Verifiable Technical Substance:** Present authentic personal bio, skills cross-referenced to shipped projects, five interactive project worlds (`AgriFlux`, `CIVIQ`, `ResQ Meal`, `RIT Digital Twin`, `NeuroRAM`), verified hackathon awards & certifications, honest empty work-history state, and instant outreach/résumé access.
- **Production Craft & Accessibility:** Maintain zero horizontal overflow (`320px–2560px+`), non-overlapping mobile controls, `prefers-reduced-motion` discipline, deterministic WebGL fallbacks, and clean code-split bundles.

---

## 3. Target Audience

| Audience Segment | Primary Needs & Expectations | Key Friction to Avoid |
| :--- | :--- | :--- |
| **Technical Recruiters & Talent Acquisition** | Rapidly understand role fit (Software / AI Engineering), education at RIT, core stack, hackathon track record, and contact/résumé download. | Buried contact info, unclear role focus, slow initial load, mobile header overlap. |
| **Engineering Managers & Senior Engineers** | Inspect real project architectures, problem/approach breakdowns, GitHub source code, live demos, and interactive skill-to-project proof. | Fluff descriptions, generic card grids, unverified claims, broken deep links. |
| **AI / Research Collaborators & Peers** | Explore technical experimentation, Infinitus mathematical/computational roots, and creative frontend execution. | Generic corporate styling with zero personality. |
| **Hackathon Organizers & Event Leads** | Verify hackathon placements (*Techathon 2K26*, *Code of Thrones*, *INNOCLASH '26*), leadership credentials, and rapid execution track record. | Conflicting dates or fabricated awards. |

---

## 4. Brand Identity and Positioning

- **Name:** Austin Joshua
- **Discipline:** Computer Science Engineering Student (RIT) | Aspiring Software & AI Engineer
- **Positioning Statement:** Bridging AI/ML intelligence, backend systems, and interactive 3D web engineering—from multi-crop agriculture telemetry and Go/Spring platforms to hardware-conscious WebGL interfaces.
- **Visual Direction:**
  - **Aesthetic Pillars:** 3D Solar-System Cosmic Universe + Swiss Experimental Grid + Contrast-Verified Dark Glassmorphism.
  - **Brand Emblem:** Circular silver metallic `AJ` emblem (`public/assets/brand/aj-emblem.png` + favicon/touch icons), featured in the first-visit curtain intro over an independent cosmic particle aura, Hero emblem badge, and sticky navigation bar.
  - **Single Dark Cosmic Palette (`data-theme="dark"` permanently):**
    - Void canvas `#020307`, elevated panel `#0B101D`, card `#111829`, glass `#080D1B / 0.80–0.92`, silver chrome `#DCE4F0`, solar core `#FFB347`.
    - Celestial planet palette: About (`#38BDF8` Ocean Cyan), Skills (`#818CF8` Violet Indigo), Projects (`#FB923C` Orange Amber), Experience (`#2DD4BF` Emerald Teal), Achievements (`#FACC15` Solar Gold), Contact (`#F472B6` Rose Magenta).
  - **Personal Imagery:** Transparent background portrait cutout (`public/assets/portrait/austin-joshua-cutout.png`, `604x806` RGBA PNG; original source preserved outside `public/` at `src/assets/source/austin-joshua.jpg`) presented in front of the live 3D universe in silhouette by default and revealing natural colour on hover, keyboard focus, or touch tap (`HeroPortraitReveal`), plus framed in the About dossier (`PortraitSlot`).

---

## 5. Core Experience and Website Sections

1. **First-Visit Curtain Intro (`CosmicIntroLoader`):** Renders once per visitor (`localStorage` key `aj-cosmic-intro-seen`), displaying the static metallic `AJ` emblem in front of an independent cosmic particle/orbit layer before horizontally parting left/right curtains smoothly into the solar system; supports Escape key, Skip button, reduced motion, and restricted storage fallback.
2. **Hero / Sun Core (`#hero`):** Open composition over the persistent full-viewport 3D Solar System, featuring the `AJ` emblem badge, `Austin Joshua` single `<h1>`, dimensional translucent background wordmark behind the foreground silhouette-to-colour portrait, View Projects / Contact / Résumé CTAs, social links, and interactive `SolarSystemHud` planet selector.
3. **About / Terra Cyan (`#about`):** Editorial 7/5 Swiss split covering RIT Computer Science Engineering background, Infinitus Mathematics Club presidency & TECHritz leadership, Résumé download, and parallax-capable `PortraitSlot`.
4. **Skills / Aether Violet (`#skills`):** Interactive atomic/molecular domain explorer (`All Molecules`, Languages, AI & Data, Web & Backend, Systems & Tooling) with orbital SVG bonds, 21 verified skills, and live click-to-highlight cross-references to matching projects.
5. **Projects / Pyros Amber (`#projects`):** Category filters, Orbital World Inspector (`ProjectWorldOrb`), and 5 deep-linkable worlds (`?project=<slug>#projects`): **AgriFlux**, **CIVIQ**, **ResQ Meal**, **RIT Digital Twin**, and **NeuroRAM**, opening `ProjectDetailModal` with Problem, Approach, Outcomes, Stack, and verified links.
6. **Experience / Viridis Teal (`#experience`):** Emerald planetary trajectory schematic paired cleanly with the honest factual empty state (`"No experience entries added yet."`) without invented internships or job history.
7. **Achievements / Solstice Gold (`#achievements`):** Gold orbital constellation linking the 3 verified hackathon awards corroborated by Austin Joshua's résumé and repositories (*Best Performance Award — Techathon 2K26*, *Best Prototype Award — Code of Thrones*, *Impact Ignite Award — INNOCLASH '26*), plus verified certifications and leadership badges strip.
8. **Contact / Nova Rose (`#contact`) & Footer:** Rose pulsing signal station exposing direct `mailto:`, accessible Copy Email feedback, GitHub, LinkedIn, Résumé action, and minimal colophon footer complemented by a floating Scroll-to-Top button.

---

## 6. Design and Interaction Principles

- **Unified 3D Exploration & Guided Scroll:** Full-viewport fixed `SolarSystemScene` smoothly reconciles desktop Hero drag-orbit inspection (`explore` mode) with section-synchronized planetary camera framing (`guided` mode) and a one-click Reset Orbit control.
- **Velocity-Reactive Hyperspace Starfield:** Layered depth-parallax star shaders gently drift during idle view, react smoothly to pointer movement, and accelerate along Z-depth in response to native page scroll velocity—all paused cleanly under `prefers-reduced-motion: reduce`.
- **Contrast & Accessibility First:** Every glass panel, cosmic badge, planet button, and modal maintains WCAG 2.2 AA legibility, keyboard navigation (`SkipLink`, `Tab`, `Escape`, focus traps), `>= 44x44px` mobile touch targets, zero mobile Hero utility overlap, and a deterministic SVG cosmic fallback (`UniverseFallback`) when WebGL is absent.

---

## 7. Technology Stack Summary

| Layer | Implemented Technology | Rationale |
| :--- | :--- | :--- |
| **UI Framework** | React 19 + TypeScript (strict mode) | Component modularity, strict typing across data & 3D boundaries. |
| **Build Tooling** | Vite 7 | Fast dev server, Rollup manual chunk isolation (`vendor-three` separate from entry). |
| **Styling** | Tailwind CSS v4 + CSS Custom Properties | Fluid `clamp()` scales, Swiss grid rules, single-theme cosmic tokens. |
| **3D / WebGL** | `three` + `@react-three/fiber` (custom GLSL shaders & Canvas2D procedural planet maps) | Lightweight, asset-free 3D Solar System staying cleanly under bundle ceilings (`<= 220 KB` gz 3D). |
| **Animation** | GSAP + ScrollTrigger & Motion (`motion/react`) | Strict separation: GSAP handles scroll progress/rail choreography; Motion handles curtain split, modal, and filter transitions. |
| **Quality & Hosting** | Vitest + `vitest-axe`, Playwright + `@axe-core/playwright`, GitHub Actions CI, Vercel | Verified automated regression/accessibility coverage and strict CSP headers. |
