
import React from 'react';
import { Info, Table, Target, Award, Hexagon, Hash, ChevronRight, Sigma, Layers, Trophy } from 'lucide-react';

const ThirdPlaceReference: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-zinc-950/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col scrollbar-hide">
        
        {/* Encabezado Estilo Documento Oficial */}
        <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-md px-6 sm:px-10 py-8 border-b border-zinc-800 flex justify-between items-center z-20">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20">
              <Table className="text-emerald-500 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter leading-none text-white">Matriz de Clasificación</h2>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-2">Documento Técnico • Motor de Pronóstico Mundial 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest border border-zinc-700"
          >
            Cerrar Anexo
          </button>
        </div>

        <div className="p-6 sm:p-10 space-y-12">
          
          {/* Sección 1: La Regla de Oro y Combinatoria */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 text-emerald-400">
                <Sigma className="w-6 h-6" />
                <h3 className="font-black uppercase text-base tracking-widest italic">Análisis Combinatorio del Formato</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                Con la expansión a <span className="text-white font-bold">12 grupos (A-L)</span>, el sistema de avance se vuelve dinámico. Clasifican los dos primeros de cada grupo (24 equipos), y los <span className="text-emerald-500 font-bold italic">8 cupos restantes</span> se otorgan a los mejores terceros lugares tras comparar sus registros.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-zinc-950 rounded-[2rem] border border-zinc-800 flex flex-col justify-center items-center text-center space-y-2 group hover:border-emerald-500/30 transition-all">
                  <span className="text-4xl font-black italic text-emerald-500 tracking-tighter group-hover:scale-110 transition-transform">495</span>
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em]">Combinaciones Totales</span>
                </div>
                <div className="p-6 bg-zinc-950 rounded-[2rem] border border-zinc-800 border-l-4 border-l-emerald-500">
                  <p className="text-[11px] text-zinc-400 italic leading-relaxed">
                    "Matemáticamente: <span className="text-white font-black italic">C(12,8) = 495</span>. El simulador calcula en milisegundos cuál de estas combinaciones se ha activado para asignar los cruces de Dieciseisavos sin errores."
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/20 p-8 rounded-[2.5rem] border border-zinc-800 space-y-6 shadow-xl shadow-black/20">
              <h4 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-3">
                <Award className="w-5 h-5 text-emerald-500" /> Criterios de Ranking
              </h4>
              <div className="space-y-4">
                {[
                  { label: 'Puntos', desc: 'Suma total en fase grupos' },
                  { label: 'Diferencia de Goles', desc: 'Goles Favor - Goles Contra' },
                  { label: 'Goles Marcados', desc: 'Total anotados en 3 partidos' },
                  { label: 'Partidos Ganados', desc: 'Número total de victorias' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1 border-b border-zinc-800/50 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 font-black text-[10px] uppercase tracking-tighter">{item.label}</span>
                      <span className="text-emerald-500 font-black italic text-xs">Prioridad {i + 1}</span>
                    </div>
                    <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-widest">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sección 2: Matriz de Asignación Técnica */}
          <section className="space-y-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-white font-black uppercase text-sm tracking-widest italic flex items-center gap-3">
                <Layers className="w-6 h-6 text-emerald-500" /> Tabla de Asignación de Llaves (M73 - M87)
              </h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-9">Mapeo dinámico de mejores terceros a posiciones de playoff</p>
            </div>

            <div className="overflow-x-auto rounded-[2.5rem] border border-zinc-800 bg-zinc-950 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/50">
                    <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest border-b border-zinc-800">Partido ID</th>
                    <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest border-b border-zinc-800">Local (Inamovible)</th>
                    <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest border-b border-zinc-800">Visitante (Slot Variable de 3°)</th>
                    <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest border-b border-zinc-800 text-center">Ruta Técnica</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-zinc-900">
                  {[
                    { id: 'M73', loc: '1ro Grupo A', vis: '3° Grupo C / D / E / F', path: 'Ruta 1' },
                    { id: 'M75', loc: '1ro Grupo B', vis: '3° Grupo A / C / D / F', path: 'Ruta 2' },
                    { id: 'M77', loc: '1ro Grupo C', vis: '3° Grupo A / B / E / F', path: 'Ruta 3' },
                    { id: 'M79', loc: '1ro Ganador D', vis: '3° Grupo A / B / C / E', path: 'Ruta 4' },
                    { id: 'M81', loc: '1ro Ganador E', vis: '3° Grupo A / B / C / D', path: 'Ruta 5' },
                    { id: 'M83', loc: '1ro Ganador F', vis: '3° Grupo G / H / I / J', path: 'Ruta 6' },
                    { id: 'M85', loc: '1ro Ganador G', vis: '3° Grupo F / H / I / J', path: 'Ruta 7' },
                    { id: 'M87', loc: '1ro Ganador H', vis: '3° Grupo F / G / I / J', path: 'Ruta 8' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-emerald-500/5 transition-all group">
                      <td className="p-6">
                        <span className="bg-emerald-500 text-zinc-950 px-2 py-1 rounded-lg font-black text-[10px] tracking-tighter">
                          {row.id}
                        </span>
                      </td>
                      <td className="p-6 font-black text-white uppercase text-[11px] tracking-tight">{row.loc}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                          <span className="text-zinc-400 font-bold uppercase text-[10px]">{row.vis}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className="bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-xl text-[9px] font-black text-zinc-600 group-hover:border-emerald-500 group-hover:text-white transition-all uppercase tracking-widest">
                          {row.path}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center gap-3 px-6 py-4 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
               <Hexagon className="w-5 h-5 text-emerald-500 animate-pulse" />
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.1em] italic">
                 Sistema de Asignación Automática: Las llaves restantes se completan con los 2dos lugares de los grupos A-L.
               </p>
            </div>
          </section>

          {/* Sección 3: Resumen Visual del Bracket */}
          <section className="bg-gradient-to-br from-zinc-950 to-zinc-900 p-10 rounded-[3rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-all duration-700"></div>
            <h3 className="text-white font-black uppercase text-sm tracking-widest italic mb-10 flex items-center gap-3">
               <Trophy className="w-6 h-6 text-emerald-500" /> Flujo Evolutivo de Eliminación
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
              {[
                { label: 'Dieciseisavos', teams: '32 Equipos', desc: 'Top 2 + 8 Mejores 3ros' },
                { label: 'Octavos', teams: '16 Equipos', desc: 'Enfrentamientos Directos' },
                { label: 'Cuartos', teams: '8 Equipos', desc: 'Rumbo a Semifinales' },
                { label: 'Semifinales', teams: '4 Equipos', desc: 'La Antesala del Título' }
              ].map((step, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${100 - (i * 20)}%` }}></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-white uppercase italic tracking-tighter">{step.label}</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{step.teams}</p>
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-tight">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Footer del Modal */}
        <div className="p-10 bg-zinc-900 border-t border-zinc-800 flex justify-center">
           <button 
             onClick={onClose}
             className="px-20 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-[0.3em] italic rounded-[2rem] shadow-[0_15px_40px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95"
           >
             Confirmar Lectura & Cerrar
           </button>
        </div>
      </div>
    </div>
  );
};

export default ThirdPlaceReference;
