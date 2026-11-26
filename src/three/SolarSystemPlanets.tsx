import '@react-three/fiber';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, Color, DoubleSide, type Group, type Mesh } from 'three';
import {
  createPlanetaryRingTexture,
  createPlanetSurfaceTexture,
  createSolarTexture,
} from '@/three/planetTextures';
import {
  COSMIC_PALETTE,
  getPlanetWorldPosition,
  SOLAR_SYSTEM_PLANETS,
  type PlanetDefinition,
  type PlanetId,
} from '@/three/universeConfig';
import type { QualityTierConfig } from '@/three/useQualityTier';

export interface SolarSystemPlanetsProps {
  qualityTier: QualityTierConfig;
  prefersReducedMotion: boolean;
  hoveredPlanet: PlanetId | null;
  selectedPlanet: PlanetId | null;
  orbitScale: number;
  onHoverPlanet: (id: PlanetId | null) => void;
  onSelectPlanet: (id: PlanetId) => void;
  elapsedTimeRef: React.RefObject<number>;
}

interface OrbitingPlanetMeshProps {
  planet: PlanetDefinition;
  orbitScale: number;
  qualityTier: QualityTierConfig;
  prefersReducedMotion: boolean;
  isHovered: boolean;
  isSelected: boolean;
  elapsedTimeRef: React.RefObject<number>;
  onHoverPlanet: (id: PlanetId | null) => void;
  onSelectPlanet: (id: PlanetId) => void;
}

function OrbitingPlanet({
  planet,
  orbitScale,
  qualityTier,
  prefersReducedMotion,
  isHovered,
  isSelected,
  elapsedTimeRef,
  onHoverPlanet,
  onSelectPlanet,
}: OrbitingPlanetMeshProps) {
  const groupRef = useRef<Group>(null);
  const sphereRef = useRef<Mesh>(null);
  const moonsGroupRef = useRef<Group>(null);
  const scaleRef = useRef<number>(1);

  const surfaceTexture = useMemo(() => createPlanetSurfaceTexture(planet), [planet]);
  const ringTexture = useMemo(
    () => (planet.hasRing ? createPlanetaryRingTexture(planet.color) : null),
    [planet.color, planet.hasRing],
  );

  useEffect(() => {
    return () => {
      surfaceTexture.dispose();
      ringTexture?.dispose();
    };
  }, [surfaceTexture, ringTexture]);

  useFrame((_, delta) => {
    const dt = prefersReducedMotion ? 0 : Math.min(delta, 0.05);
    const t = elapsedTimeRef.current ?? 0;

    if (groupRef.current) {
      const [px, py, pz] = getPlanetWorldPosition(planet, t, orbitScale);
      groupRef.current.position.set(px, py, pz);

      const targetScale = isHovered ? 1.24 : isSelected ? 1.14 : 1.0;
      scaleRef.current += (targetScale - scaleRef.current) * Math.min(1, dt * 8 || 1);
      groupRef.current.scale.setScalar(scaleRef.current);
    }

    if (sphereRef.current && !prefersReducedMotion) {
      sphereRef.current.rotation.y += dt * 0.24;
    }

    if (moonsGroupRef.current && !prefersReducedMotion) {
      moonsGroupRef.current.rotation.y += dt * 0.65;
    }
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHoverPlanet(planet.id);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHoverPlanet(null);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = '';
    }
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelectPlanet(planet.id);
  };

  const segments = qualityTier.tier === 'mobile-conserving' ? 24 : 36;
  const r = planet.radius;

  return (
    <group>
      {/* Clean hairline orbital path track */}
      <mesh rotation={[Math.PI / 2 - planet.inclination * 0.4, 0, 0]}>
        <torusGeometry
          args={[
            planet.orbitRadius * orbitScale,
            isHovered || isSelected ? 0.018 : 0.009,
            8,
            Math.max(64, qualityTier.ringSegments),
          ]}
        />
        <meshBasicMaterial
          color={isHovered || isSelected ? planet.color : COSMIC_PALETTE.orbitTrack}
          transparent
          opacity={isHovered || isSelected ? 0.78 : 0.34}
        />
      </mesh>

      {/* Planet body + atmosphere rim + ring + moons */}
      <group
        ref={groupRef}
        position={getPlanetWorldPosition(planet, 0, orbitScale)}
      >
        {/* Main textured planet sphere lit by central Sun */}
        <mesh
          ref={sphereRef}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[r, segments, segments]} />
          <meshStandardMaterial
            map={surfaceTexture}
            roughness={0.58}
            metalness={0.14}
            emissive={new Color(planet.color)}
            emissiveIntensity={isHovered ? 0.42 : isSelected ? 0.28 : 0.16}
          />
        </mesh>

        {/* Subtle luminous atmospheric scattering shell */}
        <mesh scale={1.12}>
          <sphereGeometry args={[r, 20, 20]} />
          <meshBasicMaterial
            color={planet.rimColor}
            transparent
            opacity={isHovered || isSelected ? 0.24 : 0.09}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Optional Saturnian planetary ring */}
        {ringTexture && (
          <mesh rotation={[Math.PI / 2.4, 0.25, 0]}>
            <ringGeometry args={[r * 1.38, r * 2.15, 48]} />
            <meshBasicMaterial
              map={ringTexture}
              transparent
              opacity={isHovered || isSelected ? 0.88 : 0.62}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Orbiting satellites / moons */}
        <group ref={moonsGroupRef}>
          {Array.from({ length: planet.moonCount }).map((_, idx) => {
            const angle = idx * Math.PI * 1.15;
            const dist = r * (1.7 + idx * 0.45);
            return (
              <mesh
                key={idx}
                position={[Math.cos(angle) * dist, idx === 0 ? 0.14 : -0.1, Math.sin(angle) * dist]}
              >
                <sphereGeometry args={[r * 0.16, 12, 12]} />
                <meshStandardMaterial
                  color={planet.rimColor}
                  roughness={0.5}
                  emissive={new Color(planet.color)}
                  emissiveIntensity={0.25}
                />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
}

export function SolarSystemPlanets({
  qualityTier,
  prefersReducedMotion,
  hoveredPlanet,
  selectedPlanet,
  orbitScale,
  onHoverPlanet,
  onSelectPlanet,
  elapsedTimeRef,
}: SolarSystemPlanetsProps) {
  const sunMeshRef = useRef<Mesh>(null);
  const coronaRef = useRef<Mesh>(null);

  const solarTexture = useMemo(() => createSolarTexture(), []);

  useEffect(() => {
    return () => {
      solarTexture.dispose();
    };
  }, [solarTexture]);

  useFrame((_, delta) => {
    if (prefersReducedMotion) return;
    const dt = Math.min(delta, 0.05);
    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y += dt * 0.09;
    }
    if (coronaRef.current) {
      const pulse = 1.2 + Math.sin((elapsedTimeRef.current ?? 0) * 1.4) * 0.04;
      coronaRef.current.scale.setScalar(pulse);
    }
  });

  const isSunActive = hoveredPlanet === 'sun' || selectedPlanet === 'sun';

  return (
    <group>
      {/* Central Sun — Austin Joshua */}
      <group>
        <mesh
          ref={sunMeshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHoverPlanet('sun');
            if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHoverPlanet(null);
            if (typeof document !== 'undefined') document.body.style.cursor = '';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPlanet('sun');
          }}
        >
          <sphereGeometry args={[1.15, 36, 36]} />
          <meshBasicMaterial map={solarTexture} />
        </mesh>

        {/* Outer solar corona halo */}
        <mesh ref={coronaRef} scale={1.2}>
          <sphereGeometry args={[1.18, 28, 28]} />
          <meshBasicMaterial
            color={COSMIC_PALETTE.sunCorona}
            transparent
            opacity={isSunActive ? 0.32 : 0.2}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Central point light casting planetary highlights */}
        <pointLight
          color="#FFE3A8"
          intensity={isSunActive ? 75 : 62}
          distance={38}
          decay={1.4}
        />
      </group>

      {/* Six portfolio destination planets */}
      {SOLAR_SYSTEM_PLANETS.map((planet) => (
        <OrbitingPlanet
          key={planet.id}
          planet={planet}
          orbitScale={orbitScale}
          qualityTier={qualityTier}
          prefersReducedMotion={prefersReducedMotion}
          isHovered={hoveredPlanet === planet.id}
          isSelected={selectedPlanet === planet.id}
          elapsedTimeRef={elapsedTimeRef}
          onHoverPlanet={onHoverPlanet}
          onSelectPlanet={onSelectPlanet}
        />
      ))}
    </group>
  );
}
