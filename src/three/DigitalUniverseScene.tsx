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

function buildStarGeometry(
  count: number,
  palette: { primary: string; secondary: string; highlight: string; gold: string },
): BufferGeometry {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const rand = createSeededRandom(42 + count);
  const cPrimary = new Color(palette.primary);
  const cSecondary = new Color(palette.secondary);
  const cHighlight = new Color(palette.highlight);
  const cGold = new Color(palette.gold);

  for (let i = 0; i < count; i++) {
    const radius = 1.25 + Math.pow(rand(), 0.6) * 4.2;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72;
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const pick = rand();
    const tone =
      pick < 0.5 ? cPrimary : pick < 0.78 ? cSecondary : pick < 0.92 ? cHighlight : cGold;
    colors[i * 3] = tone.r;
    colors[i * 3 + 1] = tone.g;
    colors[i * 3 + 2] = tone.b;
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setAttribute('color', new BufferAttribute(colors, 3));
  return geo;
}

function buildNebulaGeometry(
  count: number,
  palette: { primary: string; secondary: string },
): BufferGeometry {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const rand = createSeededRandom(99 + count);
  const cPrimary = new Color(palette.primary);
  const cSecondary = new Color(palette.secondary);

  for (let i = 0; i < count; i++) {
    const radius = 0.35 + rand() * 1.15;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.85;
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const t = rand();
    const tone = t < 0.6 ? cPrimary : cSecondary;
    colors[i * 3] = tone.r;
    colors[i * 3 + 1] = tone.g;
    colors[i * 3 + 2] = tone.b;
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setAttribute('color', new BufferAttribute(colors, 3));
  return geo;
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
  const starFieldRef = useRef<Points>(null);
  const nebulaRef = useRef<Points>(null);
  const outerRing1Ref = useRef<Mesh>(null);
  const outerRing2Ref = useRef<Mesh>(null);
  const midRingRef = useRef<Mesh>(null);
  const innerRingRef = useRef<Mesh>(null);
  const coreRef = useRef<Mesh>(null);
  const coreSolidRef = useRef<Mesh>(null);

  const isMobile = qualityTier.tier === 'mobile-conserving';
  const isStatic = qualityTier.tier === 'static';
  const seg = qualityTier.ringSegments;

  const starGeometry = useMemo(
    () => buildStarGeometry(qualityTier.particleCount, palette),
    [qualityTier.particleCount, palette],
  );

  const nebulaGeometry = useMemo(() => {
    if (isMobile || isStatic) return null;
    return buildNebulaGeometry(Math.floor(qualityTier.particleCount * 0.3), palette);
  }, [isMobile, isStatic, qualityTier.particleCount, palette]);

  useEffect(() => {
    return () => {
      starGeometry.dispose();
      nebulaGeometry?.dispose();
    };
  }, [starGeometry, nebulaGeometry]);

  useEffect(() => {
    invalidate();
  }, [invalidate, theme, qualityTier.tier]);

  useFrame((_, rawDelta) => {
    if (prefersReducedMotion || isStatic) return;

    const delta = Math.min(rawDelta, 0.05);
    const speed = qualityTier.driftSpeed;

    if (starFieldRef.current) {
      starFieldRef.current.rotation.y += delta * speed * 0.4;
      starFieldRef.current.rotation.x += delta * speed * 0.08;
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y -= delta * speed * 0.5;
    }
    if (outerRing1Ref.current) {
      outerRing1Ref.current.rotation.z += delta * speed * 0.7;
    }
    if (outerRing2Ref.current) {
      outerRing2Ref.current.rotation.z -= delta * speed * 0.5;
      outerRing2Ref.current.rotation.x += delta * speed * 0.3;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.z -= delta * speed * 1.0;
      midRingRef.current.rotation.y += delta * speed * 0.2;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z += delta * speed * 1.6;
      innerRingRef.current.rotation.x -= delta * speed * 0.4;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * speed * 1.3;
      coreRef.current.rotation.x += delta * speed * 0.65;
    }
    if (coreSolidRef.current) {
      coreSolidRef.current.rotation.y -= delta * speed * 0.9;
      coreSolidRef.current.rotation.z += delta * speed * 0.5;
    }

    if (rigRef.current) {
      const scrollRatio = isMobile
        ? 0
        : MathUtils.clamp(scrollProgressRef?.current ?? 0, 0, 1);
      const targetPosY = qualityTier.focalOffset[1] + scrollRatio * 0.35;
      rigRef.current.position.y = MathUtils.lerp(
        rigRef.current.position.y,
        targetPosY,
        Math.min(1, delta * 3.5),
      );

      if (qualityTier.enablePointerParallax) {
        const targetX = MathUtils.clamp(pointerRef.current.x, -1, 1) * 0.22;
        const targetY = MathUtils.clamp(pointerRef.current.y, -1, 1) * 0.14;
        rigRef.current.rotation.y = MathUtils.lerp(
          rigRef.current.rotation.y,
          targetX,
          Math.min(1, delta * 2.8),
        );
        rigRef.current.rotation.x = MathUtils.lerp(
          rigRef.current.rotation.x,
          -targetY,
          Math.min(1, delta * 2.8),
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
      {/* Far starfield */}
      <points ref={starFieldRef} geometry={starGeometry}>
        <pointsMaterial
          size={isMobile ? 0.036 : 0.028}
          vertexColors
          transparent
          opacity={palette.particleOpacity}
          depthWrite={false}
          blending={blending}
          sizeAttenuation
        />
      </points>

      {/* Nebula inner glow cloud */}
      {nebulaGeometry && (
        <points ref={nebulaRef} geometry={nebulaGeometry}>
          <pointsMaterial
            size={0.055}
            vertexColors
            transparent
            opacity={palette.particleOpacity * 0.42}
            depthWrite={false}
            blending={blending}
            sizeAttenuation
          />
        </points>
      )}

      {/* Outermost deep orbital ring */}
      <mesh ref={outerRing1Ref} rotation={[1.05, 0.22, 0.1]}>
        <torusGeometry args={[2.35, 0.008, 8, seg]} />
        <meshBasicMaterial
          color={palette.secondary}
          transparent
          opacity={Math.min(0.85, palette.ringOpacity * 0.9)}
          depthWrite={false}
        />
      </mesh>

      {/* Chrome / high-contrast outer tilted ring */}
      <mesh ref={outerRing2Ref} rotation={[-0.72, 0.55, 0.3]}>
        <torusGeometry args={[1.92, 0.009, 8, seg]} />
        <meshBasicMaterial
          color={palette.highlight}
          transparent
          opacity={Math.min(0.8, palette.ringOpacity * 0.72)}
          depthWrite={false}
        />
      </mesh>

      {/* Mid obsidian-gold highlight ring */}
      <mesh ref={midRingRef} rotation={[0.6, -0.4, 0.5]}>
        <torusGeometry args={[1.44, 0.011, 8, seg]} />
        <meshBasicMaterial
          color={palette.gold}
          transparent
          opacity={Math.min(0.9, palette.ringOpacity * 1.15)}
          depthWrite={false}
        />
      </mesh>

      {/* Inner primary accent ring */}
      <mesh ref={innerRingRef} rotation={[0.3, 0.65, -0.2]}>
        <torusGeometry args={[1.02, 0.014, 8, Math.min(seg, 72)]} />
        <meshBasicMaterial
          color={palette.primary}
          transparent
          opacity={Math.min(0.95, palette.ringOpacity * 1.5)}
          depthWrite={false}
        />
      </mesh>

      {/* Core wireframe icosahedron */}
      <mesh ref={coreRef} rotation={[0.4, 0.6, 0.2]}>
        <icosahedronGeometry args={[0.68, isMobile ? 1 : 2]} />
        <meshBasicMaterial
          color={palette.primary}
          wireframe
          transparent
          opacity={Math.min(0.92, palette.coreOpacity * 1.2)}
          depthWrite={false}
        />
      </mesh>

      {/* Inner solid orb */}
      <mesh ref={coreSolidRef}>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshBasicMaterial
          color={palette.secondary}
          transparent
          opacity={Math.min(0.8, palette.coreOpacity * 0.72)}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
