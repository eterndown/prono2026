
import React, { useState } from 'react';
import { Clasificacion } from '../types';
import { EQUIPOS, getFlagUrl } from '../constants';
import { Eye, EyeOff, Info } from 'lucide-react';

interface GroupStandingsProps {
  group: string;
  standings: Clasificacion[];
}

const GroupStandings: React.FC<GroupStandingsProps> = ({ group, standings }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 hover:border-zinc-700">
      {/* Header del Grupo */}
      <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 px-6 py-4 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-zinc-950 italic shadow-lg shadow-emerald-500/10">
            {group}
          </div>
          <h3 className="font-black text-white uppercase tracking-tighter italic text-lg">GRUPO {group}</h3>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
            showForm 
              ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
              : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'
          }`}
        >
          {showForm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showForm ? 'Ocultar Forma' : 'Ver Forma'}
        </button>
      </div>

      {/* Contenedor con Scroll Horizontal */}
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left text-[11px] border-collapse min-w-[500px]">
          <thead className="text-[9px] font-black uppercase text-zinc-500 bg-zinc-950/40 tracking-widest border-b border-zinc-800/50">
            <tr>
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-2 py-3 text-center">PJ</th>
              <th className="px-2 py-3 text-center">G</th>
              <th className="px-2 py-3 text-center">E</th>
              <th className="px-2 py-3 text-center">P</th>
              <th className="px-2 py-3 text-center">GF</th>
              <th className="px-2 py-3 text-center">GC</th>
              <th className="px-2 py-3 text-center text-zinc-400">DG</th>
              <th className="px-4 py-3 text-center font-black text-white">Pts</th>
              {showForm && <th className="px-4 py-3 text-center animate-in fade-in slide-in-from-right-2">Forma</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {standings.map((s, idx) => {
              const team = EQUIPOS.find(t => t.id === s.equipoId);
              const clasifica = idx < 2;
              
              return (
                <tr 
                  key={s.equipoId} 
                  className={`group transition-all duration-300 ${
                    clasifica 
                      ? 'bg-emerald-500/5' 
                      : 'hover:bg-zinc-800/20'
                  }`}
                >
                  <td className={`px-4 py-3.5 font-black ${clasifica ? 'text-emerald-500' : 'text-zinc-600'}`}>
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3.5 font-black flex items-center gap-3">
                    <div className="w-7 h-4.5 rounded-sm overflow-hidden border border-zinc-800 shadow-sm shrink-0">
                      <img src={getFlagUrl(team?.id || null)} className="w-full h-full object-cover" />
                    </div>
                    <span className={`truncate uppercase tracking-tighter text-xs ${clasifica ? 'text-white' : 'text-zinc-400'}`}>
                      {team?.nombre}
                    </span>
                  </td>
                  <td className="px-2 py-3.5 text-center font-bold text-zinc-500">{s.pj}</td>
                  <td className="px-2 py-3.5 text-center font-bold text-zinc-500">{s.pg}</td>
                  <td className="px-2 py-3.5 text-center font-bold text-zinc-500">{s.pe}</td>
                  <td className="px-2 py-3.5 text-center font-bold text-zinc-500">{s.pp}</td>
                  <td className="px-2 py-3.5 text-center font-bold text-zinc-500">{s.gf}</td>
                  <td className="px-2 py-3.5 text-center font-bold text-zinc-500">{s.gc}</td>
                  <td className={`px-2 py-3.5 text-center font-black ${s.dg > 0 ? 'text-emerald-500' : s.dg < 0 ? 'text-rose-500' : 'text-zinc-600'}`}>
                    {s.dg > 0 ? `+${s.dg}` : s.dg}
                  </td>
                  <td className={`px-4 py-3.5 text-center font-black text-sm ${clasifica ? 'text-emerald-400' : 'text-zinc-200'}`}>
                    {s.puntos}
                  </td>
                  {showForm && (
                    <td className="px-4 py-3.5 animate-in fade-in slide-in-from-right-2">
                      <div className="flex justify-center gap-1.5">
                        {s.forma.map((res, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full shadow-sm ${
                              res === 'G' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                              res === 'E' ? 'bg-zinc-600' : 
                              res === 'P' ? 'bg-rose-500' : 
                              'bg-zinc-800'
                            }`}
                            title={res === 'G' ? 'Victoria' : res === 'E' ? 'Empate' : res === 'P' ? 'Derrota' : 'Pendiente'}
                          ></div>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 bg-zinc-950/60 border-t border-zinc-800 flex items-center gap-2">
        <div className="w-3 h-3 text-zinc-600">
           <Info className="w-full h-full" />
        </div>
        <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest italic">
          Los 2 primeros avanzan • Sistema de desempate oficial Mundial activo
        </span>
      </div>
    </div>
  );
};

export default GroupStandings;
