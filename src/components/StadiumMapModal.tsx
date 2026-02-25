
import React from 'react';
import { InfoEstadio } from '../types';
import { X, MapPin, Users, Globe, Map as MapIcon, ExternalLink, Navigation, Satellite, Crosshair } from 'lucide-react';

interface Props {
  estadio: InfoEstadio | null;
  isOpen: boolean;
  onClose: () => void;
}

const StadiumMapModal: React.FC<Props> = ({ estadio, isOpen, onClose }) => {
  if (!isOpen || !estadio) return null;

  const satelliteUrl = `https://maps.google.com/maps?q=${estadio.lat},${estadio.lng}&t=k&z=17&output=embed`;
  
  const reliefUrls = {
    Mexico: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Mexico_relief_location_map.jpg/800px-Mexico_relief_location_map.jpg',
    Canada: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Canada_relief_location_map.jpg/800px-Canada_relief_location_map.jpg',
    USA: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/USA_relief_location_map.jpg/800px-USA_relief_location_map.jpg'
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Background overlay for closing */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Header Táctico */}
        <div className="px-10 py-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <MapIcon className="text-emerald-500 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none text-white">{estadio.e}</h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Ground Intel & Geospatial Data</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 hover:bg-zinc-800 rounded-full transition-all group border border-transparent hover:border-zinc-700"
          >
            <X className="w-8 h-8 text-zinc-500 group-hover:text-white" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col lg:flex-row h-full">
          
          {/* Vista Satelital Principal */}
          <div className="w-full lg:w-[65%] h-[400px] lg:h-auto bg-black relative group overflow-hidden">
            <iframe 
              src={satelliteUrl}
              className="w-full h-full border-0 grayscale-[10%] brightness-90 group-hover:brightness-100 group-hover:grayscale-0 transition-all duration-1000"
              allowFullScreen
              loading="lazy"
            />
            
            {/* HUD Elements */}
            <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                      <Satellite className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Sat Feed: 4K RES</span>
                   </div>
                   <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
                      <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest">AZIMUTH: 312.4°</span>
                   </div>
                </div>
                <div className="w-16 h-16 border-2 border-emerald-500/20 rounded-full flex items-center justify-center">
                   <Crosshair className="w-10 h-10 text-emerald-500/30 animate-[spin_12s_linear_infinite]" />
                </div>
              </div>

              <div className="flex items-end justify-between">
                 <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 space-y-2">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] block">GPS Lock</span>
                    <div className="flex gap-4">
                       <span className="text-xs font-mono font-bold text-emerald-400">{estadio.lat.toFixed(6)} N</span>
                       <span className="text-xs font-mono font-bold text-emerald-400">{Math.abs(estadio.lng).toFixed(6)} W</span>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
          </div>

          {/* Panel de Inteligencia del Estadio */}
          <div className="w-full lg:w-[35%] p-10 space-y-10 bg-zinc-900 border-l border-zinc-800 flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30"></div>
            
            {/* Tarjeta de País/Relieve */}
            <div className="relative h-40 w-full rounded-[2.5rem] overflow-hidden border border-zinc-800 bg-zinc-950 group/relief">
              <img 
                src={reliefUrls[estadio.pais]} 
                alt="Country Relief" 
                className="w-full h-full object-cover filter brightness-125 contrast-125 saturate-50 group-hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                 </div>
                 <div>
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block leading-none">Territorio Nacional</span>
                    <span className="text-xl font-black italic text-white tracking-tighter uppercase">{estadio.pais}</span>
                 </div>
              </div>
            </div>

            {/* Estadísticas Clave */}
            <div className="grid grid-cols-1 gap-4">
               <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800 hover:border-emerald-500/30 transition-all group/stat">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-zinc-900 rounded-xl">
                        <Users className="w-6 h-6 text-emerald-500" />
                     </div>
                     <div>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Capacidad Certificada</span>
                        <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{estadio.capacidad.toLocaleString()}</span>
                     </div>
                  </div>
               </div>
               
               <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-zinc-900 rounded-xl">
                        <MapPin className="w-6 h-6 text-emerald-500" />
                     </div>
                     <div>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Sede de Ciudad</span>
                        <span className="text-xl font-black text-white italic tracking-tighter uppercase">{estadio.c}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Acciones de Navegación */}
            <div className="mt-auto space-y-4 pt-10">
               <div className="flex gap-4">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${estadio.lat},${estadio.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
                  >
                    <Navigation className="w-4 h-4" /> Navegar
                  </a>
                  <a 
                    href={estadio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xl transition-all border border-zinc-700 active:scale-95"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
               </div>
               <p className="text-[8px] font-black text-zinc-700 uppercase italic text-center tracking-widest">
                 Official Intel Package • FIFA World Cup 2026 Operative
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StadiumMapModal;
