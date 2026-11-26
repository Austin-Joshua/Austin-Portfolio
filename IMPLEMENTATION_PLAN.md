# Implementation Plan: Austin Joshua — Engineering Portfolio

**Document Status:** Draft v1.0  
**Authoritative Baseline:** [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md), [PRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PRD.md), [TRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/TRD.md), [UI_UX_DESIGN.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/UI_UX_DESIGN.md), [SYSTEM_ARCHITECTURE.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/SYSTEM_ARCHITECTURE.md)  
**Target Stack:** React, TypeScript, Vite, Tailwind CSS, Three.js / React Three Fiber, GSAP + ScrollTrigger, Motion, GitHub, Vercel  

---

## 1. Delivery Strategy: Milestones, Dependencies & Approval Gates

### 1.1 Incremental Delivery Approach
The portfolio is built across **9 sequential, reviewable phases** grouped into **4 Milestones**. Each phase produces a runnable, verifiable outcome and must pass its gate criteria before the next phase starts.
- **Scope Rule:** All `Must` requirements (`39`) are **Mandatory**; committed `Should` requirements (`19`) are included in the v1 baseline as noted; all `Could` / `[Proposed]` features (`FR-006`, `FR-010`, `FR-014`, `FR-020`, `FR-021`, `FR-025`, `FR-028`, `FR-037`, `FR-042`) and `Won't` items (`FR-032`, `FR-043`) are **excluded from v1** unless explicitly approved.
- **Conflict Resolution Applied:** Default theme is **Midnight Amethyst (dark)** (`FR-033`, refreshed from Abyssal Teal pending owner sign-off); typography is locked to **Syne / Inter / JetBrains Mono** (`UI_UX_DESIGN.md` Sec. 3.1); max content width is locked to **1360px** (`UI_UX_DESIGN.md` Sec. 4); WCAG target is **2.2 AA** (`NFR-006`).

### 1.2 Milestones & Approval Gates

| Milestone | Phases Included | Reviewable Outcome | Gate Criteria to Advance |
| :--- | :---: | :--- | :--- |
| **M1: Foundation & Theme Shell** *(Complete)* | Phases 1–3 | Locked dependency manifest & lockfile (`T1.0`, `T1.1`), bootstrapped Vite/TS/Tailwind app, `tokens.css` (Midnight Amethyst & Scarlet Porcelain values pending Gate A sign-off), zero-FOUC theme toggle, floating desktop `Navbar` capsule (`ScrollProgressBar`), `< 768px` compact top bar + fixed bottom navigation *(superseding `MobileDrawer`)*, `>= 1280px` vertical `01–07` rail (`DesktopSectionRail`), `Footer`, and `SkipLink`. | `package-lock.json` generated via `npm install`, committed, and verified with `npm ci`; `tsc --noEmit`, ESLint (`jsx-a11y`), and Vitest smoke/a11y checks pass; Midnight Amethyst default & Scarlet Porcelain toggle persist across reloads with zero FOUC (`FR-033`–`FR-035`). |
| **M2: Semantic Content & Deep-Links** | Phases 4–5 | Complete 7-section DOM portfolio backed by typed `src/data/*.ts`, replaceable/empty states, and `?project=<slug>` `ProjectDetailModal`. | All 7 sections usable by keyboard without WebGL; filter `aria-live`, modal focus trap/restore, and Browser Back URL sync pass (`FR-016`–`FR-019`). |
| **M3: 3D Digital Universe & Motion** *(Complete)* | Phases 6–7 | Lazy-loaded `vendor-three` R3F Digital Universe, temp-canvas WebGL probe + `UniverseFallback`, GSAP scroll choreography, and Motion transitions. | Entry chunk excludes Three.js (`NFR-001`); WebGL-disabled and `prefers-reduced-motion: reduce` modes pass cleanly (`FR-039`, `FR-045`). |
| **M4: Hardening, Verification & Release** *(Partially Complete — Pre-Launch Gates Open)* | Phases 8–9 | WCAG 2.2 AA rendered contrast/keyboard checks, responsive sweep (`320px–2560px+`), cross-browser Playwright (`tests/e2e/portfolio.spec.ts`), GitHub Actions CI (`.github/workflows/ci.yml`), and Vercel security config (`vercel.json`). Public release (`T9.4`) remains blocked on Gate A, Gate B, production domain, live preview/Lighthouse, and manual AT walkthrough. | Zero `vitest-axe` / `@axe-core/playwright` violations, CWV targets (`NFR-002`) & bundle limits verified, security headers active (`NFR-018`), Gate A token sign-off complete, and Gate B (Sec. 1.3) satisfied: verified personal content populated across Hero/About/Skills/Projects/Contact (unless a specific section has explicit staged-launch approval per `PRD.md` Sec. 12 #2), Experience/Achievements populated or in their approved empty panels, `PortraitSlot` fallback active if photo pending, and zero literal `"TBD"`, `"Lorem ipsum"`, or fabricated claims. |

### 1.3 External Approval Gates (`TBD` Before Public Launch)
Phases 1–8 can be engineered and tested end-to-end using provisional design tokens and typed neutral/empty states. Only final visual sign-off and public production release (`T9.4`) are gated on external approvals:
- **Gate A (Before `T9.4` Final Visual Sign-Off & Production Release):** Stakeholder sign-off on refreshed Midnight Amethyst (`#070A18`, `#9788FF`, `#6B70E8`) and Scarlet Porcelain (`#F8F7FB`, `#D20D46`, `#A70F38`) palettes (`UI_UX_DESIGN.md` Sec. 2). All visual refresh tokens are contrast-verified (`T8.1`) and proposed pending owner screenshot review.
- **Gate B — Canonical Launch Content & Asset Rule (Before `T9.4` Public Production Release, per `PRD.md` Sec. 12 #2):**
  1. **Required Verified Personal Content (No Automatic Empty-State Exception):** Public launch requires verified personal content for `roleLabel` and Hero tagline (`FR-004`), About narrative (`FR-007`), confirmed Skills taxonomy (`FR-011`), verified Projects—titles, domain/category tags, summaries, role, problem statements, technical approaches, tech stacks, and verified external links (GitHub and/or live demo) (`FR-015`, `FR-016`)—and verified Contact email + social links (`FR-029`, `FR-030`). None of these sections may remain empty at launch unless that specific section's intentional empty/replaceable state receives **explicit staged-launch approval** under `PRD.md` Sec. 12 #2.
  2. **Automatically Permitted Neutral Empty States (`FR-023`, `FR-046`):** `Experience` (`FR-023`) and `Achievements` (`FR-046`) may launch either with verified records (`FR-022`, `FR-026`) or with their specifically approved neutral factual empty panels (`"No experience entries added yet."` / `"No achievements added yet."`) without separate staged-launch approval. These permissions apply strictly to `Experience` and `Achievements` and do **not** authorize empty Hero, About, Skills, Projects, or Contact sections.
  3. **Mandatory Portrait Component with Automatic Fallback (`FR-008`, `FR-047`):** The `PortraitSlot` UI component rendering the `3:4` Swiss geometric `AJ` monogram (`PORTRAIT // ASSET_PENDING`) is mandatory for v1 and satisfies `FR-008` without additional approval while the personal photograph remains pending.
  4. **Optional Assets & Launch Configuration (Non-Blocking):** Personal photograph (`3:4` `WebP`/`AVIF`), Résumé PDF (`FR-009` Should — CTA omitted cleanly when `null`), project outcomes/metrics (`FR-016` — omitted cleanly when unavailable, never fabricated), project `16:10` preview media (`UI_UX_DESIGN.md` Sec. 14), `1200x630` `og-image.png` (`NFR-012` Should), custom domain (defaults to Vercel URL if unset), and cookie-less analytics decision (`NFR-019` Should).
  5. **Strict Live-Site Prohibition:** Literal `"TBD"` strings, `"Lorem ipsum"`, fabricated personal details, fabricated achievements, fabricated metrics/outcomes, and unverified project claims are prohibited on the live site.

---

## 2. Phase & Task Breakdown

### Phase 1: Project Setup and Tooling
**Objective:** Verify dependency compatibility, lock package versions, and initialize a deterministic, strict-TypeScript Vite + React + Tailwind CSS repository with mandatory lint and test runner scaffolding.  
**Phase Outcome:** Committed lockfile + clean building starter shell with working typecheck, lint, and test scripts.

| Task ID | Task & Objective | Type | Affected Files / Modules | Deps | PRD Refs | Completion Criteria |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **T1.0** | Verify peer-dependency compatibility across the TRD stack (`react`, `react-dom`, `typescript`, `vite`, `tailwindcss`, `three`, `@types/three`, `@react-three/fiber`, `gsap`, `motion`, `lucide-react`, plus lint/test packages) against registry peer ranges—never blindly installing `latest` or inventing versions. Pin mutually compatible stable versions in `package.json` and record any unresolved peer-compatibility choice (e.g., React 18 vs. 19 with R3F/`vitest-axe`) as `TBD` before install. | **Mandatory** | `package.json` (version spec), compatibility notes (`TBD` if unresolved) | None | `NFR-001`, `NFR-020` | Compatible stable version matrix verified against registry manifests; zero unresolved peer conflicts remain prior to `npm install`. |
| **T1.1** | Scaffold React + TypeScript + Vite project with strict `tsconfig.json` (`strict: true`, path aliases) from the pinned `package.json` (`T1.0`), run initial `npm install` to generate `package-lock.json`, commit the lockfile, and verify clean reproducibility with `npm ci` (subsequent clean installs and CI always use `npm ci`). | **Mandatory** | `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx` | T1.0 | `NFR-001`, `NFR-020` | Initial `npm install` generates `package-lock.json`; lockfile is committed; clean `npm ci`, `npm run build`, and `tsc --noEmit` succeed with zero errors. |
| **T1.2** | Configure Vite manual chunk splitting (`vendor-three`) and folder skeleton matching `SYSTEM_ARCHITECTURE.md` Sec. 3. | **Mandatory** | `vite.config.ts`, `src/{types,data,styles,context,hooks,utils,motion,three,components}/` | T1.1 | `NFR-001`, `FR-044` | Directory structure exists; build config isolates `three`/`@react-three/fiber` from entry chunk. |
| **T1.3** | Configure ESLint (`@typescript-eslint`, `eslint-plugin-jsx-a11y`, `react-hooks`) and Vitest + React Testing Library + `vitest-axe` test runner baseline. *(Formatting via `.prettierrc` is **Recommended** and optional.)* | **Mandatory** | `eslint.config.*`, `vitest.config.*`, `tests/setup.ts` | T1.0, T1.1 | `NFR-006`, `NFR-008` | `npm run lint` and `vitest run` execute cleanly with exit code `0` on sample smoke spec. |

---

### Phase 2: Design Tokens, Typography and Theme System
**Objective:** Implement the dual-theme CSS variable architecture, finalized `Syne` / `Inter` / `JetBrains Mono` self-hosted fonts, glass/scrim utilities, and zero-FOUC theme persistence.  
**Phase Outcome:** Instant theme switching between **Midnight Amethyst** (default dark) and **Scarlet Porcelain** (light-adapted) persisted across reloads.

| Task ID | Task & Objective | Type | Affected Files / Modules | Deps | PRD Refs | Completion Criteria |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **T2.1** | Add self-hosted `woff2` subsets for `Syne` (`600`, `700`), `Inter` (`400`, `500`, `600`), and `JetBrains Mono` (`400`, `500`) with `@font-face` (`font-display: swap`) and `<link rel="preload">` for critical weights. | **Mandatory** | `public/fonts/`, `index.html`, `src/styles/index.css` | T1.1, T1.2 | `NFR-005`, `NFR-002` | DevTools confirms local `woff2` loading with zero external font requests and `0` fallback flash blocking. |
| **T2.2** | Author `[data-theme="dark"]` (Midnight Amethyst) and `[data-theme="light"]` (Scarlet Porcelain & accent tokens from `UI_UX_DESIGN.md` Sec. 2, marked provisional pending Gate A sign-off) tokens, fluid `clamp()` typography (`320px–1440px`) built on `T2.1` font stacks, `1360px` container utility, and glass/scrim utilities (`@supports` fallback). | **Mandatory** | `src/styles/tokens.css`, `src/styles/glass.css`, `src/styles/index.css`, `tailwind.config.ts` | T1.2, T2.1 | `FR-033`, `FR-034`, `NFR-007`, `NFR-014`, `NFR-016` | All UI/surface tokens resolve cleanly in both themes using contrast-verified Midnight Amethyst + Scarlet Porcelain values; glass fallback applies when `backdrop-filter` is unsupported. |
| **T2.3** | Implement pre-paint theme `<script>` in `index.html` (`localStorage` `'aj-portfolio-theme'`, fallback `'dark'`), `themeStorage.ts` helper, and `ThemeContext` + `MotionPreferenceContext` (OS `prefers-reduced-motion` only). | **Mandatory** | `index.html`, `src/utils/themeStorage.ts`, `src/context/ThemeContext.tsx`, `src/context/MotionPreferenceContext.tsx` | T2.2 | `FR-033`, `FR-035`, `FR-036`, `FR-039`, `NFR-010` | First visit loads Midnight Amethyst; saved Scarlet Porcelain reloads with zero FOUC; restricted `localStorage` does not throw. |

---

### Phase 3: Shared Layout and Navigation *(Complete)*
**Objective:** Build global semantic landmarks, desktop floating glass capsule navbar, `< 768px` compact top utility bar + fixed bottom navigation *(superseding the original `FR-003` mobile drawer/hamburger)*, accessible theme toggle, `2px` desktop scroll-progress indicator, `>= 1280px` vertical `01–07` rail, and Swiss section shell.  
**Phase Outcome:** Complete navigable single-page shell with keyboard-safe focus, `scroll-padding-top: 88px`, mobile fixed bottom navigation, GSAP-backed scroll progress, and wide-desktop section rail.

| Task ID | Task & Objective | Type | Affected Files / Modules | Deps | PRD Refs | Completion Criteria |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **T3.1** *(Complete)* | Build reusable primitives (`Button`, `GlassCard`, `TagChip`, `LiveAnnouncer`, `RootErrorBoundary`) and `useFocusTrap` hook. | **Mandatory** | `src/components/ui/{Button,GlassCard,TagChip,LiveAnnouncer}.tsx`, `src/components/layout/RootErrorBoundary.tsx`, `src/hooks/useFocusTrap.ts` | T2.2 | `FR-017`, `FR-018`, `FR-030`, `NFR-008`, `NFR-015` | Touch targets meet `>= 24x24px` (`>= 44x44px` mobile); focus trap cycles `Tab`/`Shift+Tab` and handles `Escape`. |
| **T3.2** *(Complete)* | Implement `SkipLink`, `SectionShell` (`01`–`07` Swiss index & landmarks), `Navbar` (desktop floating capsule + `< 768px` compact top bar & fixed bottom navigation), `ThemeToggle`, `useActiveSection` (`IntersectionObserver`), and `Footer` ("Back to Top"). | **Mandatory** | `src/data/sections.ts`, `src/utils/scrollNavigation.ts`, `src/components/layout/{SkipLink,SectionShell,Navbar,Footer}.tsx`, `src/components/ui/ThemeToggle.tsx`, `src/hooks/useActiveSection.ts` | T2.3, T3.1 | `FR-001`, `FR-002`, `FR-031`, `FR-034`, `NFR-008`, `NFR-011` | `SkipLink` jumps to `#main-content`; clicking nav anchors scrolls smoothly (or instant under reduced motion) without obscuring headings; mobile fixed bottom bar renders cleanly at `320px+`. |
| **T3.3** *(Complete)* | Implement `2px` desktop capsule scroll-progress indicator (`ScrollProgressBar`) with GSAP `ScrollTrigger` + `gsap.context()` cleanup and `>= 1280px` vertical `01–07` rail (`DesktopSectionRail`). *(Original `< 768px` `MobileDrawer`/hamburger requirement superseded by the approved fixed mobile bottom navigation delivered in T3.2.)* | **Should** (Progress & Rail) / **Superseded** (`MobileDrawer`) | `src/utils/scrollProgress.ts`, `src/components/layout/{ScrollProgressBar,DesktopSectionRail,Navbar}.tsx`, `src/styles/index.css` | T3.1, T3.2 | `FR-005`, `NFR-008`, `NFR-015` | Delivered: desktop `2px` scroll progress updates via GSAP `ScrollTrigger` and disables under reduced motion; `>= 1280px` rail links `01`–`07` via `PORTFOLIO_SECTIONS` + `useActiveSection` without mobile drawer or hamburger. |

---

### Phase 4: Core Portfolio Sections and Typed Content
**Objective:** Define strict content schemas (`src/types/portfolio.ts`), create configurable `src/data/*.ts` modules with `TBD`/empty-safe defaults, and implement all 7 portfolio sections.  
**Phase Outcome:** Complete, readable, empty-safe DOM portfolio covering Hero through Contact with zero fabricated details.

| Task ID | Task & Objective | Type | Affected Files / Modules | Deps | PRD Refs | Completion Criteria |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **T4.1** | Define TypeScript schemas (`ProfileData`, `SkillCategory`, `ProjectItem`, `ExperienceItem`, `AchievementItem`, `ContactData`) and initial `src/data/*.ts` files with `null`/`[]`/`TBD` placeholders (including configurable `roleLabel: string \| null`). | **Mandatory** | `src/types/portfolio.ts`, `src/data/{profile,skills,projects,experience,achievements,contact}.ts` | T1.2 | `FR-008`, `FR-023`, `FR-046`, `FR-047` | Zero hardcoded entries inside components; `tsc --noEmit` enforces null-safety for all optional/pending fields. |
| **T4.2** | Implement `HeroSection` (configurable `roleLabel`, `TBD` tagline, CTAs, `--surface-scrim`) and `AboutSection` + `PortraitSlot` (`3:4` geometric `AJ` monogram & `onError` fallback + conditional résumé CTA). | **Mandatory** (`Hero`, `About`, `Portrait`) / **Should** (`Résumé`) | `src/components/sections/{HeroSection,AboutSection}.tsx`, `src/components/ui/PortraitSlot.tsx` | T3.2, T4.1 | `FR-004`, `FR-007`, `FR-008`, `FR-009`, `FR-047`, `NFR-007` | Hero renders above fold without waiting for 3D; missing/errored portrait renders Swiss frame; missing résumé hides CTA cleanly. |
| **T4.3** | Implement `SkillsSection` (accessible domain tabs + Swiss matrix) and `src/utils/skillCrossRef.ts` mapping skills dynamically to matching projects. | **Mandatory** (`Tabs/Matrix`) / **Should** (`Cross-ref`) | `src/components/sections/SkillsSection.tsx`, `src/utils/skillCrossRef.ts` | T3.2, T4.1 | `FR-011`, `FR-012`, `FR-013`, `NFR-008` | Category tabs work via pointer and keyboard; selecting a skill highlights/links related projects without percentage bars. |
| **T4.4** | Implement `ProjectsSection` (`projectFilters.ts`, asymmetric bento `ProjectCard` grid, category filters + `aria-live` count, empty-filter reset) and `ExperienceSection` + `AchievementsSection` (with neutral empty-state cards when `[]`). | **Mandatory** (`Grid`, `Timeline`, `Achievements`, `Empty`) / **Should** (`Filter`, `Expand`, `Verify URL`) | `src/components/sections/{ProjectsSection,ExperienceSection,AchievementsSection}.tsx`, `src/utils/projectFilters.ts` | T3.2, T4.1 | `FR-015`, `FR-018`, `FR-022`, `FR-023`, `FR-024`, `FR-026`, `FR-027`, `FR-046` | Zero-item arrays render neutral factual panels; filter reset works; external verification links include `rel="noopener noreferrer"`. |
| **T4.5** | Implement `ContactSection` (`mailto:`, verified social links) and `useClipboard` hook ("Copy Email" button + `aria-live` feedback + blocked-clipboard fallback). | **Mandatory** (`Links`, `Copy`) / **Should** (`Availability`) | `src/components/sections/ContactSection.tsx`, `src/hooks/useClipboard.ts` | T3.2, T4.1 | `FR-029`, `FR-030`, `FR-031`, `NFR-017` | Email copies cleanly and announces confirmation; denied Clipboard API degrades without throwing; zero form fields exist. |

---

### Phase 5: Project Detail Modal and URL Deep-Linking
**Objective:** Implement accessible project inspection via Portal modal/sheet synchronized with `?project=<slug>` URL state and Browser Back navigation.  
**Phase Outcome:** Deep-linkable project details with full keyboard focus lifecycle and invalid-slug recovery.

| Task ID | Task & Objective | Type | Affected Files / Modules | Deps | PRD Refs | Completion Criteria |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **T5.1** | Implement `src/utils/slugValidation.ts` and `useProjectUrlState` hook syncing `?project=<slug>` via `history.pushState`/`replaceState` and `popstate` while preserving `#projects` hash. | **Mandatory** (`Dialog state`) / **Should** (`URL sync`, `Invalid notice`) | `src/utils/slugValidation.ts`, `src/hooks/useProjectUrlState.ts` | T4.1, T4.4 | `FR-016`, `FR-019`, `FR-048` | Opening a project updates URL; Browser Back closes modal; invalid `?project=bad` strips param, scrolls to `#projects`, and triggers notice. |
| **T5.2** | Implement `ProjectDetailModal` (Portal, `role="dialog"`, `aria-modal="true"`, centered `880px` desktop / bottom-up mobile sheet, sticky header, stack/media/links, focus trap + focus restoration). | **Mandatory** | `src/components/ui/ProjectDetailModal.tsx`, `src/components/sections/ProjectsSection.tsx` | T3.1, T5.1 | `FR-016`, `FR-017`, `NFR-008`, `NFR-014`, `NFR-017` | Focus enters dialog on open, traps inside, closes on `Escape`/backdrop/close button, and restores focus to triggering card. |

---

### Phase 6: 3D Digital Universe and Fallback *(Complete)*
**Objective:** Build the isolated, lazily loaded Three.js / React Three Fiber Digital Universe with temporary-canvas capability probing, adaptive mobile scaling, and deterministic CSS/SVG fallback.  
**Phase Outcome:** Non-blocking spatial 3D backdrop that degrades seamlessly when WebGL is unavailable, lost, or reduced-motion is enabled.

| Task ID | Task & Objective | Type | Affected Files / Modules | Deps | PRD Refs | Completion Criteria |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **T6.1** *(Complete)* | Implement `UniverseFallback.tsx` (theme-aware CSS/SVG orbital grid) and `useWebGLSupport.ts` using a separate off-DOM temporary `<canvas>` (`WEBGL_lose_context` cleanup) before mounting R3F. | **Mandatory** | `src/three/UniverseFallback.tsx`, `src/hooks/useWebGLSupport.ts` | T2.2 | `FR-044`, `FR-045`, `NFR-021` | Fallback matches active theme tokens; probe never touches or pollutes the R3F renderer canvas. |
| **T6.2** *(Complete)* | Implement `themePalettes.ts` (Midnight Amethyst dark core `#070A18`, `#9788FF`, `#6B70E8`, `#DDE3F3`, `#E7BC70`, `#E18DAF` plus Scarlet Porcelain light palette resolution), `useQualityTier.ts`, and `DigitalUniverseScene.tsx` (procedural `Points`, orbital rings, wireframe core, light-mode alpha blending, boosted dark-mode visibility behind Hero portrait). | **Mandatory** (`Scene`) / **Should** (`Pointer`, `Mobile tiers`) | `src/three/{themePalettes,useQualityTier,DigitalUniverseScene}.ts(x)` | T2.3 | `FR-034`, `FR-038`, `FR-040`, `FR-041`, `NFR-004` | Scene updates colors cleanly on theme toggle; mobile tier cuts density ~67.5% & caps DPR `<= 1.5`; offscreen/hidden tab pauses `frameloop`. *(Note: transparent portrait cutout `public/assets/portrait/austin-joshua-cutout.png` (`604x806`, original in `src/assets/source/austin-joshua.jpg`) integrated into `HeroPortraitReveal` + `PortraitSlot`.)* |
| **T6.3** *(Complete)* | Implement lazy-loaded `UniverseCanvas.tsx` (`React.lazy` + `Suspense` + R3F `createRoot` with selective `extend` tree-shaking `vendor-three` to `187.58 kB` gz <= `220 KB`), `UniverseLayer.tsx`, `WebGLErrorBoundary.tsx`, `webglcontextlost`/`restored` listeners, and `frameloop="demand"` static mode under `prefers-reduced-motion`. | **Mandatory** | `src/three/{UniverseCanvas,UniverseLayer,WebGLErrorBoundary}.tsx`, `src/App.tsx` | T6.1, T6.2 | `FR-039`, `FR-044`, `FR-045`, `NFR-001`, `NFR-009`, `NFR-010` | `vendor-three` loads asynchronously (`<= 220 KB` gz); throwing shader or `webglcontextlost` swaps cleanly to `UniverseFallback` with zero DOM breakage. |

---

### Phase 7: Motion and Interaction Polish *(Complete — T7.1 & T7.2 verified)*
**Objective:** Layer GSAP + ScrollTrigger scroll choreography and Motion UI transitions using strict property-ownership boundaries and unified reduced-motion gating.  
**Phase Outcome:** Expressive, distinct per-section motion with zero StrictMode leaks or GSAP/Motion DOM conflicts.

| Task ID | Task & Objective | Type | Affected Files / Modules | Deps | PRD Refs | Completion Criteria |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **T7.1** *(Complete)* | Configure `gsapConfig.ts` (`gsap.context()` cleanup + `gsap.matchMedia()` for `prefers-reduced-motion`) and wire scroll-driven `scrollProgressRef` (shared with R3F/`ScrollProgressBar`), Experience timeline spine fill, and About subtle hairline/portrait motion. | **Mandatory** (`Reduced-motion gate`) / **Should** (`Timeline/Scroll cues`) | `src/motion/gsapConfig.ts`, `src/components/sections/{AboutSection,ExperienceSection}.tsx`, `src/components/layout/{Navbar,ScrollProgressBar}.tsx`, `src/three/{DigitalUniverseScene,UniverseCanvas,UniverseLayer}.tsx` | T3.3, T4.2, T4.4, T6.3 | `FR-005`, `FR-024`, `FR-039`, `NFR-010` | Zero GSAP/Motion overlap on same DOM node; StrictMode double-mount cleans up triggers cleanly; reduced motion shows static final states. *(Note: approved persistent mobile bottom dock in `Navbar.tsx` + `DesktopSectionRail.tsx` permanently supersedes `MobileDrawer`.)* |
| **T7.2** *(Complete)* | Configure `variants.ts`, `motionFeatures.ts` (`domMax` for `<LazyMotion strict>`), and root `<MotionConfig reducedMotion="user">`; apply `AnimatePresence` + `useIsPresent()` cleanup to `ProjectDetailModal`, `layoutId` underline to `SkillsSection`, `layout` reflow to `ProjectsSection`, and checkmark spring to `ContactSection`. | **Mandatory** (`Reduced-motion`, `Dialog`) / **Should** (`Motion polish`) | `src/motion/{variants,motionFeatures}.ts`, `src/App.tsx`, `src/context/MotionPreferenceContext.tsx`, `src/components/ui/ProjectDetailModal.tsx`, `src/components/sections/{Skills,Projects,Contact}Section.tsx` | T3.3, T4.3–T4.5, T5.2 | `FR-012`, `FR-016`, `FR-018`, `FR-030`, `FR-039`, `NFR-010` | Animations run at compositor level (`transform`/`opacity` only); reduced motion reduces transitions to instant/minimal opacity fade. |

---

### Phase 8: Accessibility, Responsiveness and Performance Hardening *(T8.1 & T8.2 Complete; T8.3 Baseline Verified — Pending Domain/Gate A)*
**Objective:** Audit and remediate rendered contrast over glass + 3D, WCAG 2.2 AA semantics/touch targets, responsive edge cases (`320px–2560px+`), SEO metadata, and performance budgets.  
**Phase Outcome:** Hardened, accessible, fast production build ready for automated CI and preview testing (`Gate A`, `Gate B`, and production-domain SEO `sitemap.xml`/OG remain pending prior to Phase 9 `T9.4`).

| Task ID | Task & Objective | Type | Affected Files / Modules | Deps | PRD Refs | Completion Criteria |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **T8.1** *(Complete — provisional baseline)* | Conduct rendered-layer contrast audit (`>= 4.5:1` normal text, `>= 3:1` large text/UI/focus) across both themes over live `--surface-glass` and active 3D regions; tune `--surface-scrim` or opaque fallbacks where needed (re-verified if Gate A modifies provisional tokens). | **Mandatory** | `src/styles/{tokens,glass}.css`, `src/components/sections/HeroSection.tsx` | T6.3, T7.2 | `NFR-006`, `NFR-007` | Pass: `100%` of sampled composited foreground/background pairs meet `>= 4.5:1` / `>= 3:1` in both themes over peak 3D density (provisional light/accent values subject to Gate A sign-off & re-audit). |
| **T8.2** *(Complete)* | Conduct keyboard navigation, `24x24px` (`44x44px` mobile) target-size, `scroll-padding-top: 88px`, `200%` text-zoom, `320px–2560px+` overflow, and automated screen-reader-oriented inspection (`SkipLink`, landmarks, `aria-live`, `ProjectDetailModal`, fixed mobile bottom nav, `DesktopSectionRail`). | **Mandatory** | `src/styles/{tokens,index}.css`, `src/components/layout/Navbar.tsx`, `tests/components/phase8Hardening.test.tsx` | T7.2 | `NFR-008`, `NFR-009`, `NFR-014`, `NFR-015`, `NFR-016` | Pass: `0px` horizontal overflow across `320px–2560px` and `200%` text zoom, `0` obscured focus rings, `0` `@axe-core/playwright` violations, and `0` undersized targets; manual NVDA/VoiceOver assistive tech remains unverified in headless Linux/Windows CI without local AT session. |
| **T8.3** *(Partially complete — pending domain)* | Implement baseline static SEO (`<title>`, `<meta name="description">`, `robots.txt`; `sitemap.xml` and OG/JSON-LD deferred until verified production domain & assets exist) and verify Vite production bundle split (`dist/assets/`). *(Social OG/Twitter tags & `JSON-LD` `Person` schema are **Should**.)* | **Mandatory** (`Landmarks/Title/Desc`, `Split`) / **Should** (`OG/JSON-LD`) | `index.html`, `public/robots.txt`, `vite.config.ts` | T6.3, T7.2 | `NFR-001`, `NFR-002`, `NFR-003`, `NFR-011`, `NFR-012`, `NFR-013` | Pass for bundle split & baseline metadata (`index`: `101.97 KB` gz `<= 120 KB`, `vendor-three`: `187.58 KB` gz `<= 220 KB`, `<title>` & `<meta name="description">`, safe `public/robots.txt`); **`public/sitemap.xml` pending confirmed production domain URL**. |

**Phase 8 Verification Record:**
- **Rendered Contrast (`T8.1`):** Refreshed palette tokens verified mathematically & across composited dark (`Midnight Amethyst`: `#070A18` canvas, `#9788FF` accent, `#F4F5FF` ink) and light (`Scarlet Porcelain`: `#F8F7FB` canvas, `#D20D46` scarlet, `#1B1421` ink, `#6C6176` muted >= `4.59:1` on hover cards) glass/WebGL surfaces; `.glass-card-cinematic` switched to `--surface-glass`. Gate A owner sign-off pending screenshot review.
- **Accessibility & Responsiveness (`T8.2`):** Added mobile 6-column bottom dock fit, `scroll-padding-bottom: 5.5rem`, header flex-wrap and `px`-based gutters/`min(..., vw)` fluid headings for `200%` text zoom. Verified `0px` overflow across `320x700`–`2560x1440` and `200%` text zoom, `0` focus obscurations, `0` `vitest-axe`/`@axe-core/playwright` violations, WebGL fallback, and reduced motion.
- **SEO & Bundle (`T8.3`):** Added neutral `<meta name="description">` and `public/robots.txt`; omitted `public/sitemap.xml`, canonical/OG tags, and `JSON-LD` until a production URL and verified assets are confirmed. Production `vite build` confirmed `index` (`101.97 KB` gz) and lazy `vendor-three` (`187.58 KB` gz).

---

### Phase 9: Testing, CI and Vercel Deployment *(Partially Complete — Pre-Launch Gates Open; T9.4 Public Release Blocked)*
**Objective:** Implement mandatory automated test suites, GitHub Actions CI + Vercel security headers (`CSP` SHA-256 hash), populate verified `TBD` content/assets (`Gate B`), and verify live production release criteria.  
**Phase Outcome:** Complete Vitest (`21` files / `97` tests) and cross-browser Playwright E2E (`tests/e2e/portfolio.spec.ts`), SHA-pinned CI workflow (`.github/workflows/ci.yml`), and Vercel config (`vercel.json`) committed for preview deployment. Public release remains blocked on external Gates A & B, production domain, live Vercel preview/Lighthouse verification, and manual screen-reader/device walkthrough.

| Task ID | Task & Objective | Type | Affected Files / Modules | Deps | PRD Refs | Completion Criteria |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **T9.1** *(Complete — Vitest 97/97; E2E Chromium/Firefox/WebKit 18/18)* | Write and run Vitest unit & component tests (`slugValidation`, `skillCrossRef`, `projectFilters`, `themeStorage`, `useClipboard`, `useWebGLSupport`, `ThemeToggle`, `PortraitSlot`, `ProjectDetailModal` trap/restore, `Navbar` mobile bottom nav & `DesktopSectionRail`, `vitest-axe`) and cross-browser Playwright E2E regression/a11y checks (`tests/e2e/portfolio.spec.ts`). | **Mandatory** | `tests/unit/*.test.ts`, `tests/components/*.test.tsx`, `tests/e2e/portfolio.spec.ts`, `playwright.config.ts` | T1.3, T8.2 | `FR-008`, `FR-013`, `FR-017`, `FR-030`, `FR-045`–`FR-048`, `NFR-006` | Pass: `vitest run` (`21` files, `97` tests) and `playwright test` (`chromium`, `firefox`, `webkit`) pass `100%` against `vite preview`; live manual NVDA/VoiceOver walkthrough and physical Safari/Android/Edge device checks remain for release sign-off. *(Plan mapping note: Phase 9 task ordering maps Playwright cross-browser verification to T9.1 regression testing while T9.2 covers CI workflow orchestration.)* |
| **T9.2** *(Partially Complete — Workflow Committed; Remote CI Run Pending Push)* | Author `.github/workflows/ci.yml` (`npm ci`, `tsc --noEmit`, `eslint .`, `vitest run`, `vite build`, `playwright test`) pinned to verified commit SHAs with least-privilege `contents: read` permissions. | **Mandatory** | `.github/workflows/ci.yml` | T8.1–T8.3, T9.1 | `FR-019`, `FR-033`–`FR-035`, `FR-039`, `FR-044`, `FR-045`, `NFR-014`, `NFR-020`, `NFR-021` | All CI steps (`typecheck`, `lint`, `test`, `build`, `playwright test`) pass locally; first remote GitHub Actions execution runs upon push to `main`. |
| **T9.3** *(Partially Complete — Config Ready; Live Vercel Preview Blocked Locally)* | Author `vercel.json` (security headers + exact SHA-256 CSP hash `'sha256-T+bw1oU3xBArbqK57lOGtSO9Fc+ZbElqbFETY/CO5Qk='` for pre-paint theme script + immutable `/assets/` & `/fonts/` cache headers). | **Mandatory** | `vercel.json` | T2.3, T9.1, T9.2 | `NFR-017`, `NFR-018` | Config ready for Vercel Git integration (`npm ci`, `npm run build` -> `dist`); live Vercel Preview URL HTTP header / CSP verification blocked locally because Vercel CLI/project link is unavailable in this environment. |
| **T9.4** *(Blocked — External Gates A & B / Domain / Live Preview)* | Apply Gate A token sign-off (re-running `T8.1` if hexes change) and enforce Gate B (Sec. 1.3): populate verified personal content for `roleLabel`, Hero tagline, About narrative, Skills taxonomy, verified Projects, and Contact email/socials while keeping approved empty Experience/Achievements & `PortraitSlot` fallback; verify live Vercel Preview, Lighthouse CWV, manual NVDA/VoiceOver, and real-device Safari/mobile before production promotion. | **Mandatory** (`Gate A/B`, `CWV`, `Headers`, `Links`, `Cross-browser`) / **Should** (`Lighthouse >=90/80`, `FPS`, `OG/Analytics`) | `src/data/*.ts`, `src/styles/tokens.css`, `src/three/themePalettes.ts`, `index.html`, `public/{robots.txt,sitemap.xml,og-image.png}`, `IMPLEMENTATION_PLAN.md`, `README.md` | T9.3, Gate A, Gate B | `NFR-002`, `NFR-003`, `NFR-004`, `NFR-012`, `NFR-013`, `NFR-019`, `NFR-020` | **Blocked on:** Gate A sign-off, Gate B verified personal data/links, confirmed production domain (`sitemap.xml`/canonical/OG), live Vercel preview/Lighthouse run, and manual NVDA/VoiceOver walkthrough. Do **not** promote to production until cleared. |

---

## 3. Requirement Traceability Matrix (All 69 PRD Requirements)

| PRD ID Range | Priority | Implementation Phase(s) / Tasks | Verification Method |
| :--- | :---: | :--- | :--- |
| `FR-001`–`FR-004` | Must | Phase 3 (`T3.1`–`T3.3`), Phase 4 (`T4.2`) | Component tests (`Navbar` desktop capsule & mobile bottom bar; `FR-003` drawer superseded by fixed bottom nav), E2E Journey 1 |
| `FR-005` | Should | Phase 3 (`T3.3`), Phase 7 (`T7.1`) | E2E scroll progress & visual inspection |
| `FR-007`–`FR-008` | Must | Phase 4 (`T4.1`, `T4.2`) | Component test (`PortraitSlot` fallback) |
| `FR-009` | Should | Phase 3 (`T3.2`), Phase 4 (`T4.1`, `T4.2`) | Conditional rendering test (`resume: null` vs URL) |
| `FR-011`–`FR-012` | Must | Phase 4 (`T4.1`, `T4.3`), Phase 7 (`T7.2`) | Keyboard tab/filter test in `SkillsSection` |
| `FR-013` | Should | Phase 4 (`T4.3`) | Unit test (`skillCrossRef`) + component highlight check |
| `FR-015`–`FR-017` | Must | Phase 4 (`T4.4`), Phase 5 (`T5.1`, `T5.2`), Phase 7 (`T7.2`) | Component & E2E focus trap, `Escape`, focus restore |
| `FR-018`–`FR-019` | Should | Phase 4 (`T4.4`), Phase 5 (`T5.1`), Phase 7 (`T7.2`) | `aria-live` filter count test; E2E `?project=` + Back |
| `FR-022`–`FR-023` | Must | Phase 4 (`T4.1`, `T4.4`) | Component render test with populated & empty `[]` arrays |
| `FR-024` | Should | Phase 4 (`T4.4`), Phase 7 (`T7.1`) | Interactive expand/collapse & timeline scroll test |
| `FR-026` | Must | Phase 4 (`T4.1`, `T4.4`) | Component render test (populated & empty `[]` states) |
| `FR-027` | Should | Phase 4 (`T4.4`) | Link attribute assertion (`rel="noopener noreferrer"`) |
| `FR-029`–`FR-030` | Must | Phase 4 (`T4.5`), Phase 7 (`T7.2`) | Unit (`useClipboard` fallback) + `aria-live` component test |
| `FR-031` | Should | Phase 3 (`T3.2`), Phase 4 (`T4.5`) | "Back to Top" & footer render check |
| `FR-033`–`FR-035` | Must | Phase 2 (`T2.2`, `T2.3`), Phase 3 (`T3.2`) | E2E Journey 3 (dark default, toggle, reload zero-FOUC) |
| `FR-036` | Should | Phase 2 (`T2.3`), Phase 3 (`T3.2`) | CSS transition vs reduced-motion check |
| `FR-038`–`FR-039` | Must | Phase 2 (`T2.3`), Phase 6 (`T6.2`, `T6.3`), Phase 7 (`T7.1`, `T7.2`) | E2E Journey 4 (`prefers-reduced-motion`), `aria-hidden` |
| `FR-040`–`FR-041` | Should | Phase 6 (`T6.2`) | Mobile viewport DPR/density & desktop pointer inspection |
| `FR-044`–`FR-047` | Must | Phase 4 (`T4.1`–`T4.4`), Phase 6 (`T6.1`, `T6.3`) | E2E WebGL-disabled fallback, lazy chunk, `onError` assets |
| `FR-048` | Should | Phase 5 (`T5.1`) | Unit (`slugValidation`) + E2E invalid `?project=` recovery |
| `NFR-001`–`NFR-002` | Must | Phase 1 (`T1.0`, `T1.1`, `T1.2`), Phase 6 (`T6.3`), Phase 8 (`T8.3`), Phase 9 (`T9.4`) | Vite chunk size check + Lighthouse CI on Vercel Preview (`LCP/CLS/INP`) |
| `NFR-003`–`NFR-005` | Should | Phase 2 (`T2.1`), Phase 6 (`T6.2`), Phase 8 (`T8.3`), Phase 9 (`T9.4`) | Lighthouse CI scores, FPS trace, `woff2`/`WebP` network check |
| `NFR-006`–`NFR-010` | Must | Phase 2–8 (`T2.2`, `T3.1`, `T3.2`, `T6.3`, `T7.1`, `T8.1`, `T8.2`) | `vitest-axe`, `@axe-core/playwright`, rendered contrast audit |
| `NFR-011` | Must | Phase 3 (`T3.2`), Phase 8 (`T8.3`) | HTML landmark & `<title>`/`<meta>` validation |
| `NFR-012`–`NFR-013` | Should | Phase 8 (`T8.3`), Phase 9 (`T9.4`) | OG tag, `robots.txt`, `sitemap.xml`, `JSON-LD` validator |
| `NFR-014`–`NFR-015` | Must | Phase 2 (`T2.2`), Phase 3 (`T3.1`), Phase 8 (`T8.2`) | Playwright `320px–2560px+` overflow & target-size checks |
| `NFR-016` | Should | Phase 2 (`T2.2`), Phase 4 (`T4.2`–`T4.5`) | Multi-breakpoint layout inspection |
| `NFR-017`–`NFR-018` | Must | Phase 4 (`T4.4`, `T4.5`), Phase 9 (`T9.3`) | Link hygiene lint + live Vercel HTTP security header check |
| `NFR-019` | Should | Phase 9 (`T9.4`) | Cookie audit (`0` tracking cookies); conditional Vercel Analytics |
| `NFR-020`–`NFR-021` | Must | Phase 1 (`T1.0`, `T1.1`), Phase 6 (`T6.1`, `T6.3`), Phase 9 (`T9.2`, `T9.4`) | Cross-browser Playwright + Safari/mobile WebGL-off checks |
| `FR-006`, `FR-010`, `FR-014`, `FR-020`, `FR-021`, `FR-025`, `FR-028`, `FR-037`, `FR-042` | Could (`Excluded`) | *Excluded from v1* (`UI_UX_DESIGN.md` Sec. 9.3; `FR-037` optional reset) | Confirm not implemented in v1 unless explicitly promoted |
| `FR-032`, `FR-043` | Won't (`Excluded`) | *Explicitly excluded from v1* (No contact form; no 3D-only UI) | Verify absence of contact form & full DOM parity |

---

## 4. Verification Strategy

1. **Type Safety, Lockfile & Lint (`T1.0`, `T1.3`, `T9.3` — Every PR / `main`):** `npm ci` (pinned `package.json` + committed `package-lock.json`), `tsc --noEmit` (`0` errors), and `eslint .` (`0` errors, including `jsx-a11y` and `react-hooks`).
2. **Unit & Component Tests (`T9.1` — `vitest run`):** Pure utilities (`slugValidation`, `skillCrossRef`, `projectFilters`, `themeStorage`), hooks (`useClipboard` fallback, `useWebGLSupport` temp-canvas probe), UI states (`PortraitSlot`, empty arrays, `ThemeToggle`, `ProjectDetailModal` focus trap/restore, `Navbar` desktop/mobile navigation & `DesktopSectionRail`), plus `vitest-axe` (`100%` pass, `0` violations).
3. **End-to-End, Reduced Motion & Cross-Browser (`T9.2` — `playwright test` on `vite preview`):** Chromium, Firefox, WebKit, and mobile emulations verifying all 4 PRD User Journeys, WebGL-disabled fallback, `prefers-reduced-motion: reduce`, `?project=` deep-link/Back behavior, `320px–2560px+` zero horizontal overflow, `@axe-core/playwright` WCAG 2.2 AA scans in both themes (`0` violations), and `0` uncaught console errors.
4. **Manual Accessibility & Rendered Contrast (`T8.1`, `T8.2`):** Inspect composited `--surface-glass` cards and Hero text over active 3D Digital Universe peaks in both Abyssal Teal and Crimson Void (`>= 4.5:1` normal text, `>= 3:1` UI/large, `NFR-007`), plus manual keyboard flow and screen-reader announcements (`SkipLink`, `aria-live`, dialogs).
5. **Bundle, Performance & Security Checks (`T8.3`, `T9.3`, `T9.4`):** Verify `dist/assets/` separates `vendor-three` (`<= 220 KB` gz internal ceiling) from critical entry JS (`<= 120 KB` gz internal ceiling, `NFR-001`); run Lighthouse CI against `vite build` / Vercel Preview deployments (never dev server; exact throttling preset `TBD` per `TRD.md` Sec. 12.2) verifying `Must` Core Web Vitals (`LCP <= 2.5s`, `CLS <= 0.1`, `INP <= 200ms`, `NFR-002`) alongside `Should` targets (Desktop Performance `>= 90` / Mobile `>= 80` `NFR-003`, 3D `>= 50–60 FPS` `NFR-004`); verify `0` broken links and live `vercel.json` CSP/security headers (`NFR-018`).

---

## 5. Content and Asset Dependencies

| Item | Classification & Temporary State (Phases 1–8) | Authoritative Gate B Rule (`PRD.md` Sec. 12 #2) |
| :--- | :--- | :--- |
| **Portrait UI Component & Fallback (`FR-008` Must, `FR-047` Must)** | **Mandatory component + automatic fallback:** `PortraitSlot` renders `3:4` Swiss `AJ` monogram frame (`PORTRAIT // ASSET_PENDING`) when `profile.portrait = null` or `onError`. | **Mandatory for v1 (Gate B Sec. 1.3 #3):** Satisfies `FR-008` automatically without requiring the photograph. |
| **Personal Photograph (`FR-008`)** | **Optional asset:** `profile.portrait = null` safely activates `PortraitSlot` fallback. | **Optional for launch (non-blocking, Gate B Sec. 1.3 #4):** Supply `3:4` `WebP`/`AVIF` (`min 800x1067px`) when ready; never use generated/stock faces. |
| **Résumé / CV PDF (`FR-009` Should, `FR-047` Must)** | **Optional asset:** `profile.resume = null` omits Résumé CTA cleanly with zero dead links. | **Optional for launch (non-blocking, Gate B Sec. 1.3 #4):** Supply single `PDF` (`<= 2 MB`) when ready; omit CTA when `null`. |
| **Experience & Achievements (`FR-022`, `FR-023`, `FR-026`, `FR-046` Must)** | **Automatic neutral empty state:** Empty `[]` arrays render `"No experience entries added yet."` / `"No achievements added yet."`. | **Verified entries or automatic empty state (Gate B Sec. 1.3 #2):** Populate verified records (`src/data/{experience,achievements}.ts`) or launch with the approved neutral factual empty panels without extra approval (does not authorize empty states elsewhere). |
| **Role Label, Hero Tagline, About Bio, Skills (`FR-004`, `FR-007`, `FR-011` Must)** | **Dev/Staging only:** Typed `null`/neutral scaffolding—never literal `"TBD"` or fabricated claims. | **Verified personal content required for public launch (Gate B Sec. 1.3 #1):** Verified `roleLabel`, Hero tagline, About narrative, and confirmed Skills taxonomy, unless explicitly granted staged-launch approval under `PRD.md` Sec. 12 #2. |
| **Projects (`FR-015`, `FR-016` Must)** | **Dev/Staging only:** Typed fixtures/empty state during Phase 4–8 QA only. | **Verified personal content required for public launch (Gate B Sec. 1.3 #1):** Verified titles, domain/category tags, summaries, role, problem statements, technical approaches, tech stacks, and verified external links (GitHub and/or live demo), unless explicitly granted staged-launch approval under `PRD.md` Sec. 12 #2. Outcomes/metrics and `16:10` preview media are **optional** (`Gate B Sec. 1.3 #4`, omitted when unavailable). |
| **Contact Email & Socials (`FR-029`, `FR-030` Must)** | **Dev/Staging only:** `email: null` guards `mailto:` / Copy Email cleanly. | **Verified personal content required for public launch (Gate B Sec. 1.3 #1):** Verified email address and GitHub/LinkedIn/other social URLs, unless explicitly granted staged-launch approval under `PRD.md` Sec. 12 #2. |
| **OG Image, Custom Domain & Analytics (`NFR-012`, `NFR-019` Should)** | **Optional config:** Default Vercel `.vercel.app` preview URL; analytics disabled. | **Optional / launch configuration (non-blocking, Gate B Sec. 1.3 #4):** Custom domain (defaults to Vercel URL), `1200x630` `og-image.png`, and cookie-less analytics decision (`NFR-019`). |

---

## 6. Risk Register

| Risk | Likelihood | Impact | Prevention & Mitigation |
| :--- | :---: | :---: | :--- |
| **Peer-dependency conflict across React / R3F / test packages** | Medium | High | Lock compatible stable versions via registry verification (`T1.0`) before `npm install`, commit `package-lock.json` and verify `npm ci` (`T1.1`), and mark unresolved version choices `TBD`. |
| **Gate A updates provisional tokens late** | Low | Medium | Keep light/accent tokens centralized in `tokens.css` and `themePalettes.ts`; re-run `T8.1` rendered contrast audit before `T9.4` release if any hex changes. |
| **Rendered glass/3D fails WCAG 2.2 AA contrast (`NFR-007`)** | Medium | High | Enforce `72%`/`78%` glass opacity + Hero `--surface-scrim` in Phase 2; run rendered composited contrast audit in Phase 8 (`T8.1`) with opaque fallbacks ready. |
| **Three.js / R3F inflates initial bundle or hurts mobile FPS (`NFR-001`, `NFR-004`)** | Medium | High | Isolate `vendor-three` via Vite `manualChunks` in Phase 1 (`T1.2`), lazy-load in Phase 6 (`T6.3`), cap DPR (`<= 1.5` mobile), and pause offscreen `frameloop`. |
| **GSAP + Motion DOM race conditions or StrictMode leaks** | Medium | Medium | Enforce strict property ownership in Phase 7 (`T7.1`–`T7.2`): GSAP (`gsap.context()` + `matchMedia`) for scroll only; Motion for dialogs/layout transitions only. |
| **CSP SHA-256 hash mismatch breaks pre-paint theme script (`NFR-018`)** | Medium | Medium | Generate and verify exact SHA-256 hash whenever `index.html` theme script changes; test live Vercel Preview console in Phase 9 (`T9.3`). |
| **Delayed personal copy/assets stall launch (`TBD`)** | High | Medium | Decoupled `src/data/*.ts` schemas and approved `PortraitSlot`/empty states allow full Phases 1–8 engineering & QA completion ahead of Gate B sign-off. |

---

## 7. v1 Release Criteria (Definition of Done)

v1 is approved for production release on Vercel only when **all** mandatory criteria below pass verification:

1. **Requirements Complete:** All **39 `Must`** requirements (`25 FR` + `14 NFR`) are implemented and verified (`T1.0`–`T9.4`); committed `Should` enhancements (`19`) are included per plan unless explicitly deferred; all excluded `Could`/`Won't` items remain absent.
2. **Automated Quality Gates Green (`T1.0`, `T1.1`, `T1.3`, `T9.1`–`T9.3`):** Pinned `package.json` + committed `package-lock.json` (`npm ci` clean), `tsc --noEmit`, ESLint (`jsx-a11y`), `vitest run` (`vitest-axe`), `vite build`, and cross-browser Playwright E2E (`@axe-core/playwright`, 4 User Journeys, WebGL-off fallback, reduced-motion, `320px–2560px+` zero overflow) pass `100%` in GitHub Actions CI from `main`.
3. **Contrast & Accessibility Verified (`T2.3`, `T8.1`, `T8.2`):** Gate A sign-off complete; rendered glass + 3D contrast (`>= 4.5:1` / `>= 3:1`), `24x24px` (`44x44px` mobile) touch targets, `scroll-padding-top`, manual keyboard + screen-reader checks, and zero-FOUC Abyssal Teal default + Crimson Void toggle pass in both themes.
4. **Performance & Security Verified on Vercel (`T8.3`, `T9.3`, `T9.4`):** `vendor-three` separated from entry JS (`<= 120 KB` gz entry / `<= 220 KB` gz 3D internal ceilings), `Must` CWV (`LCP <= 2.5s`, `CLS <= 0.1`, `INP <= 200ms` on Vercel Preview; preset `TBD`), `0` broken links, `0` uncaught console errors across supported browsers (`NFR-020`), and `vercel.json` security/CSP headers active. *(Lighthouse `Should` targets: Desktop `>= 90`, Mobile `>= 80` `NFR-003`; 3D `>= 50–60 FPS` `NFR-004`.)*
5. **Content & Asset Integrity Verified (`T9.4` / Gate B, Sec. 1.3 & `PRD.md` Sec. 12 #2):**
   - Verified personal content is populated for `roleLabel` and Hero tagline, About narrative, Skills taxonomy, verified Projects (titles, domain/category tags, summaries, role, problem statements, technical approaches, tech stacks, and verified external links [GitHub and/or live demo]), and Contact email + social links—unless a specific section's empty/replaceable state has **explicit staged-launch approval** under `PRD.md` Sec. 12 #2.
   - `Experience` and `Achievements` contain verified records or their automatically permitted neutral factual empty panels (`FR-023`, `FR-046`); `PortraitSlot` (`FR-008` fallback) is active even if the personal photograph is pending. (Neither permits other sections to launch empty without explicit approval.)
   - Optional non-blocking items—personal photograph, résumé PDF (`FR-009`), project outcomes/metrics, `16:10` project preview media, `og-image.png` (`NFR-012`), custom domain, and cookie-less analytics (`NFR-019`)—remain non-blocking when omitted.
   - **Zero** literal `"TBD"` strings, `"Lorem ipsum"`, fabricated personal details, fabricated achievements, fabricated metrics/outcomes, or unverified project claims exist anywhere on the live site.
