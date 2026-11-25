# Product Requirements Document (PRD): Austin Joshua — Engineering Portfolio

**Document Status:** Draft v1.0 (Aligned to Confirmed Baseline)  
**Source of Truth:** [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md)  
**Owner:** Austin Joshua  
**Deployment Target:** Vercel (Source Control: GitHub)  

---

## 1. Product Overview and Vision

This PRD defines the functional, user experience, technical quality, and release requirements for **Austin Joshua's** personal engineering portfolio—a single-page scrolling web application built with React, TypeScript, Vite, Tailwind CSS, Three.js / React Three Fiber, GSAP, and Motion.

Building on the vision in [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md), the product pairs a **3D Digital Universe** interactive spatial layer with **Swiss Experimental** typographic grid discipline and **Glassmorphism** surfaces. It defaults to **Abyssal Teal (dark)** with an alternate **light-adapted Crimson Void** theme, backed by **Liquid Chrome**, **Obsidian Gold**, and **Burgundy Copper** accents, and targets **WCAG 2.2 AA** compliance.

---

## 2. Goals, Objectives, and Measurable Success Criteria

| Product Goal | Objective | Measurable Success Criterion (Target) |
| :--- | :--- | :--- |
| **Immediate Identity & Role Clarity** | Communicate Austin Joshua's profile (CS Engineering student; aspiring Software & AI Engineer) above the fold. | First-time visitors identify name, discipline, and primary CTAs within initial viewport without scrolling; `0` placeholder/fabricated bio items at launch. |
| **Technical Credibility Through Craft** | Showcase engineering projects, skills, experience, and achievements in an interactive yet scannable single-page layout. | `100%` of published project cards open complete detail views with verified repo/live links (`TBD` data populated prior to launch); `0` broken external links. |
| **Frictionless Outreach** | Enable recruiters and collaborators to contact Austin via email and social links without a form backend. | Email `mailto:`, one-click copy-email feedback, and social profile links reachable in `<= 2` clicks from Hero or persistent navigation. |
| **Dual-Theme & Spatial Parity** | Deliver cohesive aesthetics and contrast in both Abyssal Teal (dark default) and light-adapted Crimson Void. | `100%` of text and interactive UI elements pass WCAG 2.2 AA contrast thresholds (`>= 4.5:1` normal text, `>= 3:1` large text/UI) in both themes. |
| **Fast, Resilient Delivery** | Keep initial page load snappy despite Three.js/R3F and GSAP/Motion animations. | LCP `<= 2.5s`, CLS `<= 0.1`, INP `<= 200ms`; `0` uncaught runtime errors when WebGL is disabled or `prefers-reduced-motion` is enabled. |
| **Post-Launch Engagement KPIs** | Track recruiter/visitor conversion if analytics are approved. | Target click-through rates / unique visitor benchmarks: `TBD` (pending analytics decision). |

---

## 3. Target Users and Their Needs

Referencing the audience segments defined in [PROJECT_BRIEF.md](file:///c:/Users/austi/OneDrive/Desktop/Portfolio/PROJECT_BRIEF.md), v1 optimizes for four primary user profiles:

1. **Technical Recruiters & Talent Acquisition**
   - *Needs:* Rapidly scan education/role focus, core skills, experience, achievements, résumé access (when supplied), and direct email/LinkedIn.
   - *Product Response:* Clear Hero summary, sticky section navigation, scannable Experience/Skills sections, and one-click contact/copy-email actions.
2. **Engineering Managers & Senior Engineers**
   - *Needs:* Inspect system architecture, problem-solving rationale, code quality via GitHub, and live project demos.
   - *Product Response:* Rich project detail modal/drawer with problem/approach/stack breakdowns, deep-linkable URLs, and direct source/demo links.
3. **AI / Research Collaborators & Peers**
   - *Needs:* Gauge technical curiosity, AI/ML and creative engineering depth, and authentic personal voice.
   - *Product Response:* Cohesive 3D Digital Universe + Swiss Experimental execution, interactive skill-to-project exploration, and direct social channels.
4. **Assistive-Tech, Keyboard-Only, and Mobile Visitors**
   - *Needs:* Full parity without motion sickness, trap-free keyboard navigation, legible contrast over glassmorphic layers, and fast mobile rendering.
   - *Product Response:* WCAG 2.2 AA compliance, `prefers-reduced-motion` support, adaptive WebGL scaling, and deterministic non-WebGL fallbacks.

---

## 4. Product Scope: v1 Features and Exclusions

### Confirmed v1 Scope (In Scope)
- **Single-Page Scrolling Architecture:** Seven ordered sections (`Hero`, `About`, `Skills`, `Projects`, `Experience`, `Achievements`, `Contact`) with anchor navigation and in-page project detail modal/drawer.
- **Theme System:** **Abyssal Teal** dark theme as default; **light-adapted Crimson Void** alternate theme with persistent user preference.
- **Interactive 3D & Motion:** Three.js / React Three Fiber 3D Digital Universe scene paired with GSAP/Motion choreography and progressive/fallback rendering.
- **Replaceable Asset Slots:** Intentional fallback states for Austin Joshua's portrait and résumé PDF until supplied.
- **Direct Contact (No Form):** Verified `mailto:` email action, clipboard copy action, and social/developer profile links.
- **Static Data Layer & Hosting:** Typed local content modules deployed via GitHub to Vercel.

### Explicit v1 Exclusions (Out of Scope)
- Interactive contact form or serverless/third-party email submission backend (deferred beyond v1).
- Headless CMS, admin portal, authentication, or blogging engine.
- Multi-page routing architecture (beyond optional deep-link hash/query state for project modals within the single page).
- AI-generated, stock, or fabricated portrait images, résumé items, project metrics, or achievements.
- Full-canvas WebGL-only UI that replaces semantic DOM text.

---

## 5. Functional Requirements

> **Conventions:** Priority uses MoSCoW (`Must`, `Should`, `Could`, `Won't`). Items tagged `[Proposed]` represent enhancements derived from product best practices beyond the explicit brief; they require stakeholder confirmation if retained.

### 5.1 Navigation and Hero

| ID | Priority | Requirement |
| :--- | :--- | :--- |
| **FR-001** | Must | The application shall render a persistent top navigation bar containing Austin Joshua's brand mark/name, section links (`About`, `Skills`, `Projects`, `Experience`, `Achievements`, `Contact`), a theme toggle, and a conditional Résumé link (rendered only when a résumé asset is configured). |
| **FR-002** | Must | Clicking any navigation link shall smoothly scroll to the corresponding section landmark (instant jump when `prefers-reduced-motion: reduce` is active), update the active-section indicator based on scroll position, and maintain keyboard focus visibility. |
| **FR-003** | Must | On viewports `< 768px`, primary section links shall collapse into an accessible mobile menu drawer with an explicit open/close toggle, `Escape` key dismissal, focus trapping while open, and background scroll locking. |
| **FR-004** | Must | The Hero section shall display Austin Joshua's name, discipline ("Computer Science Engineering Student \| Aspiring Software & AI Engineer"), concise positioning copy (`TBD`), primary CTAs (jump to Projects, jump to Contact, and conditional Résumé action), and the primary 3D Digital Universe canvas. |
| **FR-005** | Should | The navigation or viewport edge shall display a subtle Swiss-styled scroll progress or current-section index indicator across the single-page journey. |
| **FR-006** | Could | `[Proposed]` Desktop pointer devices may trigger subtle magnetic or micro-interactive hover feedback on primary Hero CTAs without altering hit-target bounds. |

### 5.2 About and Personal Profile

| ID | Priority | Requirement |
| :--- | :--- | :--- |
| **FR-007** | Must | The About section shall present Austin Joshua's academic background in Computer Science Engineering, focus across software and AI engineering, and personal narrative (`TBD` copy). |
| **FR-008** | Must | The About section shall include a replaceable portrait slot (`TBD` image asset); when no portrait file is configured or if loading fails, it shall display a deliberate Swiss/3D-styled monogram or geometric placeholder frame—never a generated or stock human image. |
| **FR-009** | Should | When a résumé PDF asset (`TBD`) is supplied, the About section (and/or Hero) shall expose a clearly labeled view/download action (`target="_blank"` or `download` with file format/size hint); if unconfigured, no broken link shall be rendered. |
| **FR-010** | Could | `[Proposed]` The About section may display a compact structured spec sheet (e.g., Degree, Expected Graduation, Focus Areas, Availability — all `TBD`). |

### 5.3 Interactive Skills Exploration

| ID | Priority | Requirement |
| :--- | :--- | :--- |
| **FR-011** | Must | The Skills section shall organize capabilities into clear engineering categories (e.g., Languages, AI/ML, Frontend & Creative Tech, Backend & Systems, Tools — exact taxonomy `TBD`) without arbitrary numeric proficiency percentages. |
| **FR-012** | Must | Users shall be able to interactively filter or switch between skill categories via accessible tab/filter buttons supporting both pointer and keyboard (`Enter`/`Space`/arrow or `Tab`) interaction. |
| **FR-013** | Should | Selecting or activating a skill item shall highlight or link to related projects in the portfolio that utilize that skill (when mapped in local project data). |
| **FR-014** | Could | `[Proposed]` Desktop users may toggle between a structured Swiss matrix layout and an interactive spatial/clustered view of the skill taxonomy. |

### 5.4 Project Showcase and Project Details

| ID | Priority | Requirement |
| :--- | :--- | :--- |
| **FR-015** | Must | The Projects section shall render a curated showcase of project cards displaying title, concise summary, domain/category tags, core tech stack, and interactive trigger to open full details (`TBD` project records). |
| **FR-016** | Must | Activating a project card shall open an in-page Project Detail modal or slide-over drawer displaying: full summary, problem statement, technical architecture/approach, role, outcomes/metrics (`TBD`), visual media (`TBD`), and verified external links (GitHub repository and/or live demo `TBD`). |
| **FR-017** | Must | The Project Detail modal/drawer shall enforce accessible dialog behavior: `role="dialog"`, `aria-modal="true"`, initial focus placement inside the dialog, focus trapping, closure via `Escape` or close button/backdrop click, and focus restoration to the triggering card on close. |
| **FR-018** | Should | The Projects section shall provide category filter controls (e.g., All, Software Engineering, AI/ML, Interactive/3D — exact tags `TBD`) and announce updated result counts via an `aria-live` region. |
| **FR-019** | Should | Opening or closing a project detail view shall synchronize with URL hash/query state (e.g., `?project=<slug>`) so specific projects can be shared via link and closed via browser Back navigation without leaving the single-page app. |
| **FR-020** | Could | `[Proposed]` Project detail media galleries may support keyboard-accessible next/previous image stepping or lightbox enlargement. |
| **FR-021** | Could | `[Proposed]` Tech stack tags inside a project detail view may allow jumping to the Skills section pre-filtered to the relevant category. |

### 5.5 Experience Timeline

| ID | Priority | Requirement |
| :--- | :--- | :--- |
| **FR-022** | Must | The Experience section shall present a chronological Swiss timeline of roles, internships, research, or engineering engagements with title, organization, date range, location/mode, and key technical contributions (`TBD` entries). |
| **FR-023** | Must | If fewer than two or zero formal experience entries are supplied (`TBD`), the Experience section shall render a clean, non-broken layout (either displaying available entries or a verified academic/availability notice without fabricated work history). |
| **FR-024** | Should | Timeline entries shall support interactive focus/active highlighting on scroll or click/expand to reveal detailed bullets without cluttering the initial scan. |
| **FR-025** | Could | `[Proposed]` Experience entries may display subtle category badges (e.g., Internship, Research, Open Source, Leadership — `TBD`). |

### 5.6 Achievements

| ID | Priority | Requirement |
| :--- | :--- | :--- |
| **FR-026** | Must | The Achievements section shall display verified awards, hackathon placements, certifications, honors, or publications with title, issuing organization/event, date, and concise context (`TBD` entries). |
| **FR-027** | Should | Achievements with an external credential, Devpost, or certificate URL (`TBD`) shall render an accessible external verification link opening safely in a new tab. |
| **FR-028** | Could | `[Proposed]` If more than four achievements are listed, users may filter or scan them via category badges (e.g., Hackathons, Certifications, Academic). |

### 5.7 Contact and Social Links

| ID | Priority | Requirement |
| :--- | :--- | :--- |
| **FR-029** | Must | The Contact section shall display Austin Joshua's direct `mailto:` email link (`TBD`) and verified social/developer links (GitHub, LinkedIn, and additional profiles `TBD`) without any contact form in v1. |
| **FR-030** | Must | A dedicated "Copy Email" control shall copy the configured email address (`TBD`) to the system clipboard, display immediate visual confirmation, announce the confirmation to screen readers via `aria-live="polite"`, and provide a graceful fallback (e.g., selecting text or falling back to `mailto:`) if Clipboard API access is denied. |
| **FR-031** | Should | The Contact section and global footer shall include availability status copy (`TBD`), a "Back to Top" smooth-scroll action, and minimal colophon metadata. |
| **FR-032** | Won't | An interactive contact form with server/serverless email submission is explicitly excluded from v1. |

### 5.8 Dark / Light Theme Switching

| ID | Priority | Requirement |
| :--- | :--- | :--- |
| **FR-033** | Must | The site shall default to the **Abyssal Teal (dark)** theme on initial load when no prior theme preference is stored. |
| **FR-034** | Must | An accessible theme switcher (`aria-pressed` or explicit mode label) shall toggle between **Abyssal Teal (dark)** and **light-adapted Crimson Void (light)**, updating all surface tokens, typography contrast, glassmorphism tints, secondary accents (Liquid Chrome, Obsidian Gold, Burgundy Copper), and Three.js scene lighting/colors. |
| **FR-035** | Must | The selected theme shall persist in `localStorage` across sessions and apply via a pre-paint initialization script before React hydration to prevent flash of wrong theme (FOUC). |
| **FR-036** | Should | Theme transitions shall animate smoothly via CSS transitions while dropping to instant transitions when `prefers-reduced-motion: reduce` is active. |
| **FR-037** | Could | Optional secondary control or command to reset theme preference back to default (Abyssal Teal) if needed during testing/use (`TBD`). |

### 5.9 Responsive and Interactive 3D Experience

| ID | Priority | Requirement |
| :--- | :--- | :--- |
| **FR-038** | Must | The portfolio shall integrate a Three.js / React Three Fiber **3D Digital Universe** visual layer anchored in the Hero (and optional subtle ambient depth across sections) without blocking DOM text selection, legibility, or click targets. |
| **FR-039** | Must | When `prefers-reduced-motion: reduce` is enabled, continuous 3D camera motion, floating animations, GSAP scroll-scrubbed transforms, and Motion parallax effects shall pause or resolve immediately to static final states. |
| **FR-040** | Should | On capable desktop devices with motion allowed, the 3D scene shall respond subtly to pointer movement and scroll progress within clamped velocity/angle bounds. |
| **FR-041** | Should | On mobile/tablet viewports or constrained devices, the 3D scene shall dynamically scale down complexity (e.g., lower particle count, DPR cap, simplified shaders) to preserve responsiveness and battery life. |
| **FR-042** | Could | `[Proposed]` A subtle user-facing "Motion / 3D Effects" toggle in the header or footer allowing users to manually switch to static mode regardless of OS settings. |
| **FR-043** | Won't | Full-screen 3D-only spatial navigation that replaces standard HTML scrolling and DOM text landmarks will not be built. |

### 5.10 Loading, Error, Empty-State, and WebGL Fallback Behaviors

| ID | Priority | Requirement |
| :--- | :--- | :--- |
| **FR-044** | Must | Critical HTML content, Swiss typography, and Hero CTAs shall render immediately while the Three.js / React Three Fiber canvas loads asynchronously in a lazy-loaded chunk. |
| **FR-045** | Must | If WebGL is unsupported, disabled, throws an initialization error, or experiences a `webglcontextlost` event, a React Error Boundary and capability detector shall seamlessly render a static CSS/SVG themed Digital Universe backdrop matching the active theme without crashing the page. |
| **FR-046** | Must | All data-driven sections (`Projects`, `Experience`, `Achievements`, `Skills`) shall handle empty arrays or `TBD` entries gracefully—displaying a clean empty/filtered state (with a "Reset filters" action for filtered views) and never rendering `undefined`, `NaN`, or broken card frames. |
| **FR-047** | Must | Missing or errored replaceable assets (portrait image `onError` or unconfigured résumé path) shall degrade cleanly to the reserved fallback frame or omit/disable the unavailable download control without broken image icons. |
| **FR-048** | Should | Navigating to an invalid deep-linked project slug (e.g., `?project=unknown`) shall fail gracefully by closing/omitting the modal, scrolling to `#projects`, and showing a brief dismissible notice rather than a blank screen. |

---

## 6. User Journeys and Key Interaction Flows

### Journey 1: Technical Recruiter Rapid Evaluation & Outreach
1. Recruiter opens portfolio URL -> Abyssal Teal (dark) Hero renders immediately with name, CS/AI positioning, and non-blocking 3D backdrop.
2. Recruiter scans Hero CTAs -> clicks `Projects` (smooth scroll to `#projects`) or `Résumé` (when supplied).
3. Recruiter reviews top project cards, opens one modal to verify problem/stack/outcome, closes with `Escape` or close button.
4. Recruiter clicks `Experience` and `Achievements` in sticky nav -> verifies background.
5. Recruiter navigates to `Contact` -> clicks "Copy Email" (receives instant confirmation) or clicks LinkedIn/GitHub link.

### Journey 2: Engineering Manager / Senior Engineer Deep-Dive
1. Engineering Manager arrives directly or via `?project=<slug>` shared link.
2. If deep-linked, page lands smoothly with target Project Detail drawer/modal open (focus inside dialog).
3. Manager inspects architecture summary, tech stack, and opens GitHub repo / live demo in a new tab.
4. Manager closes modal -> filters `Projects` by AI/ML or Software Engineering -> navigates to `Skills` to inspect broader tooling depth.

### Journey 3: Aesthetic & Theme Exploration (Desktop / Mobile)
1. Visitor lands in default **Abyssal Teal** dark mode and moves pointer/scrolls to observe fluid 3D Digital Universe + GSAP/Motion transitions.
2. Visitor clicks Theme Toggle in header -> scene, glassmorphic cards, and Liquid Chrome / Obsidian Gold / Burgundy Copper accents transition cleanly to **light-adapted Crimson Void**.
3. Visitor reloads page -> **light-adapted Crimson Void** persists via pre-paint script without flash.

### Journey 4: Keyboard-Only / Reduced-Motion / No-WebGL Visitor
1. Visitor enables `prefers-reduced-motion: reduce` or opens site in a WebGL-disabled browser.
2. Pre-hydration and runtime checks swap 3D canvas to themed static fallback backdrop (`FR-045`) and disable continuous motion (`FR-039`).
3. Visitor presses `Tab` -> Skip-to-content link appears -> tabs logically through header links, theme toggle, skill tabs, project cards (opens/closes modal via `Enter`/`Escape`), and contact copy-email control with clear focus outlines throughout.

---

## 7. User Stories with Acceptance Criteria

| ID | User Story | Acceptance Criteria |
| :--- | :--- | :--- |
| **US-001** | **As a recruiter**, I want to immediately understand Austin Joshua's identity, engineering focus, and next actions on page load so I can quickly decide if he fits an open software/AI role. | - Hero displays name, role positioning, and primary CTAs above the fold on desktop (`1440x900`) and mobile (`390x844`).<br>- Core Hero text renders without waiting for Three.js bundle completion.<br>- Zero placeholder Latin ("Lorem ipsum") or invented credentials appear. |
| **US-002** | **As an engineering manager**, I want to open detailed project breakdowns and jump to source code/live demos so I can evaluate technical depth. | - Clicking/activating any project card opens an accessible modal/drawer with problem, approach, stack, and external links.<br>- Focus moves into dialog, `Escape` closes it, and focus returns to the card.<br>- Browser Back closes an open deep-linked project modal. |
| **US-003** | **As a hiring manager**, I want to filter projects and explore categorized skills so I can verify relevant experience in AI/ML or software engineering. | - Skill categories switch cleanly via pointer and keyboard.<br>- Project filters update displayed cards immediately and announce the count to screen readers.<br>- Filtering to zero matches shows a clear reset option. |
| **US-004** | **As a visitor**, I want to switch between Abyssal Teal (dark) and light-adapted Crimson Void (light) themes and have my choice remembered. | - Initial visit with empty storage loads Abyssal Teal.<br>- Toggling switches both UI tokens and 3D scene palette/lighting.<br>- Reloading preserves the selected theme with no visible theme flash. |
| **US-005** | **As a recruiter**, I want to copy Austin's email address or open his social profiles effortlessly without filling out a slow form. | - Contact section exposes `mailto:`, Copy Email, GitHub, and LinkedIn (`TBD` URLs).<br>- Clicking Copy Email copies the address and displays + announces confirmation.<br>- No contact form fields exist in v1. |
| **US-006** | **As a user sensitive to motion or using assistive technology**, I want full keyboard access, readable contrast, and calm visuals when reduced motion is enabled. | - All interactive elements are keyboard reachable with visible focus rings.<br>- Contrast passes WCAG 2.2 AA (`>= 4.5:1` / `>= 3:1`) over glassmorphic layers in both themes.<br>- `prefers-reduced-motion: reduce` halts 3D/scroll animations. |

---

## 8. Non-Functional Requirements

### 8.1 Performance
- **NFR-001 (Must):** Three.js / React Three Fiber and heavy 3D shaders/geometries shall be dynamically imported and code-split from the critical initial JS bundle so Hero text and navigation paint independently of WebGL initialization.
- **NFR-002 (Must):** Production deployment on Vercel shall meet baseline Core Web Vitals targets: **LCP <= 2.5s**, **CLS <= 0.1**, and **INP <= 200ms** (final device/throttling test profile `TBD`).
- **NFR-003 (Should):** Lighthouse Performance score target: **>= 90 (Desktop)** and **>= 80 (Mobile)** (exact budget subject to final 3D scene complexity verification).
- **NFR-004 (Should):** Smooth runtime animation targeting **>= 50–60 FPS** on standard consumer hardware, with `dpr` capped (e.g., `<= 2`) and 3D render loops paused when the canvas is scrolled out of view or `document.hidden` is true.
- **NFR-005 (Should):** Fonts shall use optimized `woff2` subsets with `font-display: swap`; images (including future portrait and project media) shall use modern formats (`WebP`/`AVIF`) with explicit `width`/`height` or aspect-ratio attributes.

### 8.2 Accessibility (WCAG 2.2 AA)
- **NFR-006 (Must):** The entire portfolio shall conform to **WCAG 2.2 Level AA** across both Abyssal Teal and light-adapted Crimson Void themes.
- **NFR-007 (Must):** Text and interactive UI contrast ratios shall meet **>= 4.5:1** (normal text) and **>= 3:1** (large text, icons, focus indicators, and borders), tested directly over glassmorphic blur layers and 3D canvas regions.
- **NFR-008 (Must):** Every interactive control shall be keyboard-operable with clear visible focus indicators (`:focus-visible`) not obscured by sticky headers (`scroll-padding-top`), paired with a Skip-to-Main-Content link and a single logical heading hierarchy (`h1` -> `h2` -> `h3`).
- **NFR-009 (Must):** Decorative 3D `<canvas>` elements shall be excluded from the accessibility tree (`aria-hidden="true"`, `tabIndex={-1}`), and icon-only buttons (theme toggle, mobile menu, copy email, modal close) shall carry descriptive accessible names.
- **NFR-010 (Must):** All CSS, GSAP, Motion, and Three.js animations shall respect `@media (prefers-reduced-motion: reduce)`.

### 8.3 SEO and Metadata
- **NFR-011 (Must):** The document shall use semantic HTML5 landmarks (`header`, `nav`, `main`, `section`, `footer`), a unique `<title>`, and an accurate `<meta name="description">` (`TBD` final copy).
- **NFR-012 (Should):** Open Graph (`og:title`, `og:description`, `og:image`, `og:url`), Twitter/X metadata, canonical `<link>`, `robots.txt`, and `sitemap.xml` shall be configured prior to public launch (`TBD` domain and OG asset).
- **NFR-013 (Should):** Structured `JSON-LD` (`Person` schema) may be embedded using only confirmed personal fields and verified URLs (`TBD`).

### 8.4 Responsiveness
- **NFR-014 (Must):** Zero horizontal page overflow across viewport widths from `320px` to `2560px+` (including zoomed text up to `200%` per WCAG).
- **NFR-015 (Must):** Interactive touch/pointer targets shall meet WCAG 2.2 AA minimum target size (`>= 24x24` CSS px) and target `>= 44x44` CSS px on mobile touchscreens with sufficient spacing.
- **NFR-016 (Should):** Swiss grid layouts shall adapt cleanly across mobile (`< 768px`), tablet (`768px–1023px`), desktop (`1024px–1439px`), and wide (`>= 1440px`) breakpoints.

### 8.5 Security and Privacy
- **NFR-017 (Must):** All external links opening in new tabs shall use `rel="noopener noreferrer"`; no unsanitized HTML injection (`dangerouslySetInnerHTML`) or client-exposed secrets shall exist in the codebase.
- **NFR-018 (Must):** Vercel deployment configuration (`vercel.json` / headers) shall enforce `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, clickjacking protection (`X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`), and a Content Security Policy compatible with Vite assets and WebGL shaders.
- **NFR-019 (Should):** v1 shall avoid invasive third-party tracking cookies; if analytics are enabled (`TBD`), only privacy-friendly cookie-less analytics (e.g., Vercel Analytics) shall be used.

### 8.6 Browser Compatibility
- **NFR-020 (Must):** Verified parity across the latest 2 major versions of Google Chrome, Microsoft Edge, Mozilla Firefox, and Apple Safari (macOS), plus iOS Safari and Chrome for Android.
- **NFR-021 (Must):** Environments with hardware acceleration disabled or blocked WebGL contexts shall render the full DOM portfolio cleanly using the CSS/SVG fallback without unhandled console errors.

---

## 9. Loading, Error, Empty-State, and WebGL Fallback Behavior

| State / Scenario | Required System Behavior | Linked IDs |
| :--- | :--- | :--- |
| **Initial Load (3D Async Load)** | Render semantic HTML, Swiss grid layout, theme tokens, and Hero CTAs immediately. Mount WebGL canvas asynchronously with a smooth opacity fade-in once ready (no blocking preloader screen). | `FR-044`, `NFR-001` |
| **WebGL Unsupported / Context Lost / Crash** | Feature-detect WebGL2/WebGL1 support and wrap `<Canvas>` in a dedicated Error Boundary + `webglcontextlost` listener. Fall back cleanly to a high-craft CSS gradient/grid/SVG backdrop styled for Abyssal Teal or Crimson Void. | `FR-045`, `NFR-021` |
| **Reduced Motion Active** | Disable continuous 3D rotation/drift, scroll-scrubbed GSAP timelines, and floating Motion loops. Display static composed 3D frame or static fallback backdrop and instant anchor jumps. | `FR-039`, `NFR-010` |
| **Missing / Unsupplied Portrait Asset** | Until Austin Joshua supplies the portrait (`TBD`), or if the image fails to load, display a purposeful geometric/Swiss typographic frame in the About section—never a broken image icon or synthetic portrait. | `FR-008`, `FR-047` |
| **Missing / Unsupplied Résumé PDF** | Omit or cleanly disable the résumé CTA in Nav/Hero/About until a verified PDF asset path is supplied (`TBD`). | `FR-001`, `FR-009`, `FR-047` |
| **Empty / Filtered Data States** | If a project filter returns 0 items, show a clear inline message + "Show all projects" reset button. If `Experience` or `Achievements` have `TBD`/zero items during staging, display an intentional verified placeholder notice without layout collapse. | `FR-023`, `FR-046` |
| **Invalid Project Deep-Link (`?project=...`)** | Ignore unknown slug without crashing, default scroll to `#projects`, and optionally surface a brief dismissible notice (`FR-048`). | `FR-019`, `FR-048` |
| **Clipboard API Blocked** | If `navigator.clipboard.writeText` fails or is unavailable on "Copy Email", provide fallback copy/selection or direct `mailto:` prompt and announce status cleanly. | `FR-030` |

---

## 10. Prioritisation (MoSCoW)

| Priority | Functional Requirements (`FR-*`) | Non-Functional Requirements (`NFR-*`) | Count |
| :--- | :--- | :--- | :---: |
| **Must** | `FR-001`, `FR-002`, `FR-003`, `FR-004`, `FR-007`, `FR-008`, `FR-011`, `FR-012`, `FR-015`, `FR-016`, `FR-017`, `FR-022`, `FR-023`, `FR-026`, `FR-029`, `FR-030`, `FR-033`, `FR-034`, `FR-035`, `FR-038`, `FR-039`, `FR-044`, `FR-045`, `FR-046`, `FR-047` | `NFR-001`, `NFR-002`, `NFR-006`, `NFR-007`, `NFR-008`, `NFR-009`, `NFR-010`, `NFR-011`, `NFR-014`, `NFR-015`, `NFR-017`, `NFR-018`, `NFR-020`, `NFR-021` | **39** (25 FR, 14 NFR) |
| **Should** | `FR-005`, `FR-009`, `FR-013`, `FR-018`, `FR-019`, `FR-024`, `FR-027`, `FR-031`, `FR-036`, `FR-040`, `FR-041`, `FR-048` | `NFR-003`, `NFR-004`, `NFR-005`, `NFR-012`, `NFR-013`, `NFR-016`, `NFR-019` | **19** (12 FR, 7 NFR) |
| **Could** | `FR-006`, `FR-010`, `FR-014`, `FR-020`, `FR-021`, `FR-025`, `FR-028`, `FR-037`, `FR-042` | *None* | **9** (9 FR, 0 NFR) |
| **Won't (v1)** | `FR-032` (Contact form), `FR-043` (3D-only DOM-less navigation) | *None* | **2** (2 FR, 0 NFR) |

*Total cataloged requirements: **69** (48 Functional + 21 Non-Functional).*

---

## 11. Dependencies, Assumptions, Risks, and Unresolved Decisions

### Dependencies
- **Content & Assets from Austin Joshua:** Bio/About copy, Skills taxonomy, Projects metadata/media/links, Experience entries, Achievements, Contact email & social URLs, Portrait photo, Résumé PDF, and custom domain (if any).
- **Platform Services:** GitHub repository access and Vercel project linkage for preview/production deployments.
- **Downstream Architecture & Design Docs:** Design System specification (exact color hex/OKLCH values for Abyssal Teal, light-adapted Crimson Void, Liquid Chrome, Obsidian Gold, Burgundy Copper) and Technical Architecture document.

### Assumptions
- English is the sole language for v1.
- All portfolio records are maintained in version-controlled local TypeScript/JSON modules.
- GSAP + Motion and Three.js / React Three Fiber animations can be cleanly decoupled so WebGL and motion fallbacks work deterministically.

### Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| :--- | :--- | :---: | :--- |
| **3D / Glassmorphism breaks WCAG 2.2 AA contrast** | High | Medium | Enforce opaque/tinted scrims or higher-alpha glass cards behind text; test automated + manual contrast across both themes (`NFR-007`). |
| **Heavy WebGL bundle degrades mobile LCP/FPS** | High | Medium | Lazy-load 3D scene (`NFR-001`), cap DPR, scale mobile particle/shader density (`FR-041`), pause offscreen render loops (`NFR-004`). |
| **Delayed personal assets (portrait, résumé, projects)** | Medium | High | Build data-driven empty/fallback slots (`FR-008`, `FR-046`, `FR-047`) so architecture ships cleanly and assets drop in without refactoring. |
| **GSAP + Motion conflict on shared DOM nodes** | Medium | Low | Establish clear animation ownership boundaries in technical architecture (e.g., GSAP for scroll timelines, Motion for UI state/modals). |

### Unresolved Decisions (`TBD`)
1. **Exact Palette & Typography Tokens:** Exact color values for Abyssal Teal, light-adapted Crimson Void, Liquid Chrome, Obsidian Gold, and Burgundy Copper, plus chosen primary display/body/mono font families.
2. **All Personal Content & Links:** About narrative, degree/institution/graduation year, availability status, skills list, project portfolio items, experience entries, achievements, email address, and social URLs.
3. **Replaceable Asset Specs:** Final portrait file/aspect ratio and whether a résumé PDF will be included at initial launch.
4. **Optional `[Proposed]` Scope Items:** Confirmation on `FR-006`, `FR-010`, `FR-014`, `FR-020`, `FR-021`, `FR-025`, `FR-028`, `FR-042`.
5. **Domain, OG Assets & Analytics:** Custom domain name, Open Graph social preview image, and whether cookie-less Vercel Analytics will be enabled.
6. **Exact Performance Test Profile:** Specific Lighthouse throttling profile and final numeric budget if stricter than `NFR-002`/`NFR-003`.

---

## 12. Definition of Done (v1 Release Gate)

v1 of the Austin Joshua portfolio is considered **Done** only when all of the following conditions are verified on a production-like Vercel preview/live deployment:

1. **All `Must` Requirements Implemented:** All 39 `Must` requirements (`25` FR + `14` NFR) are implemented and verified against acceptance criteria.
2. **Confirmed Content Populated:** Either all `TBD` content fields (bio, skills, projects, experience, achievements, email, social links) are populated with Austin Joshua's verified data, or intentional replaceable/empty states are explicitly approved for staged launch—with **zero** fabricated placeholders.
3. **Dual-Theme & Contrast Verified:** Both **Abyssal Teal (default dark)** and **light-adapted Crimson Void** pass WCAG 2.2 AA automated checks (axe/Lighthouse) and manual contrast/keyboard/screen-reader inspection, with zero FOUC on reload.
4. **3D, Reduced Motion & Fallback Verified:** Interactive 3D Digital Universe runs smoothly within frame targets on desktop/mobile, stops/simplifies properly under `prefers-reduced-motion: reduce`, and degrades cleanly when WebGL is disabled or context is lost.
5. **Performance & Security Verified:** Core Web Vitals (`NFR-002`) and security headers (`NFR-018`) pass verification on Vercel; zero uncaught console errors or broken links across supported browsers (`NFR-020`).
6. **Repository & Deployment Clean:** TypeScript type-check, lint, and production Vite build pass cleanly in CI/Vercel from the main GitHub branch.
