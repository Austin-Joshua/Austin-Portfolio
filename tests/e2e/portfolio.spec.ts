import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const REQUIRED_VIEWPORTS = [
  { name: '320x700', width: 320, height: 700 },
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1440', width: 2560, height: 1440 },
] as const;

const SECTION_IDS = [
  'hero',
  'about',
  'skills',
  'projects',
  'experience',
  'achievements',
  'contact',
] as const;

async function waitForIntroToFinish(page: Page) {
  await expect(page.getByTestId('cosmic-intro-loader')).toHaveCount(0, { timeout: 6000 });
}

async function dismissIntroForSuite(page: Page) {
  await page
    .evaluate(() => {
      const overlay = document.querySelector('[data-testid="cosmic-intro-loader"]');
      if (overlay instanceof HTMLElement) {
        overlay.click();
      }
    })
    .catch(() => undefined);
  await expect(page.getByTestId('cosmic-intro-loader')).toHaveCount(0, { timeout: 6000 });
}

test.describe('AJ Cosmic Universe — Production E2E Verification', () => {
  test('plays Cosmic Intro curtain loader on load/refresh, supports click-to-skip/Escape/reduced-motion, and handles restricted storage', async ({
    browser,
  }) => {
    test.setTimeout(150_000);
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // First visit shows Infinitus-style AJ medallion, ambient cosmic aura, and left/right curtains without a Skip button
    await page.clock.install({ time: 1000 });
    await page.clock.pauseAt(1500);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.clock.fastForward(450);
    const loader = page.getByTestId('cosmic-intro-loader');
    await expect(loader).toBeVisible();
    await expect(page.getByTestId('intro-skip-button')).toHaveCount(0);
    await expect(page.getByTestId('intro-curtain-left')).toBeVisible();
    await expect(page.getByTestId('intro-curtain-right')).toBeVisible();
    await expect(page.getByTestId('intro-cosmic-aura')).toBeVisible();
    await expect(loader.locator('img[src="/assets/brand/aj-emblem.png"]')).toBeVisible();

    // Completes automatically across holding (800ms) -> splitting -> done (1400ms)
    await page.clock.fastForward(600);
    await page.clock.fastForward(650);
    await expect(page.getByTestId('cosmic-intro-loader')).toHaveCount(0);

    // Subsequent full page reload OR fresh navigation REPLAYS the intro loader every refresh
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.clock.fastForward(350);
    await expect(page.getByTestId('cosmic-intro-loader')).toBeVisible();
    await page.clock.fastForward(650);
    await page.clock.fastForward(650);
    await expect(page.getByTestId('cosmic-intro-loader')).toHaveCount(0);

    await page.goto('about:blank');
    await page.goto('/projects', { waitUntil: 'domcontentloaded' });
    await page.clock.fastForward(350);
    await expect(page.getByTestId('cosmic-intro-loader')).toBeVisible();
    await page.clock.fastForward(650);
    await page.clock.fastForward(650);
    await expect(page.getByTestId('cosmic-intro-loader')).toHaveCount(0);
    await context.close();

    // Clicking anywhere on overlay OR pressing Escape dismisses immediately
    const clickContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const clickPage = await clickContext.newPage();
    await clickPage.clock.install({ time: 1000 });
    await clickPage.clock.pauseAt(1500);
    await clickPage.goto('/', { waitUntil: 'domcontentloaded' });
    await clickPage.clock.fastForward(350);
    await expect(clickPage.getByTestId('cosmic-intro-loader')).toBeVisible();
    await clickPage.getByTestId('cosmic-intro-loader').click({ force: true });
    await expect(clickPage.getByTestId('cosmic-intro-loader')).toHaveCount(0);
    await clickContext.close();

    const escContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const escPage = await escContext.newPage();
    await escPage.clock.install({ time: 1000 });
    await escPage.clock.pauseAt(1500);
    await escPage.goto('/', { waitUntil: 'domcontentloaded' });
    await escPage.clock.fastForward(350);
    await expect(escPage.getByTestId('cosmic-intro-loader')).toBeVisible();
    await escPage.keyboard.press('Escape');
    await expect(escPage.getByTestId('cosmic-intro-loader')).toHaveCount(0);
    await escContext.close();

    // Restricted / throwing localStorage never traps user on intro
    const restrictedContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await restrictedContext.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('Blocked storage', 'SecurityError');
        },
      });
    });
    const restrictedPage = await restrictedContext.newPage();
    await restrictedPage.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForIntroToFinish(restrictedPage);
    await expect(restrictedPage.locator('h1')).toHaveText('Austin Joshua');
    await restrictedContext.close();
  });

  test('enforces single dark Cosmic Universe theme, verified content, Solar System HUD, interactive sections, and zero errors', async ({
    page,
    browserName,
  }) => {
    test.setTimeout(90_000);
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await waitForIntroToFinish(page);

    // Permanent dark theme only; zero light-mode toggles anywhere
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('button[aria-label*="Switch to Scarlet Porcelain" i]')).toHaveCount(0);
    await expect(page.locator('[data-testid="theme-toggle"]')).toHaveCount(0);

    // Single H1 & ordered 7 sections
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('Austin');
    await expect(page.locator('h1')).toContainText('Joshua');

    const renderedIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main section[id]')).map((el) => el.id),
    );
    expect(renderedIds).toEqual([...SECTION_IDS]);

    // Automated axe WCAG scan & keyboard SkipLink before any pointer interactions shift focus anchor
    const axeResult = await new AxeBuilder({ page }).analyze();
    expect(axeResult.violations).toEqual([]);

    const skipLink = page.locator('a[href="#main-content"]');
    if (browserName === 'webkit') {
      await skipLink.focus();
    } else {
      await page.keyboard.press('Tab');
    }
    await expect(skipLink).toBeFocused();
    await skipLink.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();

    // Honest neutral Experience state, verified Achievements awards, zero contact forms/TBD, zero section border dividers
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await expect(page.getByText('No experience entries added yet.')).toBeVisible();

    const achievementsSection = page.locator('#achievements');
    await achievementsSection.scrollIntoViewIfNeeded();
    await expect(
      achievementsSection.getByRole('heading', { name: 'Best Performance Award — Techathon 2K26' }),
    ).toBeVisible();
    await expect(
      achievementsSection.getByRole('heading', { name: 'Best Prototype Award — Code of Thrones' }),
    ).toBeVisible();
    await expect(
      achievementsSection.getByRole('heading', { name: "Impact Ignite Award — INNOCLASH '26" }),
    ).toBeVisible();
    await expect(page.locator('form')).toHaveCount(0);

    const sectionBorderWidths = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main section[id]')).map((sec) =>
        parseFloat(getComputedStyle(sec).borderTopWidth || '0'),
      ),
    );
    expect(sectionBorderWidths.every((w) => w === 0)).toBe(true);

    // Sound toggle persists user preference
    const soundBtn = page.getByTestId('sound-toggle-button').first();
    await expect(soundBtn).toHaveAttribute('aria-pressed', 'true');
    await soundBtn.click();
    await expect(soundBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(
      page.evaluate(() => window.localStorage.getItem('aj_cosmic_sound_enabled')),
    ).resolves.toBe('false');
    await soundBtn.click();
    await expect(soundBtn).toHaveAttribute('aria-pressed', 'true');

    // Return to Hero top for Gyroscope verification
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(150);

    // Gyroscope DeviceOrientation drives portrait tilt + glare sheen across Chromium/Firefox/WebKit
    await page.evaluate(() => {
      window.dispatchEvent(
        Object.assign(new Event('deviceorientation'), {
          alpha: 0,
          beta: 62,
          gamma: 18,
        }),
      );
    });
    await expect(page.getByTestId('hero-portrait-figure')).toHaveAttribute('data-gyro-active', 'true');
    await expect(page.getByTestId('gyro-specular-glare')).toHaveCSS('opacity', '0.65');

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/\bTBD\b|Lorem ipsum/i);

    // Solar System HUD navigation + reset + Atomic Skills cross-ref + 5 Project Worlds
    const hud = page.getByTestId('solar-system-hud');
    await expect(hud).toBeVisible();
    await page.getByTestId('planet-nav-skills').hover();
    await expect(hud).toContainText('Aether Violet · Molecular Core');
    await page.getByTestId('planet-nav-skills').click();
    await expect(page).toHaveURL(/\/skills$/);

    await page.getByTestId('skill-atom-typescript').click();
    await expect(page.getByTestId('skill-cross-reference')).toBeVisible();
    await expect(page.getByTestId('skill-cross-reference')).toContainText('AgriFlux');

    // Scroll to bottom shows Scroll-to-Top button which returns smoothly to root /
    await page.getByTestId('planet-nav-contact').evaluate((el) => el.scrollIntoView());
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    const scrollTopBtn = page.getByTestId('scroll-to-top-button');
    await expect(scrollTopBtn).toBeVisible();
    await scrollTopBtn.click();
    await page.waitForTimeout(450);
    await expect(page).toHaveURL(/\/$/);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('recovers cleanly on invalid /projects/:slug and legacy ?project= deep links without crashing', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/projects/invalid-project-slug', { waitUntil: 'networkidle' });
    await waitForIntroToFinish(page);

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('invalid-project-notice')).toBeVisible();
    await expect(page).toHaveURL(/\/projects$/);

    await page.getByRole('button', { name: /Dismiss invalid project link notice/i }).click();
    await expect(page.getByTestId('invalid-project-notice')).toHaveCount(0);

    // Legacy ?project= fallback also recovers cleanly to /projects
    await page.goto('/?project=invalid-project-slug', { waitUntil: 'networkidle' });
    await waitForIntroToFinish(page);
    await expect(page.getByTestId('invalid-project-notice')).toBeVisible();
    await expect(page).toHaveURL(/\/projects$/);
    expect(pageErrors).toEqual([]);
  });

  test('renders UniverseFallback safely when WebGL is disabled and honors prefers-reduced-motion', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion: 'reduce',
    });
    await context.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext.bind(HTMLCanvasElement.prototype);
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
          return null;
        }
        return (orig as (...params: unknown[]) => unknown).call(this, type, ...args);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });

    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/', { waitUntil: 'networkidle' });
    // Reduced motion should bypass intro immediately
    await expect(page.getByTestId('cosmic-intro-loader')).toHaveCount(0);

    const fallback = page.getByTestId('universe-fallback');
    await expect(fallback).toBeVisible();
    await expect(fallback).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#about [data-reduced-motion]')).toHaveAttribute(
      'data-reduced-motion',
      'true',
    );

    const hiddenSections = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main section[id]')).filter(
        (sec) => parseFloat(getComputedStyle(sec).opacity) < 0.99,
      ).length,
    );
    expect(hiddenSections).toBe(0);
    expect(errors).toEqual([]);

    await context.close();
  });

  test('maintains zero horizontal overflow, valid touch targets, and 200% zoom stability across all 10 viewports', async ({
    page,
    browserName,
  }) => {
    test.setTimeout(180_000);

    await page.addInitScript(() => {
      window.localStorage.setItem('aj-cosmic-intro-seen', '1');
    });

    for (const vp of REQUIRED_VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'load' });
      await dismissIntroForSuite(page);
      await page.waitForTimeout(100);

      const metrics = await page.evaluate(() => {
        const html = document.documentElement;
        const targets = Array.from(
          document.querySelectorAll('a, button, [role="tab"], [role="button"]'),
        )
          .filter((el) => !el.className?.toString().includes('sr-only'))
          .map((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return {
              w: rect.width,
              h: rect.height,
              visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden',
            };
          })
          .filter((t) => t.visible);

        return {
          overflowX: html.scrollWidth - html.clientWidth,
          undersizedCount: targets.filter((t) => t.w < 23.5 || t.h < 23.5).length,
        };
      });

      expect(metrics.overflowX, `Overflow at ${vp.name}`).toBeLessThanOrEqual(0);
      expect(metrics.undersizedCount, `Undersized target at ${vp.name}`).toBe(0);
    }

    // 200% text-size scaling across all engines + 200% browser zoom on Chromium
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    const textZoomOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(textZoomOverflow).toBeLessThanOrEqual(0);

    if (browserName === 'chromium') {
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '';
        (document.documentElement.style as CSSStyleDeclaration & { zoom?: string }).zoom = '2';
      });
      const browserZoomOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(browserZoomOverflow).toBeLessThanOrEqual(0);
    }
  });

  test('serves SEO metadata and baseline robots.txt cleanly', async ({ page, request }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('aj-cosmic-intro-seen', '1');
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle('Austin Joshua — AJ Cosmic Universe');

    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc?.length ?? 0).toBeGreaterThan(30);

    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain('User-agent: *');
    expect(robotsText).toContain('Allow: /');
  });

  test('verifies AJ emblem, icon controls, Hero 3D composition & transparent cutout, asset MIME types, hash routing, and Back/Forward history', async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);
    await page.addInitScript(() => {
      window.localStorage.setItem('aj-cosmic-intro-seen', '1');
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await waitForIntroToFinish(page);

    // Navbar uses AJ circular emblem ONLY (no AJ // or Cosmic Universe text, no Download icon)
    await expect(page.locator('header').getByText('AJ //')).toHaveCount(0);
    await expect(page.locator('header').getByText(/Cosmic Universe/i)).toHaveCount(0);
    await expect(page.locator('header a[download]')).toHaveCount(0);
    const navEmblem = page.locator('header img[src="/assets/brand/aj-emblem.png"]').first();
    await expect(navEmblem).toBeVisible();
    const emblemAlphaCheck = await navEmblem.evaluate((el) => {
      const img = el as HTMLImageElement;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D canvas unavailable');
      ctx.drawImage(img, 0, 0);
      return {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        cornerAlpha: ctx.getImageData(4, 4, 1, 1).data[3],
        centerRingAlpha: ctx.getImageData(256, 46, 1, 1).data[3],
      };
    });
    expect(emblemAlphaCheck.naturalWidth).toBe(512);
    expect(emblemAlphaCheck.naturalHeight).toBe(512);
    expect(emblemAlphaCheck.cornerAlpha).toBeLessThan(10);
    expect(emblemAlphaCheck.centerRingAlpha).toBeGreaterThan(200);

    // Persistent full-viewport Solar System layer present & centered handwritten 3D Hero stage contains H1 + Portrait
    await expect(
      page.locator('[data-testid="universe-canvas-wrapper"], [data-testid="universe-fallback"]').first(),
    ).toBeVisible();
    const stageBox = await page.getByTestId('hero-3d-stage').boundingBox();
    const headingBox = await page.locator('#hero h1').boundingBox();
    expect(stageBox).not.toBeNull();
    expect(headingBox).not.toBeNull();
    expect(stageBox!.width).toBeGreaterThan(300);
    expect(stageBox!.height).toBeGreaterThan(300);
    expect(headingBox!.y).toBeGreaterThanOrEqual(stageBox!.y - 8);

    // Phase 2 structural polish invariants: single portrait globally (Hero only), single social relay (Contact only), single Back-to-Top
    await expect(page.locator('img[src="/assets/portrait/austin-joshua-cutout.png"]')).toHaveCount(1);
    await expect(page.locator('#about img')).toHaveCount(0);
    await expect(page.locator('#hero a[href*="github.com"], #hero a[href*="linkedin.com"]')).toHaveCount(0);
    await expect(page.locator('footer a[href*="github.com"], footer a[href*="linkedin.com"]')).toHaveCount(0);
    await expect(page.locator('footer a[href="/"]')).toHaveCount(0);
    await expect(page.getByTestId('contact-relay-dock').locator('a[href*="github.com"]')).toHaveCount(1);
    await expect(page.getByTestId('contact-relay-dock').locator('a[href*="linkedin.com"]')).toHaveCount(1);

    // Hero portrait cutout: real PNG transparency + silhouette->colour hover/click/focus states
    const failedPortraitRequests: Array<{ url: string; status: number }> = [];
    page.on('response', (res) => {
      if (res.url().includes('austin-joshua-cutout.png') && res.status() >= 400) {
        failedPortraitRequests.push({ url: res.url(), status: res.status() });
      }
    });

    const heroPortrait = page.getByTestId('hero-portrait-figure');
    const heroToggle = page.getByTestId('portrait-reveal-toggle');
    const heroImg = heroPortrait.locator('img');
    await expect(heroImg).toBeVisible();

    const canvasAlphaCheck = await heroImg.evaluate((el) => {
      const img = el as HTMLImageElement;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D canvas unavailable');
      ctx.drawImage(img, 0, 0);
      const readAlpha = (x: number, y: number) => ctx.getImageData(x, y, 1, 1).data[3];
      return {
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        bgTopLeft: readAlpha(15, 15),
        bgUpperRight: readAlpha(544, 80),
        bgLeftMid: readAlpha(30, 400),
        subjectForehead: readAlpha(290, 145),
        subjectCheek: readAlpha(270, 210),
        subjectShirt: readAlpha(300, 450),
      };
    });
    expect(failedPortraitRequests).toEqual([]);
    expect(canvasAlphaCheck.complete).toBe(true);
    expect(canvasAlphaCheck.naturalWidth).toBe(604);
    expect(canvasAlphaCheck.naturalHeight).toBe(806);
    expect(canvasAlphaCheck.bgTopLeft).toBeLessThan(255);
    expect(canvasAlphaCheck.bgUpperRight).toBeLessThan(255);
    expect(canvasAlphaCheck.bgLeftMid).toBeLessThan(255);
    expect(canvasAlphaCheck.subjectForehead).toBeGreaterThan(245);
    expect(canvasAlphaCheck.subjectCheek).toBeGreaterThan(245);
    expect(canvasAlphaCheck.subjectShirt).toBeGreaterThan(245);

    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'false');

    const beforeRevealBox = await heroImg.boundingBox();
    await heroToggle.hover();
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'true');
    const afterRevealBox = await heroImg.boundingBox();
    expect(Math.abs(beforeRevealBox!.y - afterRevealBox!.y)).toBeLessThan(2);

    await page.mouse.move(10, 10);
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'false');

    await heroToggle.click();
    await expect(heroToggle).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(10, 10);
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'true');
    await heroToggle.click();
    await expect(heroToggle).toHaveAttribute('aria-pressed', 'false');
    await page.mouse.move(10, 10);
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'false');

    // Keyboard focus keeps reveal active until blur
    await page.getByTestId('desktop-section-rail').locator('a').last().focus();
    await page.keyboard.press('Tab');
    await expect(heroToggle).toBeFocused();
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'true');
    await page.keyboard.press('Enter');
    await expect(heroToggle).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Space');
    await expect(heroToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(heroToggle).toBeFocused();
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'true');
    await page.keyboard.press('Tab');
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'false');

    // Static assets HTTP 200 & accurate Content-Types
    const emblemRes = await request.get('/assets/brand/aj-emblem.png');
    expect(emblemRes.status()).toBe(200);
    expect(emblemRes.headers()['content-type']).toContain('image/png');

    const faviconRes = await request.get('/favicon.png');
    expect(faviconRes.status()).toBe(200);
    expect(faviconRes.headers()['content-type']).toContain('image/png');

    const faviconIcoRes = await request.get('/favicon.ico');
    expect(faviconIcoRes.status()).toBe(200);

    const portraitRes = await request.get('/assets/portrait/austin-joshua-cutout.png');
    expect(portraitRes.status()).toBe(200);
    expect(portraitRes.headers()['content-type']).toContain('image/png');
    expect((await portraitRes.body()).byteLength).toBeGreaterThan(20_000);

    const resumeRes = await request.get('/assets/resume/Austin_Joshua_Resume.pdf');
    expect(resumeRes.status()).toBe(200);
    expect(resumeRes.headers()['content-type']).toContain('application/pdf');
    expect((await resumeRes.body()).byteLength).toBeGreaterThan(10_000);

    const fontRes = await request.get('/fonts/syne-700-latin.woff2');
    expect(fontRes.status()).toBe(200);
    expect(fontRes.headers()['content-type']).toMatch(/font\/woff2|application\/font-woff2|application\/octet-stream/);

    // Direct load and reload of all 7 canonical page routes
    const sectionRoutes: Array<{ id: (typeof SECTION_IDS)[number]; path: string }> = [
      { id: 'hero', path: '/' },
      { id: 'about', path: '/about' },
      { id: 'skills', path: '/skills' },
      { id: 'projects', path: '/projects' },
      { id: 'experience', path: '/experience' },
      { id: 'achievements', path: '/achievements' },
      { id: 'contact', path: '/contact' },
    ];

    for (const route of sectionRoutes) {
      await page.goto(route.path, { waitUntil: 'load' });
      await dismissIntroForSuite(page);
      await page.waitForTimeout(120);
      await expect(page).toHaveURL(new RegExp(`${route.path === '/' ? '\\/$' : `${route.path}$`}`));
      const railActive = page.getByTestId('desktop-section-rail').locator(`a[href="${route.path}"]`);
      await expect(railActive).toHaveAttribute('aria-current', 'location');
    }

    // Reload on /contact stays anchored cleanly on Contact
    await page.reload({ waitUntil: 'load' });
    await dismissIntroForSuite(page);
    await page.waitForTimeout(150);
    const contactTop = await page.locator('#contact').evaluate((el) => el.getBoundingClientRect().top);
    expect(contactTop).toBeGreaterThanOrEqual(0);
    expect(contactTop).toBeLessThan(400);

    // Legacy hash URL /#achievements canonicalizes cleanly to /achievements
    await page.goto('/#achievements', { waitUntil: 'load' });
    await dismissIntroForSuite(page);
    await expect(page).toHaveURL(/\/achievements$/);

    // Canonical /projects/:slug and legacy ?project=agriflux#projects deep links + Back/Forward history
    await page.goto('/?project=agriflux#projects', { waitUntil: 'load' });
    await dismissIntroForSuite(page);
    await expect(page).toHaveURL(/\/projects\/agriflux$/);
    await expect(page.getByRole('dialog', { name: 'AgriFlux' })).toBeVisible();

    await page.goto('/skills', { waitUntil: 'load' });
    await dismissIntroForSuite(page);
    await page.goto('/projects/agriflux', { waitUntil: 'load' });
    await dismissIntroForSuite(page);
    await expect(page.getByRole('dialog', { name: 'AgriFlux' })).toBeVisible();

    await page.goBack({ waitUntil: 'load' });
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.goForward({ waitUntil: 'load' });
    await expect(page).toHaveURL(/\/projects\/agriflux$/);
    await expect(page.getByRole('dialog', { name: 'AgriFlux' })).toBeVisible();
  });

  test('raycasts 3D planets through exposed background and redirects cleanly on click', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/skills', { waitUntil: 'load' });
    await dismissIntroForSuite(page);
    await page.waitForTimeout(850);

    let destinationPlanet: { x: number; y: number; toast: string } | null = null;
    for (let y = 110; y <= 680 && !destinationPlanet; y += 28) {
      for (const x of [24, 36, 720, 960, 1140, 1230]) {
        if (destinationPlanet) break;
        await page.mouse.move(x, y);
        await page.waitForTimeout(35);
        const toast = await page.evaluate(() => {
          if (document.body.style.cursor !== 'pointer') return null;
          return document.querySelector('[data-testid="planet-hover-toast"]')?.textContent ?? null;
        });
        if (toast && !toast.startsWith('Skills')) {
          destinationPlanet = { x, y, toast };
        }
      }
    }

    expect(destinationPlanet).not.toBeNull();
    await page.mouse.click(destinationPlanet!.x, destinationPlanet!.y);

    await expect(page).not.toHaveURL(/\/skills$/);
    await expect(page).toHaveURL(/\/(about|projects|experience|achievements|contact)?$/);
  });

  test('verifies zero mobile Hero utility overlap and layout integrity across 320px–430px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await waitForIntroToFinish(page);
    await page.waitForTimeout(200);

    for (const width of [320, 360, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(120);

      const topCheck = await page.evaluate(() => {
        const html = document.documentElement;
        const utilControls = Array.from(document.querySelectorAll('header a, header button'))
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width > 0 && r.height > 0);
        const heroNodes = Array.from(
          document.querySelectorAll(
            '#hero .eyebrow-label, #hero h1, #hero .type-lead, #hero a, [data-testid="hero-3d-stage"]',
          ),
        ).map((el) => el.getBoundingClientRect());

        const intersects = (a: DOMRect, b: DOMRect) =>
          a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

        return {
          overflowX: html.scrollWidth - html.clientWidth,
          controlsCount: utilControls.length,
          controlsInBounds: utilControls.every(
            (r) => r.left >= 0 && r.right <= html.clientWidth && r.width >= 43.5 && r.height >= 43.5,
          ),
          anyOverlapAtTop:
            utilControls.length > 0
              ? utilControls.some((ctrl) => heroNodes.some((n) => intersects(ctrl, n)))
              : true,
        };
      });

      expect(topCheck.overflowX, `Overflow at ${width}px`).toBeLessThanOrEqual(0);
      expect(topCheck.controlsCount, `Mobile top logo + sound controls at ${width}px`).toBe(2);
      expect(topCheck.controlsInBounds, `Utility bounds & >=44px target at ${width}px`).toBe(true);
      expect(topCheck.anyOverlapAtTop, `Hero overlap at top ${width}px`).toBe(false);

      await page.evaluate(() => window.scrollTo({ top: 140, behavior: 'instant' }));
      await page.waitForTimeout(100);

      const scrolledCheck = await page.evaluate(() => {
        const utilControls = Array.from(document.querySelectorAll('header a, header button'))
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width > 0 && r.height > 0);
        const heroNodes = Array.from(
          document.querySelectorAll(
            '#hero .eyebrow-label, #hero h1, #hero .type-lead, #hero a, [data-testid="hero-3d-stage"]',
          ),
        ).map((el) => el.getBoundingClientRect());
        const intersects = (a: DOMRect, b: DOMRect) =>
          a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        return {
          anyOverlapScrolled:
            utilControls.length > 0
              ? utilControls.some((ctrl) => heroNodes.some((n) => intersects(ctrl, n)))
              : true,
        };
      });
      expect(scrolledCheck.anyOverlapScrolled, `Hero overlap scrolled at ${width}px`).toBe(false);
    }

    // Mobile portrait reveal pinning still works at 390px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(120);

    const heroPortrait = page.getByTestId('hero-portrait-figure');
    const heroToggle = page.getByTestId('portrait-reveal-toggle');
    await heroToggle.click();
    await expect(heroToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'true');
    await heroToggle.click();
    await expect(heroToggle).toHaveAttribute('aria-pressed', 'false');
    await page.mouse.move(10, 10);
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'false');
  });

  test('supports bidirectional SideReveal scroll discovery (hidden offscreen, reveals on scroll down, hides when past, re-reveals on scroll up)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await waitForIntroToFinish(page);
    await page.waitForTimeout(150);

    const contactReveal = page.locator('#contact [data-testid="side-reveal"]').first();
    const aboutReveal = page.locator('#about [data-testid="side-reveal"]').first();

    // Initially offscreen below at Hero top -> hidden with opacity 0
    await expect(contactReveal).toHaveCSS('opacity', '0');
    await expect(aboutReveal).toHaveCSS('opacity', '0');

    // Scroll down to About -> reveals from side to opacity 1
    await page.locator('#about').scrollIntoViewIfNeeded();
    await expect(aboutReveal).toHaveCSS('opacity', '1');

    // Scroll far down past About into Contact -> Contact reveals and About returns hidden
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(contactReveal).toHaveCSS('opacity', '1');
    await expect(aboutReveal).toHaveCSS('opacity', '0');

    // Scroll back up to About -> About re-reveals and Contact hides again
    await page.locator('#about').scrollIntoViewIfNeeded();
    await expect(aboutReveal).toHaveCSS('opacity', '1');
    await expect(contactReveal).toHaveCSS('opacity', '0');
  });
});
