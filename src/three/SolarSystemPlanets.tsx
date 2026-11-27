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
  type MeshBasicMaterial,
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
  planetPulseRef?: RefObject<Record<PlanetId, number>>;
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
  planetPulseRef,
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
  planetPulseRef?: RefObject<Record<PlanetId, number>>;
}) {
  const groupRef = useRef<Group>(null);
  const sphereRef = useRef<Mesh>(null);
  const cloudRef = useRef<Mesh>(null);
  const haloMeshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const reticleRef = useRef<Mesh>(null);
  const reticleMatRef = useRef<MeshBasicMaterial>(null);
  const ringRef = useRef<Mesh>(null);
  const moonGroupRef = useRef<Group>(null);
  const hoverDepthRef = useRef(0);

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
    () => createAtmosphericHaloMaterial(planet.rimColor, 1.18, 0.24),
    [planet.rimColor],
  );

  useEffect(() => {
    return () => {
      planetTextures.map.dispose();
      planetTextures.bumpMap.dispose();
      planetTextures.roughnessMap?.dispose();
      planetTextures.cloudMap?.dispose();
      ringTexture?.dispose();
      atmosphereMaterial.dispose();
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
    };
  }, [planetTextures, ringTexture, atmosphereMaterial]);

  const isHighlighted = isHovered || isSelected;

  useFrame((_, delta) => {
    const dt = prefersReducedMotion ? 0 : Math.min(delta, 0.05);
    const t = elapsedTimeRef.current ?? 0;
    const stamped = planetPulseRef?.current?.[planet.id] ?? 0;
    const ageMs = stamped > 0 ? performance.now() - stamped : Infinity;
    const rawPulse =
      prefersReducedMotion || stamped <= 0 || ageMs > 2600
        ? 0
        : ageMs <= 0
          ? 1.15
          : Math.exp(-ageMs / 420);

    if (groupRef.current) {
      const [x, y, z] = getPlanetWorldPosition(planet, t, orbitScale);
      groupRef.current.position.set(x, y, z);

      const targetScale =
        (isHovered ? 1.1 : isSelected ? 1.045 : 1.0) + rawPulse * 0.05;
      const curScale = groupRef.current.scale.x;
      const nextScale =
        curScale + (targetScale - curScale) * (prefersReducedMotion ? 1 : 0.14);
      groupRef.current.scale.setScalar(nextScale);
    }

    if (sphereRef.current && !prefersReducedMotion) {
      sphereRef.current.rotation.y +=
        dt * (isHovered ? 0.36 : 0.16 + rawPulse * 0.28);
    }

    if (cloudRef.current && !prefersReducedMotion) {
      cloudRef.current.rotation.y +=
        dt * (isHovered ? 0.44 : 0.21 + rawPulse * 0.32);
    }

    if (moonGroupRef.current && !prefersReducedMotion) {
      moonGroupRef.current.rotation.y += dt * (isHighlighted ? 0.62 : 0.44);
    }

    if (ringRef.current && !prefersReducedMotion) {
      ringRef.current.rotation.z += dt * (0.06 + rawPulse * 0.08);
    }

    if (reticleRef.current && !prefersReducedMotion) {
      reticleRef.current.rotation.z -= dt * (0.28 + rawPulse * 0.5);
    }

    if (reticleMatRef.current) {
      const targetReticleOpacity = isHovered
        ? 0.72
        : Math.min(0.68, (isSelected ? 0.24 : 0) + rawPulse * 0.56);
      reticleMatRef.current.opacity +=
        (targetReticleOpacity - reticleMatRef.current.opacity) *
        (prefersReducedMotion ? 1 : 0.16);
    }

    const haloMat = haloMeshRef.current?.material as ShaderMaterial | undefined;
    const haloUniform = haloMat?.uniforms?.uIntensity;
    if (haloUniform) {
      const targetHalo =
        (isHovered ? 0.48 : isSelected ? 0.34 : 0.21) + rawPulse * 0.26;
      haloUniform.value +=
        (targetHalo - haloUniform.value) * (prefersReducedMotion ? 1 : 0.16);
    }

    if (matRef.current) {
      const targetEmissive =
        (isHovered ? 0.17 : isSelected ? 0.095 : 0.032) + rawPulse * 0.18;
      matRef.current.emissiveIntensity +=
        (targetEmissive - matRef.current.emissiveIntensity) *
        (prefersReducedMotion ? 1 : 0.16);
    }
  });

  const isGasGiant =
    planet.bandStyle === 'jovian' ||
    planet.bandStyle === 'sovereign' ||
    planet.bandStyle === 'molecular';
  const r = planet.radius;
  const orbitR = planet.orbitRadius * orbitScale;
  const sphereSegs = qualityTier.tier === 'desktop-high' ? 44 : 30;
  const bumpScale = isGasGiant ? 0.016 : 0.048;
  const roughness =
    planet.bandStyle === 'oceanic' ? 0.94 : isGasGiant ? 0.66 : 0.92;
  const axialTilt = (planet.inclination || 0.06) * 1.45 + 0.09;

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
    hoverDepthRef.current += 1;
    onHoverPlanet(planet.id);
    if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
  };

  const handleOut = () => {
    hoverDepthRef.current = Math.max(0, hoverDepthRef.current - 1);
    if (hoverDepthRef.current === 0) {
      onHoverPlanet(null);
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 16) return;
    hoverDepthRef.current = 0;
    onHoverPlanet(null);
    if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
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
        <group rotation={[axialTilt, 0, axialTilt * 0.35]}>
          <mesh ref={sphereRef}>
            <sphereGeometry args={[r, sphereSegs, sphereSegs]} />
            <meshStandardMaterial
              ref={matRef}
              map={planetTextures.map}
              bumpMap={planetTextures.bumpMap}
              bumpScale={bumpScale}
              roughnessMap={planetTextures.roughnessMap}
              roughness={roughness}
              metalness={planet.bandStyle === 'orbital' ? 0.12 : 0.04}
              emissive={new Color(planet.color)}
              emissiveIntensity={0.03}
            />
          </mesh>

          {/* Drifting concentric cloud atmosphere shell */}
          {planetTextures.cloudMap && (
            <mesh ref={cloudRef} scale={1.032}>
              <sphereGeometry args={[r, sphereSegs, sphereSegs]} />
              <meshStandardMaterial
                map={planetTextures.cloudMap}
                transparent
                opacity={isHovered ? 0.88 : 0.72}
                roughness={0.86}
                metalness={0}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Saturnian multi-band planetary rings */}
          {ringTexture && (
            <mesh
              ref={ringRef}
              rotation={[Math.PI / 2.35, 0.26, 0]}
              onPointerOver={handleOver}
              onPointerOut={handleOut}
              onClick={handleClick}
            >
              <ringGeometry args={[r * 1.38, r * 2.18, 72]} />
              <meshStandardMaterial
                map={ringTexture}
                transparent
                side={DoubleSide}
                roughness={0.85}
                metalness={0.04}
                opacity={isHighlighted ? 0.88 : 0.64}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Interactive Equatorial Orbital Lock / Pulse Reticle */}
          <mesh ref={reticleRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r * (planet.hasRing ? 2.34 : 1.46), 0.011, 8, 96]} />
            <meshBasicMaterial
              ref={reticleMatRef}
              color={planet.rimColor}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Generous invisible pointer collider so hovering/clicking a planet pauses and redirects reliably */}
        <mesh
          onPointerOver={handleOver}
          onPointerOut={handleOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[Math.max(r * 1.78, 0.78), 20, 20]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Soft seamless Fresnel atmospheric limb glow (zero hard outer edge) */}
        <mesh ref={haloMeshRef} scale={1.18} material={atmosphereMaterial}>
          <sphereGeometry args={[r, 32, 32]} />
        </mesh>

        {/* Orbiting rocky satellites with inclined orbital hairlines */}
        {moons.length > 0 && (
          <group ref={moonGroupRef}>
            {moons.map((moon, mIdx) => (
              <group key={moon.id} rotation={[moon.tilt, 0, mIdx * 0.28]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[moon.orbit, 0.004, 6, 56]} />
                  <meshBasicMaterial
                    color={isHighlighted ? planet.rimColor : COSMIC_PALETTE.orbitTrack}
                    transparent
                    opacity={isHighlighted ? 0.34 : 0.14}
                    depthWrite={false}
                  />
                </mesh>
                <mesh
                  position={[
                    Math.cos(moon.angle) * moon.orbit,
                    0,
                    Math.sin(moon.angle) * moon.orbit,
                  ]}
                >
                  <sphereGeometry args={[moon.size, 16, 16]} />
                  <meshStandardMaterial
                    color={mIdx % 2 === 0 ? '#BCC6D8' : '#96A4B8'}
                    roughness={0.86}
                    metalness={0.05}
                  />
                </mesh>
              </group>
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
  planetPulseRef,
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
    const stamped = planetPulseRef?.current?.sun ?? 0;
    const ageMs = stamped > 0 ? performance.now() - stamped : Infinity;
    const sunPulse =
      prefersReducedMotion || stamped <= 0 || ageMs > 2600
        ? 0
        : ageMs <= 0
          ? 1.15
          : Math.exp(-ageMs / 420);
    if (sunRef.current && !prefersReducedMotion) {
      sunRef.current.rotation.y += dt * (0.08 + sunPulse * 0.16);
    }
    const haloMat = sunHaloRef.current?.material as ShaderMaterial | undefined;
    const haloUniform = haloMat?.uniforms?.uIntensity;
    if (haloUniform) {
      const targetIntensity = (isSunActive ? 0.68 : 0.48) + sunPulse * 0.22;
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
    if (e.delta > 16) return;
    onHoverPlanet(null);
    if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
    onSelectPlanet('sun');
  };

  return (
    <group>
      {/* Central Sun Star Core */}
      <group>
        <mesh ref={sunRef}>
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

        {/* Generous invisible pointer collider matching solar corona so hovering/clicking Sun redirects reliably */}
        <mesh
          onPointerOver={handleSunOver}
          onPointerOut={handleSunOut}
          onClick={handleSunClick}
        >
          <sphereGeometry args={[1.65, 24, 24]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
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
          planetPulseRef={planetPulseRef}
        />
      ))}
    </group>
  );
}
