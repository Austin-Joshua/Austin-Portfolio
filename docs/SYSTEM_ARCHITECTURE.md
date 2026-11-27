# System Architecture: Austin Joshua — AJ Cosmic Universe

**Document Status:** Implemented Baseline v2.0 (`feat/aj-cosmic-universe`)  
**Authoritative Baseline:** [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md), [PRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PRD.md), [TRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/TRD.md), [UI_UX_DESIGN.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/UI_UX_DESIGN.md)  
**Target Environment:** Static SPA on Vercel Edge Network

---

## 1. Architecture Overview

AJ Cosmic Universe runs as a static React 19 + TypeScript SPA with strict unidirectional layering between typed portfolio records (`src/data/`), semantic section components (`src/components/sections/`), unified planetary camera & scroll coordination (`UniverseNavigationContext`), and the isolated Three.js / React Three Fiber 3D solar system (`src/three/`).

### Runtime Architecture Flow

```text
index.html (<head> Pre-Paint Script: data-theme="dark", intro pre-check, SEO/favicons)
 └─► App.tsx (RootErrorBoundary -> MotionPreferenceProvider -> LazyMotion -> MotionConfig)
      └─► UniverseNavigationProvider (activeSection, explore/guided mode, passive refs)
           ├─► CosmicIntroLoader (z-[100], first visit only: aj-emblem.png + cosmic aura -> L/R split)
           ├─► SkipLink + Navbar (AJ emblem + 6 planet links + icon-only Résumé + ScrollProgressBar)
           ├─► DesktopSectionRail (xl vertical 01-07 nav) + Mobile fixed 6-planet dock
           ├─► UniverseLayer (z-0, fixed inset-0, pointer-events-none, aria-hidden="true")
           │    ├─ [WebGL OK] React.lazy(UniverseCanvas) -> SolarSystemScene
           │    │    ├─ HyperspaceStarfield (far+near shader layers: pointer parallax + scroll velocity warp)
           │    │    ├─ SolarSystemPlanets (Sun + 6 procedural textured lit planets + rings + moons)
           │    │    └─ CosmicCameraRig (reconciles Explore orbit & Guided planet framing)
           │    └─ [No WebGL / Reduced Motion / Error] UniverseFallback (pitch-black cosmic SVG)
           ├─► <main id="main-content">
           │    ├─ #hero         Sun Overview (AJ badge, H1, CTAs, watermark + HeroPortraitReveal, SolarSystemHud)
           │    ├─ #about        Terra Cyan · Identity (RIT/Infinitus dossier, Résumé, parallax PortraitSlot)
           │    ├─ #skills       Aether Violet · Molecular Core (Atomic/molecular clusters + bonds + project cross-ref)
           │    ├─ #projects     Pyros Amber · Flagship Systems (Filters + Orbital World Inspector + 5 worlds + modal)
           │    ├─ #experience   Viridis Teal · Trajectory Arc (Emerald trajectory schematic + factual empty state)
           │    ├─ #achievements Solstice Gold · Constellation (3 verified hackathon awards + certs/leadership)
           │    └─ #contact      Nova Rose · Signal Relay (Rose pulsing signal + mailto + Copy Email + socials)
           └─► Footer + ScrollToTopButton + Portal(ProjectDetailModal)
```

---

## 2. Core Runtime Subsystems

### 2.1 First-Visit Curtain Intro (`CosmicIntroLoader` + `introStorage.ts`)
- Checks `shouldPlayCosmicIntroOnMount(prefersReducedMotion)` backed by `localStorage` (`aj-cosmic-intro-seen`).
- Renders the static silver metallic `aj-emblem.png` centered above an independent cosmic orbital ring/star aura (`intro-cosmic-aura`) while left (`-104%`) and right (`+104%`) `#020307` curtains part cleanly (`850ms` hold -> `770ms` split -> unmount + persist `'1'`).
- Guarded against private/throwing `localStorage`, immediate `Escape` / Skip button dismissal, and instant bypass under `prefers-reduced-motion: reduce`.

### 2.2 Persistent Solar System Navigation & Physics
- **`UniverseNavigationContext.tsx`:** Tracks `activeSection` (`useActiveSection`), derives Guided mode outside `#hero` vs Explore mode in Hero, and captures passive `scroll`, `scrollVelocityRef`, `scrollProgressRef`, and desktop `pointermove` without per-frame React state updates.
- **`CosmicCameraRig.tsx`:** Smoothly interpolates `camera.position` and look-at target between Solar System Overview (`SUN_HERO` / `explore`) and each active planet's orbital coordinates (`guided`), resetting cleanly via `resetSolarOverview()`.
- **`HyperspaceStarfield.tsx` + `starfieldPhysics.ts`:** Computes damped scroll velocity warp + Z-depth streaming wrap (`[-24, +14]`) and dual-layer pointer parallax via pure functions covered by unit tests.
- **`UniverseCanvas.tsx`:** Uses `@react-three/fiber`'s `createRoot` with explicit `three` `extend()` registration so only required classes (`AmbientLight`, `PointLight`, `DirectionalLight`, `SphereGeometry`, `TorusGeometry`, `MeshStandardMaterial`, `ShaderMaterial`, `Points`, etc.) enter the `vendor-three` bundle. Handles `webglcontextlost`, `webglcontextrestored`, `IntersectionObserver`, and `document.visibilityState` pause.

### 2.3 Deep-Link Routing & Accessibility Contracts
- **`useProjectUrlState.ts` + `slugValidation.ts`:** Synchronizes `?project=<slug>#projects` with `history.pushState` / `popstate` so shared links open `ProjectDetailModal` (`FocusTrap`, `Escape` dismissal, focus restoration) and Browser Back/Forward navigates cleanly. Unknown slugs strip the query param and surface an `aria-live="polite"` dismissible notice.
- **No Fabricated Data Guards (`dataGuards.ts`):** Runtime guards validate email syntax, `http(s)` links, and local paths; `ExperienceSection` explicitly renders `"No experience entries added yet."` when `experienceData` is empty, while `AchievementsSection` renders the 3 verified hackathon awards corroborated by `Austin_Joshua_Resume.pdf` and `projects.ts`.
