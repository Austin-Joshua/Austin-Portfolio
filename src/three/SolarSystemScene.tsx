import '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, type RefObject } from 'react';
import type {
  OrbitControlVector,
  UniverseNavigationMode,
  UniversePointerVector,
} from '@/context/UniverseNavigationContext';
import type { SectionId } from '@/data/sections';
import { CosmicCameraRig } from '@/three/CosmicCameraRig';
import { HyperspaceStarfield } from '@/three/HyperspaceStarfield';
import { SolarSystemPlanets } from '@/three/SolarSystemPlanets';
import { COSMIC_PALETTE, type PlanetId } from '@/three/universeConfig';
import type { QualityTierConfig } from '@/three/useQualityTier';

export interface SolarSystemSceneProps {
  qualityTier: QualityTierConfig;
  prefersReducedMotion: boolean;
  activeSection: SectionId;
  navigationMode: UniverseNavigationMode;
  hoveredPlanet: PlanetId | null;
  selectedPlanet: PlanetId | null;
  pointerRef: RefObject<UniversePointerVector>;
  scrollVelocityRef: RefObject<number>;
  orbitControlRef: RefObject<OrbitControlVector>;
  onHoverPlanet: (id: PlanetId | null) => void;
  onSelectPlanet: (id: PlanetId) => void;
}

export function SolarSystemScene({
  qualityTier,
  prefersReducedMotion,
  activeSection,
  navigationMode,
  hoveredPlanet,
  selectedPlanet,
  pointerRef,
  scrollVelocityRef,
  orbitControlRef,
  onHoverPlanet,
  onSelectPlanet,
}: SolarSystemSceneProps) {
  const elapsedTimeRef = useRef<number>(0);
  const orbitRateRef = useRef<number>(navigationMode === 'guided' ? 0 : 1);
  const hoveredBodyRef = useRef<PlanetId | null>(hoveredPlanet);

  useEffect(() => {
    hoveredBodyRef.current = hoveredPlanet;
  }, [hoveredPlanet]);

  useFrame((_, delta) => {
    if (prefersReducedMotion) return;
    // Immediately freeze orbits on hover so the body stays locked under the pointer for clicking
    if (hoveredBodyRef.current !== null) {
      orbitRateRef.current = 0;
      return;
    }
    const targetRate = navigationMode === 'guided' ? 0 : 1;
    orbitRateRef.current += (targetRate - orbitRateRef.current) * Math.min(1, delta * 9);
    elapsedTimeRef.current += Math.min(delta, 0.05) * orbitRateRef.current;
  });

  const handleSyncHoverPlanet = (id: PlanetId | null) => {
    hoveredBodyRef.current = id;
    if (id !== null) {
      orbitRateRef.current = 0;
    }
    onHoverPlanet(id);
  };

  const orbitScale =
    qualityTier.tier === 'mobile-conserving' ? 0.84 : 1.0;

  return (
    <>
      <color attach="background" args={[COSMIC_PALETTE.canvas]} />

      {/* Restrained deep-space ambient + soft cool bounce for crisp day/night terminators */}
      <ambientLight intensity={0.14} color="#768CB0" />
      <directionalLight
        position={[-12, 9, -8]}
        intensity={0.26}
        color="#8CAAD8"
      />

      <HyperspaceStarfield
        qualityTier={qualityTier}
        prefersReducedMotion={prefersReducedMotion}
        pointerRef={pointerRef}
        scrollVelocityRef={scrollVelocityRef}
        hoveredPlanet={hoveredPlanet}
      />

      <SolarSystemPlanets
        qualityTier={qualityTier}
        prefersReducedMotion={prefersReducedMotion}
        hoveredPlanet={hoveredPlanet}
        selectedPlanet={selectedPlanet}
        orbitScale={orbitScale}
        onHoverPlanet={handleSyncHoverPlanet}
        onSelectPlanet={onSelectPlanet}
        elapsedTimeRef={elapsedTimeRef}
      />

      <CosmicCameraRig
        activeSection={activeSection}
        navigationMode={navigationMode}
        selectedPlanet={selectedPlanet}
        hoveredPlanet={hoveredPlanet}
        hoveredBodyRef={hoveredBodyRef}
        orbitScale={orbitScale}
        prefersReducedMotion={prefersReducedMotion}
        qualityTier={qualityTier}
        pointerRef={pointerRef}
        orbitControlRef={orbitControlRef}
        elapsedTimeRef={elapsedTimeRef}
      />
    </>
  );
}
