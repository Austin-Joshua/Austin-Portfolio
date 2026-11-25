# Austin-Portfolio

Personal engineering portfolio for Austin Joshua built with React, TypeScript, Vite, Tailwind CSS v4, Three.js / React Three Fiber, GSAP, and Motion.

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
- **Vercel Configuration (`vercel.json`):** Uses Vite preset (`installCommand: "npm ci"`, `buildCommand: "npm run build"`, `outputDirectory: "dist"`), immutable caching on `/assets/*` and `/fonts/*`, and strict HTTP security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and `Content-Security-Policy` with SHA-256 hash authorization for the inline pre-paint theme script in `index.html`).
- **CSP Reminder:** Any future edit to the inline pre-paint script in `index.html` requires regenerating its SHA-256 hash in `vercel.json`.
