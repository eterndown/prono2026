/**
 * SISTEMA DE PUNTUACIÓN OFICIAL - PRONO2026
 * Versión: 1.1.0 | Compatible con 104 partidos (72 grupos + 32 eliminatorias)
 *
 * Principios:
 * - Justicia: Reglas claras, aplicadas consistentemente
 * - Diversión: Múltiples formas de sumar, nunca cero si hay acierto parcial
 * - Transparencia: Cada cálculo queda registrado y auditable
 */

import {
  Fase,
  TipoAcierto,
  Pronostico,
  Partido,
  ScoreCalculation,
  UserScore,
  LeaderboardEntry,
} from "../types";

// ============================================================================
// CONFIGURACIÓN BASE - CORREGIDA
// ============================================================================

export const PUNTOS_BASE: Record<Fase, Record<TipoAcierto, number>> = {
  Grupos: { EXACTO: 3, GANADOR: 3, EMPATE: 2, INVERTIDO: 2 },
  Dieciseisavos: { EXACTO: 3, GANADOR: 3, EMPATE: 2, INVERTIDO: 2 },
  Octavos: { EXACTO: 4, GANADOR: 4, EMPATE: 3, INVERTIDO: 3 },
  Cuartos: { EXACTO: 5, GANADOR: 5, EMPATE: 4, INVERTIDO: 4 },
  Semis: { EXACTO: 6, GANADOR: 6, EMPATE: 5, INVERTIDO: 5 },
  TercerPuesto: { EXACTO: 5, GANADOR: 5, EMPATE: 4, INVERTIDO: 4 },
  Final: { EXACTO: 7, GANADOR: 7, EMPATE: 6, INVERTIDO: 6 },
};

export const FACTOR_CERCANIA: Record<number, number> = {
  0: 1.0, // Exacto
  1: 0.8, // Muy cercano
  2: 0.6, // Cercano
  3: 0.4, // Algo lejano
  4: 0.2, // Piso mínimo (4 o más)
};

export const PISO_MINIMO: Record<"GANADOR" | "EMPATE", number> = {
  GANADOR: 2,
  EMPATE: 1,
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

export const isValidScore = (val: any): boolean => {
  if (val === null || val === undefined || val === "" || val === "-")
    return false;
  const n = Number(val);
  return !isNaN(n) && isFinite(n) && n >= 0;
};

export const calcularDiferencia = (
  glProno: number,
  gvProno: number,
  glReal: number,
  gvReal: number
): number => {
  return Math.abs(glProno - glReal) + Math.abs(gvProno - gvReal);
};

export const obtenerFactor = (diferencia: number): number => {
  if (diferencia <= 0) return FACTOR_CERCANIA[0];
  if (diferencia === 1) return FACTOR_CERCANIA[1];
  if (diferencia === 2) return FACTOR_CERCANIA[2];
  if (diferencia === 3) return FACTOR_CERCANIA[3];
  return FACTOR_CERCANIA[4];
};

export const determinarTipoAcierto = (
  glProno: number,
  gvProno: number,
  glReal: number,
  gvReal: number
): { tipo: TipoAcierto; hayPiso: "GANADOR" | "EMPATE" | null } => {
  const esEmpateReal = glReal === gvReal;
  const esEmpateProno = glProno === gvProno;
  const ganadorReal = glReal > gvReal ? "L" : "V";
  const ganadorProno = glProno > gvProno ? "L" : "V";

  // Acierto exacto (INCLUYE empates exactos: 1-1 → 1-1 = 3 pts)
  if (glProno === glReal && gvProno === gvReal) {
    return { tipo: "EXACTO", hayPiso: null };
  }

  // Resultado exacto, equipos invertidos (solo si no es empate)
  if (glProno === gvReal && gvProno === glReal && !esEmpateReal) {
    return { tipo: "INVERTIDO", hayPiso: null };
  }

  // Ganador correcto (incluye empates pronosticados cuando el real NO es empate)
  if (ganadorProno === ganadorReal && !esEmpateReal) {
    return { tipo: "GANADOR", hayPiso: "GANADOR" };
  }

  // Empate pronosticado cuando el real también es empate (pero marcador diferente)
  if (esEmpateProno && esEmpateReal) {
    return { tipo: "EMPATE", hayPiso: "EMPATE" };
  }

  // Error total
  return { tipo: "GANADOR", hayPiso: null };
};

// ============================================================================
// MOTOR PRINCIPAL DE CÁLCULO - CONSISTENTE
// ============================================================================

export const calcularPuntosPartido = (
  partido: Partido,
  pronostico: Pronostico,
  resultadoReal: Pronostico
): ScoreCalculation => {
  const glProno = isValidScore(pronostico.local)
    ? Number(pronostico.local)
    : null;
  const gvProno = isValidScore(pronostico.visitante)
    ? Number(pronostico.visitante)
    : null;
  const glReal = isValidScore(resultadoReal.local)
    ? Number(resultadoReal.local)
    : null;
  const gvReal = isValidScore(resultadoReal.visitante)
    ? Number(resultadoReal.visitante)
    : null;

  // Si no hay resultado real aún, no se puede calcular
  if (glReal === null || gvReal === null) {
    return {
      matchId: partido.id,
      fase: partido.fase,
      puntosFinales: 0,
      detalle: "Resultado real pendiente",
      bonificaciones: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Si no hay pronóstico, 0 puntos
  if (glProno === null || gvProno === null) {
    return {
      matchId: partido.id,
      fase: partido.fase,
      puntosFinales: 0,
      detalle: "Sin pronóstico cargado",
      bonificaciones: [],
      timestamp: new Date().toISOString(),
    };
  }

  const esEliminatoria = partido.fase !== "Grupos";
  const { tipo, hayPiso } = determinarTipoAcierto(
    glProno,
    gvProno,
    glReal,
    gvReal
  );

  const puntosBase = PUNTOS_BASE[partido.fase][tipo] || 0;
  const diferencia = calcularDiferencia(glProno, gvProno, glReal, gvReal);
  const factor = obtenerFactor(diferencia);

  // Cálculo base con redondeo estándar
  let puntosCalculados = puntosBase * factor;
  let puntosRedondeados = Math.round(puntosCalculados);

  // Aplicar piso mínimo si corresponde
  if (hayPiso && puntosRedondeados < PISO_MINIMO[hayPiso]) {
    puntosRedondeados = PISO_MINIMO[hayPiso];
  }

  // Calcular bonificaciones
  const bonificaciones: ScoreCalculation["bonificaciones"] = [];

  // Bonificación de equipo clasificado (eliminatorias)
  if (esEliminatoria) {
    const ganadorProno =
      glProno > gvProno ? partido.equipoLocal : partido.equipoVisitante;
    const ganadorReal =
      glReal > gvReal ? partido.equipoLocal : partido.equipoVisitante;

    if (ganadorProno && ganadorReal && ganadorProno === ganadorReal) {
      bonificaciones.push({
        tipo: "CLASIFICADO",
        puntos: 3,
        descripcion: "Equipo clasificado acertado",
      });
      puntosRedondeados += 3;
    }

    // Bonificaciones de penales (solo si aplica)
    if (glReal === gvReal) {
      const pensPronoLocal = isValidScore(pronostico.penalesLocal)
        ? Number(pronostico.penalesLocal)
        : null;
      const pensPronoVisit = isValidScore(pronostico.penalesVisitante)
        ? Number(pronostico.penalesVisitante)
        : null;
      const pensRealLocal = isValidScore(resultadoReal.penalesLocal)
        ? Number(resultadoReal.penalesLocal)
        : null;
      const pensRealVisit = isValidScore(resultadoReal.penalesVisitante)
        ? Number(resultadoReal.penalesVisitante)
        : null;

      // +2 por acertar que hay penales
      if (pensPronoLocal !== null && pensPronoVisit !== null) {
        bonificaciones.push({
          tipo: "PENALES",
          puntos: 2,
          descripcion: "Acertó tanda de penales",
        });
        puntosRedondeados += 2;

        // +3 por acertar ganador en penales
        if (pensRealLocal !== null && pensRealVisit !== null) {
          const ganadorPensProno =
            pensPronoLocal > pensPronoVisit
              ? partido.equipoLocal
              : partido.equipoVisitante;
          const ganadorPensReal =
            pensRealLocal > pensRealVisit
              ? partido.equipoLocal
              : partido.equipoVisitante;

          if (
            ganadorPensProno &&
            ganadorPensReal &&
            ganadorPensProno === ganadorPensReal
          ) {
            bonificaciones.push({
              tipo: "GANADOR_PENALES",
              puntos: 3,
              descripcion: "Ganador en penales acertado",
            });
            puntosRedondeados += 3;
          }
        }
      }
    }

    // +5 por acertar campeón (solo Final)
    if (partido.fase === "Final") {
      const campeonProno =
        glProno > gvProno ? partido.equipoLocal : partido.equipoVisitante;
      const campeonReal =
        glReal > gvReal ? partido.equipoLocal : partido.equipoVisitante;

      if (campeonProno && campeonReal && campeonProno === campeonReal) {
        bonificaciones.push({
          tipo: "CAMPEON",
          puntos: 5,
          descripcion: "Campeón del torneo acertado",
        });
        puntosRedondeados += 5;
      }
    }
  }

  return {
    matchId: partido.id,
    fase: partido.fase,
    tipoAcierto: tipo,
    diferencia,
    factor,
    puntosBase,
    puntosCalculados,
    puntosRedondeados: Math.round(puntosCalculados),
    pisoAplicado:
      hayPiso !== null && Math.round(puntosCalculados) < PISO_MINIMO[hayPiso],
    puntosFinales: puntosRedondeados,
    bonificaciones,
    detalle: `${partido.equipoLocal} ${glProno}-${gvProno} ${partido.equipoVisitante} → Real: ${glReal}-${gvReal}`,
    timestamp: new Date().toISOString(),
  };
};

// ============================================================================
// BONIFICACIONES DE GRUPOS - IMPLEMENTADAS
// ============================================================================

/**
 * Calcula las bonificaciones de fase de grupos automáticamente
 * Basado en los resultados reales de los partidos
 */
const calcularBonificacionesGrupos = (
  grupo: string,
  partidosDelGrupo: Partido[],
  pronosticos: Record<number, Pronostico>,
  resultadosReales: Record<number, Pronostico>,
  equiposDelGrupo: string[]
): {
  clasificados: { primero: string; segundo: string };
  bonificaciones: number;
} => {
  // Calcular tabla real del grupo
  const tabla: Record<string, { pts: number; dg: number; gf: number }> = {};
  equiposDelGrupo.forEach((eq) => {
    tabla[eq] = { pts: 0, dg: 0, gf: 0 };
  });

  partidosDelGrupo.forEach((partido) => {
    const real = resultadosReales[partido.id];
    if (!real || !isValidScore(real.local) || !isValidScore(real.visitante))
      return;

    const gl = Number(real.local);
    const gv = Number(real.visitante);
    const local = partido.equipoLocal!;
    const visitante = partido.equipoVisitante!;

    // Actualizar estadísticas
    tabla[local].dg += gl - gv;
    tabla[local].gf += gl;
    tabla[visitante].dg += gv - gl;
    tabla[visitante].gf += gv;

    // Asignar puntos FIFA
    if (gl > gv) {
      tabla[local].pts += 3;
    } else if (gv > gl) {
      tabla[visitante].pts += 3;
    } else {
      tabla[local].pts += 1;
      tabla[visitante].pts += 1;
    }
  });

  // Ordenar por: 1) Puntos, 2) Diferencia de gol, 3) Goles a favor
  const ordenados = Object.entries(tabla)
    .sort(([, a], [, b]) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    })
    .map(([eq]) => eq);

  const clasificados = {
    primero: ordenados[0],
    segundo: ordenados[1],
  };

  // Calcular bonificaciones para el usuario
  let bonificaciones = 0;

  // Para cada usuario, verificar sus pronósticos implícitos
  // (un equipo "clasifica" en sus pronósticos si gana más partidos)
  const pronosticosPorEquipo: Record<
    string,
    { victorias: number; empates: number }
  > = {};
  equiposDelGrupo.forEach((eq) => {
    pronosticosPorEquipo[eq] = { victorias: 0, empates: 0 };
  });

  partidosDelGrupo.forEach((partido) => {
    const prono = pronosticos[partido.id];
    if (!prono || !isValidScore(prono.local) || !isValidScore(prono.visitante))
      return;

    const gl = Number(prono.local);
    const gv = Number(prono.visitante);
    const local = partido.equipoLocal!;
    const visitante = partido.equipoVisitante!;

    if (gl > gv) {
      pronosticosPorEquipo[local].victorias++;
    } else if (gv > gl) {
      pronosticosPorEquipo[visitante].victorias++;
    } else {
      pronosticosPorEquipo[local].empates++;
      pronosticosPorEquipo[visitante].empates++;
    }
  });

  // Ordenar equipos por pronósticos del usuario
  const ordenadosProno = Object.entries(pronosticosPorEquipo)
    .sort(([, a], [, b]) => {
      // Puntos implícitos: 3 por victoria, 1 por empate
      const ptsA = a.victorias * 3 + a.empates;
      const ptsB = b.victorias * 3 + b.empates;
      return ptsB - ptsA;
    })
    .map(([eq]) => eq);

  const clasificadosProno = {
    primero: ordenadosProno[0],
    segundo: ordenadosProno[1],
  };

  // +1 punto por cada clasificado acertado
  if (clasificadosProno.primero === clasificados.primero) bonificaciones += 1;
  if (clasificadosProno.segundo === clasificados.segundo) bonificaciones += 1;

  // +2 puntos extras si acertó el orden exacto
  if (
    clasificadosProno.primero === clasificados.primero &&
    clasificadosProno.segundo === clasificados.segundo
  ) {
    bonificaciones += 2;
  }

  return { clasificados, bonificaciones };
};

// ============================================================================
// CÁLCULO DE PUNTAJE POR FASE
// ============================================================================

export const calcularPuntajeGrupos = (
  partidosGrupos: Partido[],
  pronosticos: Record<number, Pronostico>,
  resultadosReales: Record<number, Pronostico>
): { total: number; desglose: ScoreCalculation[]; bonificaciones: number } => {
  let total = 0;
  const desglose: ScoreCalculation[] = [];
  let bonificacionesTotales = 0;

  // Agrupar partidos por grupo
  const gruposMap: Record<string, Partido[]> = {};
  partidosGrupos.forEach((p) => {
    if (p.grupo) {
      if (!gruposMap[p.grupo]) gruposMap[p.grupo] = [];
      gruposMap[p.grupo].push(p);
    }
  });

  // Calcular puntos por partido + bonificaciones por grupo
  Object.entries(gruposMap).forEach(([grupo, partidosDelGrupo]) => {
    // Puntos por partidos
    partidosDelGrupo.forEach((partido) => {
      const calculo = calcularPuntosPartido(
        partido,
        pronosticos[partido.id] || {},
        resultadosReales[partido.id] || {}
      );
      total += calculo.puntosFinales;
      desglose.push(calculo);
    });

    // Bonificaciones del grupo
    const equiposDelGrupo = [
      ...new Set(
        partidosDelGrupo.flatMap(
          (p) => [p.equipoLocal, p.equipoVisitante].filter(Boolean) as string[]
        )
      ),
    ];

    const { bonificaciones } = calcularBonificacionesGrupos(
      grupo,
      partidosDelGrupo,
      pronosticos,
      resultadosReales,
      equiposDelGrupo
    );

    bonificacionesTotales += bonificaciones;
    total += bonificaciones;
  });

  return { total, desglose, bonificaciones: bonificacionesTotales };
};

export const calcularPuntajeEliminatorias = (
  partidosEliminatorias: Partido[],
  pronosticos: Record<number, Pronostico>,
  resultadosReales: Record<number, Pronostico>
): { total: number; desglose: ScoreCalculation[] } => {
  let total = 0;
  const desglose: ScoreCalculation[] = [];

  partidosEliminatorias.forEach((partido) => {
    const calculo = calcularPuntosPartido(
      partido,
      pronosticos[partido.id] || {},
      resultadosReales[partido.id] || {}
    );
    total += calculo.puntosFinales;
    desglose.push(calculo);
  });

  return { total, desglose };
};

// ============================================================================
// CÁLCULO TOTAL Y RANKING - CONSISTENTE
// ============================================================================

export const calcularPuntajeTotal = (
  todosLosPartidos: Partido[],
  pronosticos: Record<number, Pronostico>,
  resultadosReales: Record<number, Pronostico>
): UserScore => {
  const grupos = todosLosPartidos.filter((p) => p.fase === "Grupos");
  const eliminatorias = todosLosPartidos.filter((p) => p.fase !== "Grupos");

  const puntajeGrupos = calcularPuntajeGrupos(
    grupos,
    pronosticos,
    resultadosReales
  );
  const puntajeEliminatorias = calcularPuntajeEliminatorias(
    eliminatorias,
    pronosticos,
    resultadosReales
  );

  // Contar aciertos exactos para criterios de desempate
  const aciertosExactos = [
    ...puntajeGrupos.desglose,
    ...puntajeEliminatorias.desglose,
  ].filter((c) => c.tipoAcierto === "EXACTO").length;

  // Sumar bonificaciones de penales para criterios de desempate
  const bonificacionesPenales = [
    ...puntajeGrupos.desglose,
    ...puntajeEliminatorias.desglose,
  ]
    .flatMap((c) => c.bonificaciones)
    .filter((b) => b.tipo === "PENALES" || b.tipo === "GANADOR_PENALES")
    .reduce((sum, b) => sum + b.puntos, 0);

  return {
    userId: "",
    username: "",
    puntajeGrupos: puntajeGrupos.total,
    puntajeEliminatorias: puntajeEliminatorias.total,
    puntajeTotal: puntajeGrupos.total + puntajeEliminatorias.total,
    aciertosExactos,
    bonificacionesPenales,
    historial: [],
    desglose: {
      grupos: puntajeGrupos.desglose,
      eliminatorias: puntajeEliminatorias.desglose,
    },
    ultimaActualizacion: new Date().toISOString(),
  };
};

export const generarRanking = (
  scores: UserScore[],
  resultadosReales: Record<number, Pronostico>
): LeaderboardEntry[] => {
  const ordenados = [...scores].sort((a, b) => {
    if (b.puntajeTotal !== a.puntajeTotal)
      return b.puntajeTotal - a.puntajeTotal;
    if (b.puntajeEliminatorias !== a.puntajeEliminatorias)
      return b.puntajeEliminatorias - a.puntajeEliminatorias;

    const finalA =
      a.desglose?.eliminatorias?.find((c) => c.matchId === 104)
        ?.puntosFinales || 0;
    const finalB =
      b.desglose?.eliminatorias?.find((c) => c.matchId === 104)
        ?.puntosFinales || 0;
    if (finalB !== finalA) return finalB - finalA;

    if (b.aciertosExactos !== a.aciertosExactos)
      return b.aciertosExactos - a.aciertosExactos;
    if (b.bonificacionesPenales !== a.bonificacionesPenales)
      return b.bonificacionesPenales - a.bonificacionesPenales;

    return 0;
  });

  return ordenados.map((score, index) => ({
    username: score.username,
    lastCalculationDate: score.ultimaActualizacion,
    scoreGroups: score.puntajeGrupos,
    scoreKnockout: score.puntajeEliminatorias,
    scoreTotal: score.puntajeTotal,
    position: index + 1,
    aciertosExactos: score.aciertosExactos,
    bonificacionesPenales: score.bonificacionesPenales,
  }));
};

export const exportarProgresoCSV = (score: UserScore): string => {
  const headers = [
    "Fecha",
    "Partidos Jugados",
    "Puntaje Grupos",
    "Puntaje Eliminatorias",
    "Puntaje Total",
    "Posición",
  ];

  const rows =
    score.historial.length > 0
      ? score.historial.map((h) =>
          [
            h.fecha,
            h.partidosJugados,
            h.puntajeAcumuladoGrupos,
            h.puntajeAcumuladoEliminatorias,
            h.puntajeAcumuladoTotal,
            h.posicionEnEseMomento,
          ].join(",")
        )
      : [
          [
            new Date().toISOString().split("T")[0],
            score.desglose?.grupos?.length || 0,
            score.puntajeGrupos,
            score.puntajeEliminatorias,
            score.puntajeTotal,
            "?",
          ].join(","),
        ];

  return [headers.join(","), ...rows].join("\n");
};
