import { Clasificacion, Partido, LetraGrupo, Pronostico, Fase } from '../types';

/**
 * Valida si un valor es un puntaje válido (número no vacío)
 */
export const isValidScore = (v: any): boolean => {
  if (v === null || v === undefined || v === "" || v === "-") return false;
  const n = Number(v);
  return !isNaN(n) && isFinite(n);
};

/**
 * Calcula la tabla de posiciones de un grupo específico
 */
export const calcularPosiciones = (grupo: LetraGrupo, partidos: Partido[], equiposIds: string[]): Clasificacion[] => {
  const tabla: Record<string, Clasificacion> = {};
  equiposIds.forEach(id => {
    tabla[id] = { equipoId: id, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, puntos: 0, letraGrupo: grupo, forma: [] };
  });

  const partidosGrupo = partidos.filter(m => m.grupo === grupo).sort((a, b) => a.id - b.id);

  partidosGrupo.forEach(m => {
    const l = tabla[m.equipoLocal!];
    const v = tabla[m.equipoVisitante!];
    if (!l || !v) return;

    if (isValidScore(m.golesLocal) && isValidScore(m.golesVisitante)) {
      const gl = parseInt(String(m.golesLocal), 10);
      const gv = parseInt(String(m.golesVisitante), 10);
      
      l.pj++; v.pj++;
      l.gf += gl; l.gc += gv;
      v.gf += gv; v.gc += gl;
      
      if (gl > gv) { 
        l.pg++; l.puntos += 3; v.pp++; 
        l.forma.push('G'); v.forma.push('P');
      }
      else if (gl < gv) { 
        v.pg++; v.puntos += 3; l.pp++; 
        v.forma.push('G'); l.forma.push('P');
      }
      else { 
        l.pe++; v.pe++; l.puntos += 1; v.puntos += 1; 
        l.forma.push('E'); v.forma.push('E');
      }
      l.dg = l.gf - l.gc; v.dg = v.gf - v.gc;
    }
  });

  return Object.values(tabla).sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });
};

/**
 * Obtiene los 8 mejores terceros de entre todos los grupos
 */
export const obtenerMejoresTerceros = (todas: Record<LetraGrupo, Clasificacion[]>): Clasificacion[] => {
  const terceros = Object.values(todas)
    .map(s => s[2])
    .filter(t => t && t.pj > 0);

  terceros.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });
  return terceros.slice(0, 8);
};

/**
 * Resuelve todas las llaves de eliminación directa.
 * Permite alternar entre datos de simulación de usuario o datos reales del Admin.
 */
export const resolverLlaves = (
  posiciones: Record<LetraGrupo, Clasificacion[]>, 
  terceros: Clasificacion[],
  pronosticos: Record<number, Pronostico>,
  datosReales?: { posiciones: Record<LetraGrupo, Clasificacion[]>, terceros: Clasificacion[] },
  usarDatosReales: boolean = false 
): Partido[] => {

  // SELECCIÓN DE FUENTE: ¿Usamos la realidad del Admin o el pronóstico del Usuario?
  const fuentePosiciones = usarDatosReales && datosReales ? datosReales.posiciones : posiciones;
  const fuenteTerceros = usarDatosReales && datosReales ? datosReales.terceros : terceros;

  const get1 = (g: LetraGrupo) => {
    const t = fuentePosiciones[g]?.[0];
    return (t && t.pj >= 3) ? t.equipoId : null;
  };
  const get2 = (g: LetraGrupo) => {
    const t = fuentePosiciones[g]?.[1];
    return (t && t.pj >= 3) ? t.equipoId : null;
  };

  const thirdIds = fuenteTerceros.map(t => t.equipoId);
  const getT = (idx: number) => thirdIds[idx] || null;

  const getWinner = (id: number, loc: string | null, vis: string | null) => {
    const p = pronosticos[id];
    if (!p || !isValidScore(p.local) || !isValidScore(p.visitante) || !loc || !vis) return null;
    const gl = parseInt(String(p.local), 10);
    const gv = parseInt(String(p.visitante), 10);
    if (gl > gv) return loc;
    if (gv > gl) return vis;
    const pl = parseInt(String(p.penalesLocal || 0), 10);
    const pv = parseInt(String(p.penalesVisitante || 0), 10);
    return pl > pv ? loc : vis;
  };

  const getLoser = (id: number, loc: string | null, vis: string | null) => {
    const w = getWinner(id, loc, vis);
    if (!w || !loc || !vis) return null;
    return w === loc ? vis : loc;
  };

  // Mapa de Dieciseisavos (Round of 32)
  const r32Map: Record<number, { d: string, h: string, e: string, pl: string, pv: string, lId: string | null, vId: string | null }> = {
    73: { d: 'Domingo 28 Junio', h: '16:00', e: 'Los Angeles Stadium', pl: '2A', pv: '2B', lId: get2('A'), vId: get2('B') },
    74: { d: 'Lunes 29 Junio', h: '14:00', e: 'Houston Stadium', pl: '1C', pv: '2F', lId: get1('C'), vId: get2('F') },
    75: { d: 'Lunes 29 Junio', h: '17:30', e: 'Boston Stadium', pl: '1E', pv: '3A/B/C/D/F', lId: get1('E'), vId: getT(0) },
    76: { d: 'Lunes 29 Junio', h: '22:00', e: 'Estadio Monterrey', pl: '1F', pv: '2C', lId: get1('F'), vId: get2('C') },
    77: { d: 'Martes 30 Junio', h: '14:00', e: 'Dallas Stadium', pl: '2E', pv: '2I', lId: get2('E'), vId: get2('I') },
    78: { d: 'Martes 30 Junio', h: '18:00', e: 'Nueva York Nueva Jersey Stadium', pl: '1I', pv: '3C/D/F/G/H', lId: get1('I'), vId: getT(1) },
    79: { d: 'Martes 30 Junio', h: '22:00', e: 'Estadio Ciudad de México', pl: '1A', pv: '3C/E/F/H/I', lId: get1('A'), vId: getT(2) },
    80: { d: 'Miércoles 1 Julio', h: '13:00', e: 'Atlanta Stadium', pl: '1L', pv: '3E/H/I/J/K', lId: get1('L'), vId: getT(3) },
    81: { d: 'Miércoles 1 Julio', h: '17:00', e: 'Seattle Stadium', pl: '1G', pv: '3A/E/H/I/J', lId: get1('G'), vId: getT(4) },
    82: { d: 'Miércoles 1 Julio', h: '21:00', e: 'San Francisco Bay Area Stadium', pl: '1D', pv: '3B/E/F/I/J', lId: get1('D'), vId: getT(5) },
    83: { d: 'Jueves 2 Julio', h: '16:00', e: 'Los Angeles Stadium', pl: '1H', pv: '2J', lId: get1('H'), vId: get2('J') },
    84: { d: 'Jueves 2 Julio', h: '20:00', e: 'Toronto Stadium', pl: '2K', pv: '2L', lId: get2('K'), vId: get2('L') },
    85: { d: 'Viernes 3 Julio', h: '00:00', e: 'BC Place Vancouver', pl: '1B', pv: '3E/F/G/I/J', lId: get1('B'), vId: getT(6) },
    86: { d: 'Viernes 3 Julio', h: '15:00', e: 'Dallas Stadium', pl: '2D', pv: '2G', lId: get2('D'), vId: get2('G') },
    87: { d: 'Viernes 3 Julio', h: '19:00', e: 'Miami Stadium', pl: '1J', pv: '2H', lId: get1('J'), vId: get2('H') },
    88: { d: 'Viernes 3 Julio', h: '22:30', e: 'Kansas City Stadium', pl: '1K', pv: '3D/E/I/J/L', lId: get1('K'), vId: getT(7) }
  };

  const r32: Partido[] = [];
  for (let id = 73; id <= 88; id++) {
    const meta = r32Map[id];
    r32.push({
      id, fase: 'Dieciseisavos', equipoLocal: meta.lId, equipoVisitante: meta.vId,
      placeholderLocal: meta.pl, placeholderVisitante: meta.pv,
      golesLocal: pronosticos[id]?.local ?? null, golesVisitante: pronosticos[id]?.visitante ?? null,
      penalesLocal: pronosticos[id]?.penalesLocal ?? null, penalesVisitante: pronosticos[id]?.penalesVisitante ?? null,
      fecha: meta.d + ' 2026', hSimu: meta.h, estadio: meta.e
    });
  }

  // Mapa de Octavos
  const r16Map: Record<number, { d: string, h: string, e: string, l: number, v: number }> = {
    89: { d: 'Sábado 4 Julio', h: '14:00', e: 'Houston Stadium', l: 73, v: 75 },
    90: { d: 'Sábado 4 Julio', h: '18:00', e: 'Philadelphia Stadium', l: 74, v: 77 },
    91: { d: 'Domingo 5 Julio', h: '17:00', e: 'Nueva York Nueva Jersey Stadium', l: 76, v: 78 },
    92: { d: 'Domingo 5 Julio', h: '21:00', e: 'Estadio Ciudad de México', l: 79, v: 80 },
    93: { d: 'Lunes 6 Julio', h: '16:00', e: 'Dallas Stadium', l: 83, v: 84 },
    94: { d: 'Lunes 6 Julio', h: '21:00', e: 'Seattle Stadium', l: 81, v: 82 },
    95: { d: 'Martes 7 Julio', h: '13:00', e: 'Atlanta Stadium', l: 86, v: 88 },
    96: { d: 'Martes 7 Julio', h: '17:00', e: 'BC Place Vancouver', l: 85, v: 87 }
  };

  const r16: Partido[] = [];
  for (let id = 89; id <= 96; id++) {
    const meta = r16Map[id];
    const lMatch = r32.find(m => m.id === meta.l);
    const vMatch = r32.find(m => m.id === meta.v);
    const locId = getWinner(meta.l, lMatch?.equipoLocal || null, lMatch?.equipoVisitante || null);
    const visId = getWinner(meta.v, vMatch?.equipoLocal || null, vMatch?.equipoVisitante || null);
    r16.push({
      id, fase: 'Octavos', equipoLocal: locId, equipoVisitante: visId,
      placeholderLocal: `W${meta.l}`, placeholderVisitante: `W${meta.v}`,
      golesLocal: pronosticos[id]?.local ?? null, golesVisitante: pronosticos[id]?.visitante ?? null,
      penalesLocal: pronosticos[id]?.penalesLocal ?? null, penalesVisitante: pronosticos[id]?.penalesVisitante ?? null,
      fecha: meta.d + ' 2026', hSimu: meta.h, estadio: meta.e
    });
  }

  // Mapa de Cuartos
  const qfMap: Record<number, { d: string, h: string, e: string, l: number, v: number }> = {
    97: { d: 'Jueves 9 Julio', h: '17:00', e: 'Boston Stadium', l: 89, v: 90 },
    98: { d: 'Viernes 10 Julio', h: '16:00', e: 'Los Angeles Stadium', l: 93, v: 94 },
    99: { d: 'Sábado 11 Julio', h: '18:00', e: 'Miami Stadium', l: 91, v: 92 },
    100: { d: 'Sábado 11 Julio', h: '22:00', e: 'Kansas City Stadium', l: 95, v: 96 }
  };

  const qf: Partido[] = [];
  for (let id = 97; id <= 100; id++) {
    const meta = qfMap[id];
    const lMatch = r16.find(m => m.id === meta.l);
    const vMatch = r16.find(m => m.id === meta.v);
    const locId = getWinner(meta.l, lMatch?.equipoLocal || null, lMatch?.equipoVisitante || null);
    const visId = getWinner(meta.v, vMatch?.equipoLocal || null, vMatch?.equipoVisitante || null);
    qf.push({
      id, fase: 'Cuartos', equipoLocal: locId, equipoVisitante: visId,
      placeholderLocal: `W${meta.l}`, placeholderVisitante: `W${meta.v}`,
      golesLocal: pronosticos[id]?.local ?? null, golesVisitante: pronosticos[id]?.visitante ?? null,
      penalesLocal: pronosticos[id]?.penalesLocal ?? null, penalesVisitante: pronosticos[id]?.penalesVisitante ?? null,
      fecha: meta.d + ' 2026', hSimu: meta.h, estadio: meta.e
    });
  }

  // Mapa de Semifinales
  const semisMap: Record<number, { d: string, h: string, e: string, l: number, v: number }> = {
    101: { d: 'Martes 14 Julio', h: '16:00', e: 'Dallas Stadium', l: 97, v: 98 },
    102: { d: 'Miércoles 15 Julio', h: '16:00', e: 'Atlanta Stadium', l: 99, v: 100 }
  };

  const semis: Partido[] = [];
  for (let id = 101; id <= 102; id++) {
    const meta = semisMap[id];
    const lMatch = qf.find(m => m.id === meta.l);
    const vMatch = qf.find(m => m.id === meta.v);
    const locId = getWinner(meta.l, lMatch?.equipoLocal || null, lMatch?.equipoVisitante || null);
    const visId = getWinner(meta.v, vMatch?.equipoLocal || null, vMatch?.equipoVisitante || null);
    semis.push({
      id, fase: 'Semis', equipoLocal: locId, equipoVisitante: visId,
      placeholderLocal: `W${meta.l}`, placeholderVisitante: `W${meta.v}`,
      golesLocal: pronosticos[id]?.local ?? null, golesVisitante: pronosticos[id]?.visitante ?? null,
      penalesLocal: pronosticos[id]?.penalesLocal ?? null, penalesVisitante: pronosticos[id]?.penalesVisitante ?? null,
      fecha: meta.d + ' 2026', hSimu: meta.h, estadio: meta.e
    });
  }

  const t3 = { 
    id: 103, fase: 'TercerPuesto' as Fase, 
    equipoLocal: getLoser(101, semis[0]?.equipoLocal || null, semis[0]?.equipoVisitante || null), 
    equipoVisitante: getLoser(102, semis[1]?.equipoLocal || null, semis[1]?.equipoVisitante || null), 
    placeholderLocal: 'L101', placeholderVisitante: 'L102', 
    golesLocal: pronosticos[103]?.local ?? null, golesVisitante: pronosticos[103]?.visitante ?? null, 
    penalesLocal: pronosticos[103]?.penalesLocal ?? null, penalesVisitante: pronosticos[103]?.penalesVisitante ?? null,
    fecha: 'Sábado 18 Julio 2026', hSimu: '18:00', estadio: 'Miami Stadium' 
  };

  const fin = { 
    id: 104, fase: 'Final' as Fase, 
    equipoLocal: getWinner(101, semis[0]?.equipoLocal || null, semis[0]?.equipoVisitante || null), 
    equipoVisitante: getWinner(102, semis[1]?.equipoLocal || null, semis[1]?.equipoVisitante || null), 
    placeholderLocal: 'W101', placeholderVisitante: 'W102', 
    golesLocal: pronosticos[104]?.local ?? null, golesVisitante: pronosticos[104]?.visitante ?? null, 
    penalesLocal: pronosticos[104]?.penalesLocal ?? null, penalesVisitante: pronosticos[104]?.penalesVisitante ?? null,
    fecha: 'Domingo 19 Julio 2026', hSimu: '16:00', estadio: 'Nueva York Nueva Jersey Stadium' 
  };

  return [...r32, ...r16, ...qf, ...semis, t3, fin];
};

/**
 * Simulación de tanda de penales si hay empate en llaves
 */
export function simularPenales(): { golesLocal: number, golesVisitante: number } {
  let locales = 0, visitantes = 0;
  for (let i = 0; i < 5; i++) {
    if (Math.random() > 0.2) locales++;
    if (Math.random() > 0.2) visitantes++;
  }
  while (locales === visitantes) {
    if (Math.random() > 0.2) locales++;
    if (Math.random() > 0.2) visitantes++;
  }
  if (Math.max(locales, visitantes) > 5) {
     if (locales > visitantes) locales = visitantes + 1;
     else visitantes = locales + 1;
  }
  return { golesLocal: locales, golesVisitante: visitantes };
}

/**
 * REGLA DE ORO: Valida que una tanda de penales sea técnica y reglamentariamente posible.
 */
export const checkPensValidity = (pl: any, pv: any): boolean => {
  if (!isValidScore(pl) || !isValidScore(pv)) return true;
  
  const nA = parseInt(String(pl), 10);
  const nB = parseInt(String(pv), 10);
  
  // No puede haber empate en penales
  if (nA === nB) return false;
  
  const max = Math.max(nA, nB);
  const min = Math.min(nA, nB);
  const diff = max - min;

  // Lógica de tandas cortas o muerte súbita
  if (max <= 5) {
    const validPairs = [
      [1,0], [2,0], [2,1], [3,0], [3,1], [3,2], 
      [4,1], [4,2], [4,3], [5,3], [5,4]
    ];
    return validPairs.some(pair => pair[0] === max && pair[1] === min);
  } 
  
  // En muerte súbita (más de 5), la diferencia debe ser de exactamente 1
  return diff === 1;
};