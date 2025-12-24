import * as THREE from 'three';

export enum AppState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED',
}

export interface DualPosition {
  chaos: THREE.Vector3;
  target: THREE.Vector3;
}

export interface PolaroidData {
  id: number;
  url: string;
  description: string;
  position: DualPosition;
  rotation: THREE.Euler;
}

export const LUXURY_COLORS = {
  EMERALD_DEEP: '#002811',
  EMERALD_LIGHT: '#005C29',
  GOLD_HIGH: '#FFD700',
  GOLD_DARK: '#B8860B',
  SKY_BLUE: '#87CEEB',
  RIBBON_RED: '#8B0000',
};