import { CanvasTexture, LinearFilter, RepeatWrapping } from 'three';
import type { PlanetDefinition } from '@/three/universeConfig';

export interface PlanetTexturePair {
  map: CanvasTexture;
  bumpMap: CanvasTexture;
  roughnessMap?: CanvasTexture;
  cloudMap?: CanvasTexture;
}

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = Number.parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function clampByte(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : Math.round(n);
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  const k = clamp01(t);
  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
  ];
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// Fast 3D hash value noise on the unit sphere so equirectangular planets never seam
function hash3(ix: number, iy: number, iz: number, seed: number): number {
  let n = ix * 374761393 + iy * 668265263 + iz * 2147483647 + seed * 1597334677;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function noise3D(x: number, y: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const c000 = hash3(ix, iy, iz, seed);
  const c100 = hash3(ix + 1, iy, iz, seed);
  const c010 = hash3(ix, iy + 1, iz, seed);
  const c110 = hash3(ix + 1, iy + 1, iz, seed);
  const c001 = hash3(ix, iy, iz + 1, seed);
  const c101 = hash3(ix + 1, iy, iz + 1, seed);
  const c011 = hash3(ix, iy + 1, iz + 1, seed);
  const c111 = hash3(ix + 1, iy + 1, iz + 1, seed);

  const x00 = c000 + (c100 - c000) * ux;
  const x10 = c010 + (c110 - c010) * ux;
  const x01 = c001 + (c101 - c001) * ux;
  const x11 = c011 + (c111 - c011) * ux;

  const y0 = x00 + (x10 - x00) * uy;
  const y1 = x01 + (x11 - x01) * uy;

  return y0 + (y1 - y0) * uz;
}

function fbmSphere(
  nx: number,
  ny: number,
  nz: number,
  scale: number,
  seed: number,
  octaves = 4
): number {
  let sum = 0;
  let amp = 0.5;
  let freq = scale;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    sum += noise3D(nx * freq, ny * freq, nz * freq, seed + i * 31) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return sum / norm;
}

function ridgedSphere(
  nx: number,
  ny: number,
  nz: number,
  scale: number,
  seed: number,
  octaves = 3
): number {
  let sum = 0;
  let amp = 0.5;
  let freq = scale;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    const n = noise3D(nx * freq, ny * freq, nz * freq, seed + i * 53);
    const ridge = 1 - Math.abs(n * 2 - 1);
    sum += ridge * ridge * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.15;
  }
  return sum / norm;
}

function configureTexture(canvas: HTMLCanvasElement, wrap = true): CanvasTexture {
  const tex = new CanvasTexture(canvas);
  if (wrap) {
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
  }
  tex.minFilter = LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates an equirectangular solar plasma & granulation photosphere texture
 * with convection cells, magnetic sunspot clusters, and coronal filaments.
 */
export function createSolarTexture(): CanvasTexture {
  const width = 320;
  const height = 160;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new CanvasTexture(canvas);

  const img = ctx.createImageData(width, height);
  const data = img.data;
  const hotCore: [number, number, number] = [255, 246, 214];
  const plasmaMid: [number, number, number] = [250, 182, 74];
  const emberEdge: [number, number, number] = [194, 88, 22];
  const sunspotDark: [number, number, number] = [108, 36, 10];

  for (let y = 0; y < height; y += 1) {
    const v = (y + 0.5) / height;
    const phi = v * Math.PI;
    const sinPhi = Math.sin(phi);
    const ny = Math.cos(phi);

    for (let x = 0; x < width; x += 1) {
      const u = (x + 0.5) / width;
      const theta = u * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const nz = sinPhi * Math.sin(theta);

      const cells = fbmSphere(nx, ny, nz, 8.2, 41, 4);
      const filaments = ridgedSphere(nx, ny, nz, 4.4, 99, 3);
      const fine = fbmSphere(nx, ny, nz, 18.0, 211, 2);
      const sunspotZone = Math.exp(-Math.pow((Math.abs(ny) - 0.24) / 0.19, 2));
      const spotMask = smoothstep(0.7, 0.81, fbmSphere(nx, ny, nz, 5.2, 307, 3)) * sunspotZone;

      let rgb = mixRgb(emberEdge, plasmaMid, smoothstep(0.28, 0.72, cells));
      rgb = mixRgb(rgb, hotCore, smoothstep(0.56, 0.86, cells * 0.52 + filaments * 0.42 + fine * 0.16));
      rgb = mixRgb(rgb, sunspotDark, spotMask * 0.84);

      const idx = (y * width + x) * 4;
      data[idx] = clampByte(rgb[0]);
      data[idx + 1] = clampByte(rgb[1]);
      data[idx + 2] = clampByte(rgb[2]);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return configureTexture(canvas);
}

/**
 * Generates seamless equirectangular albedo, topographic bump, specular roughness,
 * and optional drifting cloud-shell CanvasTextures for each planet archetype.
 */
export function createPlanetTextures(planet: PlanetDefinition): PlanetTexturePair {
  const width = 320;
  const height = 160;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;

  const hasCloudShell =
    planet.bandStyle === 'oceanic' ||
    planet.bandStyle === 'orbital' ||
    planet.bandStyle === 'jovian' ||
    planet.bandStyle === 'sovereign' ||
    planet.bandStyle === 'molecular';

  const cloudCanvas = hasCloudShell ? document.createElement('canvas') : null;
  if (cloudCanvas) {
    cloudCanvas.width = width;
    cloudCanvas.height = height;
  }

  const aCtx = albedoCanvas.getContext('2d');
  const bCtx = bumpCanvas.getContext('2d');
  const rCtx = roughCanvas.getContext('2d');
  const cCtx = cloudCanvas ? cloudCanvas.getContext('2d') : null;

  if (!aCtx || !bCtx || !rCtx) {
    return {
      map: new CanvasTexture(albedoCanvas),
      bumpMap: new CanvasTexture(bumpCanvas),
    };
  }

  const albedoImg = aCtx.createImageData(width, height);
  const bumpImg = bCtx.createImageData(width, height);
  const roughImg = rCtx.createImageData(width, height);
  const cloudImg = cCtx ? cCtx.createImageData(width, height) : null;

  const aData = albedoImg.data;
  const bData = bumpImg.data;
  const rData = roughImg.data;
  const cData = cloudImg ? cloudImg.data : null;

  const base = parseHexRgb(planet.color);
  const deep = parseHexRgb(planet.deepColor);
  const rim = parseHexRgb(planet.rimColor);
  const seed = Math.round(planet.initialAngle * 100 + planet.orbitRadius * 37);

  for (let y = 0; y < height; y += 1) {
    const v = (y + 0.5) / height;
    const phi = v * Math.PI;
    const sinPhi = Math.sin(phi);
    const ny = Math.cos(phi);
    const latAbs = Math.abs(ny);

    for (let x = 0; x < width; x += 1) {
      const u = (x + 0.5) / width;
      const theta = u * Math.PI * 2;
      const nx = sinPhi * Math.cos(theta);
      const nz = sinPhi * Math.sin(theta);

      let rgb: [number, number, number] = base;
      let heightVal = 0.5;
      let roughnessVal = 0.72;
      let cloudAlpha = 0;

      if (planet.bandStyle === 'oceanic') {
        const cont = fbmSphere(nx, ny, nz, 2.75, seed, 4);
        const ridge = ridgedSphere(nx, ny, nz, 5.4, seed + 17, 3);
        const detail = fbmSphere(nx, ny, nz, 12.0, seed + 43, 3);
        const altitude = cont * 0.76 + detail * 0.24;
        const landMask = smoothstep(0.49, 0.56, altitude);
        const shallowMask = smoothstep(0.39, 0.5, altitude);

        const abyssOcean = mixRgb(deep, [12, 34, 78], 0.58);
        const shelfOcean = mixRgb(base, [64, 188, 224], 0.44);
        const oceanColor = mixRgb(abyssOcean, shelfOcean, shallowMask);

        const lowland: [number, number, number] = [44, 108, 86];
        const highland: [number, number, number] = [148, 128, 92];
        const peakSnow: [number, number, number] = [214, 228, 240];
        const terrainFactor = smoothstep(0.54, 0.82, altitude + ridge * 0.26);
        let landColor = mixRgb(lowland, highland, terrainFactor);
        landColor = mixRgb(landColor, peakSnow, smoothstep(0.76, 0.94, altitude + ridge * 0.28));

        rgb = mixRgb(oceanColor, landColor, landMask);
        const polar = smoothstep(0.76, 0.91, latAbs + detail * 0.14);
        rgb = mixRgb(rgb, [224, 238, 252], polar * 0.88);

        heightVal = landMask > 0.02 ? 0.34 + (altitude * 0.4 + ridge * 0.36) * landMask : 0.12 + detail * 0.05;
        // Glossy specular liquid ocean vs matte rocky continents vs crisp icy polar cap
        roughnessVal = mixRgb([0.24, 0, 0], [0.86, 0, 0], landMask)[0] * (1 - polar * 0.45) + 0.32 * polar;

        const swirl = fbmSphere(nx * 1.4, ny + 0.18, nz * 1.4, 4.3, seed + 88, 4);
        cloudAlpha = smoothstep(0.53, 0.78, swirl + fbmSphere(nx, ny, nz, 10.2, seed + 131, 2) * 0.24) * 0.72;
      } else if (planet.bandStyle === 'orbital') {
        // Crystalline amethyst world with impact craters, metallic basins, and glowing mineral veins
        const strata = fbmSphere(nx, ny, nz, 3.8, seed + 5, 4);
        const veins = ridgedSphere(nx, ny, nz, 6.2, seed + 29, 3);
        const craters = Math.pow(1 - fbmSphere(nx, ny, nz, 8.8, seed + 71, 3), 2.1);

        rgb = mixRgb(deep, base, smoothstep(0.32, 0.72, strata));
        const basinMask = smoothstep(0.55, 0.82, veins);
        rgb = mixRgb(rgb, [32, 26, 56], craters * 0.56);
        rgb = mixRgb(rgb, rim, basinMask * 0.46 + craters * 0.14);
        rgb = mixRgb(rgb, [218, 206, 255], smoothstep(0.84, 0.96, veins) * 0.52);

        heightVal = clamp01(0.48 + strata * 0.3 + veins * 0.22 - craters * 0.44);
        roughnessVal = clamp01(0.84 - basinMask * 0.48 - smoothstep(0.75, 0.94, strata) * 0.2);

        const highCirrus = fbmSphere(nx, ny * 1.35, nz, 5.2, seed + 109, 3);
        cloudAlpha = smoothstep(0.61, 0.84, highCirrus) * 0.34;
      } else if (planet.bandStyle === 'beacon') {
        // Ember super-earth with basaltic plates, impact craters, and glowing magma rifts
        const plate = fbmSphere(nx, ny, nz, 3.2, seed + 13, 4);
        const fault = ridgedSphere(nx, ny, nz, 4.9, seed + 49, 3);
        const craters = Math.pow(1 - fbmSphere(nx, ny, nz, 9.6, seed + 61, 3), 2.4);

        const lavaMask = smoothstep(0.78, 0.94, fault + plate * 0.12);
        rgb = mixRgb(deep, base, smoothstep(0.3, 0.76, plate));
        rgb = mixRgb(rgb, [34, 18, 12], craters * 0.65);
        rgb = mixRgb(rgb, [255, 198, 118], lavaMask * 0.85);
        rgb = mixRgb(rgb, rim, smoothstep(0.64, 0.88, fault) * 0.34);

        heightVal = clamp01(0.56 + plate * 0.26 - craters * 0.48 - lavaMask * 0.24);
        roughnessVal = clamp01(0.88 - lavaMask * 0.45);
      } else if (planet.bandStyle === 'jovian') {
        // Turbulent viridian gas giant with zonal jet streams & persistent anticyclonic vortex eye
        const shear = fbmSphere(nx, ny, nz, 4.6, seed + 23, 4) * 0.14;
        const fineShear = fbmSphere(nx, ny, nz, 12.0, seed + 67, 3) * 0.05;
        const bandCoord = (ny + shear + fineShear) * 8.6;
        const band = 0.5 + 0.5 * Math.sin(bandCoord * Math.PI);
        const jetEdge = Math.pow(Math.abs(Math.sin(bandCoord * Math.PI * 1.5)), 0.7);

        // Anticyclone storm oval centered near southern mid-latitude
        const stormDist = Math.hypot((u - 0.52) * 3.1, (v - 0.62) * 5.8);
        const stormEye = smoothstep(0.64, 0.08, stormDist);
        const stormWall = smoothstep(0.75, 0.42, stormDist) * (1 - smoothstep(0.42, 0.18, stormDist));

        rgb = mixRgb(deep, base, band);
        rgb = mixRgb(rgb, rim, smoothstep(0.58, 0.94, band * jetEdge) * 0.58);
        rgb = mixRgb(rgb, [20, 62, 54], smoothstep(0.25, 0.05, band) * 0.28);
        rgb = mixRgb(rgb, [224, 246, 232], stormWall * 0.65);
        rgb = mixRgb(rgb, [166, 244, 206], stormEye * 0.78);

        heightVal = 0.38 + band * 0.26 + stormEye * 0.28 + fineShear * 2.2;
        roughnessVal = 0.58 - stormEye * 0.16 + (1 - band) * 0.14;

        const ammonia = fbmSphere(nx * 1.2, ny * 2.4, nz * 1.2, 6.2, seed + 149, 3);
        cloudAlpha = smoothstep(0.48, 0.8, ammonia + band * 0.22) * 0.42;
      } else if (planet.bandStyle === 'sovereign') {
        // Gilded Saturnian world with champagne-gold jet belts & polar amber crown
        const warp = fbmSphere(nx, ny, nz, 5.2, seed + 37, 4) * 0.11;
        const micro = fbmSphere(nx, ny, nz, 13.5, seed + 83, 2) * 0.04;
        const bandCoord = (ny + warp + micro) * 10.2;
        const belt = 0.5 + 0.5 * Math.cos(bandCoord * Math.PI);
        const polarCrown = smoothstep(0.74, 0.95, latAbs + warp * 0.5);

        rgb = mixRgb(deep, base, smoothstep(0.18, 0.84, belt));
        rgb = mixRgb(rgb, rim, smoothstep(0.6, 0.95, belt) * 0.62);
        rgb = mixRgb(rgb, [196, 178, 128], polarCrown * 0.48);

        heightVal = 0.44 + belt * 0.24 + micro * 2.5;
        roughnessVal = 0.6 - belt * 0.15;

        const haze = fbmSphere(nx, ny * 2.2, nz, 7.0, seed + 173, 3);
        cloudAlpha = smoothstep(0.55, 0.85, haze) * 0.32;
      } else {
        // Rose-quartz ice dwarf with nitrogen frost plains, cryo-canyons, and crater highlights
        const frost = fbmSphere(nx, ny, nz, 3.9, seed + 71, 4);
        const canyon = ridgedSphere(nx, ny, nz, 6.4, seed + 97, 3);
        const pits = Math.pow(1 - fbmSphere(nx, ny, nz, 10.5, seed + 127, 2), 2.2);

        const glacierMask = smoothstep(0.52, 0.82, frost);
        rgb = mixRgb(deep, base, smoothstep(0.28, 0.72, frost));
        rgb = mixRgb(rgb, [46, 20, 34], smoothstep(0.74, 0.92, canyon) * 0.55);
        rgb = mixRgb(rgb, rim, glacierMask * 0.46 + pits * 0.24);
        rgb = mixRgb(rgb, [248, 226, 238], smoothstep(0.78, 0.95, latAbs + frost * 0.16) * 0.62);

        heightVal = clamp01(0.45 + frost * 0.32 - canyon * 0.34 - pits * 0.24);
        roughnessVal = clamp01(0.76 - glacierMask * 0.44);

        const iceVeil = fbmSphere(nx, ny * 1.4, nz, 4.8, seed + 193, 3);
        cloudAlpha = smoothstep(0.58, 0.86, iceVeil) * 0.3;
      }

      const idx = (y * width + x) * 4;
      aData[idx] = clampByte(rgb[0]);
      aData[idx + 1] = clampByte(rgb[1]);
      aData[idx + 2] = clampByte(rgb[2]);
      aData[idx + 3] = 255;

      const bumpByte = clampByte(heightVal * 255);
      bData[idx] = bumpByte;
      bData[idx + 1] = bumpByte;
      bData[idx + 2] = bumpByte;
      bData[idx + 3] = 255;

      const roughByte = clampByte(roughnessVal * 255);
      rData[idx] = roughByte;
      rData[idx + 1] = roughByte;
      rData[idx + 2] = roughByte;
      rData[idx + 3] = 255;

      if (cData) {
        const cloudTone = mixRgb(rim, [252, 254, 255], 0.72);
        cData[idx] = clampByte(cloudTone[0]);
        cData[idx + 1] = clampByte(cloudTone[1]);
        cData[idx + 2] = clampByte(cloudTone[2]);
        cData[idx + 3] = clampByte(cloudAlpha * 255);
      }
    }
  }

  aCtx.putImageData(albedoImg, 0, 0);
  bCtx.putImageData(bumpImg, 0, 0);
  rCtx.putImageData(roughImg, 0, 0);

  const pair: PlanetTexturePair = {
    map: configureTexture(albedoCanvas),
    bumpMap: configureTexture(bumpCanvas),
    roughnessMap: configureTexture(roughCanvas),
  };

  if (cloudCanvas && cCtx && cloudImg) {
    cCtx.putImageData(cloudImg, 0, 0);
    pair.cloudMap = configureTexture(cloudCanvas);
  }

  return pair;
}

/**
 * Generates multi-band planetary rings (Saturnian Cassini & Encke gap structure)
 * mapped radially from inner to outer radius using UV.x -> alpha + tint.
 */
export function createPlanetaryRingTexture(
  primaryHex: string,
  rimHex: string
): CanvasTexture {
  const width = 512;
  const height = 16;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new CanvasTexture(canvas);

  const primary = parseHexRgb(primaryHex);
  const rim = parseHexRgb(rimHex);
  const dustTone = mixRgb(primary, [218, 210, 198], 0.54);
  const brightTone = mixRgb(rim, [244, 246, 250], 0.56);

  const img = ctx.createImageData(width, height);
  const data = img.data;

  for (let x = 0; x < width; x += 1) {
    const r = x / (width - 1);
    const cassiniGap = Math.abs(r - 0.62) < 0.042 ? 0.1 : 1;
    const enckeGap = Math.abs(r - 0.84) < 0.016 ? 0.2 : 1;
    const innerEdge = smoothstep(0.02, 0.16, r);
    const outerEdge = 1 - smoothstep(0.88, 0.99, r);
    const microRings = 0.56 + 0.44 * Math.sin(r * 74) * Math.cos(r * 29);
    const fineDust = 0.78 + 0.22 * Math.sin(r * 165);
    const alpha = clamp01(innerEdge * outerEdge * cassiniGap * enckeGap * microRings * fineDust * 0.88);
    const tone = mixRgb(dustTone, brightTone, smoothstep(0.32, 0.82, microRings));

    for (let y = 0; y < height; y += 1) {
      const idx = (y * width + x) * 4;
      data[idx] = clampByte(tone[0]);
      data[idx + 1] = clampByte(tone[1]);
      data[idx + 2] = clampByte(tone[2]);
      data[idx + 3] = clampByte(alpha * 255);
    }
  }

  ctx.putImageData(img, 0, 0);
  return configureTexture(canvas, false);
}
