
import React from 'react';
import { Clasificacion, LetraGrupo } from '../types';
import { EQUIPOS, GRUPOS, getFlagUrl } from '../constants';
import { Info } from 'lucide-react';

interface DetailedStandingsViewProps {
  tablaGeneral: Record<LetraGrupo, Clasificacion[]>;
  isReadOnly?: boolean;
}

const DetailedStandingsView: React.FC<DetailedStandingsViewProps> = ({ tablaGeneral, isReadOnly }) => {
  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Clasificación Global</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Resultados pronosticados por grupo • Fase de Grupos</p>
        </div>
      </div>

      {GRUPOS.map(g => (
        <div key={g} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-4">
             <div className="h-[2px] w-8 bg-emerald-500"></div>
             <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Grupo {g}</h3>
          </div>
          
          <div className="overflow-x-auto rounded-[2rem] border border-zinc-900 bg-zinc-950/50">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="text-[9px] font-black uppercase text-zinc-500 tracking-widest border-b border-zinc-900">
                  <th className="py-4 pl-8 w-14">#</th>
                  <th className="py-4">Equipo</th>
                  <th className="py-4 text-center w-10">PJ</th>
                  <th className="py-4 text-center w-10">G</th>
                  <th className="py-4 text-center w-10">E</th>
                  <th className="py-4 text-center w-10">P</th>
                  <th className="py-4 text-center w-10">GF</th>
                  <th className="py-4 text-center w-10">GC</th>
                  <th className="py-4 text-center w-12 text-zinc-400">DG</th>
                  <th className="py-4 text-center w-14 text-white">Pts</th>
                  <th className="py-4 pl-8">FORMA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {tablaGeneral[g].map((s, idx) => {
                  const team = EQUIPOS.find(e => e.id === s.equipoId);
                  const clasifica = idx < 2;
                  return (
                    <tr 
                      key={s.equipoId} 
                      className={`group transition-all duration-300 ${
                        clasifica 
                          ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500' 
                          : 'hover:bg-zinc-900 border-l-4 border-l-transparent'
                      }`}
                    >
                      <td className={`py-5 pl-8 font-black text-sm ${clasifica ? 'text-emerald-500' : 'text-zinc-700'}`}>
                        {idx + 1}
                      </td>
                      <td className="py-5 flex items-center gap-4">
                        <div className="w-8 h-5 rounded overflow-hidden border border-zinc-800 shadow-sm">
                          <img 
                            src={getFlagUrl(team?.id || null)} 
                            alt={team?.nombre || 'TBD'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`font-black text-xs uppercase tracking-tighter ${clasifica ? 'text-white' : 'text-zinc-400'}`}>
                          {team?.nombre}
                        </span>
                      </td>
                      <td className="py-5 text-center font-bold text-xs text-zinc-500">{s.pj}</td>
                      <td className="py-5 text-center font-bold text-xs text-zinc-500">{s.pg}</td>
                      <td className="py-5 text-center font-bold text-xs text-zinc-500">{s.pe}</td>
                      <td className="py-5 text-center font-bold text-xs text-zinc-500">{s.pp}</td>
                      <td className="py-5 text-center font-bold text-xs text-zinc-500">{s.gf}</td>
                      <td className="py-5 text-center font-bold text-xs text-zinc-500">{s.gc}</td>
                      <td className={`py-5 text-center font-black text-xs ${s.dg > 0 ? 'text-emerald-500' : s.dg < 0 ? 'text-rose-500' : 'text-zinc-600'}`}>
                        {s.dg > 0 ? `+${s.dg}` : s.dg}
                      </td>
                      <td className={`py-5 text-center font-black text-sm ${clasifica ? 'text-emerald-400' : 'text-white'}`}>{s.puntos}</td>
                      <td className="py-5 pl-8">
                        <div className="flex gap-1.5">
                          {s.forma.map((res, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full border border-black/20 ${res === 'G' ? 'bg-emerald-500' : res === 'E' ? 'bg-zinc-600' : res === 'P' ? 'bg-rose-500' : 'bg-zinc-800'}`}></div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="mt-16 p-8 bg-zinc-900/30 rounded-[2.5rem] border border-zinc-900">
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-5 h-5 text-emerald-500" />
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 italic">Glosario de Términos</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8">
          {[
            { sigla: 'PJ', significado: 'Partidos Jugados' },
            { sigla: 'G', significado: 'Victorias (Ganados)' },
            { sigla: 'E', significado: 'Empates' },
            { sigla: 'P', significado: 'Derrotas (Perdidos)' },
            { sigla: 'GF', significado: 'Goles a Favor' },
            { sigla: 'GC', significado: 'Goles en Contra' },
            { sigla: 'DG', significado: 'Diferencia de Goles' },
            { sigla: 'Pts', significado: 'Puntos Totales' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-8 text-center font-black text-emerald-500 text-[10px] bg-zinc-950 py-1 rounded-md border border-zinc-800">{item.sigla}</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{item.significado}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
          <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] italic">
            Criterios de desempate: 1. Puntos • 2. Diferencia de Goles • 3. Goles Marcados
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailedStandingsView;
