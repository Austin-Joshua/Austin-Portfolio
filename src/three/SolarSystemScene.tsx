import '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
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

  useFrame((_, delta) => {
    if (prefersReducedMotion) return;
    elapsedTimeRef.current += Math.min(delta, 0.05);
  });

  const orbitScale =
    qualityTier.tier === 'mobile-conserving' ? 0.84 : 1.0;

  return (
    <>
      <color attach="background" args={[COSMIC_PALETTE.canvas]} />

      {/* Subtle cosmic fill + sunlit terminator contrast */}
      <ambientLight intensity={0.28} color="#8DA4C8" />
      <directionalLight
        position={[-10, 8, 6]}
        intensity={0.55}
        color="#DCE4F0"
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
        onHoverPlanet={onHoverPlanet}
        onSelectPlanet={onSelectPlanet}
        elapsedTimeRef={elapsedTimeRef}
      />

      <CosmicCameraRig
        activeSection={activeSection}
        navigationMode={navigationMode}
        selectedPlanet={selectedPlanet}
        hoveredPlanet={hoveredPlanet}
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
