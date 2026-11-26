import type { SectionId } from '@/data/sections';

export type PlanetId = SectionId extends infer T
  ? T extends 'hero'
    ? 'sun'
    : T
  : never;

export type PlanetBandStyle =
  | 'oceanic'
  | 'molecular'
  | 'jovian'
  | 'orbital'
  | 'sovereign'
  | 'beacon';

export interface PlanetDefinition {
  readonly id: Exclude<PlanetId, 'sun'>;
  readonly sectionId: Exclude<SectionId, 'hero'>;
  readonly label: string;
  readonly cosmicTitle: string;
  readonly subtitle: string;
  readonly orbitRadius: number;
  readonly radius: number;
  readonly orbitSpeed: number;
  readonly initialAngle: number;
  readonly inclination: number;
  readonly color: string;
  readonly deepColor: string;
  readonly rimColor: string;
  readonly moonCount: number;
  readonly hasRing?: boolean;
  readonly bandStyle: PlanetBandStyle;
}

export interface CosmicPaletteConfig {
  readonly canvas: string;
  readonly sunCore: string;
  readonly sunCorona: string;
  readonly chrome: string;
  readonly starFar: string;
  readonly starMid: string;
  readonly starNear: string;
  readonly orbitTrack: string;
}

export const COSMIC_PALETTE: CosmicPaletteConfig = {
  canvas: '#020307',
  sunCore: '#FFD27D',
  sunCorona: '#FF9E3D',
  chrome: '#DCE4F0',
  starFar: '#8FA2C2',
  starMid: '#D8E3F5',
  starNear: '#FFF4DC',
  orbitTrack: '#3B485E',
};

export const SOLAR_SYSTEM_PLANETS: readonly PlanetDefinition[] = [
  {
    id: 'about',
    sectionId: 'about',
    label: 'About',
    cosmicTitle: 'Terra Cyan · Identity',
    subtitle: 'Narrative, Education & Portrait',
    orbitRadius: 3.1,
    radius: 0.48,
    orbitSpeed: 0.095,
    initialAngle: 0.42,
    inclination: 0.06,
    color: '#38BDF8',
    deepColor: '#075985',
    rimColor: '#BAE6FD',
    moonCount: 1,
    bandStyle: 'oceanic',
  },
  {
    id: 'skills',
    sectionId: 'skills',
    label: 'Skills',
    cosmicTitle: 'Aether Violet · Molecular Core',
    subtitle: '21 Verified Technical Nodes',
    orbitRadius: 4.5,
    radius: 0.54,
    orbitSpeed: 0.072,
    initialAngle: 1.48,
    inclination: -0.08,
    color: '#818CF8',
    deepColor: '#3730A3',
    rimColor: '#C7D2FE',
    moonCount: 2,
    bandStyle: 'molecular',
  },
  {
    id: 'projects',
    sectionId: 'projects',
    label: 'Projects',
    cosmicTitle: 'Pyros Amber · Flagship Systems',
    subtitle: '5 Deployed Engineering Worlds',
    orbitRadius: 6.1,
    radius: 0.7,
    orbitSpeed: 0.056,
    initialAngle: 2.52,
    inclination: 0.05,
    color: '#FB923C',
    deepColor: '#9A3412',
    rimColor: '#FED7AA',
    moonCount: 2,
    hasRing: true,
    bandStyle: 'jovian',
  },
  {
    id: 'experience',
    sectionId: 'experience',
    label: 'Experience',
    cosmicTitle: 'Viridis Teal · Trajectory Arc',
    subtitle: 'Orbital Timeline Station',
    orbitRadius: 7.7,
    radius: 0.52,
    orbitSpeed: 0.044,
    initialAngle: 3.74,
    inclination: -0.05,
    color: '#2DD4BF',
    deepColor: '#115E59',
    rimColor: '#99F6E4',
    moonCount: 1,
    hasRing: true,
    bandStyle: 'orbital',
  },
  {
    id: 'achievements',
    sectionId: 'achievements',
    label: 'Achievements',
    cosmicTitle: 'Solstice Gold · Constellation',
    subtitle: 'Hackathon Honors & Beacons',
    orbitRadius: 9.3,
    radius: 0.62,
    orbitSpeed: 0.036,
    initialAngle: 4.86,
    inclination: 0.07,
    color: '#FACC15',
    deepColor: '#854D0E',
    rimColor: '#FEF08A',
    moonCount: 2,
    hasRing: true,
    bandStyle: 'sovereign',
  },
  {
    id: 'contact',
    sectionId: 'contact',
    label: 'Contact',
    cosmicTitle: 'Nova Rose · Signal Relay',
    subtitle: 'Direct Channels & Résumé',
    orbitRadius: 10.9,
    radius: 0.5,
    orbitSpeed: 0.029,
    initialAngle: 5.75,
    inclination: -0.06,
    color: '#F472B6',
    deepColor: '#9D174D',
    rimColor: '#FBCFE8',
    moonCount: 1,
    bandStyle: 'beacon',
  },
] as const;

export function getPlanetDefinition(
  id: Exclude<PlanetId, 'sun'>,
): PlanetDefinition {
  const found = SOLAR_SYSTEM_PLANETS.find((planet) => planet.id === id);
  return found ?? SOLAR_SYSTEM_PLANETS[0];
}

export function getPlanetWorldPosition(
  planet: PlanetDefinition,
  elapsedTime: number,
  orbitScale = 1,
): [number, number, number] {
  const angle = planet.initialAngle + elapsedTime * planet.orbitSpeed;
  const r = planet.orbitRadius * orbitScale;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  const y = Math.sin(angle * 1.1) * r * planet.inclination;
  return [x, y, z];
}
