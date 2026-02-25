
import React, { memo } from 'react';
import { Partido, Pronostico, InfoEstadio } from '../types';
import { EQUIPOS, ESTADIOS, getFlagUrl } from '../constants';
import { Lock, Clock, Calendar, AlertCircle, Zap, Radio, MapPin } from 'lucide-react';

interface MatchCardProps {
  match: Partido;
  prediction: Pronostico;
  disabled?: boolean;
  isReadOnly?: boolean;
  onUpdate: (id: number, local: number | string | null, visitante: number | string | null, pl?: number | string | null, pv?: number | string | null) => void;
  onSelectStadium?: (estadio: InfoEstadio) => void;
}

/**
 * Enhanced MatchCard for the 2026 World Cup Predictor.
 * Supports score entry, penalty validation, and locking based on deadlines.
 */
export const MatchCard: React.FC<MatchCardProps> = memo(({ match, prediction, disabled, isReadOnly, onUpdate, onSelectStadium }) => {
  const local = EQUIPOS.find(t => t.id === (match.equipoLocal || ''));
  const visitante = EQUIPOS.find(t => t.id === (match.equipoVisitante || ''));
  const esKO = match.fase !== 'Grupos';
  
  const isNumericValue = (val: any) => {
    if (val === null || val === undefined || val === "" || val === "-") return false;
    const num = Number(val);
    return !isNaN(num) && isFinite(num);
  };

  /**
   * FIFA World Cup Penalty Shootout Validation Rule
   */
  const validatePens = () => {
    const pl = prediction.penalesLocal;
    const pv = prediction.penalesVisitante;
    if (!isNumericValue(pl) || !isNumericValue(pv)) return true;
    
    const nA = parseInt(String(pl), 10);
    const nB = parseInt(String(pv), 10);
    if (nA === nB) return false;

    const max = Math.max(nA, nB);
    const min = Math.min(nA, nB);
    const diff = max - min;

    if (max <= 5) {
      const validPairs = [[1,0],[2,0],[2,1],[3,0],[3,1],[3,2],[4,1],[4,2],[4,3],[5,3],[5,4]];
      return validPairs.some(pair => pair[0] === max && pair[1] === min);
    } 
    return diff === 1;
  };

  const pensValid = validatePens();
  const showPens = esKO && isNumericValue(prediction.local) && isNumericValue(prediction.visitante) && parseInt(String(prediction.local), 10) === parseInt(String(prediction.visitante), 10);

  const handleScoreChange = (side: 'local' | 'visitante', value: string) => {
    if (disabled || isReadOnly) return;
    const trimmed = value.trim();
    if (trimmed === "") {
       onUpdate(match.id, side === 'local' ? null : prediction.local, side === 'visitante' ? null : prediction.visitante, prediction.penalesLocal, prediction.penalesVisitante);
       return;
    }
    const n = Number(trimmed);
    if (!isNaN(n)) {
      const clamped = Math.min(Math.max(0, Math.floor(n)), 15);
      if (side === 'local') onUpdate(match.id, clamped, prediction.visitante, prediction.penalesLocal, prediction.penalesVisitante);
      else onUpdate(match.id, prediction.local, clamped, prediction.penalesLocal, prediction.penalesVisitante);
    }
  };

  const handlePensChange = (side: 'local' | 'visitante', value: string) => {
    if (disabled || isReadOnly) return;
    const trimmed = value.trim();
    if (trimmed === "") {
       onUpdate(match.id, prediction.local, prediction.visitante, side === 'local' ? null : prediction.penalesLocal, side === 'visitante' ? null : prediction.penalesVisitante);
       return;
    }
    const n = Number(trimmed);
    if (!isNaN(n)) {
      const clamped = Math.min(Math.max(0, Math.floor(n)), 15);
      if (side === 'local') onUpdate(match.id, prediction.local, prediction.visitante, clamped, prediction.penalesVisitante);
      else onUpdate(match.id, prediction.local, prediction.visitante, prediction.penalesLocal, clamped);
    }
  };

  const getDisplayValue = (val: any) => (val === null || val === undefined || val === "-") ? '' : String(val);

  const stadiumInfo = Object.values(ESTADIOS).find(s => s.e === match.estadio);

  return (
    <div className={`bg-zinc-900/50 border-2 ${disabled && !isReadOnly ? 'border-zinc-800/40 opacity-70 grayscale-[0.2]' : isReadOnly ? 'border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-zinc-800 hover:border-zinc-700 shadow-xl'} p-4 rounded-3xl flex flex-col gap-4 transition-all duration-300 relative group/card ${prediction.esSimulacion && !isReadOnly ? 'bg-amber-500/5 border-amber-500/30 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : ''}`}>
      
      {disabled && !isReadOnly && (
        <div className="absolute -top-2 -right-2 flex items-center gap-2 bg-rose-500 px-3 py-1 rounded-full shadow-lg z-20">
          <Lock className="w-2.5 h-2.5 text-white" />
          <span className="text-[8px] font-black uppercase text-white tracking-widest">Bloqueado</span>
        </div>
      )}

      {isReadOnly && (
        <div className="absolute -top-2 -right-2 flex items-center gap-2 bg-emerald-500 px-3 py-1 rounded-full shadow-lg z-20 animate-pulse">
          <Radio className="w-2.5 h-2.5 text-zinc-950" />
          <span className="text-[8px] font-black uppercase text-zinc-950 tracking-widest">Oficial</span>
        </div>
      )}

      {prediction.esSimulacion && !isReadOnly && (
        <div className="absolute -top-2 -left-2 flex items-center gap-2 bg-amber-500 px-3 py-1 rounded-full shadow-lg z-20">
          <span className="text-[8px] font-black uppercase text-zinc-950 tracking-widest flex items-center gap-1">
            <Zap className="w-2 h-2 text-zinc-950" /> Pronosticado
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <span className={`bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter ${isReadOnly ? 'text-emerald-400' : prediction.esSimulacion ? 'text-amber-500' : 'text-emerald-500'}`}>
              MATCH #{match.id}
            </span>
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] italic">
              {match.fase === 'Grupos' ? `Grupo ${match.grupo}` : match.fase}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950/60 border border-zinc-800 rounded-lg">
               <Calendar className="w-2.5 h-2.5 text-zinc-500" />
               <span className="text-[9px] font-black text-zinc-400 uppercase leading-none">{match.fecha}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950/60 border border-zinc-800 rounded-lg">
               <Clock className="w-2.5 h-2.5 text-zinc-500" />
               <span className="text-[9px] font-black text-zinc-400 leading-none">{match.hSimu || "16:00"} ARG</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex-1 flex flex-col items-center gap-2 overflow-hidden" title={match.placeholderLocal}>
          <div className="w-10 h-7 rounded-lg overflow-hidden border border-zinc-800 shadow-md transform group-hover/card:scale-105 transition-transform">
             <img src={getFlagUrl(local?.id || null)} className="w-full h-full object-cover" alt={local?.nombre || 'TBD'} />
          </div>
          <span className={`font-black truncate text-[10px] uppercase tracking-tighter w-full text-center ${disabled && !isReadOnly ? 'text-zinc-500' : 'text-zinc-300'}`}>
            {local?.nombre || match.placeholderLocal || 'TBD'}
          </span>
        </div>

        <div className={`flex items-center gap-2 bg-zinc-950 p-2 rounded-2xl border-2 transition-colors ${disabled && !isReadOnly ? 'border-zinc-800/30' : isReadOnly ? 'border-emerald-500/40' : prediction.esSimulacion ? 'border-amber-500/20' : 'border-zinc-800'}`}>
          <input 
            type="text" 
            disabled={disabled || isReadOnly} 
            value={getDisplayValue(prediction.local)} 
            onChange={(e) => handleScoreChange('local', e.target.value)} 
            className={`w-10 h-10 bg-zinc-900 border border-zinc-800/50 text-center rounded-xl text-sm font-black outline-none transition-all ${disabled && !isReadOnly ? 'text-zinc-700' : isReadOnly ? 'text-emerald-400' : prediction.esSimulacion ? 'text-amber-400' : 'text-white focus:ring-1 focus:ring-emerald-500'}`} 
          />
          <span className={`font-black text-lg self-center ${disabled && !isReadOnly ? 'text-zinc-800' : 'text-zinc-700'}`}>:</span>
          <input 
            type="text" 
            disabled={disabled || isReadOnly} 
            value={getDisplayValue(prediction.visitante)} 
            onChange={(e) => handleScoreChange('visitante', e.target.value)} 
            className={`w-10 h-10 bg-zinc-900 border border-zinc-800/50 text-center rounded-xl text-sm font-black outline-none transition-all ${disabled && !isReadOnly ? 'text-zinc-700' : isReadOnly ? 'text-emerald-400' : prediction.esSimulacion ? 'text-amber-400' : 'text-white focus:ring-1 focus:ring-emerald-500'}`} 
          />
        </div>

        <div className="flex-1 flex flex-col items-center gap-2 overflow-hidden" title={match.placeholderVisitante}>
          <div className="w-10 h-7 rounded-lg overflow-hidden border border-zinc-800 shadow-md transform group-hover/card:scale-105 transition-transform">
             <img src={getFlagUrl(visitante?.id || null)} className="w-full h-full object-cover" alt={visitante?.nombre || 'TBD'} />
          </div>
          <span className={`font-black truncate text-[10px] uppercase tracking-tighter w-full text-center ${disabled && !isReadOnly ? 'text-zinc-500' : 'text-zinc-300'}`}>
            {visitante?.nombre || match.placeholderVisitante || 'TBD'}
          </span>
        </div>
      </div>

      {showPens && (
        <div className="flex flex-col items-center gap-2 pt-3 border-t border-zinc-800/60 mt-1">
          <div className="flex items-center gap-3">
            <span className={`text-[8px] font-black uppercase tracking-widest italic ${!pensValid ? 'text-rose-500 animate-pulse' : disabled && !isReadOnly ? 'text-zinc-700' : isReadOnly ? 'text-emerald-400' : prediction.esSimulacion ? 'text-amber-500' : 'text-emerald-500'}`}>
                {pensValid ? 'Serie Penales' : 'Serie Inválida'}
            </span>
            <div className="flex gap-2">
              <input 
                type="text" 
                disabled={disabled || isReadOnly} 
                value={getDisplayValue(prediction.penalesLocal)} 
                onChange={(e) => handlePensChange('local', e.target.value)} 
                placeholder="P" 
                className={`w-7 h-7 bg-zinc-950 border text-center rounded-lg text-[10px] font-black outline-none transition-all ${!pensValid ? 'border-rose-500 text-rose-500' : disabled && !isReadOnly ? 'border-zinc-900 text-zinc-700' : 'border-zinc-800 text-emerald-400'}`} 
              />
              <input 
                type="text" 
                disabled={disabled || isReadOnly} 
                value={getDisplayValue(prediction.penalesVisitante)} 
                onChange={(e) => handlePensChange('visitante', e.target.value)} 
                placeholder="P" 
                className={`w-7 h-7 bg-zinc-950 border text-center rounded-lg text-[10px] font-black outline-none transition-all ${!pensValid ? 'border-rose-500 text-rose-500' : disabled && !isReadOnly ? 'border-zinc-900 text-zinc-700' : 'border-zinc-800 text-emerald-400'}`} 
              />
            </div>
            {!pensValid && <AlertCircle className="w-3 h-3 text-rose-500" />}
          </div>
        </div>
      )}

      {/* Estadio interactivo */}
      {match.estadio && (
        <button 
          onClick={() => stadiumInfo && onSelectStadium && onSelectStadium(stadiumInfo)}
          className="mt-2 pt-3 border-t border-zinc-800/60 flex items-center justify-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors group/stadium-btn"
        >
          <MapPin className="w-3 h-3 group-hover/stadium-btn:animate-bounce" />
          <span className="text-[8px] font-black uppercase tracking-widest truncate max-w-[180px]">
            {match.estadio} • {match.ciudad}
          </span>
        </button>
      )}
    </div>
  );
});
