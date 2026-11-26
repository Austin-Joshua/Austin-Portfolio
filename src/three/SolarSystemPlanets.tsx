import '@react-three/fiber';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  ShaderMaterial,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from 'three';
import {
  createPlanetaryRingTexture,
  createPlanetTextures,
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
  elapsedTimeRef: RefObject<number>;
}

/**
 * Custom soft Fresnel BackSide atmospheric halo shader.
 * Evaluates to zero opacity right at the outer silhouette limb so no hard circular
 * outline ever appears around planets or the Sun.
 */
function createAtmosphericHaloMaterial(
  hexColor: string,
  shellRatio: number,
  initialIntensity: number,
): ShaderMaterial {
  const cosAtInnerLimb = Math.sqrt(
    Math.max(0.05, 1 - 1 / (shellRatio * shellRatio)),
  );
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: BackSide,
    uniforms: {
      uColor: { value: new Color(hexColor) },
      uIntensity: { value: initialIntensity },
      uMaxCos: { value: cosAtInnerLimb },
    },
    vertexShader: `
      varying vec3 vViewNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uMaxCos;
      varying vec3 vViewNormal;
      varying vec3 vViewDir;
      void main() {
        // On a BackSide shell, normal points away from camera; -dot(N, V) is 0 at outer edge
        // and increases smoothly toward the inner planet limb where it peaks without hard cutoffs.
        float rimCos = clamp(-dot(normalize(vViewNormal), normalize(vViewDir)), 0.0, 1.0);
        float normRim = clamp(rimCos / max(uMaxCos, 0.001), 0.0, 1.0);
        float alpha = pow(normRim, 2.8) * smoothstep(0.0, 0.25, normRim) * uIntensity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });
}

function OrbitingPlanet({
  planet,
  orbitScale,
  qualityTier,
  prefersReducedMotion,
  isHovered,
  isSelected,
  onHoverPlanet,
  onSelectPlanet,
  elapsedTimeRef,
}: {
  planet: PlanetDefinition;
  orbitScale: number;
  qualityTier: QualityTierConfig;
  prefersReducedMotion: boolean;
  isHovered: boolean;
  isSelected: boolean;
  onHoverPlanet: (id: PlanetId | null) => void;
  onSelectPlanet: (id: PlanetId) => void;
  elapsedTimeRef: RefObject<number>;
}) {
  const groupRef = useRef<Group>(null);
  const sphereRef = useRef<Mesh>(null);
  const haloMeshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const ringRef = useRef<Mesh>(null);
  const moonGroupRef = useRef<Group>(null);

  const planetTextures = useMemo(
    () => createPlanetTextures(planet),
    [planet],
  );
  const ringTexture = useMemo(
    () =>
      planet.hasRing
        ? createPlanetaryRingTexture(planet.color, planet.rimColor)
        : null,
    [planet.hasRing, planet.color, planet.rimColor],
  );
  const atmosphereMaterial = useMemo(
    () => createAtmosphericHaloMaterial(planet.rimColor, 1.16, 0.24),
    [planet.rimColor],
  );

  useEffect(() => {
    return () => {
      planetTextures.map.dispose();
      planetTextures.bumpMap.dispose();
      ringTexture?.dispose();
      atmosphereMaterial.dispose();
    };
  }, [planetTextures, ringTexture, atmosphereMaterial]);

  useFrame((_, delta) => {
    const dt = prefersReducedMotion ? 0 : Math.min(delta, 0.05);
    const t = elapsedTimeRef.current ?? 0;

    if (groupRef.current) {
      const [x, y, z] = getPlanetWorldPosition(planet, t, orbitScale);
      groupRef.current.position.set(x, y, z);

      const targetScale = isHovered ? 1.09 : isSelected ? 1.04 : 1.0;
      const curScale = groupRef.current.scale.x;
      const nextScale = curScale + (targetScale - curScale) * (prefersReducedMotion ? 1 : 0.14);
      groupRef.current.scale.setScalar(nextScale);
    }

    if (sphereRef.current && !prefersReducedMotion) {
      sphereRef.current.rotation.y += dt * (isHovered ? 0.34 : 0.16);
    }

    if (moonGroupRef.current && !prefersReducedMotion) {
      moonGroupRef.current.rotation.y += dt * 0.45;
    }

    if (ringRef.current && !prefersReducedMotion) {
      ringRef.current.rotation.z += dt * 0.06;
    }

    const haloMat = haloMeshRef.current?.material as ShaderMaterial | undefined;
    const haloUniform = haloMat?.uniforms?.uIntensity;
    if (haloUniform) {
      const targetHalo = isHovered ? 0.44 : isSelected ? 0.32 : 0.2;
      haloUniform.value += (targetHalo - haloUniform.value) * (prefersReducedMotion ? 1 : 0.16);
    }

    if (matRef.current) {
      const targetEmissive = isHovered ? 0.16 : isSelected ? 0.09 : 0.03;
      matRef.current.emissiveIntensity +=
        (targetEmissive - matRef.current.emissiveIntensity) * (prefersReducedMotion ? 1 : 0.16);
    }
  });

  const isGasGiant =
    planet.bandStyle === 'jovian' ||
    planet.bandStyle === 'sovereign' ||
    planet.bandStyle === 'molecular';
  const r = planet.radius;
  const orbitR = planet.orbitRadius * orbitScale;
  const isHighlighted = isHovered || isSelected;
  const sphereSegs = qualityTier.tier === 'desktop-high' ? 40 : 28;
  const bumpScale = isGasGiant ? 0.014 : 0.042;
  const roughness = isGasGiant ? 0.64 : 0.88;

  const showMoons = qualityTier.tier !== 'mobile-conserving';
  const moons = useMemo(() => {
    const count = showMoons ? planet.moonCount : 0;
    return Array.from({ length: count }, (_, idx) => ({
      id: `${planet.id}-moon-${idx}`,
      orbit: r * (1.72 + idx * 0.48),
      size: Math.max(0.055, r * (0.14 - idx * 0.03)),
      angle: idx * 2.2 + planet.initialAngle,
      tilt: idx === 0 ? 0.2 : -0.26,
    }));
  }, [showMoons, planet.id, planet.moonCount, planet.initialAngle, r]);

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHoverPlanet(planet.id);
    if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
  };

  const handleOut = () => {
    onHoverPlanet(null);
    if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelectPlanet(planet.id);
  };

  return (
    <>
      {/* Delicate celestial orbit path track */}
      <mesh rotation={[Math.PI / 2 - planet.inclination, 0, 0]}>
        <torusGeometry args={[orbitR, isHighlighted ? 0.01 : 0.006, 8, 128]} />
        <meshBasicMaterial
          color={isHighlighted ? planet.color : COSMIC_PALETTE.orbitTrack}
          transparent
          opacity={isHighlighted ? 0.44 : 0.16}
          depthWrite={false}
        />
      </mesh>

      {/* Orbiting Celestial Body */}
      <group ref={groupRef}>
        <mesh
          ref={sphereRef}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[r, sphereSegs, sphereSegs]} />
          <meshStandardMaterial
            ref={matRef}
            map={planetTextures.map}
            bumpMap={planetTextures.bumpMap}
            bumpScale={bumpScale}
            roughness={roughness}
            metalness={0.04}
            emissive={new Color(planet.color)}
            emissiveIntensity={0.03}
          />
        </mesh>

        {/* Soft seamless Fresnel atmospheric limb glow (zero hard outer edge) */}
        <mesh ref={haloMeshRef} scale={1.16} material={atmosphereMaterial}>
          <sphereGeometry args={[r, 32, 32]} />
        </mesh>

        {/* Saturnian multi-band planetary rings */}
        {ringTexture && (
          <mesh
            ref={ringRef}
            rotation={[Math.PI / 2.35, 0.26, 0]}
          >
            <ringGeometry args={[r * 1.38, r * 2.18, 72]} />
            <meshStandardMaterial
              map={ringTexture}
              transparent
              side={DoubleSide}
              roughness={0.85}
              metalness={0.04}
              opacity={isHighlighted ? 0.85 : 0.62}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Orbiting rocky satellites */}
        {moons.length > 0 && (
          <group ref={moonGroupRef}>
            {moons.map((moon) => (
              <mesh
                key={moon.id}
                position={[
                  Math.cos(moon.angle) * moon.orbit,
                  Math.sin(moon.angle) * moon.orbit * moon.tilt,
                  Math.sin(moon.angle) * moon.orbit,
                ]}
              >
                <sphereGeometry args={[moon.size, 14, 14]} />
                <meshStandardMaterial
                  color="#9AA6B8"
                  roughness={0.9}
                  metalness={0.04}
                />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </>
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
  const sunRef = useRef<Mesh>(null);
  const sunHaloRef = useRef<Mesh>(null);
  const sunTexture = useMemo(() => createSolarTexture(), []);
  const sunCoronaMaterial = useMemo(
    () => createAtmosphericHaloMaterial(COSMIC_PALETTE.sunCorona, 1.38, 0.56),
    [],
  );

  useEffect(() => {
    return () => {
      sunTexture.dispose();
      sunCoronaMaterial.dispose();
    };
  }, [sunTexture, sunCoronaMaterial]);

  const isSunActive = hoveredPlanet === 'sun' || selectedPlanet === 'sun';

  useFrame((_, delta) => {
    const dt = prefersReducedMotion ? 0 : Math.min(delta, 0.05);
    if (sunRef.current && !prefersReducedMotion) {
      sunRef.current.rotation.y += dt * 0.08;
    }
    const haloMat = sunHaloRef.current?.material as ShaderMaterial | undefined;
    const haloUniform = haloMat?.uniforms?.uIntensity;
    if (haloUniform) {
      const targetIntensity = isSunActive ? 0.68 : 0.48;
      haloUniform.value += (targetIntensity - haloUniform.value) * (prefersReducedMotion ? 1 : 0.12);
    }
  });

  const handleSunOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHoverPlanet('sun');
    if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
  };

  const handleSunOut = () => {
    onHoverPlanet(null);
    if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
  };

  const handleSunClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelectPlanet('sun');
  };

  return (
    <group>
      {/* Central Sun Star Core */}
      <group>
        <mesh
          ref={sunRef}
          onPointerOver={handleSunOver}
          onPointerOut={handleSunOut}
          onClick={handleSunClick}
        >
          <sphereGeometry args={[1.1, 44, 44]} />
          <meshStandardMaterial
            map={sunTexture}
            roughness={0.85}
            metalness={0.0}
            emissive={new Color('#FFA844')}
            emissiveMap={sunTexture}
            emissiveIntensity={isSunActive ? 1.55 : 1.32}
          />
        </mesh>

        {/* Smooth Fresnel radial solar corona fading continuously to zero at outer boundary */}
        <mesh ref={sunHaloRef} scale={1.38} material={sunCoronaMaterial}>
          <sphereGeometry args={[1.1, 36, 36]} />
        </mesh>

        {/* Physical inverse-square-like solar light illuminating planet terminators */}
        <pointLight
          position={[0, 0, 0]}
          intensity={32}
          distance={54}
          decay={1.2}
          color="#FFE3B3"
        />
      </group>

      {/* Six Portfolio Planet Worlds */}
      {SOLAR_SYSTEM_PLANETS.map((planet) => (
        <OrbitingPlanet
          key={planet.id}
          planet={planet}
          orbitScale={orbitScale}
          qualityTier={qualityTier}
          prefersReducedMotion={prefersReducedMotion}
          isHovered={hoveredPlanet === planet.id}
          isSelected={selectedPlanet === planet.id}
          onHoverPlanet={onHoverPlanet}
          onSelectPlanet={onSelectPlanet}
          elapsedTimeRef={elapsedTimeRef}
        />
      ))}
    </group>
  );
}
