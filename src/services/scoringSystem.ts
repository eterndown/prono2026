/**
 * Calcula las bonificaciones de fase de grupos automáticamente
 * CORRECCIÓN: Si el usuario no tiene pronósticos válidos en el grupo, retorna 0 bonificaciones
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

    tabla[local].dg += gl - gv;
    tabla[local].gf += gl;
    tabla[visitante].dg += gv - gl;
    tabla[visitante].gf += gv;

    if (gl > gv) {
      tabla[local].pts += 3;
    } else if (gv > gl) {
      tabla[visitante].pts += 3;
    } else {
      tabla[local].pts += 1;
      tabla[visitante].pts += 1;
    }
  });

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

  // === CORRECCIÓN CRÍTICA ===
  // Verificar si el usuario tiene ALGÚN pronóstico válido en este grupo
  let tienePronosticosValidos = false;
  for (const partido of partidosDelGrupo) {
    const prono = pronosticos[partido.id];
    if (prono && isValidScore(prono.local) && isValidScore(prono.visitante)) {
      tienePronosticosValidos = true;
      break;
    }
  }

  // Si no tiene pronósticos válidos, NO otorgar bonificaciones
  if (!tienePronosticosValidos) {
    return { clasificados, bonificaciones: 0 };
  }

  // Calcular bonificaciones para el usuario (solo si tiene pronósticos)
  let bonificaciones = 0;

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

  const ordenadosProno = Object.entries(pronosticosPorEquipo)
    .sort(([, a], [, b]) => {
      const ptsA = a.victorias * 3 + a.empates;
      const ptsB = b.victorias * 3 + b.empates;
      return ptsB - ptsA;
    })
    .map(([eq]) => eq);

  const clasificadosProno = {
    primero: ordenadosProno[0],
    segundo: ordenadosProno[1],
  };

  if (clasificadosProno.primero === clasificados.primero) bonificaciones += 1;
  if (clasificadosProno.segundo === clasificados.segundo) bonificaciones += 1;

  if (
    clasificadosProno.primero === clasificados.primero &&
    clasificadosProno.segundo === clasificados.segundo
  ) {
    bonificaciones += 2;
  }

  return { clasificados, bonificaciones };
};
