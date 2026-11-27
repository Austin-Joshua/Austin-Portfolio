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
    subtitle: 'Narrative, Education & Dossier',
    orbitRadius: 3.4,
    radius: 0.46,
    orbitSpeed: 0.088,
    initialAngle: 0.04,
    inclination: 0.09,
    color: '#38BDF8',
    deepColor: '#0A3D5C',
    rimColor: '#9EDCFB',
    moonCount: 1,
    bandStyle: 'oceanic',
  },
  {
    id: 'skills',
    sectionId: 'skills',
    label: 'Skills',
    cosmicTitle: 'Aether Violet · Molecular Core',
    subtitle: '21 Verified Technical Nodes',
    orbitRadius: 5.0,
    radius: 0.52,
    orbitSpeed: 0.068,
    initialAngle: 2.62,
    inclination: -0.1,
    color: '#818CF8',
    deepColor: '#2A256E',
    rimColor: '#B8C2FA',
    moonCount: 2,
    bandStyle: 'molecular',
  },
  {
    id: 'projects',
    sectionId: 'projects',
    label: 'Projects',
    cosmicTitle: 'Pyros Amber · Flagship Systems',
    subtitle: '5 Deployed Engineering Worlds',
    orbitRadius: 6.8,
    radius: 0.66,
    orbitSpeed: 0.052,
    initialAngle: 3.22,
    inclination: 0.08,
    color: '#FB923C',
    deepColor: '#6E280E',
    rimColor: '#F5C49B',
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
    orbitRadius: 8.6,
    radius: 0.5,
    orbitSpeed: 0.04,
    initialAngle: 0.34,
    inclination: -0.09,
    color: '#2DD4BF',
    deepColor: '#0E4844',
    rimColor: '#8BE6D8',
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
    orbitRadius: 10.4,
    radius: 0.58,
    orbitSpeed: 0.032,
    initialAngle: -0.22,
    inclination: 0.1,
    color: '#FACC15',
    deepColor: '#663D0D',
    rimColor: '#F2DE8A',
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
    orbitRadius: 12.2,
    radius: 0.48,
    orbitSpeed: 0.026,
    initialAngle: 3.52,
    inclination: -0.08,
    color: '#F472B6',
    deepColor: '#66183A',
    rimColor: '#F2B8D6',
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
