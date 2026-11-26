# System Architecture: Austin Joshua — Engineering Portfolio

**Document Status:** Draft v1.0  
**Authoritative Baseline:** [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md), [PRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PRD.md), [TRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/TRD.md), [UI_UX_DESIGN.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/UI_UX_DESIGN.md)  
**Target Environment:** Static SPA on Vercel Edge Network (Source Control: GitHub)  

---

## 1. Architecture Overview and Guiding Principles

### 1.1 Architectural Overview
The portfolio is architected as a **static, client-rendered Single-Page Application (SPA)** built with React, TypeScript, and Vite, hosted on Vercel (`NFR-018`) with zero backend, database, or external CMS dependencies in v1 (`PRD.md` Sec. 4 Exclusions; interactive contact form excluded per `FR-032` `Won't`). The runtime separates a **semantic, accessible DOM interface** (primary layer) from an **isolated, lazily loaded 3D Digital Universe layer** (progressive enhancement, `FR-038`, `FR-044`), coordinates motion across strictly partitioned animation engines (GSAP + ScrollTrigger vs. Motion vs. CSS), and binds all visual presentation to a zero-FOUC CSS custom-property token system (`FR-033`–`FR-035`).

### 1.2 Guiding Principles
1. **DOM-First Accessibility & Progressive Enhancement (`FR-038`, `FR-044`, `NFR-006`, `NFR-009`; 3D-only UI excluded per `FR-043` `Won't`):** All portfolio content, navigation, filtering, and dialogs live in semantic HTML5 DOM landmarks. WebGL is strictly decorative (`aria-hidden="true"`) and never required to read or navigate the site.
2. **Data-Driven Decoupling (`FR-008`, `FR-046`, `FR-047`):** All personal details, skills, projects, experience, achievements, and contact links live in typed TypeScript data modules (`src/data/`) completely decoupled from UI components, 3D shaders, and animation logic.
3. **Strict Engine & Layer Ownership (`FR-039`, `NFR-010`):** Global layout, reusable UI primitives, section modules, React hooks, pure utilities, theme tokens, animation controllers, and 3D modules maintain clean unidirectional dependencies so features can evolve or degrade independently.
4. **Deterministic Fallbacks (`FR-030`, `FR-045`–`FR-048`, `NFR-021`):** WebGL failure/absence, reduced motion, missing portrait/résumé assets, empty arrays, invalid URL project slugs, and blocked Clipboard API access all resolve to clean, verified fallback states.
5. **Restrained Complexity (`PRD.md` Sec. 4 Exclusions, `NFR-001`):** Avoid client-side routers, global state stores (Redux/Zustand), or server infrastructure where native browser APIs, React Context, and Vite static bundling meet all requirements with lower bundle weight.

### 1.3 Source-Document Conflicts & Resolutions
In accordance with baseline governance, the following cross-document tensions are documented explicitly rather than resolved silently:

| Topic | Conflicting / Divergent Sources | Architectural Handling & Status |
| :--- | :--- | :--- |
| **Initial Theme vs. `prefers-color-scheme`** | `PROJECT_BRIEF.md` (Sec. 8) expects `prefers-color-scheme` support. `PRD.md` (`FR-033` Must), `TRD.md` (Sec. 6.2), and `UI_UX_DESIGN.md` confirm **Midnight Amethyst (dark)** as the mandatory default when no stored preference exists (`FR-037` Could covers an optional reset back to dark default). | **Resolved (Confirmed Default per `FR-033`):** Pre-paint script honors `localStorage` first and defaults to `dark` (Midnight Amethyst); `prefers-color-scheme` is not used to override the initial dark default. |
| **WCAG 2.1 AA vs. WCAG 2.2 AA** | `PROJECT_BRIEF.md` (Sec. 8/11) suggested WCAG 2.1 AA (`TBD`). `PRD.md` (`NFR-006`, `NFR-015`), `TRD.md`, and `UI_UX_DESIGN.md` mandate **WCAG 2.2 AA**. | **Mandatory per PRD `NFR-006`:** Architecture enforces WCAG 2.2 AA controls (`>= 24x24px` targets, `scroll-padding-top` Focus Not Obscured). |
| **Typography & Container Width `TBD`s** | `TRD.md` (Sec. 10 & 17.2) left font choices and `1280px–1440px` container cap as `TBD`. `UI_UX_DESIGN.md` (Sec. 3.1 & 4) finalized **`Syne` / `Inter` / `JetBrains Mono`** and **`1360px`** max container width. | **Resolved by `UI_UX_DESIGN.md`:** System tokens and font preloads adopt `Syne`, `Inter`, `JetBrains Mono` (`woff2`) and `1360px` max width. |
| **Modal Geometry (`max-w-[920px]` / Drawer vs. `max-w-[880px]`)** | `PRD.md` & `TRD.md` allow modal or slide-over drawer. `UI_UX_DESIGN.md` (Sec. 7) specifies a centered glass modal (`max-w-[880px]`) on desktop and full-height bottom sheet on mobile. | **Aligned to `UI_UX_DESIGN.md`:** Implement `ProjectDetailModal` as centered desktop modal (`880px`) + mobile sheet while preserving portal/focus-trap/URL contracts (`FR-016`, `FR-017`, `FR-019`). |
| **Optional `[Proposed]` Scope (`Could` Tier)** | `TRD.md` includes `MotionPreferenceContext` hooks anticipating `FR-042`. `UI_UX_DESIGN.md` (Sec. 9.3) explicitly excludes all `[Proposed]` / `Could` features (`FR-006`, `FR-010`, `FR-014`, `FR-020`, `FR-021`, `FR-025`, `FR-028`, `FR-042`) from committed v1 unless approved. | **Excluded from Committed v1:** `MotionPreferenceContext` tracks OS `prefers-reduced-motion` only; unapproved `[Proposed]` UI controls are omitted from v1 build. |

---

## 2. System Boundaries and Runtime Architecture

### 2.1 Runtime Boundary Diagram
```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Browser Document (index.html)                                           │
│  ├─ <head>: Pre-paint Theme Script (SHA-256 CSP), SEO/OG/JSON-LD,       │
│  │          Self-hosted woff2 Font Preloads (Syne, Inter, JetBrainsMono)│
│  └─ <body>: <div id="root">                                             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ React Root Shell (App.tsx + RootErrorBoundary)                          │
│  ├─ Contexts: ThemeContext (Midnight Amethyst / Scarlet Porcelain)     │
│  │            MotionPreferenceContext (OS prefers-reduced-motion)       │
│  │            ProjectDialogContext / useProjectUrlState (?project=...)  │
│  │                                                                      │
│  ├─ Visual Layer 0 (z-0, pointer-events: none, aria-hidden="true")      │
│  │   └─ WebGLErrorBoundary + Suspense                                   │
│  │       ├─ [WebGL OK] Lazy Chunk -> UniverseCanvas (R3F + Three.js)    │
│  │       └─ [Fallback / Loading] -> UniverseFallback (CSS/SVG Backdrop) │
│  │                                                                      │
│  ├─ Semantic Layer 1 (z-10, Primary Interactive DOM)                    │
│  │   ├─ SkipLink + Sticky Navbar (FR-001..005, ThemeToggle, Résumé)     │
│  │   └─ <main id="main-content">                                        │
│  │       ├─ #hero         (HeroSection: 3D Stage + HeroPortraitReveal)  │
│  │       ├─ #about        (AboutSection + PortraitSlot Cutout Frame)    │
│  │       ├─ #skills       (SkillsSection + Domain Tabs)                 │
│  │       ├─ #projects     (ProjectsSection + Category Filter)           │
│  │       ├─ #experience   (ExperienceSection + GSAP Rail)               │
│  │       ├─ #achievements (AchievementsSection)                         │
│  │       └─ #contact      (ContactSection + CopyEmail + Footer)         │
│  │                                                                      │
│  └─ Overlay Portal Layer 2 (z-50, document.body Portals)                │
│      ├─ MobileDrawer (<768px Focus-Trapped Menu, FR-003)                │
│      └─ ProjectDetailModal (Focus-Trapped Dialog, FR-016, FR-017)       │
└─────────────────────────────────────────────────────────────────────────┘
         ▲                                          ▲
         │                                          │
┌────────┴─────────┐                       ┌────────┴──────────┐
│ Browser Platform │                       │ Static Assets &   │
│ APIs (URL,       │                       │ Typed Data Layer  │
│ Clipboard,       │                       │ (src/data/*.ts,   │
│ localStorage,    │                       │  public/assets/)  │
│ IntersectionObs) │                       └───────────────────┘
└──────────────────┘
```

### 2.2 External System Boundaries
- **Inbound:** Static HTTPS delivery from Vercel Edge Network (HTML, hashed CSS/JS chunks, `woff2` fonts, optional media/PDF assets).
- **Outbound:** User-initiated external navigations only (`mailto:`, GitHub, LinkedIn, project live demos, credential URLs—all `rel="noopener noreferrer"`, `NFR-017`) plus optional cookie-less Vercel Analytics telemetry if later approved (`NFR-019`, `TBD`).
- **No Server State:** Zero runtime `fetch()` calls to backend APIs, CMS endpoints, or databases in v1 (`PRD.md` Sec. 4 Exclusions; contact form excluded per `FR-032` `Won't`).

---

## 3. Proposed Project Folder Structure

| Path | Classification | Architectural Purpose |
| :--- | :---: | :--- |
| `.github/workflows/` | **Recommended** | CI pipeline definitions (`ci.yml`) running typecheck, lint, tests, build, and Playwright checks. |
| `public/` | **Mandatory** | Static root assets (`robots.txt`, `sitemap.xml`, `og-image.png` `TBD`) and `woff2` font files if placed outside `src/assets`. |
| `public/assets/portrait/` | **Mandatory** | Replaceable drop-in folder for Austin Joshua's future portrait photo (`FR-008`). |
| `public/assets/resume/` | **Mandatory** | Replaceable drop-in folder for future résumé PDF (`FR-009`). |
| `src/types/` | **Mandatory** | Canonical TypeScript interfaces (`portfolio.ts`) enforcing strict contracts between data modules and UI (`FR-046`). |
| `src/data/` | **Mandatory** | Pure, framework-agnostic TypeScript content modules (`profile.ts`, `skills.ts`, `projects.ts`, `experience.ts`, `achievements.ts`, `contact.ts`). |
| `src/styles/` | **Mandatory** | Design system CSS tokens (`tokens.css`), glassmorphism/scrim utilities (`glass.css`), and Tailwind base layer (`index.css`). |
| `src/context/` | **Mandatory** | App-wide reactive state (`ThemeContext.tsx`, `MotionPreferenceContext.tsx`) with zero heavy store boilerplate. |
| `src/hooks/` | **Mandatory** | Reusable React hooks (`useActiveSection.ts`, `useProjectUrlState.ts`, `useWebGLSupport.ts`, `useClipboard.ts`, `useFocusTrap.ts`). |
| `src/utils/` | **Mandatory** | Pure, testable helper functions (`projectFilters.ts`, `skillCrossRef.ts`, `slugValidation.ts`, `themeStorage.ts`) separated from React hooks. |
| `src/motion/` | **Mandatory** | GSAP + ScrollTrigger registration/lifecycle helpers (`gsapConfig.ts`) and Motion variant presets (`variants.ts`). |
| `src/three/` | **Mandatory** | Isolated 3D engine (`UniverseCanvas.tsx`, `DigitalUniverseScene.tsx`, `UniverseFallback.tsx`, `useQualityTier.ts`, `WebGLErrorBoundary.tsx`). |
| `src/components/layout/` | **Mandatory** | Global chrome and landmarks (`SkipLink.tsx`, `Navbar.tsx`, `MobileDrawer.tsx`, `SectionShell.tsx`, `Footer.tsx`). |
| `src/components/ui/` | **Mandatory** | Reusable Swiss/Glass primitives (`GlassCard.tsx`, `Button.tsx`, `TagChip.tsx`, `ThemeToggle.tsx`, `PortraitSlot.tsx`, `ProjectDetailModal.tsx`, `LiveAnnouncer.tsx`). |
| `src/components/sections/` | **Mandatory** | The seven committed portfolio sections (`HeroSection.tsx` through `ContactSection.tsx`). |
| `tests/` | **Recommended** | Co-located or root-grouped Vitest unit/component/axe specs and Playwright E2E/visual/overflow suites. |

---

## 4. Component Hierarchy and Section Composition

### 4.1 Component Tree
- **`App`** (`RootErrorBoundary` -> `ThemeProvider` -> `MotionPreferenceProvider` -> `<MotionConfig reducedMotion="user">`)
  - **`SkipLink`** (`#main-content`, `NFR-008`)
  - **`UniverseLayer`** (`aria-hidden="true"`, fixed `z-0`, `pointer-events: none`)
    - Renders `UniverseFallback` immediately; upgrades to lazy `UniverseCanvas` when WebGL is supported and mount completes (`FR-044`, `FR-045`).
  - **`Navbar`** (`FR-001`, `FR-002`, `FR-005`)
    - Brand mark -> `#hero`, 6 section links (`>= 768px`), conditional `Résumé` link (`FR-009`), `ThemeToggle` (`FR-034`), mobile menu trigger (`< 768px`), `2px` scroll progress bar (`FR-005`), and desktop `>= 1280px` vertical `01–07` index rail (`FR-005`).
  - **`<main id="main-content">`** (max container `1360px` inside full-bleed bands)
    1. **`HeroSection`** (`#hero`, `FR-004`): `h1` identity, configurable role label (`TBD`), `TBD` positioning copy, primary CTAs, `--surface-scrim` readability guard.
    2. **`AboutSection`** (`#about`, `FR-007`, `FR-008`): 7/5 Swiss split with narrative (`TBD`), conditional résumé CTA (`FR-009`), and `PortraitSlot`.
    3. **`SkillsSection`** (`#skills`, `FR-011`–`FR-013`): Accessible domain tablist + capability matrix + interactive skill-to-project cross-reference indicators.
    4. **`ProjectsSection`** (`#projects`, `FR-015`, `FR-018`, `FR-046`): Category filter bar, `aria-live` count announcer, invalid-slug notice (`FR-048`), asymmetric bento grid of `ProjectCard`s, empty-filter reset card.
    5. **`ExperienceSection`** (`#experience`, `FR-022`–`FR-024`): GSAP-driven vertical rail + collapsible chronological entries, or neutral empty-state `GlassCard` when `experience.length === 0`.
    6. **`AchievementsSection`** (`#achievements`, `FR-026`, `FR-027`, `FR-046`): Ledger/index cards with selective Obsidian Gold/Burgundy Copper accents and safe external credential links, or neutral empty-state `GlassCard`.
    7. **`ContactSection`** (`#contact`, `FR-029`–`FR-031`; contact form excluded per `FR-032` `Won't`): `TBD` invitation headline, `mailto:` action, `CopyEmailButton` with `aria-live` feedback, verified social links.
  - **`Footer`** (`FR-031`): Minimal Swiss colophon + "Back to Top" button.
  - **Portals:** `MobileDrawer` (`FR-003`) & `ProjectDetailModal` (`FR-016`, `FR-017`).

### 4.2 Why This Composition Fits
Wrapping each section in a shared `SectionShell` (`id`, Swiss index `01`–`07`, `aria-labelledby`, consistent vertical rhythm) eliminates duplicated landmark boilerplate while allowing each section's internal grid (hero spatial lockup, 7/5 dossier, matrix, bento, rail, ledger, typographic close) to remain visually distinct (`UI_UX_DESIGN.md` Sec. 6).

---

## 5. Content / Data Model (`src/types/portfolio.ts` & `src/data/`)

All portfolio records are statically typed and validated at build time (`tsc --noEmit`). Personal fields remain `TBD` placeholders/nullable until Austin Joshua supplies verified content (`FR-008`, `FR-023`, `FR-046`, `FR-047`).

```text
ProfileData
 ├── name: "Austin Joshua"
 ├── roleLabel: string | null              // Configurable role/discipline label (TBD)
 ├── heroTagline: string | null            // TBD
 ├── aboutParagraphs: string[]             // TBD (empty-safe)
 ├── portrait: { src: string; alt: string } | null   // null -> Swiss monogram fallback (FR-008)
 └── resume: { url: string; label: string; sizeLabel?: string } | null  // null -> omit CTA (FR-009)

SkillCategory
 ├── id: string
 ├── label: string                         // Domain name (taxonomy TBD)
 └── items: Array<{ id: string; name: string; projectTags?: string[] }>

ProjectItem
 ├── slug: string                          // Unique URL key for ?project=<slug> (FR-019)
 ├── indexCode: string                     // e.g. "P-01"
 ├── title: string
 ├── category: string                      // Filterable domain tag (TBD)
 ├── summary: string
 ├── stack: string[]                       // Cross-referenced with SkillCategory.items (FR-013)
 ├── problem: string
 ├── approach: string
 ├── outcomes?: string[]                   // Optional / TBD
 ├── media?: Array<{ src: string; alt: string; width: number; height: number }>
 └── links: { github?: string; live?: string }

ExperienceItem
 ├── id: string
 ├── role: string
 ├── organization: string
 ├── period: string
 ├── locationOrMode?: string
 └── highlights: string[]                  // Collapsible bullets (FR-024)

AchievementItem
 ├── id: string
 ├── title: string
 ├── issuer: string
 ├── date: string
 ├── context?: string
 └── verificationUrl?: string              // Optional external link (FR-027)

ContactData
 ├── email: string | null                  // TBD; guards mailto: & Copy Email (FR-029, FR-030)
 ├── availabilityNote?: string | null      // TBD (FR-031)
 └── socialLinks: Array<{ id: string; label: string; url: string; handle?: string }>
```

- **Pure Utility Cross-Referencing (`src/utils/skillCrossRef.ts`, `FR-013`):** Computes related projects dynamically from `projects.ts` using normalized skill IDs/names so updating a project's `stack` automatically updates Skills relationships without duplicate metadata.

---

## 6. Theme Tokens and Theme-Switching Architecture

### 6.1 Token Layers (`src/styles/tokens.css` & `tailwind.config.ts`)
- **Theme Attributes:** `[data-theme="dark"]` (**Midnight Amethyst**, default, `FR-033`) and `[data-theme="light"]` (**Scarlet Porcelain**, light-adapted, `FR-034`).
- **Dual-Purpose Variables:**
  - *DOM Tokens:* Surfaces (`--surface-canvas`, `--surface-elevated`, `--surface-card`, `--surface-glass`, `--surface-scrim`), typography (`--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-accent`), accents (`--accent-primary`, `--accent-primary-deep`, `--accent-secondary`, `--accent-chrome`, `--accent-gold`, `--accent-copper`), borders, focus ring (`--focus-ring`), and status tokens (`UI_UX_DESIGN.md` Sec. 2).
  - *3D Scene Palette Map:* A typed JS/TS palette map (`src/three/themePalettes.ts`) mirrors the exact hex tokens defined in `UI_UX_DESIGN.md` (Sec. 2 & Sec. 8) so Three.js materials/shaders update deterministically on `theme` prop change (`FR-034`) without `getComputedStyle` polling per frame:
    - **Midnight Amethyst Dark Tokens (Pending Owner Sign-Off):** `#070A18` (canvas/void), `#9788FF` (primary amethyst accent), `#6B70E8` (deep indigo secondary accent), `#DDE3F3` (liquid chrome highlight), `#E7BC70` (gold accent), `#E18DAF` (metallic rose rim). Zero green/teal/cyan decorative brand colors.
    - **Scarlet Porcelain Light Tokens (Pending Owner Sign-Off):** `#F8F7FB` (canvas/porcelain base), `#D20D46` (primary scarlet crimson), `#A70F38` (deep scarlet focus/pressed), `#7045C8` (porcelain violet highlight), `#946213` (antique gold), `#5C6475` (liquid chrome steel).

### 6.2 Zero-FOUC Initialization & Persistence Flow (`FR-033`, `FR-035`)
1. Synchronous inline `<script>` in `index.html` `<head>` (guarded by `try/catch` and authorized via SHA-256 hash in `vercel.json` CSP, `NFR-018`) reads `localStorage.getItem('aj-portfolio-theme')`.
2. If `'light'` or `'dark'`, applies it; otherwise sets `'dark'` (**Midnight Amethyst**). Writes `document.documentElement.dataset.theme` and `style.colorScheme`.
3. `ThemeContext` initializes state directly from `document.documentElement.dataset.theme`, synchronizes changes back to `dataset.theme`, `style.colorScheme`, and `localStorage`, and respects `prefers-reduced-motion` transition timing (`FR-036`).

---

## 7. 3D Digital Universe Architecture, Loading, and Fallback

### 7.1 Isolation & Non-Blocking Mount (`FR-038`, `FR-044`, `NFR-001`)
- `App.tsx` renders `<UniverseFallback />` (lightweight themed CSS/SVG orbital grid) immediately at `t = 0ms`.
- `UniverseCanvas` is dynamically imported via `React.lazy()` and isolated into a separate Vite chunk (`vendor-three`), ensuring zero Three.js bytes block initial Hero typography or LCP (`NFR-002`).
- The outer wrapper uses `position: fixed; inset: 0; z-index: 0; pointer-events: none; aria-hidden="true"` (`FR-038`, `NFR-009`).

### 7.2 Scene Composition & Performance Governance (`FR-040`, `FR-041`, `NFR-004`)
- **Procedural Geometry Only (v1):**
  - *Far Layer:* `Points` starfield/telemetry dust with custom lightweight alpha shader.
  - *Mid Layer:* 2–3 tilted orbital `LineLoop` / thin torus rings in Liquid Chrome, Obsidian Gold, and Burgundy Copper.
  - *Core Layer:* Low-vertex wireframe lattice responding subtly to clamped pointer offset on desktop (`FR-040`).
- **Light-Mode Blending Adaptation:** Switch from additive blending (dark Midnight Amethyst) to normal alpha blending (light Scarlet Porcelain) so deep `#1B1421` ink remains crisp (`UI_UX_DESIGN.md` Sec. 10).
- **Lifecycle & Quality Tiers (`useQualityTier`):**
  - `desktop-high`: DPR `[1, 2]`, full procedural point budget, clamped pointer tilt.
  - `mobile-conserving` (`< 768px`, `hardwareConcurrency <= 4`, or `navigator.connection?.saveData`): DPR `[1, 1.5]`, ~40% particle density, pointer parallax disabled (`FR-041`).
  - `static` (`prefers-reduced-motion: reduce`): `frameloop="demand"` renders one static composed frame (`FR-039`, `NFR-010`).
  - **Pause Outside Viewport/Tab:** `IntersectionObserver` + `document.visibilityState` pause `frameloop` when inactive (`NFR-004`). Custom geometries/materials invoke `.dispose()` on unmount.

### 7.3 Deterministic Fallback Chain (`FR-045`, `NFR-021`)
1. `useWebGLSupport()` creates a separate, off-DOM temporary `<canvas>` (`document.createElement('canvas')`) to probe `getContext('webgl2') || getContext('webgl')` and immediately releases the probe context (`WEBGL_lose_context?.loseContext()`) before discarding it—preserving the intended R3F renderer `<Canvas>` untouched. If WebGL is unavailable, it stays on `<UniverseFallback />`.
2. `<WebGLErrorBoundary>` wraps `<UniverseCanvas />` -> catches runtime/shader errors and renders `<UniverseFallback />`.
3. `webglcontextlost` listener on `gl.domElement` calls `e.preventDefault()`, swaps to `<UniverseFallback />` if unrecovered, and restores on `webglcontextrestored`.

---

## 8. Animation Ownership and Integration (GSAP, Motion, CSS)

### 8.1 Strict Partitioning Matrix (**Mandatory**)
No DOM node may have `transform` or `opacity` mutated concurrently by both GSAP and Motion:

| Layer / Scope | Engine | Responsibilities | Lifecycle / Safety |
| :--- | :--- | :--- | :--- |
| **Scroll Choreography** | **GSAP + ScrollTrigger** | Experience timeline rail progress (`FR-024`), navbar/wide-rail scroll progress (`FR-005`), About hairline/portrait subtle parallax, updating mutable `scrollProgressRef` read inside R3F `useFrame`. | Wrapped in `gsap.context()` (`ctx.revert()` on cleanup) + `gsap.matchMedia()` gating `(prefers-reduced-motion: no-preference)` (`FR-039`). |
| **UI State & Layout Transitions** | **Motion (`motion/react`)** | `AnimatePresence` for `ProjectDetailModal` (`FR-016`) and `MobileDrawer` (`FR-003`), `layoutId` tab indicator & `layout` project filter reflow (`FR-012`, `FR-018`), Copy Email checkmark feedback (`FR-030`). | Root `<MotionConfig reducedMotion="user">` (`NFR-010`). |
| **Theme & Micro-States** | **CSS Transitions** | Surface/border/color transitions (`220ms ease` -> `0ms` in reduced motion, `FR-036`), `:focus-visible` outlines, button hover states. | Pure compositor/paint-safe CSS rules. |

---

## 9. Navigation, Project Deep-Links, Dialogs, and URL State

- **Section Anchor Navigation (`FR-001`, `FR-002`, `NFR-008`):** `useActiveSection` observes section landmarks via `IntersectionObserver` to drive active nav highlighting. `html { scroll-padding-top: 88px; }` prevents fixed navbar occlusion (WCAG 2.2 Focus Not Obscured).
- **Mobile Drawer (`FR-003`):** Rendered via Portal below `768px`, locking body scroll, trapping focus via `useFocusTrap`, dismissing on `Escape`/backdrop click, and restoring focus to the hamburger trigger.
- **Project Deep-Links & Dialog (`FR-016`, `FR-017`, `FR-019`, `FR-048`):**
  - `useProjectUrlState` reads `?project=<slug>` on mount and listens to `popstate`.
  - Valid slug opens `ProjectDetailModal` (Portal, `role="dialog"`, `aria-modal="true"`, `max-w-[880px]` desktop / bottom sheet mobile, focus trap + focus restoration).
  - Closing pushes/replaces clean URL state (preserving `#projects` hash); Browser Back closes an open modal naturally (`FR-019`).
  - Invalid slug strips the bad query parameter via `history.replaceState`, scrolls to `#projects`, and triggers an `aria-live="polite"` dismissible notice (`FR-048`).

---

## 10. Responsive and Accessibility Architecture

- **Swiss Breakpoint Grid (`NFR-014`, `NFR-016`):** `1360px` max content container (`UI_UX_DESIGN.md` Sec. 4) with `4` (`<768px`), `8` (`768px–1023px`), and `12` (`>=1024px`) column layouts; `min-h-[100dvh]` Hero prevents iOS Safari address-bar jumps.
- **Rendered Glass & 3D Contrast Enforcement (`NFR-007`):** Glass surfaces (`--surface-glass`) enforce `>= 72%` dark / `>= 78%` light opacity paired with `--surface-scrim` behind Hero type and `@supports not (backdrop-filter: blur(1px))` solid fallbacks. Contrast verification must test rendered composited layers over active 3D regions, not solid tokens alone (`UI_UX_DESIGN.md` Sec. 11).
- **Keyboard, Landmarks & Live Regions (`NFR-008`, `NFR-009`, `NFR-015`):** `SkipLink` first in tab order; single `h1` -> `h2` -> `h3` hierarchy; `>= 24x24px` (`>= 44x44px` touch) targets; `LiveAnnouncer` (`aria-live="polite"`) shared by Copy Email (`FR-030`), Project filter count (`FR-018`), and invalid deep-link banner (`FR-048`).

---

## 11. Performance and Asset-Loading Strategy

| Strategy | Implementation Mechanism | Target / Satisfies |
| :--- | :--- | :--- |
| **Bundle Splitting** | Vite `manualChunks` isolates `vendor-three` (`three`, `@react-three/fiber`, `@react-three/drei`) from entry bundle; `UniverseCanvas` uses `React.lazy()`. | Entry JS `<= 120 KB` gz; 3D chunk `<= 220 KB` gz (`NFR-001`, `FR-044`). |
| **Font Delivery** | Self-hosted subsetted `woff2` files for `Syne` (`600`, `700`), `Inter` (`400`, `500`, `600`), and `JetBrains Mono` (`400`, `500`) with `<link rel="preload">` for critical weights + `font-display: swap`. | Zero third-party font network blocking; minimal CLS (`NFR-002`, `NFR-005`). |
| **Media & Replaceable Assets** | Explicit `width`/`height` or `aspect-[3/4]` / `aspect-[16/10]` containers (`CLS <= 0.1`); `WebP`/`AVIF` with lazy decoding below the fold (`loading="lazy"`). | Prevents layout shift and protects LCP `<= 2.5s` (`FR-008`, `NFR-002`, `NFR-005`). |
| **GPU & Render Throttling** | R3F DPR cap, mobile particle reduction, `IntersectionObserver` + `visibilitychange` loop pausing, single blur layer limit (`<= 12px`, no nested blurs). | `>= 50–60 FPS` desktop; mobile battery safety (`FR-041`, `NFR-004`). |

---

## 12. SEO, Metadata, and External Integrations

- **Static SEO (`NFR-011`–`NFR-013`):** `index.html` embeds semantic `<title>`, `<meta name="description">`, canonical URL, Open Graph (`1200x630` `og-image.png` `TBD`), Twitter Card tags, and optional `JSON-LD` `Person` schema using only confirmed profile fields (`TBD`). `public/robots.txt` and `public/sitemap.xml` ship at root.
- **External Integrations & Security (`FR-029`, `NFR-017`–`NFR-019`):**
  - Zero third-party scripts, embeds, or tracking cookies by default.
  - Optional cookie-less Vercel Analytics (`NFR-019`, `TBD`) requires explicit approval and matching `script-src`/`connect-src` allowlist addition in `vercel.json`.
  - Strict `vercel.json` headers (`CSP` with SHA-256 hash for pre-paint theme script, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`).

---

## 13. Testing Architecture and Quality Gates

| Layer | Tooling (**Recommended**) | Automated Quality Gate Criteria |
| :--- | :--- | :--- |
| **Static Analysis** | `tsc --noEmit` + ESLint (`jsx-a11y`, `react-hooks`) | `0` type errors; `0` lint/a11y rule violations. |
| **Unit & Utility Tests** | Vitest | `100%` pass for `slugValidation`, `skillCrossRef`, `projectFilters`, `useClipboard` fallback, `useWebGLSupport`, and empty/`TBD` data schemas. |
| **Component & A11y Tests** | Vitest + React Testing Library + `vitest-axe` | Focus trap/restoration in `ProjectDetailModal` & `MobileDrawer`, `ThemeToggle` persistence, `PortraitSlot` fallback, `0` axe violations across components. |
| **End-to-End (E2E)** | Playwright (Chromium, Firefox, WebKit + Mobile) | Verifies all 4 User Journeys (`PRD.md` Sec. 6), WebGL-disabled fallback, `prefers-reduced-motion: reduce`, `?project=` deep-link + Back button, `0` horizontal overflow (`320px–2560px+`), and `@axe-core/playwright` WCAG 2.2 AA scan in both themes (`FR-033`, `FR-035`, `FR-039`, `FR-044`, `FR-045`, `NFR-014`, `NFR-020`, `NFR-021`). |
| **Manual Contrast & Performance** | Lighthouse CI + DevTools Sampling | Verifies rendered glass + 3D contrast (`NFR-007`), `vendor-three` bundle separation (`NFR-001`), CWV (`LCP <= 2.5s`, `CLS <= 0.1`, `INP <= 200ms`), and `vercel.json` headers. |

---

## 14. GitHub, CI, and Vercel Deployment Architecture

- **Source Control (`GitHub`):** Protected `main` branch accepting changes via Pull Requests from `feat/*`, `fix/*`, and `docs/*` branches.
- **GitHub Actions CI (`.github/workflows/ci.yml`):** Sequential/parallel gates on every PR and `main` push:
  `npm ci` -> `tsc --noEmit` -> `eslint .` -> `vitest run` -> `vite build` (with entry chunk size assertion) -> `playwright test` against `vite preview`.
- **Vercel Hosting:**
  - Every PR deploys an ephemeral **Vercel Preview URL** for live WebGL, mobile Safari, and Lighthouse inspection prior to merge.
  - Merging to `main` triggers the production static build, serves immutable hashed assets via Vercel Edge CDN, enforces `vercel.json` HTTP security headers (`NFR-018`), and supports one-click instant rollback.

---

## 15. Risks, Dependencies, Architectural Decisions, and Unresolved Questions

### 15.1 Architectural Decision Log Summary
| Decision | Classification | Rationale | PRD Mapping |
| :--- | :---: | :--- | :--- |
| Static Vite SPA (no SSR/router/CMS/backend) | **Mandatory** | Matches stack, eliminates server attack surface, minimizes bundle size. | `PRD.md` Sec. 4 Exclusions, `NFR-001`, `NFR-018` |
| Direct email + social links only (no contact form in v1) | **Mandatory** | Matches confirmed v1 outreach scope without form/email backend infrastructure. | `FR-029`, `FR-030`, `FR-032` (`Won't`) |
| Isolated `src/three/` + `React.lazy` + temp-canvas probe + `UniverseFallback` | **Mandatory** | Guarantees fast initial paint, clean R3F canvas initialization, and full portfolio usability without WebGL. | `FR-038`, `FR-044`, `FR-045`, `NFR-021` |
| Strict GSAP (scroll) vs. Motion (UI) split | **Mandatory** | Prevents transform/opacity race conditions and unifies reduced-motion gating. | `FR-039`, `NFR-010` |
| Pre-paint SHA-256 theme script -> `dark` default | **Mandatory** | Eliminates theme FOUC while keeping strict CSP without `'unsafe-inline'`. | `FR-033`, `FR-035`, `NFR-018` |
| Exclude all `[Proposed]` / `Could` features from v1 | **Mandatory (until approved)** | Keeps v1 scope lean and prevents unapproved UI drift. | `UI_UX_DESIGN.md` Sec. 9.3 (`FR-006`, `FR-010`, `FR-014`, `FR-020`, `FR-021`, `FR-025`, `FR-028`, `FR-042`) |
| Vitest + `vitest-axe` + Playwright + Lighthouse CI | **Recommended** | Provides automated WCAG 2.2 AA, fallback, and bundle-split enforcement. | `NFR-002`, `NFR-006`, `NFR-020` |

### 15.2 Technical Risks & Mitigations
- **Rendered Glass/3D Contrast Failure (`NFR-007`):** Mitigated via minimum glass opacity (`84%` `--surface-glass` / `94%` `--surface-glass-strong` in both Midnight Amethyst & Scarlet Porcelain), `--surface-scrim` (`0.9` alpha) Hero/dialog backdrops, and rendered-layer contrast audits in both themes *(pending owner screenshot approval)*.
- **Three.js Bundle Bloat / Mobile Thermal Throttle (`NFR-001`, `NFR-004`):** Mitigated via Vite `manualChunks`, procedural-only v1 geometry, DPR capping, `useQualityTier`, and offscreen `frameloop` pausing.
- **GSAP StrictMode Double-Mount Bugs:** Mitigated by scoping every ScrollTrigger inside `gsap.context()` with deterministic `ctx.revert()` cleanup.

### 15.3 Dependencies & Unresolved Questions (`TBD`)
1. **Color Token Sign-Off:** Final owner approval of the refreshed Midnight Amethyst dark palette and Scarlet Porcelain light palette (`UI_UX_DESIGN.md` Sec. 2).
2. **Personal Content & Replaceable Assets (`src/data/*.ts` & `public/assets/`):** Configurable `roleLabel`, Hero tagline, About narrative, skills taxonomy, project records/media/links, experience records, achievements, email, social URLs, portrait image (`3:4`), résumé PDF, and `og-image.png`.
3. **Domain, Analytics & CI Profile:** Production domain name, cookie-less Vercel Analytics approval (`NFR-019`), and exact Lighthouse throttling preset (`NFR-003`).
4. **Optional `Could` / `[Proposed]` Scope:** Explicit decision to keep excluded or selectively promote `FR-006`, `FR-010`, `FR-014`, `FR-020`, `FR-021`, `FR-025`, `FR-028`, `FR-042`, or optional theme reset `FR-037`.
