# UI/UX Design Specification: Austin Joshua — Engineering Portfolio

**Document Status:** Draft v1.0 (Aligned to Brief, PRD, and TRD)  
**Authoritative Sources:** [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md), [PRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PRD.md), [TRD.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/TRD.md)  
**Target Standard:** WCAG 2.2 Level AA (`NFR-006`)  

---

## 1. Design Principles and Visual Identity

### 1.1 Aesthetic Identity
The visual language fuses three disciplined pillars:
- **3D Digital Universe:** A calm, spatial deep-field backdrop of orbital coordinate rings, subtle telemetry dust, and atmospheric depth—evoking systems engineering and AI computation without arcade-style sci-fi clutter (`FR-038`).
- **Swiss Experimental:** Strict column grids, exposed structural hairlines (`1px`), numeric section indices (`01`–`07`), asymmetric editorial typography, and generous negative space.
- **Glassmorphism (Restrained):** Translucent frosted planes (`backdrop-filter: blur(12px)`) used selectively for floating navigation, interactive overlays, and primary cards—always backed by contrast-verified scrims (`NFR-007`).

### 1.2 Core Design Principles
1. **Clarity Precedes Spectacle:** Typography and hierarchy remain immediately scannable even if 3D and glass effects are disabled (`FR-044`, `FR-045`).
2. **Distinct Section Cadence:** All seven sections share one token and grid grammar, yet each adopts a distinct structural layout so scrolling feels curated rather than repetitive.
3. **Selective Accent Restraint:** **Liquid Chrome**, **Obsidian Gold**, and **Burgundy Copper** serve as surgical semantic cues (highlights, orbital rings, award markers, hairline borders)—never rainbow decoration.
4. **No Scroll Hijacking:** Native browser scrolling governs page velocity (`FR-002`); GSAP animations decorate progress rather than trapping scroll physics.
5. **Dual-Theme Authorship:** **Midnight Amethyst** (dark default, `FR-033`) feels mysterious, cosmic, and luminous without green/teal accents; **Scarlet Porcelain** (light alternate, `FR-034`) feels architectural, tactile, and vibrant with stronger scarlet ink—never a mechanical CSS color inversion.

---

## 2. Exact Color Tokens (Both Themes)

> **Status Note (Visual Identity Refresh — Pending Owner Sign-Off):** **Midnight Amethyst** (dark default) and **Scarlet Porcelain** (light alternate) replace the earlier Abyssal Teal / Crimson Void tokens. All surface steps, foregrounds, and accents below are mathematically verified to meet WCAG 2.2 AA (`>= 4.5:1` normal text, `>= 3:1` large text/UI) on solid and glass surfaces (`NFR-007`), and are **proposed pending owner sign-off** following review of the production-preview screenshots. **Mandatory Verification Rule:** Solid-token contrast alone is insufficient—all foreground text and UI controls must also pass WCAG 2.2 AA contrast when composited over rendered `--surface-glass` layers and active 3D Digital Universe regions, using `--surface-scrim` or opaque surface fallbacks wherever necessary.

### 2.1 Midnight Amethyst — Dark Theme (Default, `data-theme="dark"`, Pending Owner Sign-Off)

| Token Name | Hex / Value | Usage & Solid-Surface Baseline |
| :--- | :--- | :--- |
| `--surface-canvas` | `#070A18` | Primary cosmic midnight void background (`FR-033`). |
| `--surface-elevated` | `#0E1428` | Section bands, solid fallback cards, modal inner panels. |
| `--surface-card` | `#141D36` | Interactive recessed/selected card surface. |
| `--surface-card-hover` | `#1B2745` | Elevated hover card state. |
| `--surface-glass` | `rgba(14, 20, 40, 0.80)` | Glassmorphic nav & cards over 3D (`backdrop-filter: blur(12px)`). |
| `--surface-scrim` | `rgba(7, 10, 24, 0.86)` | High-legibility backdrop behind Hero text & open dialogs. |
| `--text-primary` | `#F4F5FF` | Primary headings & body copy (`~18.2:1` on `#070A18`, `~14.3:1` on `#141D36`). |
| `--text-secondary` | `#C1C9E4` | Lead paragraphs, descriptions (`~11.6:1` on `#070A18`, `~9.1:1` on `#141D36`). |
| `--text-muted` | `#9AA6C7` | Metadata, timestamps, Swiss indices (`~7.9:1` on `#070A18`, `~6.2:1` on `#141D36`, `~5.2:1` on `#1B2745`). |
| `--text-on-accent` | `#070A18` | Deep midnight ink on `#9788FF` primary solid buttons (`~6.83:1`). |
| `--accent-primary` | `#9788FF` | Luminous violet-amethyst interactive links, active indicators, solid CTA fill (`~6.83:1` on `#070A18`). |
| `--accent-primary-deep` | `#6B70E8` | Deep indigo structural fill, subtle 3D aura & glow. |
| `--accent-secondary` | `#6B70E8` | Secondary indigo highlight accent. |
| `--accent-chrome` | `#DDE3F3` / `#AEB8D2` | **Liquid Chrome:** `#DDE3F3` high-contrast metallic labels; `#AEB8D2` hairline dividers. |
| `--accent-gold` | `#E7BC70` | **Obsidian Gold:** Achievement badges, featured marker (`~10.9:1` on `#070A18`). |
| `--accent-copper` | `#E18DAF` / `#A65578` | **Metallic Rose / Plum Rim:** `#E18DAF` secondary accent tags & warm 3D orbital highlight (`~7.8:1` on `#070A18`). |
| `--border-subtle` | `rgba(174, 184, 210, 0.20)` | Swiss 1px grid rules & card hairlines. |
| `--border-glass` | `rgba(151, 136, 255, 0.34)` | Glass panel violet-chrome edge. |
| `--focus-ring` | `#B7AAFF` | `2px` solid `:focus-visible` ring with `3px` `#070A18` offset (`NFR-008`). |
| `--status-success` | `#9FB5FF` | Copy-email confirmation text/icon (indigo-steel, zero green/teal bias). |
| `--status-warning` | `#E7BC70` | Non-blocking notices (e.g., invalid `?project=` slug, `FR-048`). |

### 2.2 Scarlet Porcelain — Light Theme (`data-theme="light"`, Pending Owner Sign-Off)

| Token Name | Hex / Value | Usage & Solid-Surface Baseline |
| :--- | :--- | :--- |
| `--surface-canvas` | `#F8F7FB` | Porcelain alabaster-lavender paper base (zero harsh sterile white glare). |
| `--surface-elevated` | `#FFFFFF` | Crisp elevated cards & modal panels. |
| `--surface-card` | `#F0EDF5` | Recessed porcelain-plum panels, portrait slot backdrop, tag pills. |
| `--surface-card-hover` | `#E8E2EF` | Interactive hover card surface. |
| `--surface-glass` | `rgba(255, 255, 255, 0.84)` | Frosted architectural glass over light 3D atmosphere (`blur(12px)`). |
| `--surface-scrim` | `rgba(248, 247, 251, 0.88)` | Scrim behind Hero display copy & dialog overlays. |
| `--text-primary` | `#1B1421` | Deep ink (`~16.6:1` on `#F8F7FB`). |
| `--text-secondary` | `#51465C` | Body & project summaries (`~8.5:1` on `#F8F7FB`). |
| `--text-muted` | `#6C6176` | Timestamps, captions, Swiss indices (`~5.46:1` on `#F8F7FB`, `~5.03:1` on `#F0EDF5`, `~4.59:1` on `#E8E2EF`). |
| `--text-on-accent` | `#FFFFFF` | Pure white text on `#D20D46` scarlet solid buttons (`~5.40:1`). |
| `--accent-primary` | `#D20D46` | Vibrant scarlet crimson primary CTA, active links, key borders (`~5.02:1` on `#F8F7FB`). |
| `--accent-primary-deep` | `#A70F38` | Hover/pressed crimson state & high-emphasis badges (`~7.06:1` on `#F8F7FB`). |
| `--accent-secondary` | `#7045C8` | Deep porcelain violet structural accent. |
| `--accent-chrome` | `#5C6475` / `#C9CEDB` | **Liquid Chrome (Light):** `#5C6475` steel labels (`~5.5:1`); `#C9CEDB` structural borders. |
| `--accent-gold` | `#946213` | **Antique Gold (Light):** Accessible gold text/badge (`~4.97:1` on `#F8F7FB`, `~5.30:1` on `#FFFFFF`). |
| `--accent-copper` | `#A64F46` / `#853830` | **Warm Carmine Copper (Light):** Accessible secondary accent. |
| `--border-subtle` | `rgba(27, 20, 33, 0.14)` | Swiss 1px editorial rules. |
| `--border-glass` | `rgba(210, 13, 70, 0.24)` | Glass panel scarlet-tinted edge. |
| `--focus-ring` | `#A70F38` | `2px` solid `:focus-visible` ring with `3px` `#F8F7FB` offset (`NFR-008`). |
| `--status-success` | `#3D3591` | Deep indigo confirmation (`~9.1:1` on `#F8F7FB`, zero generic green). |
| `--status-warning` | `#946213` | Dismissible notice text/border (`~4.97:1` on `#F8F7FB`). |

---

## 3. Typography System

### 3.1 Finalized Font Pairing (**Committed**)
| Role | Font Family | Weights (Self-Hosted `woff2`) | Fallback Stack | Usage |
| :--- | :--- | :---: | :--- | :--- |
| **Editorial Display** | `Syne` | `600`, `700` | `'Syne', system-ui, -apple-system, 'Segoe UI', sans-serif` | Hero name (`h1`), section titles (`h2`), large Swiss index numerals. |
| **Readable Body Sans** | `Inter` | `400`, `500`, `600` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | Body narrative, project breakdowns, nav links, dialog copy, UI buttons. |
| **Restrained Monospace** | `JetBrains Mono` | `400`, `500` | `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` | Section indices (`01 // ABOUT`), dates, tech stack tags (selective), metadata. |

### 3.2 Fluid Type Scale & Hierarchy
All sizes use `clamp()` for smooth scaling between `320px` and `1440px` (`NFR-014`):

| Token | Size (`min` -> `max`) | Weight | Line Height | Tracking | Role |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `--text-hero` | `2.75rem` -> `5.5rem` (`44px`–`88px`) | `700` | `0.98` | `-0.03em` | Single `h1` ("Austin Joshua") |
| `--text-h2` | `1.875rem` -> `3.25rem` (`30px`–`52px`) | `600` | `1.08` | `-0.025em` | Section headers (`h2`) |
| `--text-h3` | `1.25rem` -> `1.625rem` (`20px`–`26px`) | `600` | `1.22` | `-0.015em` | Project titles, role titles (`h3`) |
| `--text-lead` | `1.0625rem` -> `1.25rem` (`17px`–`20px`) | `400` | `1.55` | `-0.005em` | Hero subtitle, About intro |
| `--text-body` | `1rem` (`16px` baseline) | `400` | `1.65` | `0` | Paragraphs, bullet items (`<= 68ch` max measure) |
| `--text-meta` | `0.75rem` -> `0.8125rem` (`12px`–`13px`) | `500` | `1.4` | `+0.06em` | Monospace indices, dates, labels (uppercase sparingly) |

---

## 4. Grid, Spacing, Container Widths, and Breakpoints

- **Max Content Container:** `1360px` (committed maximum width) with fluid outer gutters: `20px` (mobile), `32px` (tablet), `48px`–`64px` (desktop/wide).
- **Swiss Column Grid:**
  - Mobile (`< 768px`): `4` columns, `16px` gap.
  - Tablet (`768px–1023px`): `8` columns, `20px` gap.
  - Desktop (`>= 1024px`): `12` columns, `24px` gap, with visible subtle `1px` `--border-subtle` structural dividers between major blocks.
- **Vertical Section Rhythm:** Consistent section padding (`72px` mobile -> `120px` desktop) separated by horizontal `1px` Swiss hairline rules with left-aligned monospace section markers (`01` through `07`).
- **Spacing Scale (`4px` base):** `4, 8, 12, 16, 24, 32, 48, 64, 96, 128px`.

---

## 5. Navigation and Theme-Switcher Design

### 5.1 Sticky Top Navbar (`FR-001`, `FR-002`, `NFR-008`)
- **Height & Surface:** `56px` full-width sticky bar with `1px` bottom `--border-subtle` on mobile (`< 768px`); `64px` floating inset glass capsule (`top: 12px`) on tablet/desktop (`>= 768px`), using `--surface-glass` + `backdrop-filter: blur(12px)`.
- **Layout:**
  - **Left:** Wordmark / geometric monogram (`AJ //`) linking to `#hero`.
  - **Center (`>= 768px`):** Six concise section links (`About`, `Skills`, `Projects`, `Experience`, `Achievements`, `Contact`). Active section indicated by an `accent-primary` dot and `2px` bottom underline (`aria-current="location"`).
  - **Right:** Conditional `Résumé` ghost link (only if asset exists, `FR-009`), accessible `ThemeToggle`, and (`< 768px`) `Menu` toggle button (`44x44px` hit target).
- **Scroll Progress (`FR-005`):** A `2px` hairline progress bar along the bottom edge of the navbar (supplemented by a vertical `01–07` section rail at `>= 1280px`) driven by scroll progress.

### 5.2 Theme Switcher (`FR-033`–`FR-036`)
- **Visual Form:** Icon-only glass control (`min-width: 44px`, `min-height: 44px` on touch, `36px` on desktop) displaying an orbital theme glyph with explicit accessible labeling (`aria-label="Midnight Amethyst active — Switch to Scarlet Porcelain light theme"` / `"Scarlet Porcelain active — Switch to Midnight Amethyst dark theme"`).
- **Feedback:** Smooth CSS variable transition (`220ms ease` for colors/borders; `0ms` under `prefers-reduced-motion: reduce`), plus synchronized 3D palette cross-fade.

---

## 6. Section-by-Section Visual Specifications

| Section | Visual Archetype & Composition | Distinctive Visual Character |
| :--- | :--- | :--- |
| **00. Hero** | Full-bleed `min-h-[100dvh]` spatial stage; left typographic lockup paired with right interactive 3D Digital Universe + foreground cutout portrait (`HeroPortraitReveal`) inside `[data-testid="hero-3d-stage"]`. | Dramatic scale contrast (`88px` display name vs `13px` monospace discipline tag); transparent `austin-joshua-cutout.png` stands in front of the real 3D Universe in a shadow silhouette by default (`data-portrait-revealed="false"`) and reveals full natural colour on pointer hover, keyboard focus/focus-within, or touch tap (`aria-pressed`). Primary CTAs (`View Projects`, `Get in Touch`) + verified GitHub/LinkedIn/Email icon row. |
| **01. About** | Editorial 12-col split: 7 cols narrative + 5 cols **Portrait Studio Frame** (`PortraitSlot`, `FR-007`, `FR-008`). | Print-inspired Swiss dossier feel with `1px` hairline dividers and high-contrast editorial typography; `PortraitSlot` composites the transparent cutout over a theme-aware radial studio backdrop, with automatic `AJ` Swiss monogram fallback on error. |
| **02. Skills** | Segmented interactive domain selector (`All` / category tabs, `FR-012`) paired with a structured Swiss capability matrix. | Zero cheesy percentage bars. Active category highlights related projects count (`FR-013`) using `--accent-primary` and subtle `--accent-chrome` grid cells. |
| **03. Projects** | Filter bar (`All`, `AI/ML`, `Software`, `Interactive/3D` — `TBD`, `FR-018`) above an asymmetric 2-column featured bento grid (`col-span-7` + `col-span-5` alternating, collapsing to 1-col on mobile). | Translucent `--surface-glass` cards with numbered index (`P-01`), domain badge, stack chips, 16:10 visual preview slot (`TBD`), and clear "Inspect Architecture ->" affordance opening `ProjectDetailModal`. |
| **04. Experience** | Vertical Swiss architectural rail (`2px` `--border-subtle` spine with active `--accent-primary` node) + right-aligned expandable role blocks (`FR-022`, `FR-024`). | Clean chronological pacing with monospace date columns on desktop (`col-span-3`) and role details (`col-span-9`). Renders a neutral, factual empty-state panel if entries are not yet supplied (`FR-023`). |
| **05. Achievements** | Compact, high-contrast horizontal ledger / 3-column index cards with selective **Obsidian Gold** (`#E5B85C` / `#8A5E08`) and **Burgundy Copper** markers (`FR-026`). | Restrained trophy-free elegance—tabular typography, issuer/date metadata, and external verification arrow (`FR-027`). |
| **06. Contact** | High-impact typographic closing band: large editorial invitation headline (`TBD`), oversized interactive `mailto:` link, tactile **Copy Email** pill (`FR-030`), and verified social links (`FR-029`). | No form clutter (`FR-032`). Followed by a minimal Swiss footer colophon with "Back to Top". |

---

## 7. Component Specifications

- **Buttons:**
  - *Primary:* Solid `--accent-primary` fill with `--text-on-accent` bold label (`#070A18` on `#9788FF` in dark; `#FFFFFF` on `#D20D46` in light), crisp `4px` Swiss border radius, minimum `44px` height on touch / `40px` desktop (`>= 24x24px` WCAG 2.2 minimum).
  - *Secondary / Glass:* `--surface-glass` background, `1px solid --border-glass`, `--text-primary` label, border brighten on hover.
  - *Ghost / Link:* Monospace or sans label with animated `1px` underline and `↗` / `→` directional glyph.
- **Glass Cards:** `background: var(--surface-glass)`, `border: 1px solid var(--border-glass)`, `backdrop-filter: blur(12px)`, internal padding `24px`–`32px`. Must pass rendered contrast checks over live 3D backdrops using `--surface-scrim` or opaque `--surface-elevated` / `--surface-card` fallbacks (`@supports not (backdrop-filter: blur(1px))` or wherever composited contrast drops below WCAG 2.2 AA).
- **Tags / Tech Chips:** Compact `12px`–`13px` monospace pills (`padding: 4px 10px`, `border: 1px solid --border-subtle`, `--surface-card` background). Max 4–5 visible tags per project card on overview; full stack inside `ProjectDetailModal`.
- **Project Detail Modal (`FR-016`, `FR-017`):**
  - Desktop: Centered glass modal (`max-w-[880px]`) over `--surface-scrim`. Mobile: Full-viewport bottom-up sheet.
  - Sticky modal header with project index, title, and `44x44px` Close (`×`) button; structured body (Overview, Problem, Architecture/Approach, Outcomes `TBD`, Stack, Media `TBD`, External GitHub/Live links).
- **Experience Timeline:** Left vertical `1px` rail with `10px` coordinate node (`--accent-primary` when active/focused); collapsible technical bullets (`FR-024`) with clear chevron rotation.
- **Portrait Presentation (`HeroPortraitReveal` + `PortraitSlot`, `FR-008`, `FR-047`):**
  - **Source Cutout:** Genuine transparent-background cutout `public/assets/portrait/austin-joshua-cutout.png` (`604x806`, RGBA PNG; original preserved outside `public/` in `src/assets/source/austin-joshua.jpg`).
  - **Hero Reveal Interaction:** The Hero cutout floats in front of the live 3D orbital system in a CSS shadow/silhouette filter state by default (`data-portrait-revealed="false"`) and reveals full natural colour smoothly (`380ms` cubic-bezier) on pointer hover, pointer spotlight tracking, keyboard `focus-within`, or touch tap via an accessible `<button data-testid="portrait-reveal-toggle" aria-pressed>` without triggering layout shift or instantiating a second WebGL renderer. Under `prefers-reduced-motion: reduce`, transitions become immediate.
  - **About Studio Frame & Fallback:** `PortraitSlot` renders the same transparent cutout over a theme-aware architectural radial studio backdrop with four registration ticks (`--accent-chrome`), automatically falling back to the `3:4` `AJ` monogram (`PORTRAIT // ASSET_PENDING`) if the asset fails to load.
- **Interactive Controls (`ThemeToggle`, Skill Tabs, Project Filters, Copy Email):** Clear active/selected states using both color and non-color cues (solid fill, underline, or checkmark icon—never color alone).

---

## 8. 3D Digital Universe Art Direction

- **Composition & Framing (`FR-038`):** Centered/slightly right-offset focal orbital system in the Hero (`x: +0.8` desktop so left-aligned Hero `h1` stays clean; centered behind/above on mobile), transitioning to sparse ambient deep-space drift across lower sections.
- **Depth & Geometry:**
  - *Layer A (Far):* Low-opacity starfield/coordinate particle cloud (`Points`, soft circular alpha falloff).
  - *Layer B (Mid):* 2–3 delicate tilted orbital rings (`LineLoop` / thin torus wireframes) in **Liquid Chrome** and **Obsidian Gold** / **Burgundy Copper** evoking Swiss astronomical diagrams.
  - *Layer C (Core):* Subtle translucent or wireframe polyhedral/lattice core reacting gently to pointer tilt (`FR-040`).
- **Theme Lighting & Materials:**
  - *Midnight Amethyst (Dark):* Deep `#070A18` void, luminous `#9788FF` & `#6B70E8` point accents, `#DDE3F3` chrome rings, `#E7BC70` gold orbit & `#E18DAF` metallic rose rim accent with boosted ring thickness (`0.011–0.015`) and opacity (`0.62–0.90`) for clear depth behind the Hero portrait silhouette.
  - *Scarlet Porcelain (Light):* Atmospheric `#F8F7FB` paper canvas, crisp `#D20D46`, `#A70F38`, & `#7045C8` vector particles/wireframes, `#946213` subtle gold orbital hairlines—low visual noise so `#1B1421` ink stays effortless to read.
- **Particle Behavior & Mobile Adaptation (`FR-041`):** Slow laminar orbital drift (`0.02–0.05 rad/s` max—never chaotic swarm). On mobile (`< 768px`), reduce particle count by ~60%, disable pointer parallax, cap DPR at `1.5`, and pause `frameloop` outside viewport (`NFR-004`).

---

## 9. Motion Design & Reduced-Motion Alternatives

### 9.1 Motion Language by Section (**No Repetitive Fade-Ups**)
- **Hero:** Initial typographic clip-mask/letter-spacing settle (`500ms` cubic-out) synchronized with gentle 3D camera ease-in; Hero text is readable at `t = 0ms` (never hidden waiting for GSAP).
- **About:** Hairline border draw + subtle parallax offset on the portrait frame (`<= 24px` travel on desktop).
- **Skills:** Crisp Motion `layoutId` active-tab underline glide and snappy staggered chip reorder (`180ms`–`240ms`).
- **Projects:** Motion `layout` grid reflow on filter change + shared-feel drawer/modal scale-and-fade (`260ms` enter, `200ms` exit).
- **Experience:** GSAP ScrollTrigger rail-progress fill tracking scroll position down the spine.
- **Achievements & Contact:** Subtle hover border illumination (`180ms`) and tactile Copy Email checkmark spring (`Motion`).

### 9.2 Reduced-Motion Alternatives (`FR-039`, `NFR-010`)
When `@media (prefers-reduced-motion: reduce)` is active:
- Continuous 3D rotation, floating bob, and pointer parallax halt completely (`frameloop="demand"`, rendering a single static composed frame, or `UniverseFallback` if WebGL is unavailable).
- GSAP ScrollTrigger scrub/parallax transforms disable; all sections render immediately at `opacity: 1` and `transform: none`.
- Anchor scrolling switches to `behavior: 'auto'`; modal/tab transitions cross-fade briefly (`100ms` opacity only) or switch instantaneously.

### 9.3 Optional `[Proposed]` Interactions (Excluded from Committed v1)
The following PRD `Could` / `[Proposed]` interactions are **optional enhancements excluded from the committed v1 design** unless explicitly approved: magnetic Hero CTA hover (`FR-006`), About metadata spec strip (`FR-010`), desktop spatial skill cluster view (`FR-014`), project media lightbox (`FR-020`), project-tag jump to Skills (`FR-021`), experience category badges (`FR-025`), achievement category filters (`FR-028`), and manual static-effects toggle (`FR-042`).

---

## 10. Light-Theme Visual Adaptation (Scarlet Porcelain)

Light-adapted **Scarlet Porcelain** is designed from light-surface physics rather than inverting dark mode:
- **Ink & Paper Contrast:** Deep `#1B1421` ink on `#F8F7FB` porcelain-alabaster and `#FFFFFF` cards replaces cosmic violet luminance; primary scarlet `#D20D46` and deep crimson `#A70F38` ensure crisp readability on light surfaces.
- **Glassmorphism Re-calibration:** Dark glass relies on dark translucent tint (`rgba(14, 20, 40, 0.80)`) + luminous violet specular border; light glass relies on high-opacity frosted white (`rgba(255, 255, 255, 0.84)`), subtle drop shadow (`0 8px 32px rgba(27, 20, 33, 0.08)`), and crisp `#C9CEDB` / scarlet-tinted `1px` borders to separate layers cleanly.
- **3D Adaptation:** Additive blending glows look washed out on light backgrounds; switch light-theme 3D particles/lines to normal alpha blending with crisp architectural vector linework (`#D20D46`, `#7045C8`, `#5C6475`).

---

## 11. Accessibility Specification (WCAG 2.2 AA)

- **Contrast Verification (`NFR-007`):** Solid-token contrast checks alone are insufficient. Every text and UI element must be verified against **rendered `--surface-glass` surfaces and live 3D Digital Universe compositions** (including peak particle/orbital overlap regions) in both Midnight Amethyst and Scarlet Porcelain (`>= 4.5:1` normal text, `>= 3:1` large text/UI). Apply readable `--surface-scrim` overlays or opaque `--surface-elevated` / `--surface-card` fallbacks wherever composited contrast drops below threshold.
- **Keyboard & Focus (`NFR-008`):** Global `Skip to main content` link; high-contrast `2px` `--focus-ring` with `3px` offset; `scroll-padding-top: 88px` so focused headings are never obscured under the sticky header; full `Tab`/`Escape` trapping and focus restoration in `MobileDrawer` and `ProjectDetailModal`.
- **Touch Targets (`NFR-015`):** Every interactive button, nav item, filter chip, and close icon meets `>= 24x24px` everywhere and `>= 44x44px` on mobile touch viewports with `>= 8px` gap between adjacent targets.
- **Assistive Semantics (`NFR-009`):** 3D `<canvas>` wrapper marked `aria-hidden="true"`; status changes (Copy Email, project filter counts, invalid `?project=` notice) announced via `aria-live="polite"`.

---

## 12. Responsive Behavior (`320px` to Wide Desktop)

| Viewport Tier | Width | Key Visual & UX Adjustments |
| :--- | :--- | :--- |
| **Compact Mobile** | `320px–479px` | `44px` display Hero `h1`, single-column layout, stacked CTAs (`w-full`), full-screen `MobileDrawer` & full-height `ProjectDetailModal` sheet, static/low-particle 3D. |
| **Large Mobile** | `480px–767px` | Side-by-side Hero CTAs where space permits, 2-up skill chip wrapping, `mobile-conserving` 3D tier. |
| **Tablet** | `768px–1023px` | Full inline top navbar, 8-col grid, 2-column equal project cards, side-by-side About copy + portrait slot. |
| **Desktop** | `1024px–1439px` | 12-col asymmetric Swiss layout, alternating bento project grid, split timeline (`3 + 9` cols), full `desktop-high` 3D with pointer parallax. |
| **Wide Desktop** | `>= 1440px` | Content locked to `1360px` max-width, edge-to-edge 3D canvas, subtle right-edge `01–07` section index indicator (`FR-005`). |

---

## 13. Design States (Loading, Empty, Error, Unavailable Assets, WebGL Fallback)

- **Initial 3D Loading (`FR-044`):** Zero splash/preloader blocker. Hero copy, nav, and static CSS atmospheric backdrop (`UniverseFallback`) render immediately; WebGL `<Canvas>` fades in smoothly over `400ms` once hydrated.
- **WebGL Fallback (`FR-045`):** Static SVG/CSS radial orbital grid + subtle noise/gradient texture rendered in exact Midnight Amethyst or Scarlet Porcelain palette tokens.
- **Empty / `TBD` Sections (`FR-046`):**
  - *Filtered Projects = 0:* Centered Swiss dashed-border empty card ("No projects match this filter") + prominent `Reset Filters` button.
  - *Empty Experience / Achievements (`FR-023`, `FR-046`):* Clean single glass panel displaying neutral, factual status copy (e.g., `"No experience entries added yet."` / `"No achievements added yet."`)—never implying unverified background claims, fabricated roles, blank whitespace, or broken timeline rails.
- **Unavailable Assets (`FR-008`, `FR-009`, `FR-047`):** Missing portrait triggers the geometric Swiss frame (`PortraitSlot`); missing résumé hides/disables the download control without dead links.
- **Invalid Project Deep-Link (`FR-048`):** Dismissible status toast/banner at top of `#projects` ("Requested project entry was not found") with `aria-live="polite"`.

---

## 14. Asset Requirements and Replaceable Slots

| Asset | Expected Format & Specs | Replaceable Slot Behavior (`TBD`) |
| :--- | :--- | :--- |
| **Personal Portrait** | Transparent RGBA cutout `PNG` (`public/assets/portrait/austin-joshua-cutout.png`, `604x806px`, 3:4 aspect ratio); original source preserved in `src/assets/source/austin-joshua.jpg` (`FR-008`). | Controlled by `profile.portrait`. Hero displays silhouette shadow-to-colour reveal in front of the 3D scene; About (`PortraitSlot`) composites cutout over a theme-aware surface with automatic `AJ` Swiss monogram fallback (`onError` / `null`). Never uses AI/stock faces. |
| **Résumé / CV PDF** | Single-file `PDF` (`<= 2 MB` recommended), clean filename (`Austin_Joshua_Resume.pdf`, `FR-009`). | Controlled by `profile.resume` (`null` until supplied). Navbar & Contact links render cleanly when valid path exists. |
| **Project Previews** | `WebP` / `AVIF`, `16:10` or `16:9` aspect ratio (`1280x800px` recommended), explicit dimensions (`NFR-005`). | Optional per project; projects without screenshots render a clean typographic/architecture diagram card header instead of broken image frames. |
| **Open Graph Preview** | `1200x630px` PNG/WebP (`og-image.png`) using Midnight Amethyst typography lockup (`NFR-012`). | `TBD` prior to public launch. |

---

## 15. Design Acceptance Checklist (Mapped to PRD Requirements)

- [ ] **Dual-Theme Tokens & Default:** Midnight Amethyst (`#070A18`, `#9788FF`, `#6B70E8`, `#DDE3F3`) loads by default (`FR-033`), toggles cleanly to Scarlet Porcelain (`#F8F7FB`, `#D20D46`, `#A70F38`, `FR-034`), and persists without FOUC (`FR-035`) *(pending owner screenshot sign-off)*.
- [ ] **WCAG 2.2 AA Contrast & Focus:** All text/UI elements pass `>= 4.5:1` / `>= 3:1` against rendered glass surfaces and 3D compositions (with scrims or opaque fallbacks where needed, `NFR-007`), `:focus-visible` is unobscured (`NFR-008`), and touch targets meet `>= 24x24px` (`44x44px` mobile, `NFR-015`).
- [ ] **All 7 Sections Visually Distinct & Responsive:** Hero, About, Skills, Projects, Experience, Achievements, and Contact render with zero horizontal overflow from `320px` to `2560px+` (`NFR-014`, `NFR-016`).
- [ ] **Accessible Dialogs & Menus:** `MobileDrawer` (`FR-003`) and `ProjectDetailModal` (`FR-016`, `FR-017`) trap focus, close on `Escape`, and restore focus cleanly.
- [ ] **3D & Motion Discipline:** Non-blocking async 3D load (`FR-044`), deterministic WebGL fallback (`FR-045`), mobile tier scaling (`FR-041`), and full `prefers-reduced-motion` compliance (`FR-039`, `NFR-010`).
- [ ] **Replaceable & Empty States:** Portrait placeholder (`FR-008`), conditional résumé (`FR-009`), empty/filtered states (`FR-046`), and clipboard feedback (`FR-030`) verified without fabricated data.
