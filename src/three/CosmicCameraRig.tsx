import '@react-three/fiber';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import { Vector3 } from 'three';
import type {
  OrbitControlVector,
  UniverseNavigationMode,
  UniversePointerVector,
} from '@/context/UniverseNavigationContext';
import type { SectionId } from '@/data/sections';
import {
  getPlanetDefinition,
  getPlanetWorldPosition,
  type PlanetId,
} from '@/three/universeConfig';
import type { QualityTierConfig } from '@/three/useQualityTier';

export interface CosmicCameraRigProps {
  activeSection: SectionId;
  navigationMode: UniverseNavigationMode;
  selectedPlanet: PlanetId | null;
  hoveredPlanet: PlanetId | null;
  orbitScale: number;
  prefersReducedMotion: boolean;
  qualityTier: QualityTierConfig;
  pointerRef: RefObject<UniversePointerVector>;
  orbitControlRef: RefObject<OrbitControlVector>;
  elapsedTimeRef: RefObject<number>;
}

/**
 * Single authoritative damped camera controller reconciling free exploration
 * (Hero solar-system overview + user drag orbit) and guided scrolling per section.
 */
export function CosmicCameraRig({
  activeSection,
  navigationMode,
  selectedPlanet,
  orbitScale,
  prefersReducedMotion,
  qualityTier,
  pointerRef,
  orbitControlRef,
  elapsedTimeRef,
}: CosmicCameraRigProps) {
  const { camera } = useThree();
  const targetLookAtRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const currentLookAtRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const targetCamPosRef = useRef<Vector3>(new Vector3(-1.5, 4.8, 15.8));

  useFrame((_, delta) => {
    const dt = prefersReducedMotion ? 1 : Math.min(delta, 0.05);
    const t = elapsedTimeRef.current ?? 0;
    const isExploreOverview =
      navigationMode === 'explore' && activeSection === 'hero';

    const ptr = qualityTier.enablePointerParallax
      ? pointerRef.current ?? { x: 0, y: 0 }
      : { x: 0, y: 0 };

    if (isExploreOverview) {
      const orbit = orbitControlRef.current ?? { yaw: 0, pitch: 0, zoom: 1 };
      const isDesktop = qualityTier.tier === 'desktop-high';
      // Offset lookAt slightly left on desktop so the Sun & orbits blossom behind/around right-hand portrait
      const heroLookX = isDesktop ? -2.2 : 0;
      const baseRadius = (isDesktop ? 15.4 : 18.2) / Math.max(0.75, Math.min(1.4, orbit.zoom));
      const yaw = -0.14 + orbit.yaw + ptr.x * 0.18;
      const pitch = 0.28 + orbit.pitch - ptr.y * 0.1;

      const camX = heroLookX + Math.sin(yaw) * baseRadius;
      const camY = Math.sin(pitch) * baseRadius * 0.72 + 1.1;
      const camZ = Math.cos(yaw) * Math.cos(pitch) * baseRadius;

      targetCamPosRef.current.set(camX, camY, camZ);
      targetLookAtRef.current.set(heroLookX, isDesktop ? -0.1 : 0.4, 0);
    } else {
      const focusSection =
        activeSection !== 'hero'
          ? activeSection
          : selectedPlanet && selectedPlanet !== 'sun'
            ? selectedPlanet
            : 'about';

      const planet = getPlanetDefinition(focusSection);
      const [px, py, pz] = getPlanetWorldPosition(planet, t, orbitScale);

      // Frame the active planet richly toward the outer flank so section copy stays crystal clear
      const offsetX = planet.radius * 2.4 + 1.45;
      const camOffsetZ = Math.max(3.6, planet.radius * 5.6);

      targetCamPosRef.current.set(
        px + ptr.x * 0.35 + offsetX * 0.35,
        py + 0.9 - ptr.y * 0.22,
        pz + camOffsetZ,
      );
      targetLookAtRef.current.set(px - 0.55, py, pz);
    }

    const alpha = prefersReducedMotion ? 1 : 1 - Math.exp(-dt * 4.2);
    camera.position.lerp(targetCamPosRef.current, alpha);
    currentLookAtRef.current.lerp(targetLookAtRef.current, alpha);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
}
