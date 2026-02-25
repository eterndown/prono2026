
export type LetraGrupo = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export type Fase = 'Grupos' | 'Dieciseisavos' | 'Octavos' | 'Cuartos' | 'Semis' | 'TercerPuesto' | 'Final';

// Match is an alias for Partido used in UI components
export type Match = Partido;

export interface Equipo {
  id: string;
  nombre: string;
  bandera: string;
  grupo: LetraGrupo;
}

export interface Partido {
  id: number;
  fase: Fase;
  grupo?: LetraGrupo;
  equipoLocal: string | null;
  equipoVisitante: string | null;
  placeholderLocal?: string;
  placeholderVisitante?: string;
  golesLocal: number | string | null;
  golesVisitante: number | string | null;
  penalesLocal?: number | string | null;
  penalesVisitante?: number | string | null;
  fecha: string;
  estadio?: string;
  ciudad?: string;
  numM?: number;
  hSimu?: string;
  // Metadata para desbloqueo progresivo
  gruposOrigen?: LetraGrupo[];
}

export interface Clasificacion {
  equipoId: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  puntos: number;
  letraGrupo?: LetraGrupo;
  forma: ('G' | 'E' | 'P' | '-')[];
}

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  isFrozen: boolean;
  fechaCreacion: string;
  ultimoLogin: string;
  activo: boolean;
}

export interface Pronostico {
  local: number | string | null;
  visitante: number | string | null;
  penalesLocal?: number | string | null;
  penalesVisitante?: number | string | null;
  esSimulacion?: boolean; // Indica si el dato es temporal/simulado
}

// Prediction interface for AI Analysis and results probability
export interface Prediction {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  suggestedScore: string;
  confidence: number;
  keyFactors: string[];
  analysis: string;
  sources?: { title: string; uri: string }[];
}

export interface InfoEstadio {
  e: string;
  c: string;
  lat: number;
  lng: number;
  url: string;
  pais: 'Mexico' | 'Canada' | 'USA';
  capacidad: number;
}

export interface TimeConfig {
  modoTiempo: 'PRESENTE' | 'SIMULACION';
  fechaSimulacion: string | null;
}

export interface GlobalSettings {
  groupsPhaseLocked: boolean; // Nivel 2: Manual por fase
  knockoutPhaseLocked: boolean; // Nivel 2: Manual por fase
  manualLockedMatchIds: number[]; // Nivel 1: Manual por partido (Lock)
  manualUnlockedMatchIds: number[]; // Nivel 1: Manual por partido (Unlock)
  timeConfig?: TimeConfig; // Persistencia del simulador de tiempo
}

// Enum for generic match card compatibility if needed
export enum SportType {
  SOCCER = 'SOCCER',
  BASKETBALL = 'BASKETBALL',
  TENNIS = 'TENNIS'
}
