# Austin-Portfolio

**AJ Cosmic Universe** — Interactive 3D solar-system engineering portfolio for Austin Joshua built with React 19, TypeScript, Vite, Tailwind CSS v4, Three.js / React Three Fiber, GSAP, and Motion.

## Website Routes

All portfolio sections and project detail modals use clean path routes handled smoothly via History API + Vercel SPA rewrites (`vercel.json`):

| Route | Destination |
| --- | --- |
| `/` | Sun Overview (Hero) |
| `/about` | About (`Terra Cyan`) |
| `/skills` | Skills (`Aether Violet`) |
| `/projects` | Projects (`Pyros Amber`) |
| `/projects/:slug` | Project Detail Modal (`agriflux`, `civiq`, `resq-meal`, `rit-digital-twin`, `neuroram`) |
| `/experience` | Experience (`Viridis Teal`) |
| `/achievements` | Achievements (`Stella Gold`) |
| `/contact` | Contact (`Nova Rose`) |

Legacy hash URLs (`/#achievements`) and query links (`/?project=agriflux#projects`) automatically normalize to their canonical routes on load.

## Project Structure

- `src/routes/` — Canonical route registry, path parsers, title builders, and legacy URL normalizers
- `src/components/layout/` — Intro curtain loader, navigation shell, section shell, rail, progress bar, and footer
- `src/components/sections/` — Seven routed planetary sections (`HeroSection` through `ContactSection`)
- `src/components/ui/` — Reusable UI primitives (`SideReveal`, `HeroPortraitReveal`, `SoundToggle`, `SolarSystemHud`, `ProjectDetailModal`)
- `src/context/` — Motion preference and 3D Universe navigation providers
- `src/data/` — Typed portfolio content (`profile`, `skills`, `projects`, `experience`, `achievements`, `contact`, `sections`)
- `src/three/` — Persistent Three.js / R3F solar system canvas, planets, procedural textures, camera rig, and WebGL fallback
- `src/hooks/`, `src/motion/`, `src/styles/`, `src/types/`, `src/utils/` — Hooks, GSAP/Motion presets, design tokens, types, sound, and gyro utilities
- `public/` — Static public assets (`/assets/brand/`, `/assets/portrait/`, `/assets/resume/`, `/fonts/`, favicons, `robots.txt`)
- `docs/` — Product requirements, architecture specs, and UI/UX documentation
- `tests/` — Unit tests (`tests/unit/`), hook/component integration tests (`tests/hooks/`, `tests/components/`), and Chromium/Firefox/WebKit E2E tests (`tests/e2e/`)

## Local Development

Install dependencies cleanly using the committed lockfile:

```bash
npm ci
npm run dev
```

## Verification Commands

```bash
npm run typecheck   # TypeScript strict check (tsc -b --noEmit)
npm run lint        # ESLint with TypeScript, React Hooks & jsx-a11y rules
npm run test        # Vitest unit, component & vitest-axe suite
npm run build       # Production Vite bundle output to dist/
npx playwright test # Cross-browser Chromium, Firefox & WebKit E2E + axe suite
```

## CI & Vercel Deployment Configuration

- **GitHub Actions CI (`.github/workflows/ci.yml`):** Runs `npm ci`, `typecheck`, `lint`, `test`, `build`, and `playwright test` across Chromium, Firefox, and WebKit on pull requests and pushes to `main`.
- **Vercel Configuration (`vercel.json`):** Uses Vite preset (`installCommand: "npm ci"`, `buildCommand: "npm run build"`, `outputDirectory: "dist"`), SPA path rewrites to `/index.html`, immutable caching on `/assets/*` and `/fonts/*`, and strict HTTP security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and `Content-Security-Policy` with SHA-256 hash authorization for the inline pre-paint script in `index.html`).
- **CSP Reminder:** Any future edit to the inline pre-paint script in `index.html` requires regenerating its SHA-256 hash in `vercel.json`.
