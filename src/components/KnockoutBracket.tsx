import React, { memo } from 'react';
import { Partido, Pronostico } from '../types';
import { EQUIPOS, getFlagUrl } from '../constants';
import { Trophy, Lock, Calendar, Clock, AlertCircle } from 'lucide-react';

interface KnockoutBracketProps {
  llaves: Partido[];
  pronosticos: Record<number, Pronostico>;
  onUpdate: (id: number, l: number | string | null, v: number | string | null, pl?: number | string | null, pv?: number | string | null) => void;
  disabled?: boolean;
}

const BracketMatch: React.FC<{ 
  match: Partido; 
  pronostico: Pronostico;
  onUpdate: (l: number | string | null, v: number | string | null, pl?: number | string | null, pv?: number | string | null) => void;
  disabled?: boolean;
}> = memo(({ match, pronostico, onUpdate, disabled }) => {
  const local = EQUIPOS.find(e => e.id === match.equipoLocal);
  const visitante = EQUIPOS.find(e => e.id === match.equipoVisitante);
  
  const isNumeric = (val: any) => {
    if (val === null || val === undefined || val === "" || val === "-") return false;
    return !isNaN(Number(val));
  };

  const validatePens = () => {
    const pl = pronostico.penalesLocal;
    const pv = pronostico.penalesVisitante;
    if (!isNumeric(pl) || !isNumeric(pv)) return true;
    
    const nA = parseInt(String(pl), 10);
    const nB = parseInt(String(pv), 10);
    if (nA === nB) return false;

    const max = Math.max(nA, nB);
    const min = Math.min(nA, nB);
    const diff = max - min;

    if (max <= 5) {
      const validPairs = [
        [1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [3, 2], 
        [4, 1], [4, 2], [4, 3], [5, 3], [5, 4]
      ];
      return validPairs.some(pair => pair[0] === max && pair[1] === min);
    } else {
      return diff === 1;
    }
  };

  const pensValid = validatePens();

  const isWinner = (side: 'L' | 'V') => {
    if (!isNumeric(pronostico.local) || !isNumeric(pronostico.visitante)) return false;
    const l = Number(pronostico.local);
    const v = Number(pronostico.visitante);
    const pl = isNumeric(pronostico.penalesLocal) ? Number(pronostico.penalesLocal) : 0;
    const pv = isNumeric(pronostico.penalesVisitante) ? Number(pronostico.penalesVisitante) : 0;
    
    if (side === 'L') {
      if (l > v) return true;
      if (l === v && pensValid && pl > pv) return true;
    } else {
      if (v > l) return true;
      if (l === v && pensValid && pv > pl) return true;
    }
    return false;
  };

  const isResolved = isNumeric(pronostico.local) && isNumeric(pronostico.visitante);
  const localWon = isWinner('L');
  const visitorWon = isWinner('V');

  const handleScoreChange = (side: 'local' | 'visitante', value: string) => {
    if (disabled) return;
    let processed: number | string | null = value === "" ? null : (!isNaN(Number(value)) ? Math.min(Math.max(0, Number(value)), 15) : value);
    if (side === 'local') onUpdate(processed, pronostico.visitante, pronostico.penalesLocal, pronostico.penalesVisitante);
    else onUpdate(pronostico.local, processed, pronostico.penalesLocal, pronostico.penalesVisitante);
  };

  const handlePensChange = (side: 'local' | 'visitante', value: string) => {
    if (disabled) return;
    let processed: number | string | null = value === "" ? null : (!isNaN(Number(value)) ? Math.min(Math.max(0, Number(value)), 15) : value);
    if (side === 'local') onUpdate(pronostico.local, pronostico.visitante, processed, pronostico.penalesVisitante);
    else onUpdate(pronostico.local, pronostico.visitante, pronostico.penalesLocal, processed);
  };

  const getDisplayValue = (val: any) => (val === null || val === undefined || val === "-") ? '' : String(val);

  return (
    <div className={`w-full bg-zinc-900 border ${disabled ? 'border-amber-500/10' : 'border-zinc-800'} rounded-xl overflow-hidden shadow-lg transition-all duration-300 relative`}>
      {disabled && <div className="absolute top-1 right-1 z-10"><Lock className="w-2.5 h-2.5 text-amber-500/50" /></div>}
      <div className="px-2 pt-1.5 flex items-center justify-between border-b border-zinc-800/30">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black text-emerald-500 uppercase px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded shadow-inner">M#{match.id}</span>
          <span className="text-[7px] font-black text-zinc-500 uppercase">{match.fecha}</span>
        </div>
        <div className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-zinc-600" /><span className="text-[7px] font-black text-zinc-500">{match.hSimu || "16:00"}</span></div>
      </div>
      <div className="p-2 space-y-1">
        {[
          { team: local, side: 'L' as const, key: 'local' as const, won: localWon, visitorWon },
          { team: visitante, side: 'V' as const, key: 'visitante' as const, won: visitorWon, localWon }
        ].map(({ team, side, key, won, visitorWon, localWon }) => (
          <div key={side} className={`flex items-center justify-between p-1.5 rounded-lg transition-all duration-500 ${won ? 'bg-emerald-500/20 ring-1 ring-emerald-500/30 shadow-lg' : (isResolved && (visitorWon || localWon) ? 'opacity-40 grayscale-[0.5]' : '')}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-5 h-3.5 rounded-sm overflow-hidden border border-zinc-800 shrink-0">
                <img src={getFlagUrl(team?.id || null)} className="w-full h-full object-cover" />
              </div>
              <span className={`text-[10px] font-black uppercase truncate tracking-tighter ${won ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {team?.nombre || match[`placeholder${side === 'L' ? 'Local' : 'Visitante'}`] || 'TBD'}
              </span>
            </div>
            <input type="text" disabled={disabled} value={getDisplayValue(pronostico[key])} onChange={(e) => handleScoreChange(key, e.target.value)}
              className={`w-7 h-7 bg-zinc-950 border border-zinc-800 rounded text-center text-[10px] font-black outline-none transition-colors ${disabled ? 'text-zinc-600' : 'text-white focus:ring-1 focus:ring-emerald-500'}`} />
          </div>
        ))}
      </div>
      {isResolved && Number(pronostico.local) === Number(pronostico.visitante) && (
        <div className="px-3 pb-2 flex items-center justify-between gap-1 border-t border-zinc-800/20 pt-1.5">
           <span className={`text-[7px] font-black uppercase italic ${!pensValid ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>P:</span>
           <div className="flex gap-1">
             <input type="text" disabled={disabled} value={getDisplayValue(pronostico.penalesLocal)} onChange={(e) => handlePensChange('local', e.target.value)}
                className={`w-6 h-6 bg-zinc-950 border rounded text-center text-[9px] font-black outline-none transition-all ${!pensValid ? 'border-rose-500/40 text-rose-500' : 'border-zinc-800 text-emerald-400 focus:border-emerald-500'}`} />
             <input type="text" disabled={disabled} value={getDisplayValue(pronostico.penalesVisitante)} onChange={(e) => handlePensChange('visitante', e.target.value)}
                className={`w-6 h-6 bg-zinc-950 border rounded text-center text-[9px] font-black outline-none transition-all ${!pensValid ? 'border-rose-500/40 text-rose-500' : 'border-zinc-800 text-emerald-400 focus:border-emerald-500'}`} />
           </div>
           {!pensValid && <AlertCircle className="w-2.5 h-2.5 text-rose-500" />}
        </div>
      )}
    </div>
  );
});

const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ llaves, pronosticos, onUpdate, disabled }) => {
  const octavos = [89, 90, 91, 92, 93, 94, 95, 96].map(id => llaves.find(m => m.id === id)!);
  const cuartos = [97, 98, 99, 100].map(id => llaves.find(m => m.id === id)!);
  const semis = [101, 102].map(id => llaves.find(m => m.id === id)!);
  const final = llaves.find(m => m.id === 104)!;
  const tercerPuesto = llaves.find(m => m.id === 103)!;

  return (
    <div className="w-full overflow-x-auto pb-10 scrollbar-hide">
      <div className="min-w-[1000px] flex justify-between gap-4 p-4">
        <div className="flex flex-col justify-around gap-8 w-60">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 text-center">Octavos</h4>
          {octavos.map(m => (
            <BracketMatch key={m.id} match={m} disabled={disabled} pronostico={pronosticos[m.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(m.id, l, v, pl, pv)} />
          ))}
        </div>
        <div className="flex flex-col justify-around gap-16 w-60">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2 text-center">Cuartos</h4>
          {cuartos.map(m => (
            <BracketMatch key={m.id} match={m} disabled={disabled} pronostico={pronosticos[m.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(m.id, l, v, pl, pv)} />
          ))}
        </div>
        <div className="flex flex-col justify-around gap-32 w-60">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 text-center">Semis</h4>
          {semis.map(m => (
            <BracketMatch key={m.id} match={m} disabled={disabled} pronostico={pronosticos[m.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(m.id, l, v, pl, pv)} />
          ))}
        </div>
        <div className="flex flex-col justify-center gap-20 w-64">
          <div className="space-y-4">
            <Trophy className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white text-center">Gran Final</h4>
            <div className={`p-1 rounded-[1.5rem] bg-gradient-to-br from-emerald-500/10 border border-zinc-800 shadow-xl`}>
              <BracketMatch match={final} disabled={disabled} pronostico={pronosticos[final.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(final.id, l, v, pl, pv)} />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 text-center">3er Puesto</h4>
            <BracketMatch match={tercerPuesto} disabled={disabled} pronostico={pronosticos[tercerPuesto.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(tercerPuesto.id, l, v, pl, pv)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnockoutBracket;