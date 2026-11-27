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
  hoveredBodyRef?: RefObject<PlanetId | null>;
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
  hoveredPlanet,
  hoveredBodyRef,
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
  const frozenPtrRef = useRef<UniversePointerVector>({ x: 0, y: 0 });
  const initializedRef = useRef<boolean>(false);
  const lastFocusRef = useRef<string>('hero');
  const isTransitioningRef = useRef<boolean>(false);

  useFrame((_, delta) => {
    const isBodyHovered = (hoveredBodyRef?.current ?? hoveredPlanet) !== null;
    const dt = prefersReducedMotion ? 1 : Math.min(delta, 0.05);
    const t = elapsedTimeRef.current ?? 0;
    const isExploreOverview =
      navigationMode === 'explore' && activeSection === 'hero';
    const focusKey = isExploreOverview
      ? 'hero'
      : activeSection !== 'hero'
        ? activeSection
        : selectedPlanet && selectedPlanet !== 'sun'
          ? selectedPlanet
          : 'about';
    if (lastFocusRef.current !== focusKey) {
      lastFocusRef.current = focusKey;
      isTransitioningRef.current = true;
    }

    const rawPtr = qualityTier.enablePointerParallax
      ? pointerRef.current ?? { x: 0, y: 0 }
      : { x: 0, y: 0 };
    if (!isBodyHovered) {
      frozenPtrRef.current = { x: rawPtr.x, y: rawPtr.y };
    }
    const ptr = frozenPtrRef.current;

    if (isExploreOverview) {
      const orbit = orbitControlRef.current ?? { yaw: 0, pitch: 0, zoom: 1 };
      const isDesktop = qualityTier.tier === 'desktop-high';
      // Center the solar core symmetrically behind Austin's Hero silhouette so planets frame both left & right
      const heroLookX = 0;
      const baseRadius =
        (isDesktop ? 17.6 : 20.5) / Math.max(0.75, Math.min(1.4, orbit.zoom));
      const yaw = orbit.yaw + ptr.x * 0.16;
      const pitch = 0.34 + orbit.pitch - ptr.y * 0.08;

      const camX = heroLookX + Math.sin(yaw) * baseRadius;
      const camY = Math.sin(pitch) * baseRadius * 0.72 + 1.1;
      const camZ = Math.cos(yaw) * Math.cos(pitch) * baseRadius;

      targetCamPosRef.current.set(camX, camY, camZ);
      targetLookAtRef.current.set(heroLookX, isDesktop ? -0.35 : -0.1, 0);
    } else {
      const focusSection =
        activeSection !== 'hero'
          ? activeSection
          : selectedPlanet && selectedPlanet !== 'sun'
            ? selectedPlanet
            : 'about';

      const planet = getPlanetDefinition(focusSection);
      const [px, py, pz] = getPlanetWorldPosition(planet, t, orbitScale);

      // Approach each planet tangentially from slightly sunward so the central Sun stays
      // behind/aside the camera rather than flaring behind UI headings, illuminating a rich crescent
      const radialLen = Math.hypot(px, pz) || 1;
      const rx = px / radialLen;
      const rz = pz / radialLen;
      const tx = -rz;
      const tz = rx;

      const isDesktop = qualityTier.tier === 'desktop-high';
      const maxSunClearDist = Math.max(2.9, planet.orbitRadius * orbitScale * 0.88);
      const preferredDist = planet.hasRing
        ? Math.max(5.2, planet.radius * 8.4)
        : Math.max(4.4, planet.radius * 7.0);
      const camDist = Math.min(maxSunClearDist, isDesktop ? preferredDist : preferredDist * 1.08);
      const sideBias = isDesktop ? 1.65 : 0.95;

      // Nearly sunward + slight tangent keeps the central Sun behind the camera shoulder
      // so guided sections never show a giant bright star behind left-aligned white headings
      const offsetVecX = tx * 0.28 - rx * 0.96;
      const offsetVecZ = tz * 0.28 - rz * 0.96;

      const camX = px + offsetVecX * camDist + ptr.x * 0.35;
      const camY = py + (isDesktop ? 1.05 : 1.35) - ptr.y * 0.22;
      const camZ = pz + offsetVecZ * camDist;

      // Project planet toward the right flank of viewport so left headings and center cards stay clear
      const dirX = px - camX;
      const dirZ = pz - camZ;
      const dirLen = Math.hypot(dirX, dirZ) || 1;
      const screenLeftX = dirZ / dirLen;
      const screenLeftZ = -dirX / dirLen;

      targetCamPosRef.current.set(camX, camY, camZ);
      targetLookAtRef.current.set(
        px + screenLeftX * sideBias,
        py - (isDesktop ? 0.12 : 0.55),
        pz + screenLeftZ * sideBias,
      );
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      isTransitioningRef.current = false;
      camera.position.copy(targetCamPosRef.current);
      currentLookAtRef.current.copy(targetLookAtRef.current);
      camera.lookAt(currentLookAtRef.current);
      return;
    }

    if (hoveredBodyRef?.current !== undefined ? hoveredBodyRef.current !== null && !isTransitioningRef.current : hoveredPlanet !== null && !isTransitioningRef.current) {
      return;
    }

    const alpha = prefersReducedMotion ? 1 : 1 - Math.exp(-dt * 5.6);
    camera.position.lerp(targetCamPosRef.current, alpha);
    currentLookAtRef.current.lerp(targetLookAtRef.current, alpha);
    camera.lookAt(currentLookAtRef.current);

    if (
      isTransitioningRef.current &&
      camera.position.distanceTo(targetCamPosRef.current) < 0.35
    ) {
      isTransitioningRef.current = false;
    }
  });

  return null;
}
