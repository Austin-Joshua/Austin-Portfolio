import { CanvasTexture, Color, LinearFilter, SRGBColorSpace } from 'three';
import type { PlanetDefinition } from '@/three/universeConfig';

function seededValue(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Creates a deterministic procedural plasma albedo texture for the central Sun.
 */
export function createSolarTexture(): CanvasTexture {
  const width = 256;
  const height = 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#FFF1C2');
    grad.addColorStop(0.35, '#FFB347');
    grad.addColorStop(0.7, '#F97316');
    grad.addColorStop(1, '#FFD27D');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const rand = seededValue(101);
    for (let i = 0; i < 160; i++) {
      const x = rand() * width;
      const y = rand() * height;
      const r = 4 + rand() * 18;
      const cellGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
      cellGrad.addColorStop(
        0,
        i % 3 === 0 ? 'rgba(255, 248, 220, 0.55)' : 'rgba(234, 88, 12, 0.4)',
      );
      cellGrad.addColorStop(1, 'rgba(255, 179, 71, 0)');
      ctx.fillStyle = cellGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates procedural atmospheric/banded surface maps so each planet carries
 * rich shading variation and specular curvature instead of a flat sphere fill.
 */
export function createPlanetSurfaceTexture(
  planet: PlanetDefinition,
): CanvasTexture {
  const width = 256;
  const height = 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const base = new Color(planet.color);
    const deep = new Color(planet.deepColor);
    const rim = new Color(planet.rimColor);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, `#${rim.getHexString()}`);
    grad.addColorStop(0.28, `#${base.getHexString()}`);
    grad.addColorStop(0.68, `#${deep.getHexString()}`);
    grad.addColorStop(1, `#${base.getHexString()}`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const rand = seededValue(
      planet.id.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 17),
    );

    // Latitude atmospheric / mineral bands
    const bandCount = planet.bandStyle === 'jovian' ? 14 : 9;
    for (let i = 0; i < bandCount; i++) {
      const y = (i / bandCount) * height + (rand() - 0.5) * 6;
      const bandH = 3 + rand() * 10;
      ctx.fillStyle =
        i % 2 === 0
          ? `rgba(255, 255, 255, ${0.06 + rand() * 0.12})`
          : `rgba(2, 3, 10, ${0.12 + rand() * 0.16})`;
      ctx.fillRect(0, y, width, bandH);
    }

    // Surface formations, vortex swirls, and highlights
    for (let i = 0; i < 65; i++) {
      const x = rand() * width;
      const y = 10 + rand() * (height - 20);
      const rx = 5 + rand() * 22;
      const ry = rx * (0.35 + rand() * 0.45);
      const spotGrad = ctx.createRadialGradient(x, y, 0, x, y, rx);
      if (i % 3 === 0) {
        spotGrad.addColorStop(0, `rgba(255,255,255,${0.14 + rand() * 0.14})`);
      } else {
        spotGrad.addColorStop(0, `rgba(4,8,20,${0.18 + rand() * 0.18})`);
      }
      spotGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, (rand() - 0.5) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates radial translucent concentric bands for planetary ring systems.
 */
export function createPlanetaryRingTexture(colorHex: string): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const c = new Color(colorHex);
    const r = Math.round(c.r * 255);
    const g = Math.round(c.g * 255);
    const b = Math.round(c.b * 255);

    const grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.0)`);
    grad.addColorStop(0.18, `rgba(${r},${g},${b},0.48)`);
    grad.addColorStop(0.32, `rgba(255,255,255,0.22)`);
    grad.addColorStop(0.55, `rgba(${r},${g},${b},0.65)`);
    grad.addColorStop(0.7, `rgba(${r},${g},${b},0.14)`);
    grad.addColorStop(0.84, `rgba(${r},${g},${b},0.52)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0.0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, 16);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
