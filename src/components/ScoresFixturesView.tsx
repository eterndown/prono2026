import React, { useState, useMemo } from 'react';
import { Partido, Pronostico, InfoEstadio } from '../types';
import { EQUIPOS, PARTIDOS_INICIALES, ESTADIOS, getFlagUrl } from '../constants';
import { Filter, MapPin, Calendar as CalendarIcon, ArrowUpDown, Search, ChevronRight, Clock, X } from 'lucide-react';
import FilterModal from './FilterModal';
import StadiumHoverCard from './StadiumHoverCard';

interface ScoresFixturesViewProps {
  pronosticos: Record<number, Pronostico>;
  eliminatorias: Partido[];
  onUpdate: (id: number, local: number | string | null, visitante: number | string | null, pl?: number | string | null, pv?: number | string | null) => void;
  disabled?: boolean;
  onSelectStadium?: (estadio: InfoEstadio) => void;
}

const ScoresFixturesView: React.FC<ScoresFixturesViewProps> = ({ pronosticos, eliminatorias, onUpdate, disabled, onSelectStadium }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredStadiumMatch, setHoveredStadiumMatch] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    fase: 'all',
    equipo: 'all'
  });

  const isNumeric = (val: any) => {
    if (val === null || val === undefined || val === "" || val === "-") return false;
    const num = Number(val);
    return !isNaN(num) && isFinite(num);
  };

  const filteredAndSortedMatches = useMemo(() => {
    const combined = [...PARTIDOS_INICIALES, ...eliminatorias];
    const searchLower = searchTerm.toLowerCase().trim();

    let filtered = combined.filter(m => {
      const local = EQUIPOS.find(e => e.id === m.equipoLocal);
      const visitante = EQUIPOS.find(e => e.id === m.equipoVisitante);

      const matchFase = filters.fase === 'all' || m.fase === filters.fase;
      const matchEquipo = filters.equipo === 'all' || m.equipoLocal === filters.equipo || m.equipoVisitante === filters.equipo;
      
      // Lógica de búsqueda avanzada
      const matchesSearch = searchTerm === '' || (
        m.id.toString().includes(searchLower) ||
        m.estadio?.toLowerCase().includes(searchLower) ||
        m.ciudad?.toLowerCase().includes(searchLower) ||
        local?.nombre.toLowerCase().includes(searchLower) ||
        visitante?.nombre.toLowerCase().includes(searchLower) ||
        m.placeholderLocal?.toLowerCase().includes(searchLower) ||
        m.placeholderVisitante?.toLowerCase().includes(searchLower)
      );

      return matchFase && matchEquipo && matchesSearch;
    });

    return filtered.sort((a, b) => {
      return sortBy === 'date-asc' ? (a.id - b.id) : (b.id - a.id);
    });
  }, [filters, sortBy, eliminatorias, searchTerm]);

  const groupedMatches = useMemo(() => {
    const groups: { date: string; matches: Partido[] }[] = [];
    filteredAndSortedMatches.forEach(m => {
      let group = groups.find(g => g.date === m.fecha);
      if (!group) {
        group = { date: m.fecha, matches: [] };
        groups.push(group);
      }
      group.matches.push(m);
    });
    return groups;
  }, [filteredAndSortedMatches]);

  const handleScoreChange = (id: number, side: 'local' | 'visitante', value: string) => {
    if (disabled) return;
    const prediction = pronosticos[id] || { local: '-', visitante: '-' };
    
    let processed: string | number | null = value;
    if (value.trim() === "") processed = null;
    else if (value === "-") processed = "-";
    else if (!isNaN(Number(value))) processed = Math.min(Math.max(0, parseInt(value, 10)), 15);
    else return;

    if (side === 'local') {
      onUpdate(id, processed, prediction.visitante, prediction.penalesLocal, prediction.penalesVisitante);
    } else {
      onUpdate(id, prediction.local, processed, prediction.penalesLocal, prediction.penalesVisitante);
    }
  };

  const handlePensChange = (id: number, side: 'local' | 'visitante', value: string) => {
    if (disabled) return;
    const prediction = pronosticos[id] || { local: '-', visitante: '-' };
    
    let processed: string | number | null = value;
    if (value.trim() === "") processed = null;
    else if (value === "-") processed = "-";
    else if (!isNaN(Number(value))) processed = parseInt(value, 10);
    else return;

    if (side === 'local') {
      onUpdate(id, prediction.local, prediction.visitante, processed, prediction.penalesVisitante);
    } else {
      onUpdate(id, prediction.local, prediction.visitante, prediction.penalesLocal, processed);
    }
  };

  const getDisplayValue = (val: any) => {
    if (val === null || val === undefined || val === "-") return '';
    return String(val);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700 px-4 sm:px-6">
      <FilterModal 
        isOpen={showFilters} 
        onClose={() => setShowFilters(false)} 
        filters={filters} 
        setFilters={setFilters} 
      />
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b-2 border-zinc-900 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-1 bg-emerald-500 rounded-full"></div>
            <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px]">Copa del Mundo 2026</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter leading-none">Calendario de Partidos</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest max-lg leading-relaxed">
            Consulta y carga marcadores de tu pronóstico.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 no-print w-full lg:w-auto">
          {/* Barra de Búsqueda de Texto */}
          <div className="flex flex-col gap-2 w-full sm:w-64">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 pl-1">Buscar partido:</span>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="ID, Equipo, Estadio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-all shadow-xl"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 pl-1">Ordenar:</span>
            <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 shadow-xl w-full sm:w-auto">
              <button 
                onClick={() => setSortBy('date-asc')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${sortBy === 'date-asc' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <ArrowUpDown className="w-3 h-3" />
                Fecha
              </button>
              <button 
                onClick={() => setSortBy('date-desc')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${sortBy === 'date-desc' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <ArrowUpDown className="w-3 h-3 rotate-180" />
                Orden Inv.
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 pl-1">Filtrar:</span>
            <button 
              onClick={() => setShowFilters(true)}
              className="flex items-center justify-center gap-4 bg-zinc-900 px-8 py-4 rounded-2xl border border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-zinc-800 transition-all hover:border-emerald-500/50 group w-full sm:w-auto h-[54px]"
            >
              <span className="group-hover:text-emerald-500 transition-colors">Avanzado</span>
              <Filter className="w-4 h-4 text-emerald-500" />
            </button>
          </div>
        </div>
      </div>

      {filteredAndSortedMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-8 bg-zinc-900/10 rounded-[4rem] border-2 border-dashed border-zinc-800/50">
          <Search className="w-20 h-20 text-zinc-800" />
          <h3 className="text-2xl font-black uppercase italic text-zinc-500 tracking-tighter">Sin coincidencias</h3>
          <button 
            onClick={() => { setFilters({ fase: 'all', equipo: 'all' }); setSearchTerm(''); }}
            className="bg-emerald-500 text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all"
          >
            Ver todos los partidos
          </button>
        </div>
      ) : (
        <div className="space-y-24">
          {groupedMatches.map(({ date, matches }) => (
            <div key={date} className="space-y-8">
              <div className="sticky top-[105px] z-30 py-4 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between border-b border-zinc-900 no-print">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-4">
                  <CalendarIcon className="w-6 h-6 text-emerald-500" />
                  {date}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {matches.map(m => {
                  const local = EQUIPOS.find(e => e.id === m.equipoLocal);
                  const visitante = EQUIPOS.find(e => e.id === m.equipoVisitante);
                  const pred = pronosticos[m.id] || { local: '-', visitante: '-' };
                  const isKO = m.fase !== 'Grupos';
                  
                  const isDraw = isNumeric(pred.local) && isNumeric(pred.visitante) && parseInt(String(pred.local), 10) === parseInt(String(pred.visitante), 10);
                  
                  const estadioInfo = Object.values(ESTADIOS).find(info => info.e === m.estadio);
                  const isHoveredMatch = hoveredStadiumMatch === m.id;

                  return (
                    <div key={m.id} className={`relative bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-900 rounded-[2.5rem] p-6 sm:p-10 transition-all duration-500 group ${isHoveredMatch ? 'z-50' : 'z-10'}`}>
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                        <div className="flex-1 flex flex-row items-center justify-end gap-5 sm:gap-8 w-full group/team-l">
                          <span className="font-black text-lg sm:text-2xl uppercase tracking-tighter text-right group-hover/team-l:text-emerald-400 transition-colors">
                              {local?.nombre || m.placeholderLocal || `Ganador M${m.equipoLocal || '?'}`}
                          </span>
                          <div className="w-16 h-10 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 border-zinc-800 shadow-2xl transform group-hover/team-l:scale-110 transition-all duration-500">
                             <img 
                               src={getFlagUrl(local?.id || null)} 
                               alt={local?.nombre || m.placeholderLocal || 'TBD'} 
                               className="w-full h-full object-cover"
                             />
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 min-w-[200px] shrink-0">
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full">
                            <Clock className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-black text-white">{m.hSimu || "16:00"} ARG</span>
                          </div>

                          <div className={`flex items-center gap-6 bg-zinc-950 px-8 py-5 rounded-3xl border border-zinc-800 shadow-2xl ${disabled ? 'opacity-80' : ''}`}>
                            <input
                              type="text"
                              disabled={disabled}
                              value={getDisplayValue(pred.local)}
                              onChange={(e) => handleScoreChange(m.id, 'local', e.target.value)}
                              className={`w-14 h-14 bg-zinc-900 border border-zinc-800/50 text-center rounded-2xl text-2xl font-black outline-none transition-all ${disabled ? 'text-zinc-600' : 'text-white focus:ring-1 focus:ring-emerald-500 focus:bg-zinc-800'}`}
                            />
                            <div className="w-[2px] h-10 bg-zinc-800 rounded-full"></div>
                            <input
                              type="text"
                              disabled={disabled}
                              value={getDisplayValue(pred.visitante)}
                              onChange={(e) => handleScoreChange(m.id, 'visitante', e.target.value)}
                              className={`w-14 h-14 bg-zinc-900 border border-zinc-800/50 text-center rounded-2xl text-2xl font-black outline-none transition-all ${disabled ? 'text-zinc-600' : 'text-white focus:ring-1 focus:ring-emerald-500 focus:bg-zinc-800'}`}
                            />
                          </div>
                          
                          {isKO && isDraw && (
                            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-2xl animate-in fade-in duration-300">
                               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">P:</span>
                               <div className="flex gap-2">
                                 <input
                                   type="text"
                                   disabled={disabled}
                                   value={getDisplayValue(pred.penalesLocal)}
                                   onChange={(e) => handlePensChange(m.id, 'local', e.target.value)}
                                   className={`w-8 h-8 bg-zinc-900 text-center rounded-lg text-sm font-black text-emerald-500 outline-none ${disabled ? 'opacity-50' : 'focus:ring-1 focus:ring-emerald-500'}`}
                                   placeholder="-"
                                 />
                                 <input
                                   type="text"
                                   disabled={disabled}
                                   value={getDisplayValue(pred.penalesVisitante)}
                                   onChange={(e) => handlePensChange(m.id, 'visitante', e.target.value)}
                                   className={`w-8 h-8 bg-zinc-900 text-center rounded-lg text-sm font-black text-emerald-500 outline-none ${disabled ? 'opacity-50' : 'focus:ring-1 focus:ring-emerald-500'}`}
                                   placeholder="-"
                                 />
                               </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex items-center justify-start gap-5 sm:gap-8 w-full group/team-v">
                          <div className="w-16 h-10 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 border-zinc-800 shadow-2xl transform group-hover/team-v:scale-110 transition-all duration-500">
                             <img 
                               src={getFlagUrl(visitante?.id || null)} 
                               alt={visitante?.nombre || m.placeholderVisitante || 'TBD'} 
                               className="w-full h-full object-cover"
                             />
                          </div>
                          <span className="font-black text-lg sm:text-2xl uppercase tracking-tighter group-hover/team-v:text-emerald-400 transition-colors">
                              {visitante?.nombre || m.placeholderVisitante || `Ganador M${m.equipoVisitante || '?'}`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-zinc-800/50 flex flex-wrap items-center justify-between gap-6 relative z-10">
                         <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2.5">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-emerald-500/20"></div>
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                 {m.fase === 'Grupos' ? `Grupos ${m.grupo}` : m.fase}
                               </span>
                            </div>
                            <div 
                              className="relative"
                              onMouseEnter={() => setHoveredStadiumMatch(m.id)}
                              onMouseLeave={() => setHoveredStadiumMatch(null)}
                            >
                              <div 
                                className="flex items-center gap-2.5 text-zinc-500 cursor-pointer group/stadium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (estadioInfo && onSelectStadium) onSelectStadium(estadioInfo);
                                }}
                              >
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest group-hover/stadium:text-emerald-400 transition-colors">
                                  {m.estadio} • {m.ciudad}
                                </span>
                              </div>
                              {isHoveredMatch && estadioInfo && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4">
                                  <StadiumHoverCard estadio={estadioInfo} />
                                </div>
                              )}
                            </div>
                         </div>
                         <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Match #{m.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoresFixturesView;