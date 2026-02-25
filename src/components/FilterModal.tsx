
import React, { useState } from 'react';
import { X, Check, ChevronDown, ChevronUp, Trophy, Users, Filter as FilterIcon, RotateCcw } from 'lucide-react';
import { EQUIPOS } from '../constants';
import { logger } from '../services/errorLogger';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    fase: string;
    equipo: string;
  };
  setFilters: (f: { fase: string; equipo: string }) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filters, setFilters }) => {
  const [openSection, setOpenSection] = useState<'etapa' | 'equipo' | null>('etapa');

  if (!isOpen) return null;

  const fases = [
    { id: 'all', label: 'Todas las etapas' },
    { id: 'Grupos', label: 'Fase de Grupos' },
    { id: 'Dieciseisavos', label: 'Dieciseisavos de Final' },
    { id: 'Octavos', label: 'Octavos de Final' },
    { id: 'Cuartos', label: 'Cuartos de Final' },
    { id: 'Semis', label: 'Semifinales' },
    { id: 'TercerPuesto', label: 'Tercer Puesto' },
    { id: 'Final', label: 'Gran Final' },
  ];

  // Ordenar equipos alfabéticamente para facilitar la búsqueda
  const sortedEquipos = [...EQUIPOS].sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-end sm:justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Overlay para cerrar al hacer clic fuera */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative bg-zinc-950 text-white w-full sm:max-w-xl h-[95vh] sm:h-[85vh] flex flex-col rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-zinc-800 overflow-hidden animate-in slide-in-from-bottom-20 duration-500">
        
        {/* Cabecera del Modal */}
        <div className="px-10 py-8 flex justify-between items-center border-b border-zinc-900 bg-zinc-950/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <FilterIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Filtrar Copa</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Personaliza tu vista de partidos</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-zinc-900 rounded-full transition-all active:scale-90 border border-transparent hover:border-zinc-800"
          >
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        {/* Contenido Desplazable */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          
          {/* SECCIÓN POR ETAPA */}
          <div className="mb-4">
            <button 
              onClick={() => setOpenSection(openSection === 'etapa' ? null : 'etapa')}
              className={`w-full p-6 flex justify-between items-center rounded-3xl transition-all duration-300 ${openSection === 'etapa' ? 'bg-zinc-900 border border-zinc-800' : 'hover:bg-zinc-900/50'}`}
            >
              <div className="flex items-center gap-4">
                <Trophy className={`w-5 h-5 ${openSection === 'etapa' ? 'text-emerald-500' : 'text-zinc-600'}`} />
                <h3 className="text-lg font-black uppercase tracking-tight italic">Por Etapa</h3>
              </div>
              {openSection === 'etapa' ? <ChevronUp className="w-5 h-5 text-emerald-500" /> : <ChevronDown className="w-5 h-5 text-zinc-700" />}
            </button>
            
            {openSection === 'etapa' && (
              <div className="px-4 py-6 grid grid-cols-1 gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
                {fases.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilters({ ...filters, fase: f.id })}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${filters.fase === f.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-transparent border-transparent hover:bg-zinc-900/30 hover:border-zinc-800'}`}
                  >
                    <span className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${filters.fase === f.id ? 'text-emerald-500' : 'text-zinc-500'}`}>
                      {f.label}
                    </span>
                    {filters.fase === f.id && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN POR EQUIPO */}
          <div className="mb-4">
            <button 
              onClick={() => setOpenSection(openSection === 'equipo' ? null : 'equipo')}
              className={`w-full p-6 flex justify-between items-center rounded-3xl transition-all duration-300 ${openSection === 'equipo' ? 'bg-zinc-900 border border-zinc-800' : 'hover:bg-zinc-900/50'}`}
            >
              <div className="flex items-center gap-4">
                <Users className={`w-5 h-5 ${openSection === 'equipo' ? 'text-emerald-500' : 'text-zinc-600'}`} />
                <h3 className="text-lg font-black uppercase tracking-tight italic">Por Equipo</h3>
              </div>
              {openSection === 'equipo' ? <ChevronUp className="w-5 h-5 text-emerald-500" /> : <ChevronDown className="w-5 h-5 text-zinc-700" />}
            </button>
            
            {openSection === 'equipo' && (
              <div className="px-4 py-6 grid grid-cols-1 gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
                <button
                  onClick={() => setFilters({ ...filters, equipo: 'all' })}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${filters.equipo === 'all' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-transparent border-transparent hover:bg-zinc-900/30 hover:border-zinc-800'}`}
                >
                  <span className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${filters.equipo === 'all' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    Todos los equipos
                  </span>
                  {filters.equipo === 'all' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>}
                </button>
                
                {sortedEquipos.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setFilters({ ...filters, equipo: e.id })}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${filters.equipo === e.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-transparent border-transparent hover:bg-zinc-900/30 hover:border-zinc-800'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl filter saturate-150">{e.bandera}</span>
                      <div className="flex flex-col items-start">
                        <span className={`text-[11px] font-black uppercase tracking-tighter transition-colors ${filters.equipo === e.id ? 'text-emerald-500' : 'text-zinc-200'}`}>
                          {e.nombre}
                        </span>
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{e.id}</span>
                      </div>
                    </div>
                    {filters.equipo === e.id && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pie de Acción */}
        <div className="p-10 bg-zinc-900 grid grid-cols-2 gap-6 shrink-0 border-t border-zinc-800">
          <button 
            onClick={() => {
              setFilters({ fase: 'all', equipo: 'all' });
              logger.log('Filtros restablecidos manualmente', 'info');
            }}
            className="flex items-center justify-center gap-3 py-5 bg-zinc-950 text-zinc-400 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all active:scale-95 group"
          >
            <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
            Limpiar Filtros
          </button>
          <button 
            onClick={onClose}
            className="py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-400 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
          >
            Aplicar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
