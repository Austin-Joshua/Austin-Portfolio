# UI/UX Design Specification: Austin Joshua — AJ Cosmic Universe

**Document Status:** Implemented Baseline v2.0 (`feat/aj-cosmic-universe`)  
**Authoritative Sources:** [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md), [PRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PRD.md), [TRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/TRD.md)  
**Target Standard:** WCAG 2.2 Level AA

---

## 1. Visual Identity & Core Design Principles

AJ Cosmic Universe permanently unifies the portfolio under a single **Cosmic Night** (`#020307`) dark identity — removing light mode entirely — combining:
1. **Interactive 3D Solar System:** Central pulsing `Sun` (**Austin Joshua**) orbited by six distinct procedural Canvas2D-textured lit planets, atmospheric rings, moons, and a two-layer scroll-velocity & pointer-reactive `HyperspaceStarfield`.
2. **Swiss Experimental Grid & Hierarchy:** Fluid `clamp()` display typography (`Syne`, `Inter`, `JetBrains Mono`), exposed `1px` rules (`--border-subtle`), numbered cosmic orbital indices (`01`–`07`), and `1360px` max content container.
3. **Dark Metallic Glassmorphism:** Frosted cosmic surfaces backed by verified opacity & blur tokens (`--glass-blur: 14px`, `--glass-blur-strong: 22px`) and `@supports not (backdrop-filter: blur(1px))` solid surface fallbacks (`--surface-elevated`).

---

## 2. Exact Verified Design Tokens (`src/styles/tokens.css` & `src/styles/glass.css`)

All surface, text, border, and planetary accent tokens below match `src/styles/tokens.css` verbatim under `color-scheme: dark` (`data-theme="dark"` permanently):

### 2.1 Cosmic Night Surfaces, Inks, Borders & Glass

| Token Name | Exact Value | Role & Contrast Baseline |
| :--- | :--- | :--- |
| `--surface-canvas` | `#020307` | Pitch-black cosmic void canvas |
| `--surface-elevated` | `#070a11` | Solid fallback card / elevated panel background |
| `--surface-card` | `#0c101a` | Recessed skill/project/archive card surface |
| `--surface-card-hover` | `#131928` | Hover card surface state |
| `--surface-glass` | `rgba(7, 10, 17, 0.82)` | Primary translucent glass (`backdrop-filter: blur(14px)`) |
| `--surface-glass-strong` | `rgba(3, 5, 10, 0.94)` | High-opacity modals, featured orbital inspector, scroll-to-top button (`blur(22px)`) |
| `--surface-scrim` | `rgba(2, 3, 7, 0.9)` | High-legibility backdrop behind modal overlays & scrims |
| `--text-primary` | `#f3f6fb` | Primary headings & body copy |
| `--text-secondary` | `#c2ccd9` | Lead descriptions, body copy, secondary controls |
| `--text-muted` | `#8f9cb0` | Swiss indices, metadata, timestamps |
| `--text-on-accent` | `#020307` | Ink on metallic silver `--accent-chrome` buttons |
| `--accent-primary` | `#dce4f0` | Metallic silver-chrome primary UI highlight |
| `--accent-primary-deep` | `#9aa8bd` | Deep brushed chrome border/secondary highlight |
| `--accent-secondary` | `#38bdf8` | Stellar cyan accent |
| `--accent-primary-glow` | `rgba(220, 228, 240, 0.16)` | Portrait spotlight & card metallic gleam |
| `--accent-chrome` | `#edf2f8` / muted `#98a4b8` | High-contrast metallic silver primary CTA fill & registration marks |
| `--accent-gold` | `#f5b841` | Solar gold highlight (`--accent-gold-line: rgba(245, 184, 65, 0.5)`) |
| `--accent-copper` | `#fb923c` / deep `#c2571a` | Amber-copper highlight accent |
| `--border-subtle` | `rgba(195, 204, 217, 0.14)` | Swiss `1px` grid rules & dividers |
| `--border-glass` | `rgba(220, 228, 240, 0.22)` | Frosted panel chrome edge |
| `--border-glass-strong` | `rgba(237, 242, 248, 0.45)` | Emphasized glass panel & active border |
| `--focus-ring` | `#f5b841` | High-contrast `2px` `:focus-visible` ring (`2–3px` offset) |
| `--status-success` | `#2dd4bf` | Copy-email confirmation cue |
| `--status-warning` | `#f5b841` | Invalid `?project=` slug recovery notice |

### 2.2 Solar System Celestial Planet Palette

| Celestial Body | Section | CSS Token / Hex | Role |
| :--- | :---: | :--- | :--- |
| **Sun (Sol Core)** | `#hero` | `--planet-sun: #ffb347` | Central glowing star, Hero badge, Scroll-to-Top highlight |
| **Planet 01 — Terra Cyan** | `#about` | `--planet-about: #38bdf8` | Cyan oceanic accent, About Swiss hairline, RIT/Infinitus badges |
| **Planet 02 — Aether Violet** | `#skills` | `--planet-skills: #818cf8` | Violet-indigo orbital bonds, active molecular cluster accents |
| **Planet 03 — Pyros Amber** | `#projects` | `--planet-projects: #fb923c` | Orange-amber project category filter & Orbital World Inspector |
| **Planet 04 — Viridis Teal** | `#experience` | `--planet-experience: #2dd4bf` | Emerald-teal orbital trajectory schematic |
| **Planet 05 — Solstice Gold** | `#achievements` | `--planet-achievements: #facc15` | Solar gold 3-award constellation lines & star nodes |
| **Planet 06 — Nova Rose** | `#contact` | `--planet-contact: #f472b6` | Rose-magenta pulsing communication beacon |

---

## 3. Typography & Responsive Grid

- **Fonts (Self-Hosted `woff2`):** `Syne` (`600`, `700`), `Inter` (`400`, `500`, `600`), `JetBrains Mono` (`400`, `500`).
- **Fluid Scale (`tokens.css`):** `--text-hero` (`2.75rem -> 5.5rem`, `min(..., 13.75vw)`), `--text-h2` (`1.875rem -> 3.25rem`, `min(..., 11vw)`), `--text-h3` (`1.25rem -> 1.625rem`), `--text-lead` (`1.0625rem -> 1.25rem`), `--text-body` (`1rem`, max `<= 68ch`), `--text-meta` (`0.75rem -> 0.8125rem`).
- **Grid:** `--container-max: 85rem` (`1360px`), 4 cols mobile (`16px` gap), 8 cols tablet (`20px` gap), 12 cols desktop (`24px` gap), `scroll-padding-top: 88px` + mobile `scroll-padding-bottom: 5.5rem` (matching fixed bottom 6-planet dock).

---

## 4. Brand Emblem, First-Visit Curtain & Section Design

1. **Canonical AJ Brand Emblem:** Extracted circular silver metallic RGBA PNG (`public/assets/brand/aj-emblem.png`, `512x512`) + `favicon.png` (`64x64`) + `apple-touch-icon.png` (`180x180`). Zero legacy `"AJ //"` text.
2. **First-Visit Curtain Intro (`CosmicIntroLoader`):**
   - Renders `aj-emblem.png` statically in the center over an independent animated cosmic orbital ring/star layer (`intro-cosmic-aura`) before parting left (`-104%`) and right (`+104%`) `#020307` curtains horizontally.
   - Plays once per visitor (`localStorage` `'aj-cosmic-intro-seen' = '1'`), supports Skip button + `Escape`, bypasses immediately on `prefers-reduced-motion: reduce`, and handles restricted `localStorage` without trapping.
3. **Navbar & Navigation Rails:**
   - Top bar: AJ circular emblem + `"Cosmic Universe"` label (`sm+`), 6 planet links with orbital dot + underline on desktop (`>= 768px`), icon-only Résumé download (`Austin_Joshua_Resume.pdf`), and GSAP `ScrollProgressBar`.
   - Mobile (`< 768px`): non-overlapping relative top utility bar (`>= 44x44px` emblem + download icon) + fixed safe-area 6-planet bottom dock.
   - Desktop wide (`>= 1280px`): vertical `01–07` `DesktopSectionRail` + floating `ScrollToTopButton`.
4. **Hero Core Identity (`#hero`):** Single `<h1>` ("Austin Joshua"), AJ emblem badge, CTAs (`View Projects`, `Contact Me`, `Résumé`), social icon links, `SolarSystemHud` (Sun + 6 planet buttons + `Explore System` / `Reset Orbit`), dimensional translucent `"Austin Joshua"` watermark behind `austin-joshua-cutout.png` (`604x806`), silhouette by default -> full colour on hover/focus/tap (`HeroPortraitReveal`).
5. **Custom Planet Sections:**
   - **About (`#about`):** Editorial dossier + RIT CSE / Infinitus Club Presidency / TECHritz badges + parallax `PortraitSlot`.
   - **Skills (`#skills`):** Interactive atomic/molecular cluster nodes (`skill-atom-<id>`) connected by orbital SVG bonds + click-to-inspect `skill-cross-reference` project links.
   - **Projects (`#projects`):** Filter pills + Orbital World Inspector (`ProjectWorldOrb`) + 5 deep-linkable worlds (`?project=<slug>#projects`) + `ProjectDetailModal`.
   - **Experience (`#experience`):** Emerald planetary trajectory schematic paired cleanly with `"No experience entries added yet."`.
   - **Achievements (`#achievements`):** Solar Gold constellation of 3 verified hackathon awards (*Techathon 2K26*, *Code of Thrones*, *INNOCLASH '26*) + verified certifications/leadership badges.
   - **Contact (`#contact`):** Rose communication beacon with `mailto:`, accessible Copy Email feedback, GitHub, LinkedIn, and Résumé download (`0` forms).
