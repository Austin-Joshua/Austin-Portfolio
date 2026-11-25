import '@react-three/fiber';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  NormalBlending,
  type Group,
  type Mesh,
  type Points,
} from 'three';
import { getUniversePalette } from '@/three/themePalettes';
import type { QualityTierConfig } from '@/three/useQualityTier';
import type { Theme } from '@/utils/themeStorage';

export interface PointerVector {
  x: number;
  y: number;
}

export interface DigitalUniverseSceneProps {
  theme: Theme;
  qualityTier: QualityTierConfig;
  prefersReducedMotion: boolean;
  pointerRef: RefObject<PointerVector>;
  scrollProgressRef?: RefObject<number>;
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function DigitalUniverseScene({
  theme,
  qualityTier,
  prefersReducedMotion,
  pointerRef,
  scrollProgressRef,
}: DigitalUniverseSceneProps) {
  const palette = useMemo(() => getUniversePalette(theme), [theme]);
  const { invalidate } = useThree();

  const rigRef = useRef<Group>(null);
  const pointsRef = useRef<Points>(null);
  const outerRingRef = useRef<Mesh>(null);
  const midRingRef = useRef<Mesh>(null);
  const innerCoreRef = useRef<Mesh>(null);

  const starGeometry = useMemo(() => {
    const count = qualityTier.particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const rand = createSeededRandom(1337 + count);
    const cPrimary = new Color(palette.primary);
    const cSecondary = new Color(palette.secondary);
    const cHighlight = new Color(palette.highlight);

    for (let i = 0; i < count; i++) {
      const radius = 1.6 + Math.pow(rand(), 0.72) * 5.2;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.68;
      const z = radius * Math.cos(phi);

      const offset = i * 3;
      positions[offset] = x;
      positions[offset + 1] = y;
      positions[offset + 2] = z;

      const pick = rand();
      const tone =
        pick < 0.45 ? cPrimary : pick < 0.8 ? cSecondary : cHighlight;
      colors[offset] = tone.r;
      colors[offset + 1] = tone.g;
      colors[offset + 2] = tone.b;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    return geometry;
  }, [
    qualityTier.particleCount,
    palette.primary,
    palette.secondary,
    palette.highlight,
  ]);

  useEffect(() => {
    return () => {
      starGeometry.dispose();
    };
  }, [starGeometry]);

  // Ensure static frame updates cleanly on theme/quality switches in demand mode
  useEffect(() => {
    invalidate();
  }, [invalidate, theme, qualityTier.tier]);

  useFrame((_, rawDelta) => {
    if (prefersReducedMotion || qualityTier.tier === 'static') {
      return;
    }

    const delta = Math.min(rawDelta, 0.05);
    const speed = qualityTier.driftSpeed;

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * speed * 0.6;
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * speed * 0.8;
    }

    if (midRingRef.current) {
      midRingRef.current.rotation.z -= delta * speed * 1.1;
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y += delta * speed * 1.4;
      innerCoreRef.current.rotation.x += delta * speed * 0.7;
    }

    if (rigRef.current) {
      const scrollRatio =
        qualityTier.tier === 'mobile-conserving'
          ? 0
          : MathUtils.clamp(scrollProgressRef?.current ?? 0, 0, 1);
      const targetPosY = qualityTier.focalOffset[1] + scrollRatio * 0.45;
      rigRef.current.position.y = MathUtils.lerp(
        rigRef.current.position.y,
        targetPosY,
        Math.min(1, delta * 4),
      );

      if (qualityTier.enablePointerParallax) {
        const targetX = MathUtils.clamp(pointerRef.current.x, -1, 1) * 0.14;
        const targetY = MathUtils.clamp(pointerRef.current.y, -1, 1) * 0.1;

        rigRef.current.rotation.y = MathUtils.lerp(
          rigRef.current.rotation.y,
          targetX,
          Math.min(1, delta * 3.5),
        );
        rigRef.current.rotation.x = MathUtils.lerp(
          rigRef.current.rotation.x,
          -targetY,
          Math.min(1, delta * 3.5),
        );
      }
    }
  });

  const blending = palette.additiveBlending ? AdditiveBlending : NormalBlending;

  return (
    <group
      ref={rigRef}
      position={[
        qualityTier.focalOffset[0],
        qualityTier.focalOffset[1],
        qualityTier.focalOffset[2],
      ]}
    >
      {/* Far procedural telemetry & starfield cloud */}
      <points ref={pointsRef} geometry={starGeometry}>
        <pointsMaterial
          size={qualityTier.tier === 'mobile-conserving' ? 0.032 : 0.028}
          vertexColors
          transparent
          opacity={palette.particleOpacity}
          depthWrite={false}
          blending={blending}
          sizeAttenuation
        />
      </points>

      {/* Mid-ground Swiss orbital rings derived strictly from active palette */}
      <mesh ref={outerRingRef} rotation={[1.18, 0.28, 0]}>
        <torusGeometry args={[2.4, 0.008, 8, qualityTier.ringSegments]} />
        <meshBasicMaterial
          color={palette.highlight}
          transparent
          opacity={palette.ringOpacity * 0.65}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={midRingRef} rotation={[-0.78, 0.42, 0.25]}>
        <torusGeometry args={[1.75, 0.009, 8, qualityTier.ringSegments]} />
        <meshBasicMaterial
          color={palette.primary}
          transparent
          opacity={palette.ringOpacity * 0.85}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[0.35, -0.52, 0]}>
        <torusGeometry args={[1.2, 0.007, 8, qualityTier.ringSegments]} />
        <meshBasicMaterial
          color={palette.secondary}
          transparent
          opacity={Math.min(0.65, palette.ringOpacity * 1.25)}
          depthWrite={false}
        />
      </mesh>

      {/* Core polyhedral lattice */}
      <mesh ref={innerCoreRef} rotation={[0.4, 0.6, 0]}>
        <icosahedronGeometry args={[0.68, 1]} />
        <meshBasicMaterial
          color={palette.primary}
          wireframe
          transparent
          opacity={palette.coreOpacity}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
