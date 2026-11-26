# Technical Requirements Document (TRD): Austin Joshua — Engineering Portfolio

**Document Status:** Draft v1.0  
**Authoritative Sources:** [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md) & [PRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PRD.md)  
**Target Platform:** Static/SPA Frontend on Vercel (Source Control: GitHub)  

---

## 1. Technical Overview and Architectural Principles

### 1.1 System Overview
The Austin Joshua engineering portfolio is a client-rendered, single-page React + TypeScript application built with Vite and deployed as static assets on Vercel (`NFR-018`). No custom backend, CMS, or database is included in v1 (`FR-032`). The architecture separates semantic DOM content from progressive WebGL rendering (`FR-038`, `FR-044`), coordinates scroll choreography (GSAP + ScrollTrigger) separately from UI state transitions (Motion), and enforces dual-theme parity between **Midnight Amethyst** (dark default, `FR-033`, pending owner sign-off) and **Scarlet Porcelain** (`FR-034`, pending owner sign-off).

### 1.2 Core Architectural Principles
1. **DOM-First Progressive Enhancement (`FR-038`, `FR-043`, `FR-044`, `NFR-009`):** Semantic HTML5 landmarks, typography, and interactive controls form the primary application layer. The Three.js / React Three Fiber (R3F) canvas renders purely as a decorative, `aria-hidden`, non-blocking visual layer that loads asynchronously after initial text paint.
2. **Strict Separation of Concerns:** Typed content schemas/data, design tokens, UI presentation components, 3D scene modules, and animation hooks reside in isolated layers so content updates (`TBD` -> final data) or visual tuning require zero structural rewrites (`FR-008`, `FR-046`, `FR-047`).
3. **Deterministic Fallbacks (`FR-039`, `FR-045`, `NFR-010`, `NFR-021`):** Every enhanced capability—WebGL2/WebGL1 rendering, Clipboard API, custom portrait/résumé assets, and continuous motion—has a verified fallback path.
4. **Zero-Overengineering (`FR-032`):** Avoid unnecessary global state libraries, routing frameworks, or runtime CMS dependencies when static TypeScript modules, native URL APIs, and lightweight React contexts suffice.
5. **Contrast & Motion Safety First (`NFR-006`, `NFR-007`, `NFR-010`):** Architectural choices (glassmorphism surface opacity, z-index layering, `prefers-reduced-motion` gating) prioritize WCAG 2.2 AA compliance over decorative effects.

### 1.3 Brief-vs-PRD Conflicts Identified
Rather than silently reconciling differences between [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md) and [PRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PRD.md), the following discrepancies are surfaced for explicit stakeholder sign-off:

| Area | `PROJECT_BRIEF.md` | `PRD.md` | Architectural Impact & Recommended Resolution |
| :--- | :--- | :--- | :--- |
| **Initial Theme vs. `prefers-color-scheme`** | Section 8 states "Complete support for `prefers-reduced-motion` and `prefers-color-scheme`." | `FR-033` (Must) requires defaulting to **Abyssal Teal (dark)** when no stored preference exists; `FR-037` (Could) makes OS/default reset optional. | **Conflict:** Auto-applying `prefers-color-scheme: light` on first visit violates `FR-033`. **Resolution (Required by PRD):** Pre-paint script honors `localStorage` first and defaults to `dark` (Abyssal Teal) when unset; `prefers-color-scheme` auto-sync is omitted unless `FR-037` is later elevated. |
| **WCAG Standard Level** | Section 8/11 recommends **WCAG 2.1 AA** (`TBD`). | `NFR-006` and `NFR-015` mandate **WCAG 2.2 AA**. | **Progression:** Implement and test against **WCAG 2.2 AA**, specifically adding `24x24` CSS px target size checks (`NFR-015`) and Focus Not Obscured (`scroll-padding-top`, `NFR-008`). |
| **Navigation / Project URLs** | Section 11 leaves single-page vs `/projects/:slug` routes `TBD`. | Section 4 confirms single-page scroll with in-page dialog (`FR-016`) and optional `?project=<slug>` state (`FR-019`). | **Resolved:** No client-side router library (`react-router`) is needed; use native `URLSearchParams` + `history.pushState` / `popstate` (`FR-019`). |
| **Contact Mechanism** | Section 11 leaves contact form vs links `TBD`. | `FR-032` (Won't) explicitly excludes a contact form in v1. | **Resolved:** Static `mailto:`, clipboard copy (`FR-030`), and social links only; zero serverless email endpoints needed in v1. |

---

## 2. Technology Choices with Justification

All core stack selections below are **Required** per project specification, with implementation-level choices marked **[Required]** or **[Recommended]**:

| Layer | Choice | Status | Justification & Trade-Offs | Satisfies |
| :--- | :--- | :--- | :--- | :--- |
| **UI & Language** | React 18+ & TypeScript (strict mode) | **Required** | Component isolation, strict compile-time validation for `TBD` content schemas, wide R3F/Motion ecosystem support. | `FR-046`, `NFR-020` |
| **Build Tool** | Vite | **Required** | Native ESM dev server, Rollup manual chunking for isolating Three.js (`NFR-001`), fast Vercel builds. | `NFR-001`, `NFR-002` |
| **Styling** | Tailwind CSS (v3/v4 CSS-variable backed) | **Required** | Utility velocity paired with CSS custom properties for instant dual-theme switching without runtime CSS-in-JS overhead. *Trade-off:* Requires disciplined utility composition/tokens to maintain Swiss grid alignment. | `FR-034`, `NFR-016` |
| **3D / WebGL** | `three` + `@react-three/fiber` (+ selective `@react-three/drei` helpers) | **Required** | Declarative scene graph lifecycle inside React; easy Suspense/ErrorBoundary integration. *Trade-off:* Heavy bundle (~150–200 KB+ gzipped); mitigated via dynamic `React.lazy()` and custom geometry/shaders over heavy `drei` abstractions. | `FR-038`, `FR-044`, `NFR-001` |
| **Scroll Choreography** | `gsap` + `ScrollTrigger` | **Required** | Frame-accurate timeline scrubbing and pinned/triggered Swiss section reveals without React re-render overhead. | `FR-005`, `FR-024`, `FR-039` |
| **UI Transitions** | `motion` (`motion/react`) | **Required** | Declarative `AnimatePresence`, layout transitions for filters/tabs, and accessible modal enter/exit animations. *Trade-off:* Using both GSAP and Motion risks DOM transform collisions; resolved via strict boundary rules (Section 8). | `FR-012`, `FR-017`, `FR-018` |
| **Icons** | `lucide-react` (tree-shaken) or minimal inline SVGs | **Recommended** | Lightweight, consistent stroke weight matching Swiss aesthetic; zero icon font download. | `NFR-005`, `NFR-009` |
| **Lint / Format** | ESLint (TS + `jsx-a11y` + React Hooks) + Prettier | **Recommended** | Catches accessibility regressions and hook dependency bugs before CI/build. | `NFR-006`, `NFR-008` |
| **Testing** | Vitest + React Testing Library + `vitest-axe` + Playwright | **Recommended** | Fast unit/component/a11y checks plus real-browser WebGL, focus-trap, and CWV verification. | `NFR-002`, `NFR-006`, `NFR-020` |
| **Hosting & CI** | GitHub + GitHub Actions + Vercel | **Required** | Automated PR previews, branch protection checks, edge caching, and security header config via `vercel.json`. | `NFR-018` |

*Explicitly Excluded Dependencies:* `react-router-dom` (unnecessary for single-page + query param state), Redux/Zustand (React Context + local state suffices), `three-stdlib` full imports, and heavy UI component libraries (MUI/Chakra) that fight custom Swiss/Glassmorphism styling.

---

## 3. Application Architecture and Component Boundaries

### 3.1 Layered Architecture
```text
┌──────────────────────────────────────────────────────────────────────┐
│  index.html (Pre-paint Theme Script + Critical Meta/CSP Hooks)       │
└───────────────────────────────────┬──────────────────────────────────┘
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│  App Shell (ThemeProvider, ReducedMotionProvider, URL/Dialog State)  │
├───────────────────────────────────┬──────────────────────────────────┤
│  Layer 0: Background Spatial Layer│  Layer 1: Semantic DOM Layer     │
│  (Suspense + WebGLErrorBoundary)  │  (SkipLink, Header/Nav, <main>,  │
│   ├─ Lazy R3F <Canvas> (WebGL OK) │   7 Section Modules, Footer)     │
│   └─ Static CSS/SVG Backdrop      │                                  │
│      (No WebGL / Reduced Motion)  │  Layer 2: Overlay Layer (Portal) │
│                                   │  (ProjectDetailDialog, MobileNav)│
└───────────────────────────────────┴──────────────────────────────────┘
         ▲                                           ▲
         └────────── Shared Read-Only Inputs ────────┴── Typed Data Modules
                     (ThemeContext, ScrollProgress)      (src/data/*.ts)
```

### 3.2 Module Boundary Rules
- **`src/data/` (Content Layer):** Pure TypeScript objects/arrays typed against `src/types/portfolio.ts`. Zero React, DOM, GSAP, or Three.js imports.
- **`src/components/ui/` (Design Primitives):** Theme-aware Swiss/Glassmorphism primitives (`GlassSurface`, `SectionShell`, `Tag`, `ActionButton`, `PortraitFrame`) driven exclusively by CSS variables and Tailwind utilities.
- **`src/components/sections/` (Feature Sections):** Semantic section containers (`HeroSection`, `AboutSection`, `SkillsSection`, `ProjectsSection`, `ExperienceSection`, `AchievementsSection`, `ContactSection`). Each handles its own empty/`TBD` state (`FR-046`).
- **`src/three/` (3D Engine Boundary):** Isolated behind a single lazy-loaded entry point (`UniverseCanvas.tsx`). Receives only primitive props (`theme`, `reducedMotion`, `qualityTier`, `scrollProgressRef`). Never imports UI components or mutates DOM outside `<Canvas>`.
- **`src/motion/` (Animation Hooks):** Houses GSAP ScrollTrigger registration/cleanup (`useScrollReveal`, `useSectionObserver`) and Motion preset variants (`src/motion/variants.ts`), enforcing `prefers-reduced-motion` uniformly (`FR-039`, `NFR-010`).

---

## 4. Recommended Folder and File Structure

```text
Portfolio/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Typecheck, lint, unit/a11y tests, build, optional E2E
├── public/
│   ├── robots.txt                    # SEO crawl rules (NFR-012)
│   ├── sitemap.xml                   # Canonical single-page sitemap (NFR-012)
│   ├── og-image.png                  # TBD Open Graph preview asset (NFR-012)
│   └── assets/
│       ├── portrait/                 # Reserved slot for future portrait (FR-008)
│       └── resume/                   # Reserved slot for future résumé PDF (FR-009)
├── src/
│   ├── main.tsx                      # React root mount + GSAP ScrollTrigger plugin registration
│   ├── App.tsx                       # Providers, semantic shell, lazy 3D mount, overlay portals
│   ├── styles/
│   │   ├── tokens.css                # CSS custom properties (Midnight Amethyst & Scarlet Porcelain tokens)
│   │   ├── glass.css                 # Glassmorphism utilities & contrast-safe scrims
│   │   └── index.css                 # Tailwind directives, base typography, focus/scroll-padding rules
│   ├── types/
│   │   └── portfolio.ts              # Strict TS interfaces for Profile, Skill, Project, Experience, Achievement
│   ├── data/
│   │   ├── profile.ts                # Austin Joshua identity, bio, availability, portrait/résumé paths (TBD)
│   │   ├── skills.ts                 # Categorized skills & project-tag mappings (TBD)
│   │   ├── projects.ts               # Project entries, slugs, stacks, architecture notes, links (TBD)
│   │   ├── experience.ts             # Experience timeline records (TBD)
│   │   ├── achievements.ts           # Achievements & credentials records (TBD)
│   │   └── contact.ts                # Email & verified social links (TBD)
│   ├── context/
│   │   ├── ThemeContext.tsx          # Midnight Amethyst <-> Scarlet Porcelain state & localStorage persistence
│   │   └── MotionPreferenceContext.tsx # prefers-reduced-motion (+ optional FR-042 manual override)
│   ├── hooks/
│   │   ├── useActiveSection.ts       # IntersectionObserver active nav tracking (FR-002)
│   │   ├── useProjectUrlState.ts     # ?project=<slug> sync with history/popstate (FR-019)
│   │   ├── useWebGLSupport.ts        # Capability & context-loss detection (FR-045)
│   │   └── useClipboard.ts           # Clipboard API + graceful fallback + aria status (FR-030)
│   ├── motion/
│   │   ├── gsapConfig.ts             # Safe ScrollTrigger setup & matchMedia helper
│   │   └── variants.ts               # Shared Motion transition/reduced-motion variants
│   ├── three/
│   │   ├── UniverseFallback.tsx      # Static CSS/SVG Digital Universe backdrop (FR-045)
│   │   ├── UniverseCanvas.tsx        # Lazy-loaded R3F <Canvas> + WebGLErrorBoundary + DPR/visibility pause
│   │   ├── DigitalUniverseScene.tsx  # Starfield/nebula/orbital Swiss geometry & theme uniforms
│   │   └── useQualityTier.ts         # Viewport/hardware tiering (FR-041)
│   └── components/
│       ├── layout/
│       │   ├── SkipLink.tsx          # WCAG 2.2 AA Skip-to-main-content (NFR-008)
│       │   ├── Navbar.tsx            # Sticky header, desktop links, theme toggle, mobile trigger (FR-001)
│       │   ├── MobileDrawer.tsx      # Accessible mobile menu with focus trap (FR-003)
│       │   └── Footer.tsx            # Colophon + Back-to-top (FR-031)
│       ├── ui/
│       │   ├── GlassCard.tsx         # Contrast-verified translucent container
│       │   ├── ThemeToggle.tsx       # Accessible dark/light switch (FR-034)
│       │   ├── HeroPortraitReveal.tsx # Hero silhouette-to-colour portrait reveal over 3D scene
│       │   ├── PortraitSlot.tsx      # Replaceable cutout portrait frame + Swiss geometric fallback (FR-008, FR-047)
│       │   └── ProjectDetailModal.tsx # Accessible dialog, focus trap, Escape/Back handling (FR-016, FR-017)
│       └── sections/
│           ├── HeroSection.tsx
│           ├── AboutSection.tsx
│           ├── SkillsSection.tsx
│           ├── ProjectsSection.tsx
│           ├── ExperienceSection.tsx
│           ├── AchievementsSection.tsx
│           └── ContactSection.tsx
├── tests/                            # Vitest unit/component/axe specs & Playwright E2E specs
├── index.html                        # Pre-paint theme inline script, font preloads, SEO tags
├── package.json
├── tsconfig.json
├── vite.config.ts                    # Manual chunking (three/r3f, gsap, motion)
├── tailwind.config.ts
└── vercel.json                       # Security headers & SPA rewrite rules (NFR-018)
```

---

## 5. Frontend Rendering Strategy and Data Management

### 5.1 Rendering Strategy (**Required**)
- **Static SPA Build via Vite:** `vite build` outputs static HTML, CSS, and code-split JS bundles served from Vercel's edge CDN.
- **Why SPA over SSR/SSG framework (e.g., Next.js/Astro):** The brief/PRD lock React + Vite + Vercel for a single-page portfolio with static local data. Adding SSR introduces unnecessary complexity for zero dynamic database routes (`NFR-011`–`NFR-013` are satisfied cleanly in static `index.html`).
- **Pre-paint Critical Path (`FR-044`, `NFR-001`):** `index.html` includes inline theme initialization and static SEO metadata; Hero DOM renders immediately on React mount while `UniverseCanvas` is loaded via `React.lazy(() => import('./three/UniverseCanvas'))`.

### 5.2 Typed Data Management & Null-Safe Schemas (`FR-008`, `FR-023`, `FR-046`, `FR-047`)
- All portfolio content resides in strongly typed `src/data/*.ts` modules with optional/nullable fields for `TBD` items so the UI compiles and renders safely before final copy/assets arrive:
  - `ProfileData`: `portrait?: { src: string; alt: string } | null`, `resume?: { url: string; label: string } | null`.
  - `ProjectItem`: `slug`, `title`, `summary`, `category`, `stack[]`, `problem`, `approach`, `outcomes?`, `links: { github?: string; live?: string }`, `media?: MediaItem[]`.
  - `ExperienceItem[]` and `AchievementItem[]`: Explicitly allow `[]` (zero items) during staging; sections inspect array length and render a clean verified notice (`FR-023`, `FR-046`) rather than crashing or emitting `undefined`.
- **Single Source Cross-Referencing (`FR-013`):** Skills link to projects dynamically by matching canonical skill IDs/names against `projects.ts` rather than duplicating links manually.

---

## 6. Design Tokens, Theme Architecture, and Persistence

### 6.1 Semantic Token Architecture (`FR-033`, `FR-034`, `NFR-007`)
- Define semantic CSS custom properties under `[data-theme="dark"]` (**Midnight Amethyst**, default) and `[data-theme="light"]` (**Scarlet Porcelain**) in `src/styles/tokens.css`, mapped into `tailwind.config.ts` (e.g., `bg-surface-primary`, `text-content-primary`, `border-glass-edge`).
- **Token Categories (Proposed Values Pending Owner Sign-Off in Design System):**
  - **Surfaces:** `--surface-canvas`, `--surface-elevated`, `--surface-card`, `--surface-glass`, `--surface-scrim` (scrim alpha tuned so text contrast always clears `4.5:1`).
  - **Typography:** `--text-primary`, `--text-secondary`, `--text-muted`, `--font-display` (`Syne`), `--font-sans` (`Inter`), `--font-mono` (`JetBrains Mono`).
  - **Accents:** `--accent-primary` (`#9788FF` dark / `#D20D46` light), `--accent-chrome`, `--accent-gold`, `--accent-copper` (metallic rose / warm carmine copper).
  - **3D Uniform Tokens:** Expose typed scene palette tokens (`src/three/themePalettes.ts` + CSS tokens) read by `DigitalUniverseScene` when theme changes (`FR-034`).

### 6.2 Zero-FOUC Pre-Paint Persistence (`FR-033`, `FR-035`)
- **Required Mechanism:** A minimal synchronous `<script>` in `<head>` of `index.html` executes before first paint:
  1. Reads `localStorage.getItem('aj-portfolio-theme')` inside a `try/catch` (safe in private/restricted storage contexts).
  2. Validates value is `'dark'` or `'light'`; otherwise defaults to `'dark'` (**Midnight Amethyst**, per `FR-033`—do not override with `prefers-color-scheme` unless `FR-037`/Brief conflict is changed).
  3. Sets `document.documentElement.dataset.theme = theme` and `document.documentElement.style.colorScheme = theme`.
- `ThemeContext` initializes state directly from `document.documentElement.dataset.theme`, keeping React hydration 100% consistent with initial paint.
- **CSP Consideration:** Because `index.html` uses a small inline script, compute its SHA-256 hash in `vercel.json` CSP (`script-src 'self' 'sha256-...'`) rather than enabling `'unsafe-inline'` (`NFR-018`).

---

## 7. 3D Architecture: Scene Composition, Loading, Performance, Fallback, and Lifecycle

### 7.1 Scene Composition (**Recommended Concept**)
- **Visual Role (`FR-038`):** Full-viewport fixed/pinned background canvas (`z-index: 0`, `pointer-events: none` on wrapper so DOM scrolling and clicks are never intercepted) behind Hero (`z-index: 10`) and subtle ambient depth in lower sections.
- **Scene Elements:** Low-draw-call procedural Digital Universe—e.g., instanced/point-cloud starfield (`Points` + custom GLSL shader or `BufferGeometry`), subtle orbital Swiss wireframe rings/lattice in Liquid Chrome / Obsidian Gold / Burgundy Copper accents, and theme-reactive atmospheric fog/lighting. Avoid high-poly external `.glb` models in v1 unless strictly budgeted (`NFR-002`).

### 7.2 Async Loading & Bundle Isolation (`FR-044`, `NFR-001`)
- Configure `vite.config.ts` `build.rollupOptions.output.manualChunks` to isolate `three`, `@react-three/fiber`, and `@react-three/drei` into a dedicated `vendor-three` chunk.
- Load `<UniverseCanvas />` via `React.lazy` inside `<Suspense fallback={<UniverseFallback />}>` after initial mount (or `requestIdleCallback` / post-first-paint micro-deferral if needed to protect LCP).

### 7.3 Performance Scaling & Lifecycle (`FR-040`, `FR-041`, `NFR-004`)
- **Quality Tiers (`useQualityTier`):**
  - `desktop-high`: DPR `[1, 2]`, full particle count (`TBD`, e.g., ~1500–2500 points), subtle pointer parallax.
  - `mobile-conserving` (`< 768px` or `hardwareConcurrency <= 4` or `saveData`): DPR `[1, 1.5]`, reduced particle count (~40%), simplified shader, no continuous pointer tracking.
  - `static` (`prefers-reduced-motion: reduce` or manual toggle `FR-042`): `frameloop="demand"` (renders one composed frame on mount/theme change) or renders `<UniverseFallback />` directly (`FR-039`).
- **Visibility & Scroll Pausing (`NFR-004`):** Track `document.visibilityState` and Hero/canvas `IntersectionObserver`; set R3F `frameloop={isVisible && !isReducedMotion ? 'always' : 'demand'}` so GPU usage drops to zero when tab is backgrounded or canvas is offscreen.
- **Disposal (`NFR-021`):** R3F handles standard geometry/material disposal on unmount; custom `ShaderMaterial`, `BufferGeometry`, or `WebGLRenderTarget` instances created manually must explicitly invoke `.dispose()` in `useEffect` cleanup.

### 7.4 Deterministic Fallback & Context Loss (`FR-045`, `NFR-021`)
1. **Pre-Mount Capability Check (`useWebGLSupport`):** Test `canvas.getContext('webgl2') || canvas.getContext('webgl')` safely before attempting R3F mount. If unavailable, render `<UniverseFallback />` immediately.
2. **Error Boundary:** Wrap `<UniverseCanvas />` in a dedicated `WebGLErrorBoundary` catching shader/context exceptions and swapping to `<UniverseFallback />` without disturbing the DOM portfolio.
3. **Context Loss Handler:** Attach `webglcontextlost` listener on `gl.domElement` in R3F `onCreated`; call `event.preventDefault()`, switch state to fallback backdrop if context is unrecoverable, and restore cleanly on `webglcontextrestored`.

---

## 8. Animation Architecture: GSAP vs. Motion Responsibilities and Conflict Prevention

### 8.1 Strict Ownership Matrix (**Required**)
Never allow GSAP and Motion to animate the same CSS property (`transform`, `opacity`) on the same DOM element simultaneously.

| Responsibility | Owner | Scope & Mechanism | Satisfies |
| :--- | :--- | :--- | :--- |
| **Scroll-Linked Choreography & Section Entrances** | **GSAP + ScrollTrigger** | Hero-to-About spatial scroll cues, Swiss grid line reveals, Experience timeline progress markers, updating a mutable `scrollProgressRef` read by R3F inside `useFrame` (zero React re-renders). | `FR-005`, `FR-024`, `FR-040` |
| **Component State, Modals & Filter Transitions** | **Motion (`motion/react`)** | `AnimatePresence` for `ProjectDetailModal` & `MobileDrawer`, `layout` transitions on `ProjectsSection` filter grids & `SkillsSection` tabs, copy-email confirmation badge. | `FR-003`, `FR-012`, `FR-017`, `FR-018` |
| **Theme & Hover Micro-States** | **CSS Transitions** | Color/background/border token transitions (`FR-036`), focus outlines, standard button hover states. | `FR-034`, `FR-036` |

### 8.2 Lifecycle & Conflict Prevention Rules
- **GSAP Cleanup (`useGSAP` or `gsap.context()`):** Every GSAP setup inside React `useEffect` must be wrapped in `gsap.context(() => { ... }, containerRef)` and call `ctx.revert()` on unmount to survive React StrictMode double-invocation cleanly.
- **Reduced Motion Unification (`FR-039`, `NFR-010`):**
  - Wrap root app in Motion's `<MotionConfig reducedMotion="user">` (or toggle `"always"` if `FR-042` manual toggle is active).
  - Wrap GSAP ScrollTrigger timelines in `gsap.matchMedia()` checking `(prefers-reduced-motion: no-preference)`; when reduced motion matches, leave elements at natural `opacity: 1; transform: none`.
- **No Layout-Thrashing Properties:** Animate only compositor-friendly properties (`transform`, `opacity`, `clip-path`). Never animate `width`, `height`, `top`, `left`, or `backdrop-filter` blur radius per frame.

---

## 9. Navigation, Scrolling, Project Dialogs, and URL State

### 9.1 Single-Page Scroll & Sticky Header (`FR-001`, `FR-002`, `NFR-008`)
- Set `scroll-padding-top` on `html` equal to sticky navbar height + safe margin (e.g., `88px`) so anchor jumps and keyboard focus never hide target headings behind the fixed navbar (WCAG 2.2 AA **Focus Not Obscured**).
- Use `IntersectionObserver` across section landmarks (`#hero`, `#about`, `#skills`, `#projects`, `#experience`, `#achievements`, `#contact`) with rootMargin tuned to highlight the active section in `Navbar` (`aria-current="location"` or active indicator).
- Anchor clicks use `element.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' })` and ensure focus moves appropriately for keyboard users.

### 9.2 Project Detail Dialog & URL Synchronization (`FR-016`, `FR-017`, `FR-019`, `FR-048`)
- **Dialog Pattern:** Render `ProjectDetailModal` into a React Portal (`document.body` child) with `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`.
- **Focus & Scroll Lock:** On open, capture `document.activeElement`, lock background scroll (`overflow: hidden` with scrollbar gutter compensation so layout doesn't jump), move focus to modal close button or heading, trap `Tab`/`Shift+Tab` inside modal, and restore focus to the triggering project card on close.
- **URL State (`useProjectUrlState`):**
  - Opening a project calls `window.history.pushState({ projectSlug }, '', '?project=' + slug + window.location.hash)` (preserving any `#projects` hash).
  - Listening to `popstate` closes the modal cleanly when the user presses Browser Back (`FR-019`).
  - On initial load, if `?project=<slug>` matches a valid item in `projects.ts`, open the modal directly; if unknown (`FR-048`), strip the invalid query via `history.replaceState`, scroll to `#projects`, and display a dismissible non-blocking notice.

---

## 10. Responsive Implementation Strategy

| Breakpoint | Width Range | Layout & Grid Strategy | 3D & Interaction Adaptation | Satisfies |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `320px–767px` | 4-column Swiss grid, single-column stacked cards/timeline, `MobileDrawer` navigation, full-screen sheet for `ProjectDetailModal`. | `mobile-conserving` 3D tier; touch targets `>= 44x44px`; zero hover-dependent info. | `FR-003`, `FR-041`, `NFR-014`, `NFR-015` |
| **Tablet** | `768px–1023px` | 8-column Swiss grid, 2-column project/skill grid, inline header links (condensed spacing). | Moderate 3D density, clamped DPR `<= 1.5`. | `NFR-016` |
| **Desktop** | `1024px–1439px` | 12-column Swiss asymmetric grid, sticky/offset About & Timeline layouts, centered/slide-over modal. | `desktop-high` 3D tier with subtle clamped pointer parallax (`FR-040`). | `FR-040`, `NFR-016` |
| **Wide** | `>= 1440px` | Max container width (`TBD`, e.g., `1280px–1440px`) centered with generous Swiss margins; full-bleed 3D canvas edge-to-edge. | Full-bleed viewport canvas with DPR capped at `2`. | `NFR-004`, `NFR-014` |

- **Glassmorphism Performance & Legibility:** Cap `backdrop-filter: blur(...)` to reasonable radii (e.g., `12px–16px`) and apply only to discrete surfaces—never stacked nested blurs—with a translucent tinted fallback (`@supports not (backdrop-filter: blur(1px))`) to protect mobile GPU fill-rate and text contrast.

---

## 11. Accessibility Implementation Requirements (WCAG 2.2 AA)

| Technical Control | Implementation Standard | Satisfies |
| :--- | :--- | :--- |
| **Landmarks & Headings** | Single `<main>`, `<header>`, `<nav aria-label="Primary">`, `<footer>`, seven `<section aria-labelledby="...">`, strictly sequential `h1` -> `h2` -> `h3`. | `NFR-008`, `NFR-011` |
| **Skip Link & Focus** | First focusable element is `<a href="#main-content">Skip to main content</a>`; global `:focus-visible` ring (`>= 2px` solid high-contrast accent with offset) + `scroll-padding-top`. | `NFR-008` |
| **Contrast Over Glass/3D** | Measure foreground-over-composited-glass contrast in both **Abyssal Teal** and **light-adapted Crimson Void** (`>= 4.5:1` body, `>= 3:1` UI/large). Add subtle dark/light scrims behind Hero text if 3D particles pass behind typography. | `NFR-007` |
| **Target Sizes (WCAG 2.2)** | All buttons, filter chips, nav links, and icon toggles enforce minimum `24x24px` clickable area (`>= 44x44px` on touch breakpoints). | `NFR-015` |
| **Live Announcements** | Dedicated `aria-live="polite"` regions for: Copy Email feedback (`FR-030`), Project filter result count (`FR-018`), and invalid deep-link notice (`FR-048`). | `FR-018`, `FR-030`, `FR-048` |
| **3D Canvas Isolation** | `<canvas>` wrapper has `aria-hidden="true"` and no focusable child nodes (`NFR-009`). | `NFR-009` |
| **Reduced Motion** | Instant scroll, paused R3F `frameloop`, Motion `reducedMotion`, and GSAP `matchMedia` gating (`FR-039`). | `NFR-010` |

---

## 12. Performance Budgets and Testing Methodology

### 12.1 Quantitative Budgets (**Required Targets**)
| Metric / Asset | Budget Target | Verification Tool | Satisfies |
| :--- | :--- | :--- | :--- |
| **Initial Critical JS (excluding lazy 3D chunk)** | `<= 120 KB` gzipped (**Recommended** internal ceiling) | Vite bundle visualizer / CI size check | `NFR-001` |
| **Lazy 3D Chunk (`vendor-three`)** | `<= 220 KB` gzipped (**Recommended** ceiling; defer post-paint) | Vite build output | `NFR-001` |
| **LCP (Largest Contentful Paint)** | `<= 2.5 s` (Mobile & Desktop) | Lighthouse CI / CrUX / WebPageTest | `NFR-002` |
| **CLS (Cumulative Layout Shift)** | `<= 0.1` (Target `0.00` via explicit dimensions & pre-paint theme) | Lighthouse CI | `NFR-002` |
| **INP (Interaction to Next Paint)** | `<= 200 ms` | Chrome DevTools Performance / Playwright | `NFR-002` |
| **Lighthouse Scores** | Performance `>= 90` Desktop / `>= 80` Mobile; Accessibility `>= 95` (Target `100`); Best Practices `>= 95`; SEO `>= 95` | Lighthouse CI against Vercel Preview URL | `NFR-003`, `NFR-006` |
| **3D Frame Rate** | `>= 50–60 FPS` on mid-tier desktop during Hero scroll | Chrome DevTools FPS meter / GPU trace | `NFR-004` |

### 12.2 Measurement Methodology
- Run automated Lighthouse audits against production `vite build` / Vercel Preview deployments (`NFR-003`, never dev server) using a consistent throttling profile (`TBD` exact Lighthouse Mobile/Desktop preset).
- Inspect `dist/assets/` chunk breakdown on every PR touching `three`, `gsap`, or `motion` to verify Three.js has not leaked into the entry chunk (`NFR-001`).

---

## 13. SEO, Metadata, and Security Requirements

### 13.1 SEO & Metadata (`NFR-011`, `NFR-012`, `NFR-013`)
- Static `index.html` includes `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type="website"`), and Twitter Card tags (values marked `TBD` until domain/copy/OG image are confirmed).
- Include `public/robots.txt`, `public/sitemap.xml`, and an optional static `<script type="application/ld+json">` (`Person` schema) populated strictly from confirmed profile fields (`TBD`).

### 13.2 Security Headers & Hardening (`NFR-017`, `NFR-018`, `NFR-019`)
Configure `vercel.json` HTTP response headers for all routes:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` (**Required**):
  - `default-src 'self'`
  - `script-src 'self' 'sha256-<prepaint-theme-hash>'` (+ Vercel Analytics domain only if `FR`/`NFR-019` analytics is approved)
  - `style-src 'self' 'unsafe-inline'` (or hashed if feasible with Tailwind/Motion inline style attributes; note Motion sets inline `style` transforms, so avoid blocking style attributes)
  - `img-src 'self' data: blob:`
  - `font-src 'self'`
  - `connect-src 'self'` (+ Vercel Analytics endpoint only if enabled)
  - `frame-ancestors 'none'`
  - `object-src 'none'`
- **Link & Content Hygiene:** All `target="_blank"` links enforce `rel="noopener noreferrer"`; zero `dangerouslySetInnerHTML` usage (`NFR-017`).

---

## 14. Error Handling, Logging, and Browser Compatibility

### 14.1 Error Boundaries & Graceful Degradation (`FR-045`–`FR-048`)
- **Root Error Boundary:** Lightweight fallback UI preserving Austin Joshua's name, email `mailto:`, and reload action if an unexpected fatal React error occurs.
- **3D Error Boundary (`WebGLErrorBoundary`):** Isolates R3F/shader failures exclusively to the canvas container, silently switching to `<UniverseFallback />` (`FR-045`).
- **Asset & Clipboard Errors:** `PortraitSlot` attaches `onError` to switch to the Swiss geometric monogram (`FR-008`, `FR-047`). `useClipboard` wraps `navigator.clipboard.writeText` in `try/catch` and falls back cleanly (`FR-030`).
- **Logging Policy:** Zero noisy `console.log` in production builds; unexpected caught errors (e.g., WebGL context failure) emit concise `console.warn` diagnostics without exposing internal stack traces in UI (`NFR-021`).

### 14.2 Browser Compatibility Matrix (`NFR-020`, `NFR-021`)
- **Supported Targets:** Latest 2 major versions of Chrome, Edge, Firefox, Safari (macOS), iOS Safari, and Chrome for Android.
- **Verification Focus:** Safari `backdrop-filter` rendering and WebGL context limits, iOS `100dvh` viewport height handling in Hero (`min-h-[100dvh]`), and non-WebGL headless/privacy-hardened browser fallback parity.

---

## 15. Testing Strategy

| Test Level | Tooling (**Recommended**) | Scope & Verifiable Assertions | Requirement Coverage |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Vitest | `useClipboard` fallback, `useProjectUrlState` slug parsing/sanitization, `useWebGLSupport` feature detection, skill-to-project cross-referencing, empty/`TBD` data guards. | `FR-013`, `FR-019`, `FR-030`, `FR-045`, `FR-046`, `FR-048` |
| **Component Tests** | Vitest + React Testing Library | `Navbar` / `MobileDrawer` open/close/Escape, `ThemeToggle` persistence & `data-theme` updates, `SkillsSection` tabs, `ProjectsSection` filtering + `aria-live`, `ProjectDetailModal` focus trap/restore, `PortraitSlot` `onError` fallback. | `FR-001`–`FR-003`, `FR-008`, `FR-012`, `FR-016`–`FR-018`, `FR-034`, `FR-047` |
| **Accessibility Tests** | `vitest-axe` + Playwright `@axe-core/playwright` | Automated WCAG 2.2 AA scans on full page (dark & light themes), open `ProjectDetailModal`, and open `MobileDrawer`; keyboard-only tab order & `24x24` target size checks. | `NFR-006`–`NFR-010`, `NFR-015` |
| **End-to-End (E2E)** | Playwright (Chromium, Firefox, WebKit + mobile viewports) | All 4 User Journeys: Hero load before 3D, deep-link `?project=<slug>` + Back button, theme toggle + reload (no dark/light mismatch), WebGL-disabled context fallback, `prefers-reduced-motion: reduce`, zero horizontal overflow (`320px`–`1440px`). | `FR-033`, `FR-035`, `FR-039`, `FR-044`, `FR-045`, `NFR-014`, `NFR-020`, `NFR-021` |
| **Performance & Security** | Lighthouse CI + HTTP header check | Verify bundle split (`vendor-three` separate), CWV (`NFR-002`), and `vercel.json` security headers on preview URL. | `NFR-001`–`NFR-003`, `NFR-018` |

---

## 16. GitHub Workflow, CI Checks, and Vercel Deployment

### 16.1 GitHub Workflow (**Recommended**)
- **Branching:** `main` (production-ready, protected) <- short-lived feature branches (`feat/*`, `fix/*`, `docs/*`) via Pull Requests.
- **CI Pipeline (`.github/workflows/ci.yml` on PR & `main` push):**
  1. `npm ci` (lockfile deterministic install)
  2. `tsc --noEmit` (strict TypeScript type-check)
  3. `eslint .` (code + `jsx-a11y` lint)
  4. `vitest run` (unit, component, and `vitest-axe` checks)
  5. `vite build` (verify clean production bundle & chunk split)
  6. `playwright test` (E2E + `@axe-core/playwright` on `vite preview`)

### 16.2 Vercel Deployment Architecture (**Required**)
- **Preview Deployments:** Every GitHub PR generates an isolated Vercel Preview URL for visual, 3D FPS, and Lighthouse verification prior to merge.
- **Production Deployment:** Merging to `main` triggers production build (`vite build`), applies `vercel.json` security headers and SPA fallback rewrites, and serves static assets via Vercel Edge Network.
- **Rollback:** Instant promotion/rollback to previous immutable Vercel deployment in case of post-release regression.

---

## 17. Technical Risks, Mitigations, and Unresolved Decisions

### 17.1 Technical Risks & Mitigations
| Risk | Severity | Mitigation Strategy |
| :--- | :---: | :--- |
| **GSAP ScrollTrigger & React StrictMode / Motion conflicts** | Medium | Enforce strict DOM ownership matrix (Section 8.1); always scope GSAP inside `gsap.context()` and revert on unmount. |
| **Three.js bundle size inflating initial load (`NFR-001`/`002`)** | High | Code-split `vendor-three` via Vite `manualChunks` + `React.lazy`, avoid heavy pre-built `drei` abstractions/models, defer canvas mount until after initial paint. |
| **WCAG 2.2 AA contrast failure over translucent glass + animated 3D** | High | Enforce minimum scrim opacity tokens (`--surface-scrim`) on text-bearing glass cards and test both Abyssal Teal & light-adapted Crimson Void with `axe` and manual contrast sampling. |
| **CSP breaking Vite inline pre-paint theme script or WebGL shaders** | Medium | Use deterministic SHA-256 CSP hash for the pre-paint theme `<script>` and avoid `eval()` / `new Function()` in shaders or libraries. |
| **Mobile Safari / WebGL memory pressure & `100dvh` jumps** | Medium | Cap DPR at `1.5` on mobile, scale geometry counts (`useQualityTier`), pause offscreen render loops (`NFR-004`), and use `100dvh` for Hero sizing. |

### 17.2 Unresolved Technical & Product Decisions (`TBD`)
1. **Brief-vs-PRD Theme Conflict:** Confirm strict adherence to `FR-033` (always default to Midnight Amethyst dark theme on first visit) vs. supporting `prefers-color-scheme` on initial visit (`PROJECT_BRIEF.md`).
2. **Design System Tokens:** Final owner sign-off on Midnight Amethyst (`#070A18`, `#9788FF`, `#6B70E8`) and Scarlet Porcelain (`#F8F7FB`, `#D20D46`, `#A70F38`) palettes (`UI_UX_DESIGN.md` Sec. 2).
3. **3D Scene Scope & Asset Budget:** Exact 3D Digital Universe geometry/shader composition (procedural starfield/orbital vs. custom GLSL) and exact particle/draw-call budgets per quality tier.
4. **Optional `[Proposed]` Features (`Could` tier):** Confirm inclusion/exclusion of `FR-006`, `FR-010`, `FR-014`, `FR-020`, `FR-021`, `FR-025`, `FR-028`, `FR-042` before implementation sprint.
5. **Domain, OG Image & Analytics:** Final production domain, `og-image.png` asset, and decision on enabling cookie-less Vercel Analytics (`NFR-019`).
6. **Personal Data Modules (`src/data/*.ts`):** All verified copy, skills taxonomy, project entries/links/media, experience, achievements, email, social URLs, portrait asset, and résumé PDF.
