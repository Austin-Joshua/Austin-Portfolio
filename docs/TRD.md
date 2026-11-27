# Technical Requirements Document (TRD): Austin Joshua — AJ Cosmic Universe

**Document Status:** Implemented Baseline v2.0 (`feat/aj-cosmic-universe`)  
**Authoritative Sources:** [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md) & [PRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PRD.md)  
**Target Platform:** Static SPA on Vercel Edge Network (Source Control: GitHub)

---

## 1. Technical Overview and Architectural Principles

### 1.1 System Overview
The Austin Joshua portfolio (**AJ Cosmic Universe**) is a client-rendered single-page React 19 + TypeScript application bundled with Vite 7 and deployed to Vercel. There is zero backend, CMS, contact form, or database.

The architecture permanently unifies around a single **Cosmic Night (`#020307`)** dark theme (`data-theme="dark"`), isolates a persistent full-viewport Three.js / React Three Fiber Solar System (`UniverseLayer` -> lazy `UniverseCanvas` -> `SolarSystemScene`) behind all seven semantic DOM sections, introduces first-time visitors via `CosmicIntroLoader`, separates GSAP + ScrollTrigger scroll telemetry (`ScrollProgressBar`, `AboutSection` parallax, passive scroll velocity) from Motion UI transitions (`CosmicIntroLoader`, `ProjectDetailModal`, `ProjectsSection`, `ContactSection`), and maintains deterministic SVG/reduced-motion fallbacks.

### 1.2 Architectural Principles
1. **DOM-First Accessibility & Persistent WebGL Isolation:** All content, planet controls (`SolarSystemHud`), atomic skill cross-links, project worlds, awards, and contact actions exist in semantic HTML5 landmarks. WebGL is `aria-hidden="true"`, non-blocking, lazy-loaded into `vendor-three`, and gracefully backed by `UniverseFallback`.
2. **Unified 3D Exploration & Guided Navigation:** `UniverseNavigationContext` coordinates free desktop Hero drag-orbit exploration (`explore` mode) with section-synchronized planetary camera targeting (`guided` mode), plus mutable `scrollVelocityRef`, `scrollProgressRef`, `pointerRef`, and `orbitControlRef` read at 60 FPS inside R3F `useFrame` with zero React re-renders.
3. **Procedural GPU Efficiency:** Planet surfaces (`planetTextures.ts`), solar corona shaders, and two-layer hyperspace starfield GLSL shaders (`starfieldPhysics.ts`, `HyperspaceStarfield.tsx`) are synthesized procedurally at runtime—eliminating large external `.glb` or texture downloads while keeping `vendor-three` (`187.67 kB` gz) below the `220 kB` gzipped ceiling.
4. **No Light-Mode Debt:** Light themes, `ThemeToggle`, `ThemeContext`, `themeStorage`, and `[data-theme="light"]` tokens are removed cleanly.

---

## 2. Technology Choices

| Layer | Implemented Package / Tool | Role |
| :--- | :--- | :--- |
| **UI & Language** | React 19 + TypeScript (`strict: true`) | Component modularity & strict null-safe schemas (`src/types/portfolio.ts`). |
| **Build & Split** | Vite 7 (`manualChunks`) | Isolates `three` + `@react-three/fiber` (`vendor-three`), `gsap`, and `motion` (`motionFeatures`). |
| **Styling** | Tailwind CSS v4 + CSS Variables | Single dark cosmic palette (`tokens.css`, `glass.css`), `clamp()` type scale (`index.css`). |
| **3D Engine** | `three@0.187.0` + `@react-three/fiber@9.8.2` | Custom `extend()` tree-shaken R3F root mounting `SolarSystemScene` (`HyperspaceStarfield`, `SolarSystemPlanets`, `CosmicCameraRig`). |
| **Scroll Motion** | `gsap@3.14.x` + `ScrollTrigger` | `ScrollProgressBar` and `AboutSection` hairline/parallax under `gsap.context()` + `gsap.matchMedia()`. |
| **UI Motion** | `motion@12.x` (`LazyMotion` + `domMax` + `MotionConfig`) | Horizontal split-curtain `CosmicIntroLoader`, `ProjectDetailModal`, `ProjectsSection` filter transitions, `ContactSection` copy badge. |
| **Testing** | Vitest + RTL + `vitest-axe` + Playwright + `@axe-core/playwright` | Unit, component/a11y, physics, and cross-browser E2E verification (`Chromium`, `Firefox`, `WebKit`). |
| **Hosting & Security** | Vercel (`vercel.json`) + GitHub Actions CI | Immutable caching + strict SHA-256 CSP header for pre-paint `<head>` script. |

---

## 3. Code Organization

```text
Portfolio/
├── public/
│   ├── favicon.png                        # 64x64 circular AJ emblem favicon
│   ├── apple-touch-icon.png               # 180x180 touch icon
│   ├── robots.txt
│   └── assets/
│       ├── brand/aj-emblem.png            # 512x512 RGBA circular silver metallic AJ emblem
│       ├── portrait/austin-joshua-cutout.png # 604x806 RGBA cutout (source kept in src/assets/source/)
│       └── resume/Austin_Joshua_Resume.pdf
├── src/
│   ├── assets/source/austin-joshua.jpg    # Preserved untouched portrait master
│   ├── context/
│   │   ├── MotionPreferenceContext.tsx    # OS prefers-reduced-motion observer
│   │   └── UniverseNavigationContext.tsx  # Planet nav, Explore/Guided mode, scrollVelocity/pointer refs
│   ├── three/
│   │   ├── universeConfig.ts              # Sun + 6 planet orbital radii, colors, speeds & camera views
│   │   ├── planetTextures.ts              # Deterministic PRNG seeded Canvas2D albedo/bump generators
│   │   ├── starfieldPhysics.ts            # Pure star layer warp velocity & depth-parallax math
│   │   ├── HyperspaceStarfield.tsx        # Two-layer custom GLSL shader starfield (pointer + scroll warp)
│   │   ├── SolarSystemPlanets.tsx         # Pulsing Sun core + 6 lit procedural planets, rings & moons
│   │   ├── CosmicCameraRig.tsx            # Smooth Explore orbit <-> Guided planet focus camera rig
│   │   ├── SolarSystemScene.tsx           # Root R3F lighting, background #020307, stars, planets & rig
│   │   ├── UniverseCanvas.tsx             # Selective three extend(), visibility pause, context-loss guard
│   │   ├── UniverseLayer.tsx              # Fixed inset-0 z-0 wrapper + Suspense + ErrorBoundary
│   │   ├── UniverseFallback.tsx           # Deterministic pitch-black cosmic SVG/CSS orbital fallback
│   │   └── useQualityTier.ts              # Desktop-high / mobile-conserving / static capability tiering
│   ├── utils/
│   │   ├── introStorage.ts                # aj-cosmic-intro-seen storage/reduced-motion safety helpers
│   │   └── ...                            # dataGuards, projectFilters, scrollNavigation, skillCrossRef, slugValidation
│   └── components/
│       ├── layout/                        # CosmicIntroLoader, Navbar, DesktopSectionRail, ScrollProgressBar, SectionShell, SkipLink, Footer
│       ├── ui/                            # SolarSystemHud, ScrollToTopButton, HeroPortraitReveal, PortraitSlot, ProjectDetailModal, GlassCard, Button, TagChip, LiveAnnouncer
│       └── sections/                      # HeroSection, AboutSection, SkillsSection, ProjectsSection, ExperienceSection, AchievementsSection, ContactSection
└── tests/
    ├── unit/                              # phase4DataAndUtils, cosmicUniversePhysics, universeConfig, scrollProgress, slugValidation, useWebGLSupport
    ├── hooks/                             # useActiveSection, useFocusTrap, useProjectUrlState
    ├── components/                        # cosmicIntroLoader, navigationShell, t33NavigationEnhancements, phase4Sections, phase5ProjectsIntegration, phase7Motion, phase8Hardening, portfolioFinalIntegration, universeThree, projectDetailModal, uiPrimitives, MotionPreferenceContext
    └── e2e/portfolio.spec.ts              # Cross-browser E2E, intro loader, WebGL fallback, canvas alpha, mobile non-overlap
```

---

## 4. Security, CSP, and Performance Verification

- **CSP Pre-Paint Script (`index.html` & `vercel.json`):** Inline `<head>` script locks `data-theme="dark"`, `colorScheme = 'dark'`, and adds `aj-intro-seen` when `localStorage` contains `'aj-cosmic-intro-seen' === '1'` or `prefers-reduced-motion: reduce` matches. Its exact SHA-256 hash in `vercel.json` is `'sha256-W85Dr5idMeTW9lFpycX/RUFAM3w7N3xnKz81gwTYkB8='`.
- **Bundle Split Budget (Measured Vite Build):** Critical entry JS `116.99 kB` gz (`<= 120 kB` ceiling) and lazy `vendor-three` `187.67 kB` gz (`<= 220 kB` ceiling).
- **GSAP vs. Motion Boundaries:** GSAP mutates scroll progress and `AboutSection` hairline/parallax elements; Motion mutates `CosmicIntroLoader` curtains/aura, `ProjectDetailModal`, `ProjectsSection` cards, and `ContactSection` copy feedback. Zero overlapping animations on shared DOM nodes.
