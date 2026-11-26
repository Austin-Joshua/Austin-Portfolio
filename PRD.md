# Product Requirements Document (PRD): Austin Joshua — Portfolio (AJ Cosmic Universe)

**Document Status:** Implemented Baseline v2.0 (`feat/aj-cosmic-universe`)  
**Source of Truth:** [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md)  
**Owner:** Austin Joshua  
**Deployment Target:** Vercel (Source Control: GitHub)

---

## 1. Product Overview and Vision

This PRD defines the functional, user experience, accessibility, performance, and release requirements for **Austin Joshua's AJ Cosmic Universe** portfolio—a single-page React 19 + TypeScript application built with Vite 7, Tailwind CSS v4, Three.js / React Three Fiber, GSAP + ScrollTrigger, and Motion.

The experience centers on a **persistent, interactive 3D Solar System** behind all seven semantic DOM sections (`Hero`, `About`, `Skills`, `Projects`, `Experience`, `Achievements`, `Contact`), introduced once on first visit via a horizontal split-curtain emblem loader (`CosmicIntroLoader`). Light mode has been permanently removed in favor of a single, unmistakable **Cosmic Night (`#020307`)** dark aesthetic pairing silver chrome metallic accents with six color-coded celestial planet destinations.

---

## 2. Goals and Measurable Success Criteria

| Product Goal | Objective | Measurable Success Criterion |
| :--- | :--- | :--- |
| **First-Visit Brand Impression** | Introduce the metallic circular `AJ` emblem (`aj-emblem.png`) over an animated cosmic backdrop before smoothly splitting curtains left/right once per visitor. | First visit plays `CosmicIntroLoader`, writes `aj-cosmic-intro-seen='1'`, and skips automatically on subsequent loads, hash routes, or reduced motion. |
| **Interactive Solar System Exploration** | Allow desktop Hero drag-orbit and planet selection via WebGL and keyboard-accessible `SolarSystemHud` without breaking scroll navigation. | All 7 destinations (`Sun`, `About`, `Skills`, `Projects`, `Experience`, `Achievements`, `Contact`) remain keyboard/screen-reader operable and synced with DOM sections. |
| **Velocity-Reactive Hyperspace Immersion** | React starfield depth layers smoothly to pointer tilt and native scroll velocity without jitter or GPU leaks. | Starfield shaders run lazily inside `vendor-three` (`<= 220 KB` gz), pause offscreen/hidden, and freeze immediately under `prefers-reduced-motion: reduce`. |
| **Verified Engineering Substance** | Showcase Austin Joshua's verified RIT/Infinitus bio, 21 cross-referenced skills, 5 Project Worlds, 3 verified hackathon awards & certs, and honest empty work history. | `0` fabricated claims, `0` light-mode remnants, `?project=<slug>` Back/Forward sync, and working email/Copy/Résumé actions. |
| **WCAG 2.2 AA & Cross-Device Quality** | Ensure contrast, keyboard navigation, touch sizing, zero mobile overlap, and non-WebGL resilience across Chromium, Firefox, and WebKit. | `0` `vitest-axe` / `@axe-core/playwright` violations, `0px` horizontal overflow (`320px–2560px`), and `>= 44x44px` mobile utility targets without overlapping Hero text. |

---

## 3. Target Users

1. **Technical Recruiters & Talent Acquisition:** Rapidly inspect RIT Computer Science focus, core engineering stack, hackathon awards (`Techathon 2K26`, `Code of Thrones`, `INNOCLASH '26`), Résumé PDF, and direct email/Copy actions.
2. **Engineering Managers & Senior Engineers:** Open deep-linked Orbital Worlds (`?project=<slug>#projects`), inspect problem/approach/architecture/outcomes, click cross-referenced atomic skills, and visit verified GitHub/Live URLs.
3. **Collaborators & Hackathon Communities:** Explore Austin's Infinitus Mathematics Club presidency, TECHritz coordinator background, and multi-domain systems/AI builds.
4. **Assistive-Tech, Keyboard-Only, and Mobile Visitors:** Navigate via `SkipLink`, focus-visible rings, bottom 6-planet mobile dock, reduced-motion static states, and SVG `UniverseFallback` when WebGL is disabled.

---

## 4. Confirmed Scope and Explicit Exclusions

### In Scope
- **Permanent Single-Theme Cosmic Dark System:** `html[data-theme="dark"]` locked permanently in `#020307` Cosmic Night (`tokens.css` & `index.html`). All light palettes, `[data-theme="light"]` selectors, and `ThemeToggle` controls are permanently removed.
- **Canonical Brand Emblem & Favicons:** Circular silver metallic `AJ` RGBA PNG (`public/assets/brand/aj-emblem.png`, `512x512`) + `favicon.png` (`64x64`) + `apple-touch-icon.png` (`180x180`).
- **First-Visit Split Curtain Intro (`CosmicIntroLoader`):** Horizontal left/right curtains revealing the solar system, with Skip button, `Escape` shortcut, reduced-motion bypass, and throwing-`localStorage` protection.
- **Persistent Full-Viewport 3D Solar System:** Central pulsing `Sun`, 6 procedural Canvas2D-textured lit planets (`About`, `Skills`, `Projects`, `Experience`, `Achievements`, `Contact`), moons/rings, `HyperspaceStarfield` GLSL shader, unified `CosmicCameraRig`, and `SolarSystemHud`.
- **Distinct Per-Section Experiences:** Hero silhouette-to-colour portrait over 3D + layered watermark, About RIT/Infinitus dossier + `PortraitSlot`, Skills atomic/molecular clusters + cross-project links, Projects Orbital World Inspector + 5 worlds + modal, Experience trajectory schematic + honest empty state, Achievements award constellation + certifications strip, Contact pulsing beacon + Copy Email, and `ScrollToTopButton`.

### Explicit Exclusions
- Light-mode toggle, `[data-theme="light"]`, or system `prefers-color-scheme: light` overrides.
- Interactive contact forms or external CMS/database backends.
- Fabricated internships, awards, dates, or AI/stock portrait images.
- Replacing semantic HTML landmarks with WebGL-only UI text.

---

## 5. Functional Requirements

| ID | Priority | Requirement |
| :--- | :---: | :--- |
| **FR-001** | **Must** | Render a persistent top navigation bar featuring the circular silver metallic `aj-emblem.png` brand link, desktop planet section links with individual orbital color accents, icon-only Résumé download link (`Austin_Joshua_Resume.pdf`), GSAP `ScrollProgressBar`, zero light-mode toggles, and zero legacy `"AJ //"` text. |
| **FR-002** | **Must** | Clicking any navbar link, vertical `DesktopSectionRail` (`>= 1280px`) item, mobile fixed 6-column dock item, or `SolarSystemHud` planet button navigates smoothly to the target section (instant under reduced motion), updates `aria-current="location"` / `aria-pressed`, and focuses the corresponding 3D planet. |
| **FR-003** | **Must** | Mobile viewports (`< 768px`) keep a non-overlapping top utility header (`emblem` + `Download Résumé`, each `>= 44x44px`) outside the Hero flow combined with a fixed bottom safe-area 6-planet dock. |
| **FR-004** | **Must** | `CosmicIntroLoader` plays once per browser (`localStorage` `'aj-cosmic-intro-seen'`) showing static `aj-emblem.png` in front of an independent cosmic particle/ring layer before separating horizontally left/right; reloads, hash jumps, `prefers-reduced-motion: reduce`, `Escape`, and Skip dismiss cleanly without trapping restricted-storage visitors. |
| **FR-005** | **Must** | Hero renders single `<h1>` ("Austin Joshua"), CS/AI role positioning, AJ emblem badge, layered translucent `"Austin Joshua"` backdrop watermark behind `austin-joshua-cutout.png` (`HeroPortraitReveal` silhouette -> colour on hover/focus/tap), CTAs (`View Projects`, `Contact Me`, `Résumé`), verified socials, and `SolarSystemHud` above the persistent 3D backdrop. |
| **FR-006** | **Must** | About displays verified RIT CSE bio, Infinitus Club Presidency (2026–2027) & TECHritz leadership badges, Résumé download, and parallax `PortraitSlot` with automatic geometric `AJ` fallback on error. |
| **FR-007** | **Must** | Skills renders an interactive atomic/molecular cluster view (`All Molecules` + domain tabs with keyboard arrow support), 21 verified skills (`skill-atom-<id>`), bond hover highlights, and `skill-cross-reference` project jumps. |
| **FR-008** | **Must** | Projects renders category filters (`aria-live` counts + reset button), an Orbital World Inspector (`ProjectWorldOrb`) + 5 deep-linkable worlds (`AgriFlux`, `CIVIQ`, `ResQ Meal`, `RIT Digital Twin`, `NeuroRAM`), and accessible `ProjectDetailModal` synced with `?project=<slug>#projects` and Browser Back/Forward (`FR-009` invalid-slug recovery notice). |
| **FR-010** | **Must** | Experience renders the emerald orbital trajectory schematic paired strictly with `"No experience entries added yet."` unless verified employment records are supplied. |
| **FR-011** | **Must** | Achievements renders the Solar Gold constellation of 3 verified hackathon awards (*Techathon 2K26*, *Code of Thrones*, *INNOCLASH '26*) + verified certifications/leadership credentials strip (and handles `[]` empty gracefully when overridden in tests). |
| **FR-012** | **Must** | Contact displays the Rose Magenta communication beacon, `mailto:`, accessible Copy Email (`useClipboard` + fallback + `aria-live`), GitHub, LinkedIn, and Résumé without any `<form>`, followed by Footer and conditional `ScrollToTopButton`. |
| **FR-013** | **Must** | `UniverseLayer` renders SVG `UniverseFallback` (`aria-hidden="true"`) immediately and upgrades asynchronously to lazy `UniverseCanvas` (`three` + R3F), handling `webglcontextlost`/`WebGLErrorBoundary` and reduced-motion static frames cleanly. |

---

## 6. Non-Functional Requirements

- **Performance & Bundle Isolation (`NFR-001`–`NFR-004`):** Three.js / R3F isolate in lazy `vendor-three` (`<= 220 KB` gz ceiling); critical entry chunk stays `<= 120 KB` gz; procedural Canvas2D planet textures & GLSL star shader avoid heavy `.glb` fetches; offscreen/hidden tabs pause `frameloop`; target `LCP <= 2.5s`, `CLS <= 0.1`, `INP <= 200ms`.
- **Accessibility (`NFR-005`–`NFR-008`):** Conform to **WCAG 2.2 Level AA** with `SkipLink`, `:focus-visible` outlines, `scroll-padding-top`, `aria-hidden="true"` on WebGL/fallback layers, `>= 24x24px` desktop / `>= 44x44px` mobile targets, and zero axe violations across Chromium/Firefox/WebKit.
- **Responsiveness (`NFR-009`–`NFR-010`):** Zero horizontal overflow from `320px` to `2560px` and at `200%` text scaling; zero mobile Hero utility overlap across `320px–430px`.
- **Security & CSP (`NFR-011`–`NFR-012`):** `vercel.json` enforces `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, immutable cache rules for `/assets/brand/*`, and exact SHA-256 CSP hash (`'sha256-W85Dr5idMeTW9lFpycX/RUFAM3w7N3xnKz81gwTYkB8='`) for the pre-paint `<head>` script in `index.html`.
