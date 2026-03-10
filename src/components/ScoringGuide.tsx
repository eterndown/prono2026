import React from "react";
import {
  X,
  Trophy,
  Target,
  Zap,
  Award,
  Calculator,
  CheckCircle2,
} from "lucide-react";

interface ScoringGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScoringGuide: React.FC<ScoringGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <Trophy className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">
                Sistema de Puntuación
              </h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                Guía Completa • Mundial 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-10">
          {/* Introducción */}
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase text-emerald-400 italic tracking-tighter flex items-center gap-3">
              <Calculator className="w-5 h-5" />
              Filosofía del Sistema
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              El sistema de puntuación está diseñado para premiar el
              conocimiento futbolístico y la precisión en los pronósticos.
              Incluso si no aciertas exactamente, puedes sumar puntos por
              aproximación. Cada fase del torneo tiene su propia tabla de
              puntos, aumentando progresivamente en importancia.
            </p>
          </section>

          {/* Fase de Grupos */}
          <section className="space-y-6">
            <h3 className="text-xl font-black uppercase text-emerald-400 italic tracking-tighter flex items-center gap-3">
              <Target className="w-5 h-5" />
              Fase de Grupos (72 Partidos)
            </h3>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Tipo de Acierto</th>
                    <th className="px-6 py-4 text-center">Puntos Base</th>
                    <th className="px-6 py-4">Ejemplo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      ✅ Acierto EXACTO
                    </td>
                    <td className="px-6 py-4 text-center font-black text-white">
                      3 pts
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      ARG 2-1 BRA → ARG 2-1 BRA
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-amber-400">
                      🟰 Empate EXACTO
                    </td>
                    <td className="px-6 py-4 text-center font-black text-white">
                      2 pts
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      1-1 → 1-1
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-400">
                      🎯 Ganador Cercano
                    </td>
                    <td className="px-6 py-4 text-center font-black text-white">
                      3 × %
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      ESP 2-1 ITA → ESP 3-0 ITA (60% = 2 pts)
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-purple-400">
                      🔄 Equipos Invertidos
                    </td>
                    <td className="px-6 py-4 text-center font-black text-white">
                      2 × %
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      BRA 2-1 ARG → ARG 2-1 BRA
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Factor de Cercanía */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
              <h4 className="text-sm font-black uppercase text-zinc-400 mb-4 tracking-widest">
                Factor de Cercanía (Grupos)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { diff: "0", factor: "100%", desc: "Exacto" },
                  { diff: "1", factor: "80%", desc: "Muy cercano" },
                  { diff: "2", factor: "60%", desc: "Cercano" },
                  { diff: "3", factor: "40%", desc: "Lejano" },
                  { diff: "4+", factor: "20%", desc: "Mínimo" },
                ].map((item) => (
                  <div
                    key={item.diff}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl font-black text-emerald-400 mb-1">
                      {item.factor}
                    </div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase">
                      Dif: {item.diff}
                    </div>
                    <div className="text-[9px] text-zinc-600 mt-1">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonificaciones Grupos */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <h4 className="text-sm font-black uppercase text-emerald-400 mb-4 tracking-widest flex items-center gap-2">
                <Award className="w-4 h-4" />
                Bonificaciones Especiales (Grupos)
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-zinc-950/50 rounded-xl p-4">
                  <span className="text-sm font-bold text-zinc-300">
                    +1 punto por equipo clasificado
                  </span>
                  <span className="text-lg font-black text-amber-400">+1</span>
                </div>
                <div className="flex items-center justify-between bg-zinc-950/50 rounded-xl p-4">
                  <span className="text-sm font-bold text-zinc-300">
                    +2 puntos por orden exacto (1° y 2°)
                  </span>
                  <span className="text-lg font-black text-amber-400">+2</span>
                </div>
              </div>
            </div>
          </section>

          {/* Fase Eliminatoria */}
          <section className="space-y-6">
            <h3 className="text-xl font-black uppercase text-emerald-400 italic tracking-tighter flex items-center gap-3">
              <Zap className="w-5 h-5" />
              Fase Eliminatoria (32 Partidos)
            </h3>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Fase</th>
                    <th className="px-6 py-4 text-center">Acierto Exacto</th>
                    <th className="px-6 py-4 text-center">Empate Exacto</th>
                    <th className="px-6 py-4 text-center">Ganador Cercano</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {[
                    {
                      fase: "Dieciseisavos",
                      exacto: "3 pts",
                      empate: "2 pts",
                      cercano: "3 × %",
                    },
                    {
                      fase: "Octavos",
                      exacto: "4 pts",
                      empate: "3 pts",
                      cercano: "4 × %",
                    },
                    {
                      fase: "Cuartos",
                      exacto: "5 pts",
                      empate: "4 pts",
                      cercano: "5 × %",
                    },
                    {
                      fase: "Semifinales",
                      exacto: "6 pts",
                      empate: "5 pts",
                      cercano: "6 × %",
                    },
                    {
                      fase: "Final",
                      exacto: "7 pts",
                      empate: "6 pts",
                      cercano: "7 × %",
                    },
                  ].map((row) => (
                    <tr
                      key={row.fase}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-white">
                        {row.fase}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-emerald-400">
                        {row.exacto}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-amber-400">
                        {row.empate}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-blue-400">
                        {row.cercano}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bonificaciones Eliminatorias */}
            <div className="bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20 rounded-2xl p-6">
              <h4 className="text-sm font-black uppercase text-amber-400 mb-4 tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Bonificaciones Especiales (Eliminatorias)
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-zinc-950/50 rounded-xl p-4">
                  <span className="text-sm font-bold text-zinc-300">
                    +3 puntos por equipo clasificado
                  </span>
                  <span className="text-lg font-black text-amber-400">+3</span>
                </div>
                <div className="flex items-center justify-between bg-zinc-950/50 rounded-xl p-4">
                  <span className="text-sm font-bold text-zinc-300">
                    +2 puntos por acertar penales
                  </span>
                  <span className="text-lg font-black text-amber-400">+2</span>
                </div>
                <div className="flex items-center justify-between bg-zinc-950/50 rounded-xl p-4">
                  <span className="text-sm font-bold text-zinc-300">
                    +3 puntos por ganador en penales
                  </span>
                  <span className="text-lg font-black text-amber-400">+3</span>
                </div>
                <div className="flex items-center justify-between bg-zinc-950/50 rounded-xl p-4 border border-rose-500/20">
                  <span className="text-sm font-bold text-zinc-300">
                    +5 puntos por acertar CAMPEÓN
                  </span>
                  <span className="text-xl font-black text-rose-400">
                    +5 🏆
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Ejemplos Prácticos */}
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase text-emerald-400 italic tracking-tighter">
              Ejemplos Prácticos
            </h3>

            <div className="space-y-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h4 className="text-sm font-black uppercase text-emerald-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Ejemplo 1: Acierto Perfecto en Final
                </h4>
                <div className="space-y-2 text-sm text-zinc-400">
                  <p>Pronóstico: ARG 2-2 FRA, 4-3 penales</p>
                  <p>Resultado: ARG 2-2 FRA, 5-4 penales</p>
                  <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1">
                    <div className="flex justify-between">
                      <span>Empate exacto (2-2):</span>
                      <span className="text-emerald-400 font-bold">6 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonificación penales:</span>
                      <span className="text-amber-400 font-bold">+2 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ganador penales:</span>
                      <span className="text-amber-400 font-bold">+3 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Campeón:</span>
                      <span className="text-rose-400 font-bold">+5 pts</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
                      <span>TOTAL:</span>
                      <span>16 pts</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h4 className="text-sm font-black uppercase text-amber-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Ejemplo 2: Piso Mínimo Aplicado
                </h4>
                <div className="space-y-2 text-sm text-zinc-400">
                  <p>Pronóstico: POR 5-0 URU (Octavos)</p>
                  <p>Resultado: POR 1-0 URU</p>
                  <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1">
                    <div className="flex justify-between">
                      <span>Diferencia = 4 → Factor 20%:</span>
                      <span className="text-zinc-500">4 × 20% = 0.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redondeo:</span>
                      <span className="text-zinc-500">1 pt</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⚠️ Piso mínimo (ganador):</span>
                      <span className="text-emerald-400 font-bold">2 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonificación clasificado:</span>
                      <span className="text-amber-400 font-bold">+3 pts</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
                      <span>TOTAL:</span>
                      <span>5 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recordatorios */}
          <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-black uppercase text-zinc-400 tracking-widest mb-4">
              Recordatorios Importantes
            </h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>
                  En fase de grupos NO hay penales. Los empates son resultados
                  finales.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>
                  En eliminatorias SÍ hay penales. Debes pronosticar el marcador
                  de penales si hay empate.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>
                  El piso mínimo te protege: siempre sumas al menos 2 puntos si
                  aciertas el ganador.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>
                  Las bonificaciones en eliminatorias pueden valer más que el
                  partido mismo.
                </span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center sticky bottom-0 bg-zinc-950">
          <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">
            Sistema de Puntuación Oficial • Mundial 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoringGuide;
