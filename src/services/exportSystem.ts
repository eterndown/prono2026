/**
 * SISTEMA DE EXPORTACIÓN - PRONO2026
 * Exporta progreso de usuarios a XLSX y Ranking a PDF
 */

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserScore, Partido, Pronostico } from "../types";
import { PARTIDOS_INICIALES, EQUIPOS } from "../constants";
import { calcularPuntosPartido } from "./scoringSystem";

// ============================================================================
// EXPORTAR PROGRESO DE USUARIO A XLSX
// ============================================================================

export interface ExportRow {
  Usuario: string;
  MatchID: number;
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
 * 105 filas: 1 header + 104 partidos
 */
export const exportarProgresoXLSX = (
  username: string,
  userScore: UserScore,
  todosLosPartidos: Partido[],
  pronosticos: Record<number, Pronostico>,
  resultadosReales: Record<number, Pronostico>
) => {
  const filas: ExportRow[] = [];

  todosLosPartidos.forEach((partido) => {
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

    // Calcular puntos del partido
    const calculo = calcularPuntosPartido(partido, pronostico, real);

    // Extraer bonificaciones
    const bonifClasificado =
      calculo.bonificaciones.find((b) => b.tipo === "CLASIFICADO")?.puntos || 0;
    const bonifPenales =
      calculo.bonificaciones.find((b) => b.tipo === "PENALES")?.puntos || 0;
    const bonifGanadorPenales =
      calculo.bonificaciones.find((b) => b.tipo === "GANADOR_PENALES")
        ?.puntos || 0;
    const bonifCampeon =
      calculo.bonificaciones.find((b) => b.tipo === "CAMPEON")?.puntos || 0;

    // Obtener nombres de equipos
    const equipoA = partido.equipoLocal || partido.placeholderLocal || "TBD";
    const equipoB =
      partido.equipoVisitante || partido.placeholderVisitante || "TBD";

    const fila: ExportRow = {
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
    };

    filas.push(fila);
  });

  // Crear worksheet
  const worksheet = XLSX.utils.json_to_sheet(filas);

  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 15 }, // Usuario
    { wch: 8 }, // MatchID
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

  // Agregar hoja de resumen
  const resumenData = [
    ["RESUMEN DE PUNTAJE"],
    ["Usuario", username],
    ["Puntaje Fase de Grupos", userScore.puntajeGrupos],
    ["Puntaje Eliminatorias", userScore.puntajeEliminatorias],
    ["Puntaje Total", userScore.puntajeTotal],
    ["Aciertos Exactos", userScore.aciertosExactos],
    ["Bonificaciones Penales", userScore.bonificacionesPenales],
    ["Fecha de Exportación", new Date().toLocaleString("es-AR")],
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
      fillColor: [16, 185, 129], // Emerald-500
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
      // Resaltar top 3
      if (data.section === "body" && data.column.index === 0) {
        const pos = parseInt(data.cell.raw as string);
        if (pos === 1) {
          data.cell.styles.textColor = [251, 191, 36]; // Amber-400 (Oro)
          data.cell.styles.fontStyle = "bold";
        } else if (pos === 2) {
          data.cell.styles.textColor = [161, 161, 170]; // Zinc-400 (Plata)
          data.cell.styles.fontStyle = "bold";
        } else if (pos === 3) {
          data.cell.styles.textColor = [251, 146, 60]; // Amber-600 (Bronce)
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // Footer - CORREGIDO: usar (doc as any).internal.pages.length
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
