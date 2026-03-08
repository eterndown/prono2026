import React from "react";
import { ScoreCalculation, Fase } from "../types";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  Zap,
  Target,
} from "lucide-react";

interface ScoreBreakdownProps {
  calculations: ScoreCalculation[];
  fase?: Fase;
  onClose?: () => void;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  calculations,
  fase,
  onClose,
}) => {
  // Filtrar por fase si se especifica
  const filtered = fase
    ? calculations.filter((c) => c.fase === fase)
    : calculations;

  const total = filtered.reduce((sum, c) => sum + c.puntosFinales, 0);
  const bonificacionesTotales = filtered
    .flatMap((c) => c.bonificaciones)
    .reduce((sum, b) => sum + b.puntos, 0);

  const getAciertoIcon = (tipo: ScoreCalculation["tipoAcierto"]) => {
    switch (tipo) {
      case "EXACTO":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "EMPATE_EXACTO":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "GANADOR":
        return <Target className="w-4 h-4 text-amber-500" />;
      case "EMPATE":
        return <AlertCircle className="w-4 h-4 text-zinc-500" />;
      case "INVERTIDO":
        return <AlertCircle className="w-4 h-4 text-zinc-500" />;
      default:
        return <XCircle className="w-4 h-4 text-rose-500" />;
    }
  };

  const getBonificacionIcon = (tipo: string) => {
    switch (tipo) {
      case "CLASIFICADO":
        return <Zap className="w-3 h-3 text-amber-400" />;
      case "PENALES":
        return <Trophy className="w-3 h-3 text-amber-400" />;
      case "GANADOR_PENALES":
        return <Trophy className="w-3 h-3 text-emerald-400" />;
      case "CAMPEON":
        return <Trophy className="w-3 h-3 text-amber-300" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-lg font-black uppercase italic text-white tracking-tighter">
          {fase ? `Desglose: ${fase}` : "Desglose de Puntos"}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
            Partidos
          </p>
          <p className="text-xl font-black text-white">{filtered.length}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
            Bonificaciones
          </p>
          <p className="text-xl font-black text-amber-400">
            +{bonificacionesTotales}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
            TOTAL
          </p>
          <p className="text-xl font-black text-emerald-400">{total}</p>
        </div>
      </div>

      {/* Lista de Cálculos */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
        {filtered.map((calc) => (
          <div
            key={`${calc.matchId}-${calc.timestamp}`}
            className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            {/* Header del partido */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getAciertoIcon(calc.tipoAcierto)}
                <span className="text-xs font-black text-white">
                  Match #{calc.matchId}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">
                  {calc.fase}
                </span>
              </div>
              <span className="text-lg font-black text-emerald-400">
                {calc.puntosFinales} pts
              </span>
            </div>

            {/* Detalle del resultado */}
            <p className="text-[10px] font-bold text-zinc-400 mb-2">
              {calc.detalle}
            </p>

            {/* Cálculo técnico (colapsable en producción) */}
            <details className="text-[9px] text-zinc-500">
              <summary className="cursor-pointer hover:text-zinc-300 transition-colors">
                Ver cálculo técnico
              </summary>
              <div className="mt-2 space-y-1 pl-2 border-l-2 border-zinc-800">
                <p>Tipo: {calc.tipoAcierto}</p>
                {calc.diferencia !== undefined && (
                  <p>Diferencia: {calc.diferencia} goles</p>
                )}
                {calc.factor !== undefined && (
                  <p>Factor: {(calc.factor * 100).toFixed(0)}%</p>
                )}
                {calc.puntosBase !== undefined && (
                  <p>Base: {calc.puntosBase} pts</p>
                )}
                {calc.pisoAplicado && (
                  <p className="text-amber-400">⚠ Piso mínimo aplicado</p>
                )}
              </div>
            </details>

            {/* Bonificaciones */}
            {calc.bonificaciones.length > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-800">
                <p className="text-[9px] font-black uppercase text-zinc-500 mb-1">
                  Bonificaciones:
                </p>
                <div className="space-y-1">
                  {calc.bonificaciones.map((bonif, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-[10px]"
                    >
                      {getBonificacionIcon(bonif.tipo)}
                      <span className="text-zinc-300">{bonif.descripcion}</span>
                      <span className="font-black text-amber-400">
                        +{bonif.puntos}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nota de transparencia */}
      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest text-center pt-2">
        Cada cálculo queda registrado • Última actualización:{" "}
        {new Date().toLocaleString("es-AR")}
      </p>
    </div>
  );
};

export default ScoreBreakdown;
