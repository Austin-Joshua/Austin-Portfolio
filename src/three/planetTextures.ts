import { CanvasTexture, LinearFilter, RepeatWrapping } from 'three';
import type { PlanetDefinition } from '@/three/universeConfig';

export interface PlanetTexturePair {
  map: CanvasTexture;
  bumpMap: CanvasTexture;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [140, 160, 190];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  const k = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ];
}

function hash3(ix: number, iy: number, iz: number, seed: number): number {
  let n =
    Math.imul(ix, 374761393) +
    Math.imul(iy, 668265263) +
    Math.imul(iz, 2147483647) +
    Math.imul(seed, 1274126177);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * 3D value noise sampled on unit sphere coordinates so equirectangular
 * textures wrap horizontally without any visible vertical seam.
 */
function noise3(x: number, y: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const fz = smooth(z - iz);

  const n000 = hash3(ix, iy, iz, seed);
  const n100 = hash3(ix + 1, iy, iz, seed);
  const n010 = hash3(ix, iy + 1, iz, seed);
  const n110 = hash3(ix + 1, iy + 1, iz, seed);
  const n001 = hash3(ix, iy, iz + 1, seed);
  const n101 = hash3(ix + 1, iy, iz + 1, seed);
  const n011 = hash3(ix, iy + 1, iz + 1, seed);
  const n111 = hash3(ix + 1, iy + 1, iz + 1, seed);

  const nx00 = lerp(n000, n100, fx);
  const nx10 = lerp(n010, n110, fx);
  const nx01 = lerp(n001, n101, fx);
  const nx11 = lerp(n011, n111, fx);

  return lerp(lerp(nx00, nx10, fy), lerp(nx01, nx11, fy), fz);
}

function fbmSphere(
  nx: number,
  ny: number,
  nz: number,
  freq: number,
  octaves: number,
  seed: number,
): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let f = freq;
  for (let i = 0; i < octaves; i += 1) {
    sum += noise3(nx * f, ny * f, nz * f, seed + i * 97) * amp;
    norm += amp;
    amp *= 0.5;
    f *= 2.04;
  }
  return sum / norm;
}

/**
 * Generates an astrophysical photosphere map for the central solar core
 * with granulation convection cells, sunspots, and warm limb depth.
 */
export function createSolarTexture(): CanvasTexture {
  const width = 256;
  const height = 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new CanvasTexture(canvas);

  const img = ctx.createImageData(width, height);
  const data = img.data;
  const hotCore: [number, number, number] = [255, 240, 198];
  const plasmaMid: [number, number, number] = [248, 174, 68];
  const deepSpot: [number, number, number] = [148, 62, 18];

  for (let py = 0; py < height; py += 1) {
    const v = (py + 0.5) / height;
    const phi = v * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    for (let px = 0; px < width; px += 1) {
      const u = px / width;
      const theta = u * Math.PI * 2;
      const sx = sinPhi * Math.cos(theta);
      const sy = cosPhi;
      const sz = sinPhi * Math.sin(theta);

      const cell = fbmSphere(sx, sy, sz, 6.5, 4, 17);
      const fine = fbmSphere(sx, sy, sz, 15.0, 2, 71);
      const spotNoise = fbmSphere(sx, sy, sz, 3.1, 3, 211);
      const sunspot = spotNoise < 0.34 ? (0.34 - spotNoise) * 2.8 : 0;

      const heat = Math.max(0, Math.min(1, cell * 0.72 + fine * 0.28 - sunspot * 0.78));
      const color =
        heat > 0.58
          ? mixRgb(plasmaMid, hotCore, (heat - 0.58) / 0.42)
          : mixRgb(deepSpot, plasmaMid, heat / 0.58);

      const idx = (py * width + px) * 4;
      data[idx] = color[0];
      data[idx + 1] = color[1];
      data[idx + 2] = color[2];
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.minFilter = LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Synthesizes natural geological albedo and height bump maps per planet archetype:
 * oceanic cratered worlds, turbulent gas-giant vortex bands, ice worlds, and rocky basalt.
 */
export function createPlanetTextures(planet: PlanetDefinition): PlanetTexturePair {
  const width = 256;
  const height = 128;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;

  const aCtx = albedoCanvas.getContext('2d');
  const bCtx = bumpCanvas.getContext('2d');
  if (!aCtx || !bCtx) {
    return { map: new CanvasTexture(albedoCanvas), bumpMap: new CanvasTexture(bumpCanvas) };
  }

  const albedoImg = aCtx.createImageData(width, height);
  const bumpImg = bCtx.createImageData(width, height);
  const aData = albedoImg.data;
  const bData = bumpImg.data;

  const seed = Math.round(planet.initialAngle * 1000 + planet.orbitRadius * 37);
  const rand = seededRandom(seed);

  // Tamed natural pigment palette blending planetary signature with mineral rock/atmosphere tones
  const baseHue = parseHexRgb(planet.color);
  const deepHue = parseHexRgb(planet.deepColor);
  const rimHue = parseHexRgb(planet.rimColor);
  const rockSlate: [number, number, number] = [56, 63, 78];
  const cloudMist: [number, number, number] = mixRgb([214, 222, 234], rimHue, 0.35);

  const isRockyTerrain = planet.bandStyle === 'oceanic' || planet.bandStyle === 'orbital' || planet.bandStyle === 'beacon';
  const isGasGiant = planet.bandStyle === 'jovian' || planet.bandStyle === 'sovereign';

  // Deterministic crater centers on unit sphere for rocky worlds
  const craterCount = isRockyTerrain ? 16 : 0;
  const craters = Array.from({ length: craterCount }, () => {
    const u = rand();
    const v = rand();
    const theta = u * Math.PI * 2;
    const zPos = v * 1.6 - 0.8;
    const radXY = Math.sqrt(Math.max(0.01, 1 - zPos * zPos));
    return {
      x: radXY * Math.cos(theta),
      y: zPos,
      z: radXY * Math.sin(theta),
      radius: 0.14 + rand() * 0.24,
      depth: 0.35 + rand() * 0.45,
    };
  });

  // Storm eye position for gas giants
  const stormTheta = rand() * Math.PI * 2;
  const stormY = (rand() - 0.5) * 0.5;
  const stormScaleXY = Math.sqrt(Math.max(0.1, 1 - stormY * stormY));
  const stormX = stormScaleXY * Math.cos(stormTheta);
  const stormZ = stormScaleXY * Math.sin(stormTheta);

  for (let py = 0; py < height; py += 1) {
    const v = (py + 0.5) / height;
    const phi = v * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const lat = 1 - Math.abs(cosPhi); // 1 near equator, 0 near poles

    for (let px = 0; px < width; px += 1) {
      const u = px / width;
      const theta = u * Math.PI * 2;
      const sx = sinPhi * Math.cos(theta);
      const sy = cosPhi;
      const sz = sinPhi * Math.sin(theta);

      let rgb: [number, number, number] = deepHue;
      let bumpVal = 0.5;

      if (isRockyTerrain) {
        const continent = fbmSphere(sx, sy, sz, 2.5, 4, seed);
        const ridge = Math.abs(fbmSphere(sx, sy, sz, 6.8, 3, seed + 19) - 0.5) * 2;
        const fineGrain = fbmSphere(sx, sy, sz, 14.0, 2, seed + 47);

        let craterDelta = 0;
        for (let c = 0; c < craters.length; c += 1) {
          const cr = craters[c];
          const dx = sx - cr.x;
          const dy = sy - cr.y;
          const dz = sz - cr.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) / cr.radius;
          if (dist < 1.35) {
            if (dist < 0.82) {
              craterDelta -= (1 - (dist / 0.82) ** 2) * cr.depth;
            } else {
              const rimT = 1 - Math.abs(dist - 1.0) / 0.35;
              craterDelta += Math.max(0, rimT) * cr.depth * 0.42;
            }
          }
        }

        const elev = Math.max(
          0,
          Math.min(1, continent * 0.72 + (1 - ridge) * 0.16 + fineGrain * 0.12 + craterDelta * 0.35),
        );

        const seaLevel = planet.bandStyle === 'beacon' ? 0.36 : 0.49;
        if (elev < seaLevel) {
          const depthT = elev / seaLevel;
          const deepTone = mixRgb(rockSlate, deepHue, 0.72);
          const shelfTone = mixRgb(deepHue, baseHue, 0.38);
          rgb = mixRgb(deepTone, shelfTone, depthT);
          bumpVal = 0.25 + depthT * 0.12;
        } else {
          const landT = (elev - seaLevel) / (1 - seaLevel);
          const highland = mixRgb(baseHue, rockSlate, 0.45);
          const peak = mixRgb(highland, rimHue, 0.45);
          rgb = mixRgb(highland, peak, Math.pow(landT, 0.85));
          bumpVal = 0.46 + landT * 0.54;
        }

        // Polar frost & faint swirling clouds
        const cloud = fbmSphere(sx * 1.4 + 0.7, sy * 2.1, sz * 1.4, 3.8, 3, seed + 83);
        if (cloud > 0.63) {
          const cloudAlpha = Math.min(0.42, (cloud - 0.63) * 1.5);
          rgb = mixRgb(rgb, cloudMist, cloudAlpha);
        }
        if (lat < 0.15) {
          const polarFactor = (0.15 - lat) / 0.15;
          rgb = mixRgb(rgb, cloudMist, polarFactor * 0.42);
        }
      } else if (isGasGiant) {
        // Turbulent sheared zonal flow with non-uniform eddies and a Great Spot vortex
        const shear = fbmSphere(sx * 1.3, sy * 3.8, sz * 1.3, 3.2, 4, seed);
        const eddy = fbmSphere(sx, sy * 5.0, sz, 7.6, 3, seed + 31);
        const warpedLat = sy + (shear - 0.5) * 0.24 + (eddy - 0.5) * 0.08;

        const zoneWave =
          Math.sin(warpedLat * 14.5 + shear * 2.6) * 0.5 +
          Math.cos(warpedLat * 27.0 - eddy * 1.8) * 0.25;
        const zoneT = Math.max(0, Math.min(1, 0.5 + zoneWave * 0.62));

        const stormBandDeep = mixRgb(deepHue, rockSlate, 0.38);
        const beltWarm = mixRgb(baseHue, [218, 204, 186], 0.32);
        const paleZone = mixRgb(beltWarm, rimHue, 0.4);

        rgb =
          zoneT < 0.5
            ? mixRgb(stormBandDeep, beltWarm, zoneT * 2)
            : mixRgb(beltWarm, paleZone, (zoneT - 0.5) * 2);

        // Anticyclonic storm vortex
        const dx = sx - stormX;
        const dy = (sy - stormY) * 1.65;
        const dz = sz - stormZ;
        const stormDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (stormDist < 0.32) {
          const vT = 1 - stormDist / 0.32;
          const eyeColor = mixRgb(deepHue, [232, 162, 118], 0.55);
          rgb = mixRgb(rgb, eyeColor, vT * 0.68);
        }

        bumpVal = 0.44 + zoneT * 0.18 + (eddy - 0.5) * 0.12;
      } else {
        // Ice giant ('molecular'): serene methane atmosphere + soft cirrus streaks
        const swirl = fbmSphere(sx, sy * 2.4, sz, 3.4, 4, seed);
        const cirrus = fbmSphere(sx * 0.9, sy * 4.5, sz * 0.9, 6.2, 3, seed + 61);
        const bandT = Math.max(
          0,
          Math.min(1, 0.5 + Math.sin((sy + (swirl - 0.5) * 0.18) * 9.5) * 0.35),
        );

        const iceDeep = mixRgb(deepHue, [26, 30, 56], 0.45);
        const iceMid = mixRgb(baseHue, [145, 162, 210], 0.28);
        rgb = mixRgb(iceDeep, iceMid, bandT);
        if (cirrus > 0.59) {
          rgb = mixRgb(rgb, cloudMist, Math.min(0.45, (cirrus - 0.59) * 1.4));
        }
        bumpVal = 0.46 + swirl * 0.14;
      }

      const idx = (py * width + px) * 4;
      aData[idx] = rgb[0];
      aData[idx + 1] = rgb[1];
      aData[idx + 2] = rgb[2];
      aData[idx + 3] = 255;

      const bByte = Math.round(Math.max(0, Math.min(255, bumpVal * 255)));
      bData[idx] = bByte;
      bData[idx + 1] = bByte;
      bData[idx + 2] = bByte;
      bData[idx + 3] = 255;
    }
  }

  aCtx.putImageData(albedoImg, 0, 0);
  bCtx.putImageData(bumpImg, 0, 0);

  const map = new CanvasTexture(albedoCanvas);
  map.wrapS = RepeatWrapping;
  map.wrapT = RepeatWrapping;
  map.minFilter = LinearFilter;
  map.needsUpdate = true;

  const bumpMap = new CanvasTexture(bumpCanvas);
  bumpMap.wrapS = RepeatWrapping;
  bumpMap.wrapT = RepeatWrapping;
  bumpMap.minFilter = LinearFilter;
  bumpMap.needsUpdate = true;

  return { map, bumpMap };
}

/**
 * Generates an astronomical ring texture (Saturnian radial dust bands + Cassini gap)
 * using radial pixels so `ringGeometry` maps smoothly with soft inner/outer feather.
 */
export function createPlanetaryRingTexture(
  primaryHex: string,
  rimHex: string,
): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new CanvasTexture(canvas);

  const primary = parseHexRgb(primaryHex);
  const rim = parseHexRgb(rimHex);
  const dustTone = mixRgb(primary, [212, 206, 198], 0.58);
  const brightTone = mixRgb(rim, [234, 236, 240], 0.5);

  const img = ctx.createImageData(size, 32);
  const data = img.data;

  for (let x = 0; x < size; x += 1) {
    const t = x / (size - 1);
    const fineBand = Math.sin(t * 72) * 0.5 + 0.5;
    const outerFade = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
    // Subtle Cassini gap around t = 0.64..0.71
    const gap = Math.abs(t - 0.675) < 0.045 ? 0.16 : 1.0;
    const innerThin = t < 0.2 ? t / 0.2 : 1.0;
    const alpha = Math.max(
      0,
      Math.min(1, Math.pow(outerFade, 0.7) * gap * innerThin * (0.34 + fineBand * 0.36)),
    );

    const rgb = mixRgb(dustTone, brightTone, fineBand);
    for (let y = 0; y < 32; y += 1) {
      const idx = (y * size + x) * 4;
      data[idx] = rgb[0];
      data[idx + 1] = rgb[1];
      data[idx + 2] = rgb[2];
      data[idx + 3] = Math.round(alpha * 180);
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new CanvasTexture(canvas);
  tex.minFilter = LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
