
import React from 'react';
import { Clasificacion, LetraGrupo } from '../types';
import { GRUPOS, EQUIPOS, getFlagUrl } from '../constants';
import { X, Trophy, Flag, Hash, ChevronRight } from 'lucide-react';

interface StandingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tablaGeneral: Record<LetraGrupo, Clasificacion[]>;
  mejoresTerceros: Clasificacion[];
}

const StandingsSidebar: React.FC<StandingsSidebarProps> = ({ isOpen, onClose, tablaGeneral, mejoresTerceros }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-[320px] bg-zinc-950 border-l border-zinc-800 z-[110] shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-zinc-900 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-tighter italic leading-none">Posiciones Live</h3>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Pronóstico 2026</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
            
            {/* Mejores Terceros Mini */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <Flag className="w-3 h-3 text-emerald-500" />
                <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Ranking 3ros (Top 8)</h4>
              </div>
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-[9px]">
                  <thead className="bg-zinc-950/50 text-zinc-600">
                    <tr>
                      <th className="px-3 py-1.5">#</th>
                      <th className="px-2 py-1.5">Equipo</th>
                      <th className="px-2 py-1.5 text-center">PTS</th>
                      <th className="px-3 py-1.5 text-center">DG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {mejoresTerceros.slice(0, 8).map((t, idx) => {
                      const team = EQUIPOS.find(e => e.id === t.equipoId);
                      return (
                        <tr key={t.equipoId} className="hover:bg-emerald-500/5">
                          <td className="px-3 py-2 font-black text-emerald-500">{idx + 1}</td>
                          <td className="px-2 py-2 font-bold uppercase truncate max-w-[120px]">
                            <div className="flex items-center gap-2">
                              <img src={getFlagUrl(team?.id || null)} className="w-4 h-2.5 object-cover rounded-sm border border-zinc-800" />
                              <span className="truncate">{team?.nombre}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center font-black text-white">{t.puntos}</td>
                          <td className="px-3 py-2 text-center text-zinc-500">{t.dg > 0 ? `+${t.dg}` : t.dg}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Grupos Mini */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Hash className="w-3 h-3 text-emerald-500" />
                <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Fase de Grupos</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {GRUPOS.map(g => (
                  <div key={g} className="space-y-2 bg-zinc-900/30 rounded-2xl p-3 border border-zinc-900">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-emerald-500 uppercase italic">Grupo {g}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-800" />
                    </div>
                    <div className="overflow-hidden">
                      <table className="w-full text-left text-[9px]">
                        <tbody className="divide-y divide-zinc-900/50">
                          {tablaGeneral[g].map((s, idx) => {
                            const team = EQUIPOS.find(e => e.id === s.equipoId);
                            return (
                              <tr key={s.equipoId} className={idx < 2 ? 'text-emerald-400' : 'text-zinc-500'}>
                                <td className="py-1.5 font-black opacity-50 w-4">{idx + 1}</td>
                                <td className="py-1.5 font-bold uppercase truncate max-w-[140px]">
                                  <div className="flex items-center gap-2">
                                    <img src={getFlagUrl(team?.id || null)} className="w-4 h-2.5 object-cover rounded-sm border border-zinc-800" />
                                    <span className="truncate">{team?.nombre}</span>
                                  </div>
                                </td>
                                <td className="py-1.5 text-right font-black w-8">
                                  {s.puntos} <span className="text-[7px] font-bold opacity-40 ml-1">PTS</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-900 text-center">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all text-zinc-400"
            >
              Cerrar Panel
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StandingsSidebar;
