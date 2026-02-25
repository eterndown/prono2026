
import React from 'react';
import { InfoEstadio } from '../types';
import { MapPin, Crosshair, Globe, Users, Satellite } from 'lucide-react';

interface StadiumHoverCardProps {
  estadio: InfoEstadio;
}

const StadiumHoverCard: React.FC<StadiumHoverCardProps> = ({ estadio }) => {
  const reliefUrls = {
    Mexico: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Mexico_relief_location_map.jpg/800px-Mexico_relief_location_map.jpg',
    Canada: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Canada_relief_location_map.jpg/800px-Canada_relief_location_map.jpg',
    USA: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/USA_relief_location_map.jpg/800px-USA_relief_location_map.jpg'
  };

  const satelliteUrl = `https://maps.google.com/maps?q=${estadio.lat},${estadio.lng}&t=k&z=17&output=embed`;

  return (
    <div className="relative w-72 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden z-[200] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
      {/* Glow effect overlay */}
      <div className="absolute inset-0 border border-emerald-500/10 rounded-3xl pointer-events-none" />

      {/* Satellite Feed Container */}
      <div className="relative h-44 w-full bg-zinc-900 overflow-hidden group">
        <iframe 
          src={satelliteUrl}
          className="w-full h-full grayscale-[10%] brightness-90 group-hover:brightness-110 group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
          frameBorder="0"
          title="Satellite View"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
        
        {/* Marcador táctico de precisión */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Crosshair className="w-12 h-12 text-emerald-500/40 animate-[spin_10s_linear_infinite]" />
        </div>

        {/* Live Status Indicators */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
           <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
           <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Satellite Linked</span>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 shadow-lg">
           <Satellite className="w-3.5 h-3.5 text-emerald-400" />
           <span className="text-[9px] font-black text-emerald-400 tabular-nums">4K FEED</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-[11px] font-black uppercase text-emerald-500 tracking-tighter leading-none group-hover:text-emerald-400 transition-colors">{estadio.e}</h4>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{estadio.c}</p>
          </div>
          <div className="shrink-0 w-14 h-14 rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl relative">
            <img 
              src={reliefUrls[estadio.pais]} 
              alt="Country Relief" 
              className="w-full h-full object-cover filter brightness-110 contrast-125 saturate-50" 
            />
            <div className="absolute inset-0 border border-white/5 rounded-2xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80 shadow-inner group/stat">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3 h-3 text-emerald-600 group-hover/stat:text-emerald-400 transition-colors" />
              <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Capacidad</span>
            </div>
            <span className="text-[10px] font-black text-zinc-200 tabular-nums">{estadio.capacidad.toLocaleString()}</span>
          </div>
          <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80 shadow-inner group/stat">
            <div className="flex items-center gap-1.5 mb-1">
              <Globe className="w-3 h-3 text-emerald-600 group-hover/stat:text-emerald-400 transition-colors" />
              <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Territorio</span>
            </div>
            <span className="text-[10px] font-black text-zinc-200 uppercase tracking-tighter">{estadio.pais}</span>
          </div>
        </div>

        <div className="space-y-2">
           <span className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.3em] px-1">Geolocalización GPS</span>
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-900 text-center">
                 <span className="text-[9px] font-mono font-bold text-zinc-500">{estadio.lat.toFixed(6)}° N</span>
              </div>
              <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-900 text-center">
                 <span className="text-[9px] font-mono font-bold text-zinc-500">{Math.abs(estadio.lng).toFixed(6)}° W</span>
              </div>
           </div>
        </div>

        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
           <div className="flex items-center gap-1.5 text-[8px] font-black text-zinc-600 uppercase italic">
             <MapPin className="w-3 h-3 text-emerald-700" /> Ground Verified
           </div>
           <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">Sede Mundial 2026</span>
        </div>
      </div>
    </div>
  );
};

export default StadiumHoverCard;
