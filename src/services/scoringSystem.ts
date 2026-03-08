/**
 * SISTEMA DE PUNTUACIÓN OFICIAL - PRONO2026
 * Versión: 1.0.0 | Compatible con 104 partidos (72 grupos + 32 eliminatorias)
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
// CONFIGURACIÓN BASE
// ============================================================================

export const PUNTOS_BASE: Record<Fase, Record<TipoAcierto, number>> = {
  Grupos: { EXACTO: 3, EMPATE_EXACTO: 2, GANADOR: 3, EMPATE: 2, INVERTIDO: 2 },
  Dieciseisavos: {
    EXACTO: 3,
    EMPATE_EXACTO: 2,
    GANADOR: 3,
    EMPATE: 2,
    INVERTIDO: 2,
  },
  Octavos: { EXACTO: 4, EMPATE_EXACTO: 3, GANADOR: 4, EMPATE: 3, INVERTIDO: 3 },
  Cuartos: { EXACTO: 5, EMPATE_EXACTO: 4, GANADOR: 5, EMPATE: 4, INVERTIDO: 4 },
  Semis: { EXACTO: 6, EMPATE_EXACTO: 5, GANADOR: 6, EMPATE: 5, INVERTIDO: 5 },
  TercerPuesto: {
    EXACTO: 5,
    EMPATE_EXACTO: 4,
    GANADOR: 5,
    EMPATE: 4,
    INVERTIDO: 4,
  }, // Igual que Cuartos
  Final: { EXACTO: 7, EMPATE_EXACTO: 6, GANADOR: 7, EMPATE: 6, INVERTIDO: 6 },
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

/**
 * Valida si un valor de gol es numérico válido
 */
export const isValidScore = (val: any): boolean => {
  if (val === null || val === undefined || val === "" || val === "-")
    return false;
  const n = Number(val);
  return !isNaN(n) && isFinite(n) && n >= 0;
};

/**
 * Calcula la diferencia total de goles entre pronóstico y resultado real
 * Fórmula: |GL_prono - GL_real| + |GV_prono - GV_real|
 */
export const calcularDiferencia = (
  glProno: number,
  gvProno: number,
  glReal: number,
  gvReal: number
): number => {
  return Math.abs(glProno - glReal) + Math.abs(gvProno - gvReal);
};

/**
 * Obtiene el factor de cercanía según la diferencia de goles
 */
export const obtenerFactor = (diferencia: number): number => {
  if (diferencia <= 0) return FACTOR_CERCANIA[0];
  if (diferencia === 1) return FACTOR_CERCANIA[1];
  if (diferencia === 2) return FACTOR_CERCANIA[2];
  if (diferencia === 3) return FACTOR_CERCANIA[3];
  return FACTOR_CERCANIA[4]; // 4 o más
};

/**
 * Determina el tipo de acierto basado en pronóstico vs resultado
 */
export const determinarTipoAcierto = (
  glProno: number,
  gvProno: number,
  glReal: number,
  gvReal: number,
  esEliminatoria: boolean
): { tipo: TipoAcierto; hayPiso: "GANADOR" | "EMPATE" | null } => {
  const esEmpateReal = glReal === gvReal;
  const esEmpateProno = glProno === gvProno;
  const ganadorReal = glReal > gvReal ? "L" : "V";
  const ganadorProno = glProno > gvProno ? "L" : "V";

  // Acierto exacto
  if (glProno === glReal && gvProno === gvReal) {
    return { tipo: "EXACTO", hayPiso: null };
  }

  // Empate exacto
  if (esEmpateProno && esEmpateReal && glProno === glReal) {
    return { tipo: "EMPATE_EXACTO", hayPiso: "EMPATE" };
  }

  // Resultado exacto, equipos invertidos
  if (glProno === gvReal && gvProno === glReal && !esEmpateReal) {
    return { tipo: "INVERTIDO", hayPiso: null };
  }

  // Ganador correcto
  if (ganadorProno === ganadorReal && !esEmpateReal) {
    return { tipo: "GANADOR", hayPiso: "GANADOR" };
  }

  // Empate cercano (pronosticó empate, salió empate pero con otro marcador)
  if (esEmpateProno && esEmpateReal) {
    return { tipo: "EMPATE", hayPiso: "EMPATE" };
  }

  // Error total
  return { tipo: "GANADOR", hayPiso: null }; // Tipo fallback para cálculo
};

// ============================================================================
// MOTOR PRINCIPAL DE CÁLCULO
// ============================================================================

/**
 * Calcula los puntos de un solo partido
 * @returns Objeto con cálculo detallado para auditoría
 */
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
    gvReal,
    esEliminatoria
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

  // Calcular bonificaciones (solo para eliminatorias o grupos al final)
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
      // Si el partido real fue a penales
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

/**
 * Calcula el puntaje total de un usuario para la Fase de Grupos
 * Incluye bonificaciones de equipos clasificados y orden exacto
 */
export const calcularPuntajeGrupos = (
  partidosGrupos: Partido[],
  pronosticos: Record<number, Pronostico>,
  resultadosReales: Record<number, Pronostico>,
  prediccionClasificados?: Record<string, { primero: string; segundo: string }> // Opcional: si se implementa UI para predecir clasificados
): { total: number; desglose: ScoreCalculation[]; bonificaciones: number } => {
  let total = 0;
  const desglose: ScoreCalculation[] = [];
  let bonificacionesTotales = 0;

  // Calcular puntos por partido
  partidosGrupos.forEach((partido) => {
    const calculo = calcularPuntosPartido(
      partido,
      pronosticos[partido.id] || {},
      resultadosReales[partido.id] || {}
    );
    total += calculo.puntosFinales;
    desglose.push(calculo);
  });

  // Calcular bonificaciones de grupos (si hay predicción de clasificados)
  if (prediccionClasificados) {
    // Esta lógica se activará cuando se implemente la UI para predecir clasificados
    // Por ahora, se calcula automáticamente basado en los pronósticos de partidos
  }

  return { total, desglose, bonificaciones: bonificacionesTotales };
};

/**
 * Calcula el puntaje total de un usuario para la Fase Eliminatoria
 */
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

/**
 * Calcula el puntaje TOTAL del usuario (Grupos + Eliminatorias)
 */
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
    userId: "", // Se completa en el llamado
    username: "",
    puntajeGrupos: puntajeGrupos.total,
    puntajeEliminatorias: puntajeEliminatorias.total,
    puntajeTotal: puntajeGrupos.total + puntajeEliminatorias.total,
    aciertosExactos,
    bonificacionesPenales,
    historial: [], // Se completa con evolución temporal
    desglose: {
      grupos: puntajeGrupos.desglose,
      eliminatorias: puntajeEliminatorias.desglose,
    },
    ultimaActualizacion: new Date().toISOString(),
  };
};

/**
 * Genera el ranking de usuarios ordenado por puntaje total
 * Aplica criterios de desempate en orden:
 * 1. Mayor puntaje total
 * 2. Mayor puntaje en eliminatorias
 * 3. Mayor puntaje en la Final
 * 4. Más aciertos exactos
 * 5. Más bonificaciones de penales
 * 6. Empate mantenido
 */
export const generarRanking = (
  scores: UserScore[],
  resultadosReales: Record<number, Pronostico>
): LeaderboardEntry[] => {
  // Ordenar con criterios de desempate
  const ordenados = [...scores].sort((a, b) => {
    if (b.puntajeTotal !== a.puntajeTotal)
      return b.puntajeTotal - a.puntajeTotal;
    if (b.puntajeEliminatorias !== a.puntajeEliminatorias)
      return b.puntajeEliminatorias - a.puntajeEliminatorias;

    // Comparar puntaje en la Final (partido 104)
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

    return 0; // Mantener empate
  });

  // Asignar posiciones
  return ordenados.map((score, index) => {
    // Manejar empates en posición
    const posicion = index + 1;

    return {
      username: score.username,
      lastCalculationDate: score.ultimaActualizacion,
      scoreGroups: score.puntajeGrupos,
      scoreKnockout: score.puntajeEliminatorias,
      scoreTotal: score.puntajeTotal,
      position: posicion,
      aciertosExactos: score.aciertosExactos,
      bonificacionesPenales: score.bonificacionesPenales,
    };
  });
};

/**
 * Exporta el progreso de un usuario en formato CSV para descarga
 */
export const exportarProgresoCSV = (score: UserScore): string => {
  const headers = [
    "Fecha",
    "Partidos Jugados",
    "Puntaje Grupos",
    "Puntaje Eliminatorias",
    "Puntaje Total",
    "Posición",
  ];

  // Generar filas históricas (simulado - en producción vendría de historial)
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
            "?", // Posición se calcula en el ranking global
          ].join(","),
        ];

  return [headers.join(","), ...rows].join("\n");
};
