import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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

test.describe('Phase 9 — Production Portfolio E2E Verification', () => {
  test('renders semantic landmarks, neutral empty states, zero fabricated copy, and toggles theme cleanly', async ({
    page,
  }) => {
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

    await page.goto('/', { waitUntil: 'networkidle' });

    // Single H1 & ordered 7 sections
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Austin Joshua');

    const renderedIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main section[id]')).map((el) => el.id),
    );
    expect(renderedIds).toEqual([...SECTION_IDS]);

    // Approved neutral empty states & zero placeholder copy or contact forms
    await expect(page.getByText('No experience entries added yet.')).toBeVisible();
    await expect(page.getByText('No achievements added yet.')).toBeVisible();
    await expect(page.locator('form')).toHaveCount(0);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/\bTBD\b|Lorem ipsum/i);

    // Default dark theme -> toggle light -> reload preserves light without FOUC
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const toggleBtn = page.locator('button[aria-label*="Switch to Scarlet Porcelain" i]:visible').first();
    await toggleBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.waitForTimeout(300);

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('passes automated axe scans in dark and settled light themes and validates SkipLink/keyboard access', async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(350);

    const darkAxe = await new AxeBuilder({ page }).analyze();
    expect(darkAxe.violations).toEqual([]);

    // Keyboard SkipLink -> main content (WebKit headless omits links from plain Tab by default)
    const skipLink = page.locator('a[href="#main-content"]');
    if (browserName === 'webkit') {
      await skipLink.focus();
    } else {
      await page.keyboard.press('Tab');
    }
    await expect(skipLink).toBeFocused();
    await skipLink.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();

    // Toggle to settled light theme and re-run axe
    const toggleBtn = page.locator('button[aria-label*="Switch to Scarlet Porcelain" i]:visible').first();
    await toggleBtn.click();
    await page.waitForTimeout(350);

    const lightAxe = await new AxeBuilder({ page }).analyze();
    expect(lightAxe.violations).toEqual([]);
  });

  test('recovers cleanly on invalid ?project= deep links without crashing', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/?project=invalid-project-slug', { waitUntil: 'networkidle' });

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('invalid-project-notice')).toBeVisible();
    await expect(page).not.toHaveURL(/project=/);

    await page.getByRole('button', { name: /Dismiss invalid project link notice/i }).click();
    await expect(page.getByTestId('invalid-project-notice')).toHaveCount(0);
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
    test.slow();

    for (const vp of REQUIRED_VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);

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

    // Check 200% text-size scaling across all engines + 200% layout zoom on Chromium
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
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle('Austin Joshua — Portfolio');

    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc?.length ?? 0).toBeGreaterThan(30);

    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain('User-agent: *');
    expect(robotsText).toContain('Allow: /');
  });

  test('verifies navbar icon controls, real Hero 3D stage geometry, static assets & MIME types, hash deep links, and Browser Back/Forward', async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Navbar: no AJ // mark; ThemeToggle & Résumé download are icon-only controls
    await expect(page.locator('header').getByText('AJ //')).toHaveCount(0);
    const navResume = page.locator('header a[download="Austin_Joshua_Resume.pdf"]');
    await expect(navResume).toHaveCount(1);
    await expect(navResume).toHaveText('');

    // Real 3D Hero stage is present inside #hero and does not overlap left-column h1
    const stageBox = await page.getByTestId('hero-3d-stage').boundingBox();
    const headingBox = await page.locator('#hero h1').boundingBox();
    expect(stageBox).not.toBeNull();
    expect(headingBox).not.toBeNull();
    expect(stageBox!.width).toBeGreaterThan(300);
    expect(stageBox!.height).toBeGreaterThan(300);
    expect(stageBox!.x).toBeGreaterThanOrEqual(headingBox!.x + headingBox!.width - 4);

    // Hero portrait cutout: real PNG transparency via same-origin canvas + coherent hover, keyboard focus, & click states
    const failedPortraitRequests: Array<{ url: string; status: number }> = [];
    page.on('response', (res) => {
      if (res.url().includes('austin-joshua-cutout.png') && res.status() >= 400) {
        failedPortraitRequests.push({ url: res.url(), status: res.status() });
      }
    });

    const heroStage = page.getByTestId('hero-3d-stage');
    await expect(heroStage.locator('canvas')).toHaveCount(await page.locator('canvas').count());
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

    // Pointer hover in & out without layout shift
    const beforeRevealBox = await heroImg.boundingBox();
    await heroToggle.hover();
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'true');
    const afterRevealBox = await heroImg.boundingBox();
    expect(Math.abs(beforeRevealBox!.y - afterRevealBox!.y)).toBeLessThan(2);

    await page.mouse.move(10, 10);
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'false');

    // Pointer click pins colour across mouse leave, unpin + mouse leave restores silhouette
    await heroToggle.click();
    await expect(heroToggle).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(10, 10);
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'true');
    await heroToggle.click();
    await expect(heroToggle).toHaveAttribute('aria-pressed', 'false');
    await page.mouse.move(10, 10);
    await expect(heroPortrait).toHaveAttribute('data-portrait-revealed', 'false');

    // Keyboard focus via Tab keeps portrait revealed through Enter/Space until Tab moves focus away
    await page.locator('#hero a').last().focus();
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

    // Direct load and reload of all 7 section hashes
    for (const sectionId of SECTION_IDS) {
      await page.goto(`/#${sectionId}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);
      await expect(page).toHaveURL(new RegExp(`#${sectionId}$`));
      const railActive = page.getByTestId('desktop-section-rail').locator(`a[href="#${sectionId}"]`);
      await expect(railActive).toHaveAttribute('aria-current', 'location');
    }

    // Reload on #contact stays anchored cleanly on Contact
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    const contactTop = await page.locator('#contact').evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(contactTop)).toBeLessThan(260);

    // Valid project deep-link -> modal opens -> Browser Back closes -> Forward reopens
    await page.goto('/?project=agriflux#projects', { waitUntil: 'networkidle' });
    await expect(page.getByRole('dialog', { name: 'AgriFlux' })).toBeVisible();

    await page.goto('/#skills', { waitUntil: 'networkidle' });
    await page.goto('/?project=agriflux#projects', { waitUntil: 'networkidle' });
    await expect(page.getByRole('dialog', { name: 'AgriFlux' })).toBeVisible();

    await page.goBack({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/#skills$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.goForward({ waitUntil: 'networkidle' });
    await expect(page.getByRole('dialog', { name: 'AgriFlux' })).toBeVisible();
  });
});
