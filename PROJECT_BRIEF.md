# Project Brief: Austin Joshua — Engineering Portfolio

**Document Status:** Draft for Stakeholder Confirmation  
**Owner:** Austin Joshua  
**Target Domain / URL:** `TBD`  
**Repository:** `TBD` (GitHub)  
**Hosting:** Vercel  

---

## 1. Project Overview and Vision

This project establishes a personal portfolio website for **Austin Joshua**, a Computer Science Engineering student and aspiring software/AI engineer.

**Vision:** Build a distinctive, immersive engineering portfolio that communicates technical ability, creativity, problem-solving, and project experience. Rather than presenting a static résumé, the site will pair interactive 3D spatial craft with disciplined Swiss editorial typography and glassmorphic depth—demonstrating engineering rigor directly through the medium of the web experience itself.

---

## 2. Problem Statement and Objectives

### Problem Statement
Standard developer portfolios often rely on generic templates that fail to differentiate early-career engineers or convey depth across software engineering and AI systems. Conversely, overly experimental 3D sites frequently sacrifice readability, accessibility, mobile usability, and load speed.

### Core Objectives
- **Demonstrate Craft & Technical Range:** Present Austin Joshua’s engineering work, skills, and problem-solving mindset in an interactive, memorable format.
- **Balance Spectacle with Clarity:** Fuse a 3D Digital Universe aesthetic with Swiss Experimental grid discipline so key information remains scannable and structured.
- **Support Dual-Theme Expression:** Deliver a cohesive experience across both **Dark (`Abyssal Teal`)** and **Light (`Crimson Void`, adapted for light surfaces)** themes.
- **Convert Audience Interest:** Make it effortless for recruiters, hiring managers, and collaborators to inspect projects, verify credentials, and initiate contact.
- **Maintain Production Standards:** Achieve high responsiveness, accessibility compliance, and fast performance across desktop and mobile devices.

---

## 3. Target Audience

| Audience Segment | Primary Needs & Expectations | Key Friction to Avoid |
| :--- | :--- | :--- |
| **Technical Recruiters & Talent Acquisition** | Rapidly understand role fit (Software / AI Engineering), education status, core stack, and contact/résumé access. | Buried contact info, unclear role focus, slow initial load. |
| **Engineering Managers & Senior Engineers** | Evaluate real project architecture, problem-solving depth, code quality (via GitHub/live demos), and technical rigor. | Fluff descriptions without technical substance or broken links. |
| **AI / Research Collaborators & Peers** | Explore technical experimentation, shared interests, and potential collaboration opportunities. | Overly rigid corporate tone with no creative or technical personality. |
| **Hackathon Organizers / Potential Clients** | Assess execution speed, achievements, versatility, and reliability. | Unclear track record or missing proof of shipped work. |

---

## 4. Brand Identity and Positioning

- **Name:** Austin Joshua
- **Discipline:** Computer Science Engineering Student | Aspiring Software & AI Engineer
- **Positioning Statement:** An engineer bridging foundational software systems, intelligent/AI applications, and high-craft interactive frontends—combining analytical structure with creative execution.
- **Tone of Voice:** Confident, precise, curious, and substance-first; avoids hyperbole and empty buzzwords.
- **Visual Direction:**
  - **Aesthetic Pillars:** 3D Digital Universe + Swiss Experimental + Glassmorphism.
  - **Typography & Layout:** Strong typographic hierarchy, structured asymmetric/modular grids, deliberate whitespace, and clear visual anchoring.
  - **Color System:**
    - **Dark Theme (Primary / `TBD` default):** Abyssal Teal.
    - **Light Theme:** Crimson Void (adapted for light surfaces, maintaining legibility and contrast).
    - **Secondary Accents:** Liquid Chrome, Obsidian Gold, and Burgundy Copper.
  - **Personal Imagery:** A portrait of Austin Joshua will be supplied later; no placeholder AI-generated or fabricated portrait will be invented. Until provided, layout specifications will reserve an explicit `TBD` portrait slot/graceful fallback.

---

## 5. Core Experience and Website Sections

The portfolio is structured into seven core sections, supported by global navigation, theme switching, and interactive 3D ambient/focal elements:

1. **Hero**
   - Immediate statement of identity (**Austin Joshua**), role positioning (Computer Science Engineering student; aspiring Software/AI Engineer), and a concise value proposition (`TBD`).
   - Primary 3D Digital Universe focal canvas integrated with Swiss typographic framing.
   - Direct calls to action (e.g., explore projects, contact, résumé download `TBD`).
2. **About**
   - Concise narrative covering academic background in Computer Science Engineering, engineering philosophy, focus areas across software and AI, and reserved portrait media (`TBD`—to be supplied).
3. **Skills**
   - Structured breakdown of languages, frameworks, AI/ML tooling, systems/backend, frontend/creative tech, and developer tools (`TBD` exact inventory).
   - Presented with clear categorization rather than arbitrary percentage bars.
4. **Projects**
   - Curated showcase of software and AI engineering projects (`TBD` project list, descriptions, architectures, media, GitHub/live URLs).
   - Emphasizes problem statement, technical approach, stack, and outcomes.
5. **Experience**
   - Timeline or structured record of internships, research, engineering roles, freelance work, or relevant leadership (`TBD` entries).
6. **Achievements**
   - Notable milestones such as hackathon placements, certifications, academic honors, publications, or open-source recognitions (`TBD` entries).
7. **Contact**
   - Direct contact channels (email, LinkedIn, GitHub, other profiles `TBD`) and/or contact form (`TBD` delivery mechanism).

---

## 6. Design and Interaction Principles

- **Cinematic, Fluid & Expressive Motion:** Scroll choreography, section transitions, and micro-interactions should feel intentional and physically grounded, never gratuitous or blocking.
- **Swiss Grid Discipline Meets Spatial Depth:** Glassmorphic surfaces and 3D canvas layers must enhance hierarchy rather than obscure text contrast or grid alignment.
- **Dual-Theme Parity:** Both *Abyssal Teal* (dark) and light-adapted *Crimson Void* must feel purposefully authored, with Liquid Chrome, Obsidian Gold, and Burgundy Copper accents calibrated for contrast in each mode.
- **Graceful Degradation & Reduced Motion:** Interactive 3D and GSAP/Motion animations must respect `prefers-reduced-motion` and scale gracefully on low-power or non-WebGL devices.
- **Zero-Gimmick Content Priority:** Every animation or shader effect exists to frame engineering substance—never to delay access to project details, links, or contact actions.

---

## 7. Technology Direction

| Layer | Planned Technology | Rationale |
| :--- | :--- | :--- |
| **UI Framework** | React + TypeScript | Component modularity, strong typing, maintainable architecture. |
| **Build Tooling** | Vite | Fast local dev server, optimized production bundling and code splitting. |
| **Styling** | Tailwind CSS | Utility-first consistency, clean design token mapping for dual themes. |
| **3D / WebGL** | Three.js / React Three Fiber | Declarative 3D Digital Universe scene integration within React. |
| **Animation** | GSAP + Motion | Precision scroll/timeline choreography (GSAP) paired with declarative UI/layout transitions (Motion). |
| **Source Control** | GitHub | Version control, CI integration, and portfolio transparency. |
| **Deployment** | Vercel | Zero-config Vite/React builds, preview deployments, edge caching. |

*Note: Exact package versions, supplementary libraries (e.g., `drei`, icon sets, form handlers, analytics), and architectural boundaries will be defined in subsequent technical specification documents.*

---

## 8. Performance, Accessibility, and Responsiveness Goals

Because target quantitative SLAs have not yet been locked, baseline engineering targets are framed qualitatively with explicit thresholds marked `TBD`:

- **Performance:**
  - Fast initial content paint by deferring/lazy-loading heavy 3D assets and keeping critical CSS/JS lean.
  - Smooth rendering frame rate during scroll and 3D interactions across standard consumer laptops and mobile devices.
  - Specific Lighthouse / Core Web Vitals targets (LCP, INP, CLS): `TBD`.
- **Accessibility:**
  - Target WCAG compliance level: `TBD` (recommended baseline: WCAG 2.1 AA).
  - Full keyboard navigability, visible focus indicators, semantic landmarks, proper heading order, and screen-reader-friendly labels for interactive 3D/theme controls.
  - Verified color contrast across both Abyssal Teal and light-adapted Crimson Void themes, including glassmorphic surfaces.
  - Complete support for `prefers-reduced-motion` and `prefers-color-scheme`.
- **Responsiveness:**
  - Fluid adaptation across mobile, tablet, laptop, and ultrawide viewports.
  - Touch-friendly targets and tuned 3D complexity/fallback behavior on mobile viewports to protect battery and thermal performance.

---

## 9. Project Scope and Exclusions

### In Scope (v1)
- Design and architecture of the single-page or multi-view portfolio covering Hero, About, Skills, Projects, Experience, Achievements, and Contact.
- Dual-theme system (*Abyssal Teal* dark theme and light-adapted *Crimson Void* light theme) with secondary accent tokens.
- Interactive 3D Digital Universe visuals, Swiss Experimental layouts, Glassmorphism UI components, and GSAP/Motion choreography.
- Responsive layouts, accessibility safeguards, and deployment pipeline via GitHub and Vercel.
- Placeholder/reserved slot for Austin Joshua's portrait pending asset delivery.

### Explicit Exclusions (v1 unless later confirmed)
- Fabricating placeholder personal details, résumé entries, achievements, metrics, or external links.
- Generating or inventing a synthetic portrait replacement.
- Full CMS / admin dashboard, blog engine, or user authentication (`TBD` if desired in a future phase).
- Custom backend infrastructure beyond lightweight serverless contact handling (if a form is chosen; `TBD`).

---

## 10. Success Criteria

- **Brand & Aesthetic Cohesion:** The finished site authentically embodies 3D Digital Universe + Swiss Experimental + Glassmorphism across both *Abyssal Teal* and *Crimson Void* (light-adapted) themes.
- **Clarity of Narrative:** First-time visitors immediately understand who Austin Joshua is, his focus in Software & AI Engineering, and how to review his work or get in touch.
- **Technical Credibility:** All shipped projects, links, and credentials are accurate, verifiable, and free of placeholder fluff.
- **Cross-Device Quality:** Smooth, accessible, responsive behavior verified across desktop and mobile browsers without layout breaks or motion sickness triggers.
- **Production Readiness:** Clean GitHub repository and live Vercel deployment with verified build health and defined SEO/metadata (`TBD` copy/OG assets).

---

## 11. Assumptions and Information Requiring Confirmation

### Working Assumptions
1. The portfolio will be authored primarily in English (`TBD` if multilingual support is needed).
2. Content will initially be managed locally in structured TypeScript/JSON data modules rather than an external headless CMS.
3. Heavy 3D assets/shaders will be progressively enhanced so core content remains accessible even if WebGL is unavailable or disabled.
4. No personal metrics, dates, company names, awards, or URLs will be assumed prior to user input.

### Information Requiring Confirmation from Austin Joshua
Please confirm or provide the following before proceeding to design/content architecture and implementation:

1. **Theme & Visual Defaults**
   - Should **Dark (`Abyssal Teal`)** or **Light (`Crimson Void`)** be the default initial theme when system preference is neutral or on first visit?
   - Are exact hex/OKLCH palette values already defined for *Abyssal Teal*, *Crimson Void*, *Liquid Chrome*, *Obsidian Gold*, and *Burgundy Copper*, or should they be proposed in the design specification?
2. **Personal Details & Links (`TBD`)**
   - Preferred bio / About narrative, university/degree details, graduation year, and location/availability (e.g., internships, full-time roles, remote/relocation).
   - Contact email, GitHub URL, LinkedIn URL, and any additional profiles (X/Twitter, Hugging Face, Kaggle, personal blog, etc.).
   - Whether a downloadable résumé/CV PDF will be included (`Yes / No / Later`).
   - Timeline for supplying the personal portrait and preferred framing/aspect ratio if known.
3. **Portfolio Content (`TBD`)**
   - **Skills:** Confirmed list of programming languages, AI/ML frameworks, web/systems technologies, and tools.
   - **Projects:** List of projects to feature (titles, problem/solution summaries, tech stacks, role, live/repo links, screenshots/media).
   - **Experience:** Internships, research assistantships, engineering roles, or organizations with dates and responsibilities.
   - **Achievements:** Hackathons, awards, certifications, publications, or notable milestones.
4. **Functional & Technical Preferences (`TBD`)**
   - **Contact mechanism:** Direct `mailto:` + social links only, or an interactive contact form (e.g., Vercel serverless function / Resend / Formspree)?
   - **Navigation model:** Single continuous scroll landing experience with deep project modals/drawers, or dedicated routes (e.g., `/projects/:slug`)?
   - **Domain & Analytics:** Custom domain plans and whether privacy-friendly analytics (e.g., Vercel Analytics) should be included.
   - **Target Benchmarks:** Specific Lighthouse/Core Web Vitals thresholds and WCAG level (e.g., WCAG 2.1 AA).
