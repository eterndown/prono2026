/**
 * SISTEMA DE EXPORTACIÓN - PRONO2026
 * Exporta progreso de usuarios a XLSX y Ranking a PDF
 *
 * IMPORTANTE: Este módulo usa los valores de userScore para garantizar
 * consistencia con el Ranking y el backend.
 */

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserScore, Partido, Pronostico, ScoreCalculation } from "../types";
import { PARTIDOS_INICIALES, EQUIPOS, GRUPOS } from "../constants";
import { calcularPuntosPartido, calcularBonificacionesGrupos } from "./scoringSystem";

// ============================================================================
// EXPORTAR PROGRESO DE USUARIO A XLSX
// ============================================================================

export interface ExportRow {
  Usuario: string;
  MatchID: number | string;
  Fase: string;
  EquipoA: string;
  PronosticoA: string;
  PronosticoB: string;
  EquipoB: string;
  ResultadoRealA: string;
  ResultadoRealB: string;
  PenalesPronosticoA: string;
  PenalesPronosticoB: string;
  PenalesRealA: string;
  PenalesRealB: string;
  PuntosPartido: number;
  BonificacionClasificado: number;
  BonificacionPenales: number;
  BonificacionGanadorPenales: number;
  BonificacionCampeon: number;
  PuntosTotalesFila: number;
}

/**
 * Genera el archivo XLSX con el progreso detallado de un usuario
 * 105+ filas: 1 header + 104 partidos + bonificaciones de grupos
 *
 * IMPORTANTE: Usa userScore.desglose si está disponible para garantizar
 * consistencia con el backend. Si no, calcula en tiempo real.
 */
export const exportarProgresoXLSX = (
  username: string,
  userScore: UserScore,
  todosLosPartidos: Partido[],
  pronosticos: Record<number, Pronostico>,
  resultadosReales: Record<number, Pronostico>
) => {
  const filas: ExportRow[] = [];

  // Agrupar partidos por grupo para calcular bonificaciones
  const gruposMap: Record<string, Partido[]> = {};
  todosLosPartidos.forEach((p) => {
    if (p.grupo) {
      if (!gruposMap[p.grupo]) gruposMap[p.grupo] = [];
      gruposMap[p.grupo].push(p);
    }
  });

  // Procesar partidos fase de grupos + bonificaciones por grupo
  Object.entries(gruposMap).forEach(([grupo, partidosDelGrupo]) => {
    // 1. Agregar filas de partidos
    partidosDelGrupo.forEach((partido) => {
      const pronostico = pronosticos[partido.id] || {
        local: "-",
        visitante: "-",
        penalesLocal: "-",
        penalesVisitante: "-",
      };
      const real = resultadosReales[partido.id] || {
        local: null,
        visitante: null,
        penalesLocal: null,
        penalesVisitante: null,
      };

      let calculo: ScoreCalculation | undefined;
      if (userScore.desglose?.grupos) {
        calculo = userScore.desglose.grupos.find((c) => c.matchId === partido.id);
      }
      if (!calculo) {
        calculo = calcularPuntosPartido(partido, pronostico, real);
      }

      const bonifClasificado =
        calculo.bonificaciones?.find((b) => b.tipo === "CLASIFICADO")?.puntos || 0;
      const bonifPenales =
        calculo.bonificaciones?.find((b) => b.tipo === "PENALES")?.puntos || 0;
      const bonifGanadorPenales =
        calculo.bonificaciones?.find((b) => b.tipo === "GANADOR_PENALES")?.puntos || 0;
      const bonifCampeon =
        calculo.bonificaciones?.find((b) => b.tipo === "CAMPEON")?.puntos || 0;

      const equipoA = partido.equipoLocal || partido.placeholderLocal || "TBD";
      const equipoB = partido.equipoVisitante || partido.placeholderVisitante || "TBD";

      filas.push({
        Usuario: username,
        MatchID: partido.id,
        Fase: partido.fase,
        EquipoA: equipoA,
        PronosticoA:
          pronostico.local !== null && pronostico.local !== "-"
            ? String(pronostico.local)
            : "-",
        PronosticoB:
          pronostico.visitante !== null && pronostico.visitante !== "-"
            ? String(pronostico.visitante)
            : "-",
        EquipoB: equipoB,
        ResultadoRealA:
          real.local !== null && real.local !== "-" ? String(real.local) : "-",
        ResultadoRealB:
          real.visitante !== null && real.visitante !== "-"
            ? String(real.visitante)
            : "-",
        PenalesPronosticoA:
          pronostico.penalesLocal !== null && pronostico.penalesLocal !== "-"
            ? String(pronostico.penalesLocal)
            : "-",
        PenalesPronosticoB:
          pronostico.penalesVisitante !== null &&
          pronostico.penalesVisitante !== "-"
            ? String(pronostico.penalesVisitante)
            : "-",
        PenalesRealA:
          real.penalesLocal !== null && real.penalesLocal !== "-"
            ? String(real.penalesLocal)
            : "-",
        PenalesRealB:
          real.penalesVisitante !== null && real.penalesVisitante !== "-"
            ? String(real.penalesVisitante)
            : "-",
        PuntosPartido:
          calculo.puntosFinales -
          (bonifClasificado + bonifPenales + bonifGanadorPenales + bonifCampeon),
        BonificacionClasificado: bonifClasificado,
        BonificacionPenales: bonifPenales,
        BonificacionGanadorPenales: bonifGanadorPenales,
        BonificacionCampeon: bonifCampeon,
        PuntosTotalesFila: calculo.puntosFinales,
      });
    });

    // 2. Calcular y agregar fila de bonificaciones de grupos
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

    if (bonificaciones > 0) {
      filas.push({
        Usuario: "",
        MatchID: `BONUS_GRUPO_${grupo}`,
        Fase: `Bonificación Grupo ${grupo}`,
        EquipoA: "",
        PronosticoA: "",
        PronosticoB: "",
        EquipoB: "",
        ResultadoRealA: "",
        ResultadoRealB: "",
        PenalesPronosticoA: "",
        PenalesPronosticoB: "",
        PenalesRealA: "",
        PenalesRealB: "",
        PuntosPartido: bonificaciones,
        BonificacionClasificado: 0,
        BonificacionPenales: 0,
        BonificacionGanadorPenales: 0,
        BonificacionCampeon: 0,
        PuntosTotalesFila: bonificaciones,
      });
    }
  });

  // Procesar partidos eliminatorias
  const eliminatorias = todosLosPartidos.filter((p) => p.fase !== "Grupos");
  eliminatorias.forEach((partido) => {
    const pronostico = pronosticos[partido.id] || {
      local: "-",
      visitante: "-",
      penalesLocal: "-",
      penalesVisitante: "-",
    };
    const real = resultadosReales[partido.id] || {
      local: null,
      visitante: null,
      penalesLocal: null,
      penalesVisitante: null,
    };

    let calculo: ScoreCalculation | undefined;
    if (userScore.desglose?.eliminatorias) {
      calculo = userScore.desglose.eliminatorias.find((c) => c.matchId === partido.id);
    }
    if (!calculo) {
      calculo = calcularPuntosPartido(partido, pronostico, real);
    }

    const bonifClasificado =
      calculo.bonificaciones?.find((b) => b.tipo === "CLASIFICADO")?.puntos || 0;
    const bonifPenales =
      calculo.bonificaciones?.find((b) => b.tipo === "PENALES")?.puntos || 0;
    const bonifGanadorPenales =
      calculo.bonificaciones?.find((b) => b.tipo === "GANADOR_PENALES")?.puntos || 0;
    const bonifCampeon =
      calculo.bonificaciones?.find((b) => b.tipo === "CAMPEON")?.puntos || 0;

    const equipoA = partido.equipoLocal || partido.placeholderLocal || "TBD";
    const equipoB = partido.equipoVisitante || partido.placeholderVisitante || "TBD";

    filas.push({
      Usuario: username,
      MatchID: partido.id,
      Fase: partido.fase,
      EquipoA: equipoA,
      PronosticoA:
        pronostico.local !== null && pronostico.local !== "-"
          ? String(pronostico.local)
          : "-",
      PronosticoB:
        pronostico.visitante !== null && pronostico.visitante !== "-"
          ? String(pronostico.visitante)
          : "-",
      EquipoB: equipoB,
      ResultadoRealA:
        real.local !== null && real.local !== "-" ? String(real.local) : "-",
      ResultadoRealB:
        real.visitante !== null && real.visitante !== "-"
          ? String(real.visitante)
          : "-",
      PenalesPronosticoA:
        pronostico.penalesLocal !== null && pronostico.penalesLocal !== "-"
          ? String(pronostico.penalesLocal)
          : "-",
      PenalesPronosticoB:
        pronostico.penalesVisitante !== null &&
        pronostico.penalesVisitante !== "-"
          ? String(pronostico.penalesVisitante)
          : "-",
      PenalesRealA:
        real.penalesLocal !== null && real.penalesLocal !== "-"
          ? String(real.penalesLocal)
          : "-",
      PenalesRealB:
        real.penalesVisitante !== null && real.penalesVisitante !== "-"
          ? String(real.penalesVisitante)
          : "-",
      PuntosPartido:
        calculo.puntosFinales -
        (bonifClasificado + bonifPenales + bonifGanadorPenales + bonifCampeon),
      BonificacionClasificado: bonifClasificado,
      BonificacionPenales: bonifPenales,
      BonificacionGanadorPenales: bonifGanadorPenales,
      BonificacionCampeon: bonifCampeon,
      PuntosTotalesFila: calculo.puntosFinales,
    });
  });

  // Agregar fila de totales
  const totalPuntosPartido = filas.reduce(
    (sum, fila) => sum + fila.PuntosPartido,
    0
  );
  const totalBonifClasificado = filas.reduce(
    (sum, fila) => sum + fila.BonificacionClasificado,
    0
  );
  const totalBonifPenales = filas.reduce(
    (sum, fila) => sum + fila.BonificacionPenales,
    0
  );
  const totalBonifGanadorPenales = filas.reduce(
    (sum, fila) => sum + fila.BonificacionGanadorPenales,
    0
  );
  const totalBonifCampeon = filas.reduce(
    (sum, fila) => sum + fila.BonificacionCampeon,
    0
  );
  const totalPuntosTotalesFila = filas.reduce(
    (sum, fila) => sum + fila.PuntosTotalesFila,
    0
  );

  filas.push({
    Usuario: "",
    MatchID: "TOTAL",
    Fase: "=== TOTAL ===",
    EquipoA: "",
    PronosticoA: "",
    PronosticoB: "",
    EquipoB: "",
    ResultadoRealA: "",
    ResultadoRealB: "",
    PenalesPronosticoA: "",
    PenalesPronosticoB: "",
    PenalesRealA: "",
    PenalesRealB: "",
    PuntosPartido: totalPuntosPartido,
    BonificacionClasificado: totalBonifClasificado,
    BonificacionPenales: totalBonifPenales,
    BonificacionGanadorPenales: totalBonifGanadorPenales,
    BonificacionCampeon: totalBonifCampeon,
    PuntosTotalesFila: totalPuntosTotalesFila,
  });

  // Crear worksheet
  const worksheet = XLSX.utils.json_to_sheet(filas);

  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 15 }, // Usuario
    { wch: 15 }, // MatchID
    { wch: 15 }, // Fase
    { wch: 12 }, // EquipoA
    { wch: 10 }, // PronosticoA
    { wch: 10 }, // PronosticoB
    { wch: 12 }, // EquipoB
    { wch: 12 }, // ResultadoRealA
    { wch: 12 }, // ResultadoRealB
    { wch: 12 }, // PenalesPronosticoA
    { wch: 12 }, // PenalesPronosticoB
    { wch: 12 }, // PenalesRealA
    { wch: 12 }, // PenalesRealB
    { wch: 12 }, // PuntosPartido
    { wch: 18 }, // BonificacionClasificado
    { wch: 18 }, // BonificacionPenales
    { wch: 22 }, // BonificacionGanadorPenales
    { wch: 18 }, // BonificacionCampeon
    { wch: 15 }, // PuntosTotalesFila
  ];
  worksheet["!cols"] = colWidths;

  // Crear workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Progreso");

  // === HOJA DE RESUMEN: USAR VALORES DE userScore PARA CONSISTENCIA ===
  const resumenData = [
    ["RESUMEN DE PUNTAJE"],
    ["Usuario", username],
    ["Puntaje Fase de Grupos", userScore.puntajeGrupos],
    ["Puntaje Eliminatorias", userScore.puntajeEliminatorias],
    ["Puntaje Total", userScore.puntajeTotal],
    ["Aciertos Exactos", userScore.aciertosExactos],
    ["Bonificaciones Penales", userScore.bonificacionesPenales],
    ["Fecha de Exportación", new Date().toLocaleString("es-AR")],
    ["", ""],
    ["DESGLOSE DE BONIFICACIONES:"],
    ["Bonificación Clasificados", totalBonifClasificado],
    ["Bonificación Penales", totalBonifPenales],
    ["Bonificación Ganador Penales", totalBonifGanadorPenales],
    ["Bonificación Campeón", totalBonifCampeon],
    ["", ""],
    ["VERIFICACIÓN:"],
    ["Suma PuntosPartido", totalPuntosPartido],
    [
      "Suma Bonificaciones",
      totalBonifClasificado +
        totalBonifPenales +
        totalBonifGanadorPenales +
        totalBonifCampeon,
    ],
    ["Total Calculado", totalPuntosTotalesFila],
    ["Total Backend", userScore.puntajeTotal],
    ["Diferencia", userScore.puntajeTotal - totalPuntosTotalesFila],
  ];
  const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, resumenSheet, "Resumen");

  // Descargar archivo
  XLSX.writeFile(workbook, `prono2026-${username}-progreso.xlsx`);
};

// ============================================================================
// EXPORTAR RANKING A PDF
// ============================================================================

export interface LeaderboardEntry {
  position: number;
  username: string;
  scoreGroups: number;
  scoreKnockout: number;
  scoreTotal: number;
}

/**
 * Genera el archivo PDF con el ranking completo de usuarios
 */
export const exportarRankingPDF = (ranking: LeaderboardEntry[]) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Título
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PRONO2026 - RANKING GLOBAL", 14, 20);

  // Subtítulo
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${new Date().toLocaleString("es-AR")}`, 14, 28);
  doc.text(`Total Usuarios: ${ranking.length}`, 14, 33);

  // Tabla
  const tableData = ranking.map((entry) => [
    entry.position.toString(),
    `@${entry.username}`,
    entry.scoreGroups.toString(),
    entry.scoreKnockout.toString(),
    entry.scoreTotal.toString(),
  ]);

  autoTable(doc, {
    head: [["#", "Usuario", "Grupos", "Eliminatorias", "TOTAL"]],
    body: tableData,
    startY: 40,
    theme: "striped",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: 50 },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 30, halign: "center" },
      4: { cellWidth: 25, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const pos = parseInt(data.cell.raw as string);
        if (pos === 1) {
          data.cell.styles.textColor = [251, 191, 36];
          data.cell.styles.fontStyle = "bold";
        } else if (pos === 2) {
          data.cell.styles.textColor = [161, 161, 170];
          data.cell.styles.fontStyle = "bold";
        } else if (pos === 3) {
          data.cell.styles.textColor = [251, 146, 60];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // Footer
  const pageCount = (doc as any).internal.pages.length;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} • Sistema de Pronósticos Mundial 2026`,
      14,
      (doc as any).internal.pageSize.height - 10
    );
  }

  // Guardar
  doc.save(`prono2026-ranking-${new Date().toISOString().split("T")[0]}.pdf`);
};