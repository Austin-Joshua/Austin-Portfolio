import '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  type Points,
} from 'three';
import type { UniversePointerVector } from '@/context/UniverseNavigationContext';
import {
  computeDepthParallax,
  stepHyperspaceFrame,
} from '@/three/starfieldPhysics';
import { COSMIC_PALETTE, type PlanetId } from '@/three/universeConfig';
import type { QualityTierConfig } from '@/three/useQualityTier';

export interface HyperspaceStarfieldProps {
  qualityTier: QualityTierConfig;
  prefersReducedMotion: boolean;
  pointerRef: RefObject<UniversePointerVector>;
  scrollVelocityRef: RefObject<number>;
  hoveredPlanet: PlanetId | null;
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

interface StarLayerBuffers {
  geometry: BufferGeometry;
  baseZ: Float32Array;
}

function buildStarLayer(
  count: number,
  seed: number,
  spreadXY: number,
  zMin: number,
  zMax: number,
  sizeRange: [number, number],
): StarLayerBuffers {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const baseZ = new Float32Array(count);

  const rand = createSeededRandom(seed);
  const cFar = new Color(COSMIC_PALETTE.starFar);
  const cMid = new Color(COSMIC_PALETTE.starMid);
  const cNear = new Color(COSMIC_PALETTE.starNear);
  const cCyan = new Color('#38BDF8');
  const cGold = new Color('#FFB347');

  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = Math.pow(rand(), 0.55) * spreadXY;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.78;
    const z = zMin + rand() * (zMax - zMin);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    baseZ[i] = z;

    sizes[i] = sizeRange[0] + rand() * (sizeRange[1] - sizeRange[0]);

    const pick = rand();
    const tone =
      pick < 0.45
        ? cMid
        : pick < 0.76
          ? cFar
          : pick < 0.9
            ? cNear
            : pick < 0.96
              ? cCyan
              : cGold;
    colors[i * 3] = tone.r;
    colors[i * 3 + 1] = tone.g;
    colors[i * 3 + 2] = tone.b;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));

  return { geometry, baseZ };
}

const STAR_VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  uniform float uWarpBoost;
  uniform float uHoverPulse;
  varying vec3 vColor;
  varying float vWarp;

  void main() {
    vColor = aColor;
    vWarp = uWarpBoost;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float distScale = 28.0 / max(1.5, -mvPosition.z);
    gl_PointSize = clamp(aSize * uPixelRatio * distScale * (1.0 + uWarpBoost * 0.35 + uHoverPulse * 0.14), 1.4, 18.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const STAR_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vWarp;
  uniform float uOpacity;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 1.85);
    float alpha = glow * clamp(uOpacity + vWarp * 0.18, 0.2, 1.0);
    gl_FragColor = vec4(vColor * (1.0 + vWarp * 0.22), alpha);
  }
`;

export function HyperspaceStarfield({
  qualityTier,
  prefersReducedMotion,
  pointerRef,
  scrollVelocityRef,
  hoveredPlanet,
}: HyperspaceStarfieldProps) {
  const farPointsRef = useRef<Points>(null);
  const nearPointsRef = useRef<Points>(null);
  const dampedWarpRef = useRef<number>(0);
  const dampedPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoverPulseRef = useRef<number>(0);

  const farCount = Math.round(qualityTier.particleCount * 0.65);
  const nearCount = Math.max(180, qualityTier.particleCount - farCount);

  const farLayer = useMemo(
    () => buildStarLayer(farCount, 701, 46, -42, 6, [1.2, 2.8]),
    [farCount],
  );
  const nearLayer = useMemo(
    () => buildStarLayer(nearCount, 907, 30, -24, 14, [2.0, 4.4]),
    [nearCount],
  );

  const farMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: STAR_VERTEX_SHADER,
        fragmentShader: STAR_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uPixelRatio: { value: qualityTier.dpr[1] },
          uWarpBoost: { value: 0 },
          uHoverPulse: { value: 0 },
          uOpacity: { value: 0.72 },
        },
      }),
    [qualityTier.dpr],
  );

  const nearMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: STAR_VERTEX_SHADER,
        fragmentShader: STAR_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uPixelRatio: { value: qualityTier.dpr[1] },
          uWarpBoost: { value: 0 },
          uHoverPulse: { value: 0 },
          uOpacity: { value: 0.92 },
        },
      }),
    [qualityTier.dpr],
  );

  useEffect(() => {
    return () => {
      farLayer.geometry.dispose();
      nearLayer.geometry.dispose();
      farMaterial.dispose();
      nearMaterial.dispose();
    };
  }, [farLayer, nearLayer, farMaterial, nearMaterial]);

  useFrame((_, delta) => {
    const step = stepHyperspaceFrame({
      currentWarp: dampedWarpRef.current,
      rawScrollVelocity: scrollVelocityRef.current ?? 0,
      delta,
      prefersReducedMotion,
      driftSpeed: qualityTier.driftSpeed,
    });

    dampedWarpRef.current = step.nextWarp;

    // Gentle hover luminance reaction
    const targetHover = hoveredPlanet ? 1 : 0;
    hoverPulseRef.current +=
      (targetHover - hoverPulseRef.current) *
      Math.min(1, step.cappedDelta * 5.0 || 0.1);

    // Update shader uniforms through mounted Three refs (keeps useMemo values immutable)
    const absWarp = Math.min(1.6, Math.abs(step.nextWarp));
    const farMat = farPointsRef.current?.material as ShaderMaterial | undefined;
    const nearMat = nearPointsRef.current?.material as ShaderMaterial | undefined;
    if (farMat?.uniforms) {
      farMat.uniforms.uWarpBoost.value = absWarp * 0.4;
      farMat.uniforms.uHoverPulse.value = hoverPulseRef.current * 0.5;
    }
    if (nearMat?.uniforms) {
      nearMat.uniforms.uWarpBoost.value = absWarp;
      nearMat.uniforms.uHoverPulse.value = hoverPulseRef.current;
    }

    if (prefersReducedMotion) {
      return;
    }

    // Damped pointer parallax (near stars respond stronger than far stars)
    const ptr = pointerRef.current ?? { x: 0, y: 0 };
    const pAlpha = 1 - Math.exp(-step.cappedDelta * 4.5);
    dampedPointerRef.current.x += (ptr.x - dampedPointerRef.current.x) * pAlpha;
    dampedPointerRef.current.y += (ptr.y - dampedPointerRef.current.y) * pAlpha;

    const farOffset = computeDepthParallax(
      dampedPointerRef.current.x,
      dampedPointerRef.current.y,
      0.55,
      qualityTier.enablePointerParallax,
    );
    const nearOffset = computeDepthParallax(
      dampedPointerRef.current.x,
      dampedPointerRef.current.y,
      1.65,
      qualityTier.enablePointerParallax,
    );

    if (farPointsRef.current) {
      farPointsRef.current.position.x = farOffset.x;
      farPointsRef.current.position.y = farOffset.y;
      farPointsRef.current.rotation.z += step.cappedDelta * 0.004;
    }

    if (nearPointsRef.current) {
      nearPointsRef.current.position.x = nearOffset.x;
      nearPointsRef.current.position.y = nearOffset.y;
    }

    // Stream near stars along Z depth in response to scroll velocity + cosmic drift
    const nearPos = nearPointsRef.current?.geometry.getAttribute('position') as
      | BufferAttribute
      | undefined;
    if (!nearPos) {
      return;
    }
    const arr = nearPos.array as Float32Array;
    const zSpan = 38; // [-24 .. +14]
    const direction = step.nextWarp < -0.08 ? -1 : 1;
    const deltaZ = step.forwardTravel * direction;

    if (Math.abs(deltaZ) > 0.0001) {
      for (let i = 0; i < nearCount; i++) {
        let z = arr[i * 3 + 2] + deltaZ;
        if (z > 14) z -= zSpan;
        if (z < -24) z += zSpan;
        arr[i * 3 + 2] = z;
      }
      nearPos.needsUpdate = true;
    }
  });

  return (
    <group>
      <points
        ref={farPointsRef}
        geometry={farLayer.geometry}
        material={farMaterial}
        frustumCulled={false}
      />
      <points
        ref={nearPointsRef}
        geometry={nearLayer.geometry}
        material={nearMaterial}
        frustumCulled={false}
      />
    </group>
  );
}
