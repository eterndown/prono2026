import React, { memo, useState, useEffect, useRef } from 'react';
import { Partido, Pronostico } from '../types';
import { EQUIPOS, getFlagUrl } from '../constants';
import { Trophy, Lock, AlertCircle, HelpCircle } from 'lucide-react';

const isNumeric = (val: any) => {
  if (val === null || val === undefined || val === "" || val === "-") return false;
  return !isNaN(Number(val)) && isFinite(Number(val));
};

/**
 * Helper function to format score values for display in input fields.
 */
const getDisplayValue = (val: any) => (val === null || val === undefined || val === "-") ? '' : String(val);

interface KnockoutFullBracketProps {
  llaves: Partido[];
  pronosticos: Record<number, Pronostico>;
  onUpdate: (id: number, l: number | string | null, v: number | string | null, pl?: number | string | null, pv?: number | string | null) => void;
  disabled?: boolean;
  isSimulationComplete?: boolean;
}

const FullBracketMatch: React.FC<{ 
  match: Partido; 
  pronostico: Pronostico;
  onUpdate: (l: number | string | null, v: number | string | null, pl?: number | string | null, pv?: number | string | null) => void;
  disabled?: boolean;
  reverse?: boolean;
}> = memo(({ match, pronostico, onUpdate, disabled, reverse }) => {
  const local = EQUIPOS.find(e => e.id === match.equipoLocal);
  const visitante = EQUIPOS.find(e => e.id === match.equipoVisitante);
  
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

  const handleScoreChange = (side: 'local' | 'visitante', value: string) => {
    if (disabled) return;
    let processed: number | string | null = value === "" ? null : (!isNaN(Number(value)) ? Math.min(Math.max(0, parseInt(value, 10)), 15) : value);
    if (side === 'local') onUpdate(processed, pronostico.visitante, pronostico.penalesLocal, pronostico.penalesVisitante);
    else onUpdate(pronostico.local, processed, pronostico.penalesLocal, pronostico.penalesVisitante);
  };

  const handlePensChange = (side: 'local' | 'visitante', value: string) => {
    if (disabled) return;
    let processed: number | string | null = value === "" ? null : (!isNaN(Number(value)) ? Math.min(Math.max(0, parseInt(value, 10)), 15) : value);
    if (side === 'local') onUpdate(pronostico.local, pronostico.visitante, processed, pronostico.penalesVisitante);
    else onUpdate(pronostico.local, pronostico.visitante, pronostico.penalesLocal, processed);
  };

  const isWon = (side: 'L' | 'V') => {
    if (!isNumeric(pronostico.local) || !isNumeric(pronostico.visitante)) return false;
    const l = parseInt(String(pronostico.local), 10);
    const v = parseInt(String(pronostico.visitante), 10);
    if (side === 'L' && l > v) return true;
    if (side === 'V' && v > l) return true;
    if (l === v) {
      const pl = isNumeric(pronostico.penalesLocal) ? Number(pronostico.penalesLocal) : 0;
      const pv = isNumeric(pronostico.penalesVisitante) ? Number(pronostico.penalesVisitante) : 0;
      if (side === 'L' && pl > pv && pensValid) return true;
      if (side === 'V' && pv > pl && pensValid) return true;
    }
    return false;
  };

  const isDraw = isNumeric(pronostico.local) && isNumeric(pronostico.visitante) && parseInt(String(pronostico.local), 10) === parseInt(String(pronostico.visitante), 10);

  return (
    <div className={`w-full bg-zinc-950 border ${disabled ? 'border-amber-500/20' : 'border-zinc-800'} rounded-xl overflow-hidden shadow-xl transition-all relative ${isWon('L') || isWon('V') ? 'ring-1 ring-emerald-500/30' : ''}`}>
      <div className={`flex items-center px-1.5 py-1 bg-zinc-900 border-b border-zinc-800/50 ${reverse ? 'flex-row-reverse' : ''}`}>
         <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest px-1 bg-zinc-950 rounded border border-zinc-800/50">M#{match.id}</span>
      </div>
      <div className="p-0.5 space-y-0.5">
        {[
          { team: local, placeholder: match.placeholderLocal, side: 'L' as const, key: 'local' as const },
          { team: visitante, placeholder: match.placeholderVisitante, side: 'V' as const, key: 'visitante' as const }
        ].map(({ team, placeholder, side, key }) => {
          const won = isWon(side);
          return (
            <div key={side} className={`flex items-center justify-between p-1 rounded-lg ${won ? 'bg-emerald-500/10' : ''} ${reverse ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-1.5 overflow-hidden flex-1 ${reverse ? 'flex-row-reverse text-right' : 'text-left'}`} title={placeholder}>
                <div className="w-4 h-3 rounded-sm overflow-hidden border border-zinc-800 shrink-0">
                   <img src={getFlagUrl(team?.id || null)} className="w-full h-full object-cover" />
                </div>
                <span className={`text-[8px] font-black uppercase truncate tracking-tighter ${won ? 'text-emerald-400' : 'text-zinc-200'}`}>
                  {team?.id || placeholder || 'TBD'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {isDraw && (
                  <input 
                    type="text" 
                    disabled={disabled} 
                    value={getDisplayValue(pronostico[side === 'L' ? 'penalesLocal' : 'penalesVisitante'])} 
                    onChange={(e) => handlePensChange(side === 'L' ? 'local' : 'visitante', e.target.value)}
                    placeholder="P" 
                    className={`w-3.5 h-3.5 bg-zinc-950 border rounded text-center text-[7px] font-black outline-none transition-all ${!pensValid ? 'border-rose-500 text-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.3)]' : 'border-emerald-500/30 text-emerald-500'}`} 
                  />
                )}
                <input type="text" disabled={disabled} value={getDisplayValue(pronostico[key])} onChange={(e) => handleScoreChange(key, e.target.value)}
                  className={`w-4 h-4 bg-zinc-900 border border-zinc-800 rounded text-center text-[8px] font-black outline-none transition-all ${disabled ? 'text-zinc-700' : 'text-white focus:ring-1 focus:ring-emerald-500'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const KnockoutFullBracket: React.FC<KnockoutFullBracketProps> = ({ llaves, pronosticos, onUpdate, disabled, isSimulationComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        const bracketWidth = 1100; 
        if (parentWidth < bracketWidth) {
          setScale(parentWidth / bracketWidth);
        } else {
          setScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const leftR32 = [74, 77, 73, 75, 83, 84, 81, 82].map(id => llaves.find(m => m.id === id)!);
  const leftR16 = [89, 90, 93, 94].map(id => llaves.find(m => m.id === id)!);
  const leftQF = [97, 98].map(id => llaves.find(m => m.id === id)!);
  const leftSF = llaves.find(m => m.id === 101)!;
  const rightR32 = [76, 78, 79, 80, 86, 88, 85, 87].map(id => llaves.find(m => m.id === id)!);
  const rightR16 = [91, 92, 95, 96].map(id => llaves.find(m => m.id === id)!);
  const rightQF = [99, 100].map(id => llaves.find(m => m.id === id)!);
  const rightSF = llaves.find(m => m.id === 102)!;
  const finalMatch = llaves.find(m => m.id === 104)!;
  const tercerPuestoMatch = llaves.find(m => m.id === 103)!;

  return (
    <div ref={containerRef} className="w-full flex justify-center py-10 overflow-x-auto scrollbar-hide min-h-[800px]">
      <div 
        className="flex items-center justify-center gap-4 p-4 relative transform-gpu mx-auto"
        style={{ 
          transform: `scale(${scale})`, 
          width: '1100px',
          minWidth: '1100px',
          transformOrigin: 'top center'
        }}
      >
        <div className="flex gap-4 items-center">
          <div className="flex flex-col justify-around gap-6 w-28">
            {leftR32.map(m => (
              <FullBracketMatch key={m.id} match={m} disabled={disabled} pronostico={pronosticos[m.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(m.id, l, v, pl, pv)} />
            ))}
          </div>
          <div className="flex flex-col justify-around gap-16 w-28">
            {leftR16.map(m => (
              <FullBracketMatch key={m.id} match={m} disabled={disabled} pronostico={pronosticos[m.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(m.id, l, v, pl, pv)} />
            ))}
          </div>
          <div className="flex flex-col justify-around gap-32 w-28">
            {leftQF.map(m => (
              <FullBracketMatch key={m.id} match={m} disabled={disabled} pronostico={pronosticos[m.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(m.id, l, v, pl, pv)} />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-12 flex-1">
          <div className="flex items-center gap-4">
            <div className="w-28">
              <h4 className="text-[8px] font-black uppercase text-zinc-500 text-center mb-2 tracking-[0.3em]">Semifinal A</h4>
              <FullBracketMatch match={leftSF} disabled={disabled} pronostico={pronosticos[leftSF.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(leftSF.id, l, v, pl, pv)} />
            </div>
            <div className="w-[180px] space-y-8">
              <div className="flex flex-col items-center gap-4">
                 <Trophy className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-bounce" />
                 <div className="bg-zinc-900 border-2 border-emerald-500/30 p-2 rounded-2xl w-full">
                    <h3 className="text-[9px] font-black uppercase text-center text-white italic tracking-[0.4em] mb-2">Gran Final</h3>
                    <FullBracketMatch match={finalMatch} disabled={disabled} pronostico={pronosticos[104] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(104, l, v, pl, pv)} />
                 </div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-2 rounded-2xl w-full">
                 <h4 className="text-[7px] font-black uppercase text-center text-zinc-500 tracking-[0.2em] mb-1">Tercer Puesto</h4>
                 <FullBracketMatch match={tercerPuestoMatch} disabled={disabled} pronostico={pronosticos[103] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(103, l, v, pl, pv)} />
              </div>
            </div>
            <div className="w-28">
              <h4 className="text-[8px] font-black uppercase text-zinc-500 text-center mb-2 tracking-[0.3em]">Semifinal B</h4>
              <FullBracketMatch match={rightSF} disabled={disabled} pronostico={pronosticos[rightSF.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(rightSF.id, l, v, pl, pv)} reverse />
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex flex-col justify-around gap-32 w-28">
            {rightQF.map(m => (
              <FullBracketMatch key={m.id} match={m} disabled={disabled} pronostico={pronosticos[m.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(m.id, l, v, pl, pv)} reverse />
            ))}
          </div>
          <div className="flex flex-col justify-around gap-16 w-28">
            {rightR16.map(m => (
              <FullBracketMatch key={m.id} match={m} disabled={disabled} pronostico={pronosticos[m.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(m.id, l, v, pl, pv)} reverse />
            ))}
          </div>
          <div className="flex flex-col justify-around gap-6 w-28">
            {rightR32.map(m => (
              <FullBracketMatch key={m.id} match={m} disabled={disabled} pronostico={pronosticos[m.id] || { local: "-", visitante: "-" }} onUpdate={(l, v, pl, pv) => onUpdate(m.id, l, v, pl, pv)} reverse />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnockoutFullBracket;