import { LetraGrupo, Equipo, Partido, InfoEstadio, Fase } from './types';

export const GRUPOS: LetraGrupo[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Apertura del Mundial: 11 de Junio de 2026.
export const DEADLINE_GROUPS = "2026-06-11T16:00:00-03:00"; 
export const DEADLINE_KNOCKOUT = "2026-06-28T15:00:00-03:00";

export const getFlagUrl = (id: string | null): string => {
  if (!id) return 'https://flagcdn.com/un.svg';
  const mapping: Record<string, string> = {
    'ARG': 'ar', 'BRA': 'br', 'MEX': 'mx', 'USA': 'us', 'CAN': 'ca',
    'ESP': 'es', 'FRA': 'fr', 'GER': 'de', 'ITA': 'it', 'ENG': 'gb-eng',
    'POR': 'pt', 'URU': 'uy', 'COL': 'co', 'BEL': 'be', 'NED': 'nl',
    'MAR': 'ma', 'JPN': 'jp', 'KOR': 'kr', 'SEN': 'sn', 'KSA': 'sa',
    'CRO': 'hr', 'SUI': 'ch', 'DEN': 'dk', 'ECU': 'ec', 'VEN': 've',
    'PAR': 'py', 'CHI': 'cl', 'BOL': 'bo', 'PER': 'pe', 'RSA': 'za',
    'QAT': 'qa', 'SCO': 'gb-sct', 'AUS': 'au', 'CUW': 'cw', 'CIV': 'ci',
    'TUN': 'tn', 'IRN': 'ir', 'CPV': 'cv', 'NZL': 'nz', 'EGY': 'eg',
    'AUT': 'at', 'JOR': 'jo', 'ALG': 'dz', 'UZB': 'uz', 'PAN': 'pa',
    'GHA': 'gh', 'HAI': 'ht', 'NOR': 'no', 'JAM': 'jm', 'COD': 'cd', 'UKR': 'ua',
    'F4': 'un', 'K3': 'un', 'EUR1': 'un', 'EUR2': 'un', 'EUR3': 'un', 'BSI': 'un'
  };
  if (mapping[id]) return `https://flagcdn.com/${mapping[id]}.svg`;
  const code = (id && id.length === 2) ? id.toLowerCase() : 'un';
  return `https://flagcdn.com/${code}.svg`;
};

export const ESTADIOS: Record<string, InfoEstadio> = {
  'Azteca': { e: 'Estadio Ciudad de México', c: 'CDMX', lat: 19.3029, lng: -99.1505, url: '#', pais: 'Mexico', capacidad: 87523 },
  'Toronto': { e: 'Toronto Stadium', c: 'Toronto', lat: 43.6332, lng: -79.3986, url: '#', pais: 'Canada', capacidad: 45000 },
  'LA': { e: 'Los Angeles Stadium', c: 'Los Ángeles', lat: 33.9535, lng: -118.3390, url: '#', pais: 'USA', capacidad: 70000 },
  'NY': { e: 'Nueva York Nueva Jersey Stadium', c: 'East Rutherford', lat: 40.8128, lng: -74.0742, url: '#', pais: 'USA', capacidad: 82500 },
  'Miami': { e: 'Miami Stadium', c: 'Miami Gardens', lat: 25.9580, lng: -80.2389, url: '#', pais: 'USA', capacidad: 64767 },
  'Dallas': { e: 'Dallas Stadium', c: 'Arlington', lat: 32.7473, lng: -97.0945, url: '#', pais: 'USA', capacidad: 80000 },
  'Atlanta': { e: 'Atlanta Stadium', c: 'Atlanta', lat: 33.7553, lng: -84.4006, url: '#', pais: 'USA', capacidad: 71000 },
  'Houston': { e: 'Houston Stadium', c: 'Houston', lat: 29.6847, lng: -95.4082, url: '#', pais: 'USA', capacidad: 72220 },
  'Boston': { e: 'Boston Stadium', c: 'Foxborough', lat: 42.0909, lng: -71.2643, url: '#', pais: 'USA', capacidad: 65878 },
  'Seattle': { e: 'Seattle Stadium', c: 'Seattle', lat: 47.5952, lng: -122.3316, url: '#', pais: 'USA', capacidad: 69000 },
  'Vancouver': { e: 'BC Place Vancouver', c: 'Vancouver', lat: 49.2767, lng: -123.1084, url: '#', pais: 'Canada', capacidad: 54500 },
  'San Francisco': { e: 'San Francisco Bay Area Stadium', c: 'Santa Clara', lat: 37.4033, lng: -121.9694, url: '#', pais: 'USA', capacidad: 68500 },
  'Monterrey': { e: 'Estadio Monterrey', c: 'Monterrey', lat: 25.6689, lng: -100.2446, url: '#', pais: 'Mexico', capacidad: 53500 },
  'Guadalajara': { e: 'Estadio Guadalajara', c: 'Guadalajara', lat: 20.6811, lng: -103.4627, url: '#', pais: 'Mexico', capacidad: 48071 },
  'Kansas City': { e: 'Kansas City Stadium', c: 'Kansas City', lat: 39.0489, lng: -94.4839, url: '#', pais: 'USA', capacidad: 76416 },
  'Filadelfia': { e: 'Philadelphia Stadium', c: 'Filadelfia', lat: 39.9012, lng: -75.1675, url: '#', pais: 'USA', capacidad: 69796 }
};

export const EQUIPOS: Equipo[] = [
  { id: 'MEX', nombre: 'México', bandera: '🇲🇽', grupo: 'A' }, { id: 'RSA', nombre: 'Sudáfrica', bandera: '🇿🇦', grupo: 'A' }, { id: 'KOR', nombre: 'Corea del Sur', bandera: '🇰🇷', grupo: 'A' }, { id: 'EUR1', nombre: 'DEN/MDK/CZE/IRL', bandera: '🇪🇺', grupo: 'A' },
  { id: 'CAN', nombre: 'Canadá', bandera: '🇨🇦', grupo: 'B' }, { id: 'EUR2', nombre: 'ITA/NOR/WAL/SCO', bandera: '🇪🇺', grupo: 'B' }, { id: 'QAT', nombre: 'Qatar', bandera: '🇶🇦', grupo: 'B' }, { id: 'SUI', nombre: 'Suiza', bandera: '🇨🇭', grupo: 'B' },
  { id: 'BRA', nombre: 'Brasil', bandera: '🇧🇷', grupo: 'C' }, { id: 'MAR', nombre: 'Marruecos', bandera: '🇲🇦', grupo: 'C' }, { id: 'HAI', nombre: 'Haití', bandera: '🇭🇹', grupo: 'C' }, { id: 'SCO', nombre: 'Escocia', bandera: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', grupo: 'C' },
  { id: 'USA', nombre: 'Estados Unidos', bandera: '🇺🇸', grupo: 'D' }, { id: 'PAR', nombre: 'Paraguay', bandera: '🇵🇾', grupo: 'D' }, { id: 'AUS', nombre: 'Australia', bandera: '🇦🇺', grupo: 'D' }, { id: 'EUR3', nombre: 'TUR/ROU/SVK/KOS', bandera: '🇪🇺', grupo: 'D' },
  { id: 'GER', nombre: 'Alemania', bandera: '🇩🇪', grupo: 'E' }, { id: 'CUW', nombre: 'Curazao', bandera: '🇨🇼', grupo: 'E' }, { id: 'CIV', nombre: 'Costa de Marfil', bandera: '🇨🇮', grupo: 'E' }, { id: 'ECU', nombre: 'Ecuador', bandera: '🇪🇨', grupo: 'E' },
  { id: 'NED', nombre: 'Países Bajos', bandera: '🇳🇱', grupo: 'F' }, { id: 'JPN', nombre: 'Japón', bandera: '🇯🇵', grupo: 'F' }, { id: 'TUN', nombre: 'Túnez', bandera: '🇹🇳', grupo: 'F' }, { id: 'F4', nombre: 'UKR/SWE/POL/ALB', bandera: '🇪🇺', grupo: 'F' },
  { id: 'BEL', nombre: 'Bélgica', bandera: '🇧🇪', grupo: 'G' }, { id: 'EGY', nombre: 'Egipto', bandera: '🇪🇬', grupo: 'G' }, { id: 'IRN', nombre: 'Irán', bandera: '🇮🇷', grupo: 'G' }, { id: 'NZL', nombre: 'Nueva Zelanda', bandera: '🇳🇿', grupo: 'G' },
  { id: 'ESP', nombre: 'España', bandera: '🇪🇸', grupo: 'H' }, { id: 'CPV', nombre: 'Cabo Verde', bandera: '🇨🇻', grupo: 'H' }, { id: 'KSA', nombre: 'Arabia Saudita', bandera: '🇸🇦', grupo: 'H' }, { id: 'URU', nombre: 'Uruguay', bandera: '🇺🇾', grupo: 'H' },
  { id: 'FRA', nombre: 'Francia', bandera: '🇫🇷', grupo: 'I' }, { id: 'SEN', nombre: 'Senegal', bandera: '🇸🇳', grupo: 'I' }, { id: 'BSI', nombre: 'BOL/SUR/IRQ', bandera: '🏳️', grupo: 'I' }, { id: 'NOR', nombre: 'Noruega', bandera: '🇳🇴', grupo: 'I' },
  { id: 'ARG', nombre: 'Argentina', bandera: '🇦🇷', grupo: 'J' }, { id: 'ALG', nombre: 'Argelia', bandera: '🇩🇿', grupo: 'J' }, { id: 'AUT', nombre: 'Austria', bandera: '🇦🇹', grupo: 'J' }, { id: 'JOR', nombre: 'Jordania', bandera: '🇯🇴', grupo: 'J' },
  { id: 'K3', nombre: 'NCL/JAM/COD', bandera: '🏳️', grupo: 'K' }, { id: 'POR', nombre: 'Portugal', bandera: '🇵🇹', grupo: 'K' }, { id: 'UZB', nombre: 'Uzbekistán', bandera: '🇺🇿', grupo: 'K' }, { id: 'COL', nombre: 'Colombia', bandera: '🇨🇴', grupo: 'K' },
  { id: 'ENG', nombre: 'Inglaterra', bandera: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', grupo: 'L' }, { id: 'CRO', nombre: 'Croacia', bandera: '🇭🇷', grupo: 'L' }, { id: 'GHA', nombre: 'Ghana', bandera: '🇬🇭', grupo: 'L' }, { id: 'PAN', nombre: 'Panamá', bandera: '🇵🇦', grupo: 'L' },
];

export const PARTIDOS_INICIALES: Partido[] = [
  // Round 1
  { id: 1, fase: 'Grupos', grupo: 'A', equipoLocal: 'MEX', equipoVisitante: 'RSA', fecha: 'Jueves, 11 de junio', hSimu: '16:00', estadio: 'Estadio Ciudad de México', ciudad: 'CDMX' },
  { id: 2, fase: 'Grupos', grupo: 'A', equipoLocal: 'KOR', equipoVisitante: 'EUR1', fecha: 'Jueves, 11 de junio', hSimu: '23:00', estadio: 'Estadio Guadalajara', ciudad: 'Guadalajara' },
  { id: 3, fase: 'Grupos', grupo: 'B', equipoLocal: 'CAN', equipoVisitante: 'EUR2', fecha: 'Viernes, 12 de junio', hSimu: '16:00', estadio: 'Toronto Stadium', ciudad: 'Toronto' },
  { id: 4, fase: 'Grupos', grupo: 'D', equipoLocal: 'USA', equipoVisitante: 'PAR', fecha: 'Viernes, 12 de junio', hSimu: '22:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles' },
  { id: 5, fase: 'Grupos', grupo: 'B', equipoLocal: 'QAT', equipoVisitante: 'SUI', fecha: 'Sábado, 13 de junio', hSimu: '16:00', estadio: 'San Francisco Bay Area Stadium', ciudad: 'Santa Clara' },
  { id: 6, fase: 'Grupos', grupo: 'C', equipoLocal: 'BRA', equipoVisitante: 'MAR', fecha: 'Sábado, 13 de junio', hSimu: '19:00', estadio: 'Nueva York Nueva Jersey Stadium', ciudad: 'East Rutherford' },
  { id: 7, fase: 'Grupos', grupo: 'C', equipoLocal: 'HAI', equipoVisitante: 'SCO', fecha: 'Sábado, 13 de junio', hSimu: '22:00', estadio: 'Boston Stadium', ciudad: 'Foxborough' },
  { id: 8, fase: 'Grupos', grupo: 'D', equipoLocal: 'AUS', equipoVisitante: 'EUR3', fecha: 'Domingo, 14 de junio', hSimu: '01:00', estadio: 'BC Place Vancouver', ciudad: 'Vancouver' },
  { id: 9, fase: 'Grupos', grupo: 'E', equipoLocal: 'GER', equipoVisitante: 'CUW', fecha: 'Domingo, 14 de junio', hSimu: '14:00', estadio: 'Houston Stadium', ciudad: 'Houston' },
  { id: 10, fase: 'Grupos', grupo: 'F', equipoLocal: 'NED', equipoVisitante: 'JPN', fecha: 'Domingo, 14 de junio', hSimu: '17:00', estadio: 'Dallas Stadium', ciudad: 'Arlington' },
  { id: 11, fase: 'Grupos', grupo: 'E', equipoLocal: 'CIV', equipoVisitante: 'ECU', fecha: 'Domingo, 14 de junio', hSimu: '20:00', estadio: 'Philadelphia Stadium', ciudad: 'Filadelfia' },
  { id: 12, fase: 'Grupos', grupo: 'F', equipoLocal: 'TUN', equipoVisitante: 'F4', fecha: 'Domingo, 14 de junio', hSimu: '23:00', estadio: 'Estadio Monterrey', ciudad: 'Monterrey' },
  { id: 13, fase: 'Grupos', grupo: 'H', equipoLocal: 'ESP', equipoVisitante: 'CPV', fecha: 'Lunes, 15 de junio', hSimu: '13:00', estadio: 'Atlanta Stadium', ciudad: 'Atlanta' },
  { id: 14, fase: 'Grupos', grupo: 'G', equipoLocal: 'BEL', equipoVisitante: 'EGY', fecha: 'Lunes, 15 de junio', hSimu: '16:00', estadio: 'Seattle Stadium', ciudad: 'Seattle' },
  { id: 15, fase: 'Grupos', grupo: 'H', equipoLocal: 'KSA', equipoVisitante: 'URU', fecha: 'Lunes, 15 de junio', hSimu: '19:00', estadio: 'Miami Stadium', ciudad: 'Miami Gardens' },
  { id: 16, fase: 'Grupos', grupo: 'G', equipoLocal: 'IRN', equipoVisitante: 'NZL', fecha: 'Lunes, 15 de junio', hSimu: '22:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles' },
  { id: 17, fase: 'Grupos', grupo: 'I', equipoLocal: 'FRA', equipoVisitante: 'SEN', fecha: 'Martes, 16 de junio', hSimu: '16:00', estadio: 'Nueva York Nueva Jersey Stadium', ciudad: 'East Rutherford' },
  { id: 18, fase: 'Grupos', grupo: 'I', equipoLocal: 'BSI', equipoVisitante: 'NOR', fecha: 'Martes, 16 de junio', hSimu: '19:00', estadio: 'Boston Stadium', ciudad: 'Foxborough' },
  { id: 19, fase: 'Grupos', grupo: 'J', equipoLocal: 'ARG', equipoVisitante: 'ALG', fecha: 'Martes, 16 de junio', hSimu: '22:00', estadio: 'Kansas City Stadium', ciudad: 'Kansas City' },
  { id: 20, fase: 'Grupos', grupo: 'J', equipoLocal: 'AUT', equipoVisitante: 'JOR', fecha: 'Miércoles, 17 de junio', hSimu: '01:00', estadio: 'San Francisco Bay Area Stadium', ciudad: 'Santa Clara' },
  { id: 21, fase: 'Grupos', grupo: 'K', equipoLocal: 'K3', equipoVisitante: 'POR', fecha: 'Miércoles, 17 de junio', hSimu: '14:00', estadio: 'Houston Stadium', ciudad: 'Houston' },
  { id: 22, fase: 'Grupos', grupo: 'L', equipoLocal: 'ENG', equipoVisitante: 'CRO', fecha: 'Miércoles, 17 de junio', hSimu: '17:00', estadio: 'Dallas Stadium', ciudad: 'Arlington' },
  { id: 23, fase: 'Grupos', grupo: 'L', equipoLocal: 'GHA', equipoVisitante: 'PAN', fecha: 'Miércoles, 17 de junio', hSimu: '20:00', estadio: 'Toronto Stadium', ciudad: 'Toronto' },
  { id: 24, fase: 'Grupos', grupo: 'K', equipoLocal: 'UZB', equipoVisitante: 'COL', fecha: 'Miércoles, 17 de junio', hSimu: '23:00', estadio: 'Estadio Ciudad de México', ciudad: 'CDMX' },

  // Round 2
  { id: 25, fase: 'Grupos', grupo: 'A', equipoLocal: 'EUR1', equipoVisitante: 'RSA', fecha: 'Jueves, 18 de junio', hSimu: '13:00', estadio: 'Atlanta Stadium', ciudad: 'Atlanta' },
  { id: 26, fase: 'Grupos', grupo: 'B', equipoLocal: 'SUI', equipoVisitante: 'EUR2', fecha: 'Jueves, 18 de junio', hSimu: '16:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles' },
  { id: 27, fase: 'Grupos', grupo: 'B', equipoLocal: 'CAN', equipoVisitante: 'QAT', fecha: 'Jueves, 18 de junio', hSimu: '19:00', estadio: 'BC Place Vancouver', ciudad: 'Vancouver' },
  { id: 28, fase: 'Grupos', grupo: 'A', equipoLocal: 'MEX', equipoVisitante: 'KOR', fecha: 'Jueves, 18 de junio', hSimu: '22:00', estadio: 'Estadio Guadalajara', ciudad: 'Guadalajara' },
  
  { id: 29, fase: 'Grupos', grupo: 'D', equipoLocal: 'USA', equipoVisitante: 'AUS', fecha: 'Viernes, 19 de junio', hSimu: '16:00', estadio: 'Seattle Stadium', ciudad: 'Seattle' },
  { id: 30, fase: 'Grupos', grupo: 'C', equipoLocal: 'SCO', equipoVisitante: 'MAR', fecha: 'Viernes, 19 de junio', hSimu: '19:00', estadio: 'Boston Stadium', ciudad: 'Foxborough' },
  { id: 31, fase: 'Grupos', grupo: 'C', equipoLocal: 'BRA', equipoVisitante: 'HAI', fecha: 'Viernes, 19 de junio', hSimu: '22:00', estadio: 'Philadelphia Stadium', ciudad: 'Filadelfia' },
  { id: 32, fase: 'Grupos', grupo: 'D', equipoLocal: 'EUR3', equipoVisitante: 'PAR', fecha: 'Sábado, 20 de junio', hSimu: '01:00', estadio: 'San Francisco Bay Area Stadium', ciudad: 'Santa Clara' },
  { id: 33, fase: 'Grupos', grupo: 'F', equipoLocal: 'NED', equipoVisitante: 'F4', fecha: 'Sábado, 20 de junio', hSimu: '14:00', estadio: 'Houston Stadium', ciudad: 'Houston' },
  { id: 34, fase: 'Grupos', grupo: 'E', equipoLocal: 'GER', equipoVisitante: 'CIV', fecha: 'Sábado, 20 de junio', hSimu: '17:00', estadio: 'Toronto Stadium', ciudad: 'Toronto' },
  { id: 35, fase: 'Grupos', grupo: 'E', equipoLocal: 'ECU', equipoVisitante: 'CUW', fecha: 'Sábado, 20 de junio', hSimu: '21:00', estadio: 'Kansas City Stadium', ciudad: 'Kansas City' },
  { id: 36, fase: 'Grupos', grupo: 'F', equipoLocal: 'TUN', equipoVisitante: 'JPN', fecha: 'Domingo, 21 de junio', hSimu: '01:00', estadio: 'Estadio Monterrey', ciudad: 'Monterrey' },
  { id: 37, fase: 'Grupos', grupo: 'H', equipoLocal: 'ESP', equipoVisitante: 'KSA', fecha: 'Domingo, 21 de junio', hSimu: '13:00', estadio: 'Atlanta Stadium', ciudad: 'Atlanta' },
  { id: 38, fase: 'Grupos', grupo: 'G', equipoLocal: 'BEL', equipoVisitante: 'IRN', fecha: 'Domingo, 21 de junio', hSimu: '16:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles' },
  { id: 39, fase: 'Grupos', grupo: 'H', equipoLocal: 'URU', equipoVisitante: 'CPV', fecha: 'Domingo, 21 de junio', hSimu: '19:00', estadio: 'Miami Stadium', ciudad: 'Miami Gardens' },
  { id: 40, fase: 'Grupos', grupo: 'G', equipoLocal: 'NZL', equipoVisitante: 'EGY', fecha: 'Domingo, 21 de junio', hSimu: '22:00', estadio: 'BC Place Vancouver', ciudad: 'Vancouver' },
  { id: 41, fase: 'Grupos', grupo: 'J', equipoLocal: 'ARG', equipoVisitante: 'AUT', fecha: 'Lunes, 22 de junio', hSimu: '14:00', estadio: 'Dallas Stadium', ciudad: 'Arlington' },
  { id: 42, fase: 'Grupos', grupo: 'I', equipoLocal: 'FRA', equipoVisitante: 'BSI', fecha: 'Lunes, 22 de junio', hSimu: '18:00', estadio: 'Philadelphia Stadium', ciudad: 'Filadelfia' },
  { id: 43, fase: 'Grupos', grupo: 'I', equipoLocal: 'NOR', equipoVisitante: 'SEN', fecha: 'Lunes, 22 de junio', hSimu: '21:00', estadio: 'Nueva York Nueva Jersey Stadium', ciudad: 'East Rutherford' },
  { id: 44, fase: 'Grupos', grupo: 'J', equipoLocal: 'JOR', equipoVisitante: 'ALG', fecha: 'Martes, 23 de junio', hSimu: '00:00', estadio: 'San Francisco Bay Area Stadium', ciudad: 'Santa Clara' },
  { id: 45, fase: 'Grupos', grupo: 'K', equipoLocal: 'POR', equipoVisitante: 'UZB', fecha: 'Martes, 23 de junio', hSimu: '14:00', estadio: 'Houston Stadium', ciudad: 'Houston' },
  { id: 46, fase: 'Grupos', grupo: 'L', equipoLocal: 'ENG', equipoVisitante: 'GHA', fecha: 'Martes, 23 de junio', hSimu: '17:00', estadio: 'Seattle Stadium', ciudad: 'Seattle' },
  { id: 47, fase: 'Grupos', grupo: 'L', equipoLocal: 'PAN', equipoVisitante: 'CRO', fecha: 'Martes, 23 de junio', hSimu: '20:00', estadio: 'Toronto Stadium', ciudad: 'Toronto' },
  { id: 48, fase: 'Grupos', grupo: 'K', equipoLocal: 'COL', equipoVisitante: 'K3', fecha: 'Martes, 23 de junio', hSimu: '23:00', estadio: 'Estadio Guadalajara', ciudad: 'Guadalajara' },

  // Round 3
  { id: 49, fase: 'Grupos', grupo: 'B', equipoLocal: 'SUI', equipoVisitante: 'CAN', fecha: 'Miércoles, 24 de junio', hSimu: '16:00', estadio: 'BC Place Vancouver', ciudad: 'Vancouver' },
  { id: 50, fase: 'Grupos', grupo: 'B', equipoLocal: 'EUR2', equipoVisitante: 'QAT', fecha: 'Miércoles, 24 de junio', hSimu: '16:00', estadio: 'Seattle Stadium', ciudad: 'Seattle' },
  { id: 51, fase: 'Grupos', grupo: 'C', equipoLocal: 'SCO', equipoVisitante: 'BRA', fecha: 'Miércoles, 24 de junio', hSimu: '19:00', estadio: 'Miami Stadium', ciudad: 'Miami Gardens' },
  { id: 52, fase: 'Grupos', grupo: 'C', equipoLocal: 'MAR', equipoVisitante: 'HAI', fecha: 'Miércoles, 24 de junio', hSimu: '19:00', estadio: 'Atlanta Stadium', ciudad: 'Atlanta' },
  { id: 53, fase: 'Grupos', grupo: 'A', equipoLocal: 'EUR1', equipoVisitante: 'MEX', fecha: 'Miércoles, 24 de junio', hSimu: '22:00', estadio: 'Estadio Ciudad de México', ciudad: 'CDMX' },
  { id: 54, fase: 'Grupos', grupo: 'A', equipoLocal: 'RSA', equipoVisitante: 'KOR', fecha: 'Miércoles, 24 de junio', hSimu: '22:00', estadio: 'Estadio Monterrey', ciudad: 'Monterrey' },
  { id: 55, fase: 'Grupos', grupo: 'E', equipoLocal: 'CUW', equipoVisitante: 'CIV', fecha: 'Jueves, 25 de junio', hSimu: '17:00', estadio: 'Philadelphia Stadium', ciudad: 'Filadelfia' },
  { id: 56, fase: 'Grupos', grupo: 'E', equipoLocal: 'ECU', equipoVisitante: 'GER', fecha: 'Jueves, 25 de junio', hSimu: '17:00', estadio: 'Nueva York Nueva Jersey Stadium', ciudad: 'East Rutherford' },
  { id: 57, fase: 'Grupos', grupo: 'F', equipoLocal: 'JPN', equipoVisitante: 'F4', fecha: 'Jueves, 25 de junio', hSimu: '20:00', estadio: 'Dallas Stadium', ciudad: 'Arlington' },
  { id: 58, fase: 'Grupos', grupo: 'F', equipoLocal: 'TUN', equipoVisitante: 'NED', fecha: 'Jueves, 25 de junio', hSimu: '20:00', estadio: 'Kansas City Stadium', ciudad: 'Kansas City' },
  { id: 59, fase: 'Grupos', grupo: 'D', equipoLocal: 'EUR3', equipoVisitante: 'USA', fecha: 'Jueves, 25 de junio', hSimu: '23:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles' },
  { id: 60, fase: 'Grupos', grupo: 'D', equipoLocal: 'PAR', equipoVisitante: 'AUS', fecha: 'Jueves, 25 de junio', hSimu: '23:00', estadio: 'San Francisco Bay Area Stadium', ciudad: 'Santa Clara' },
  { id: 61, fase: 'Grupos', grupo: 'I', equipoLocal: 'NOR', equipoVisitante: 'FRA', fecha: 'Viernes, 26 de junio', hSimu: '16:00', estadio: 'Boston Stadium', ciudad: 'Foxborough' },
  { id: 62, fase: 'Grupos', grupo: 'I', equipoLocal: 'SEN', equipoVisitante: 'BSI', fecha: 'Viernes, 26 de junio', hSimu: '16:00', estadio: 'Toronto Stadium', ciudad: 'Toronto' },
  { id: 63, fase: 'Grupos', grupo: 'H', equipoLocal: 'CPV', equipoVisitante: 'KSA', fecha: 'Viernes, 26 de junio', hSimu: '21:00', estadio: 'Houston Stadium', ciudad: 'Houston' },
  { id: 64, fase: 'Grupos', grupo: 'H', equipoLocal: 'URU', equipoVisitante: 'ESP', fecha: 'Viernes, 26 de junio', hSimu: '21:00', estadio: 'Estadio Guadalajara', ciudad: 'Guadalajara' },
  { id: 65, fase: 'Grupos', grupo: 'G', equipoLocal: 'EGY', equipoVisitante: 'IRN', fecha: 'Sábado, 27 de junio', hSimu: '00:00', estadio: 'Seattle Stadium', ciudad: 'Seattle' },
  { id: 66, fase: 'Grupos', grupo: 'G', equipoLocal: 'NZL', equipoVisitante: 'BEL', fecha: 'Sábado, 27 de junio', hSimu: '00:00', estadio: 'BC Place Vancouver', ciudad: 'Vancouver' },
  { id: 67, fase: 'Grupos', grupo: 'L', equipoLocal: 'PAN', equipoVisitante: 'ENG', fecha: 'Sábado, 27 de junio', hSimu: '18:00', estadio: 'Nueva York Nueva Jersey Stadium', ciudad: 'East Rutherford' },
  { id: 68, fase: 'Grupos', grupo: 'L', equipoLocal: 'CRO', equipoVisitante: 'GHA', fecha: 'Sábado, 27 de junio', hSimu: '18:00', estadio: 'Philadelphia Stadium', ciudad: 'Filadelfia' },
  { id: 69, fase: 'Grupos', grupo: 'K', equipoLocal: 'COL', equipoVisitante: 'POR', fecha: 'Sábado, 27 de junio', hSimu: '20:30', estadio: 'Miami Stadium', ciudad: 'Miami Gardens' },
  { id: 70, fase: 'Grupos', grupo: 'K', equipoLocal: 'K3', equipoVisitante: 'UZB', fecha: 'Sábado, 27 de junio', hSimu: '20:30', estadio: 'Atlanta Stadium', ciudad: 'Atlanta' },
  { id: 71, fase: 'Grupos', grupo: 'J', equipoLocal: 'ALG', equipoVisitante: 'AUT', fecha: 'Sábado, 27 de junio', hSimu: '23:00', estadio: 'Kansas City Stadium', ciudad: 'Kansas City' },
  { id: 72, fase: 'Grupos', grupo: 'J', equipoLocal: 'JOR', equipoVisitante: 'ARG', fecha: 'Sábado, 27 de junio', hSimu: '23:00', estadio: 'Dallas Stadium', ciudad: 'Arlington' },
].map(m => ({ ...m, golesLocal: "-", golesVisitante: "-" } as Partido));