
import React from 'react';
import { BookOpen, Info, ShieldCheck, HelpCircle, Clock, Calendar, Zap, AlertTriangle, Trophy, CheckCircle2, ChevronRight, Scale } from 'lucide-react';
import { DEADLINE_GROUPS, DEADLINE_KNOCKOUT } from '../constants';

const TournamentManual: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col scrollbar-hide">
        
        {/* Cabecera Estilo Documento Oficial */}
        <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-md px-10 py-8 border-b border-zinc-800 flex justify-between items-center z-20">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <BookOpen className="text-emerald-500 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">Manual del Participante</h2>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-2">Protocolo de Pronóstico • Mundial 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest border border-zinc-700"
          >
            Cerrar Guía
          </button>
        </div>

        <div className="p-8 sm:p-12 space-y-16">
          
          {/* SECCIÓN 1: CRONOGRAMA DE CIERRE */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-emerald-400">
              <Clock className="w-6 h-6" />
              <h3 className="font-black uppercase text-lg tracking-widest italic">Gobernanza Temporal y Plazos</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plazo Grupos */}
              <div className="p-8 bg-zinc-950 rounded-[2.5rem] border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Calendar className="w-20 h-20 text-emerald-500" />
                </div>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4">Fase 1: Grupos (Partidos 1-72)</h4>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black italic text-emerald-500 tracking-tighter">10 JUN</span>
                    <span className="text-zinc-600 font-bold uppercase text-[10px] mb-1">/ 23:59 ARG</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Fecha límite absoluta para enviar el pronóstico inicial. Tras este hito, los partidos de grupos quedarán <span className="text-rose-500 font-bold">BLOQUEADOS</span> para edición.
                  </p>
                </div>
              </div>

              {/* Plazo Eliminatorias */}
              <div className="p-8 bg-zinc-950 rounded-[2.5rem] border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Trophy className="w-20 h-20 text-emerald-500" />
                </div>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4">Fase 2: Eliminatorias (73-104)</h4>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black italic text-emerald-500 tracking-tighter">25 JUN al 28 JUN 15:00 ARG</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Desde el 25 de Junio que definen Grupos A y B hasta el 28 de Junio a las 15:00 (1 hora antes que empiece el primer partido de Dieciseisavos) se permite cargar pronósticos eliminatorios hasta la FINAL. Solo podrás completar toda la Fase Clasificatoria cuando la Fase de Grupos esté resuelta matemáticamente (27 de Junio).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: MECÁNICA DE LLENADO */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-emerald-400">
              <Zap className="w-6 h-6" />
              <h3 className="font-black uppercase text-lg tracking-widest italic">Mecánica de Pronóstico</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-zinc-200 font-black uppercase text-[11px] tracking-tight">Cero como Valor Real</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  El sistema trata el "0" como un marcador válido. No dejes campos vacíos; si crees que un partido termina sin goles, ingresa <span className="text-white font-bold">0-0</span> explícitamente.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-emerald-500" />
                  <span className="text-zinc-200 font-black uppercase text-[11px] tracking-tight">Desbloqueo Progresivo</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Los partidos de <span className="text-white font-bold">Dieciseisavos (M73-M88)</span> solo se habilitarán cuando todos los equipos de los grupos involucrados tengan sus 3 resultados cargados.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="text-zinc-200 font-black uppercase text-[11px] tracking-tight">Validación de Penales</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  En caso de empate en Fase KO, se activará la tanda de penales. El ganador debe tener <span className="text-white font-bold">+1 gol</span> de diferencia si se supera la tanda inicial de 5.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: ESTADOS DEL PRONÓSTICO */}
          <section className="bg-zinc-950 p-10 rounded-[3rem] border border-zinc-800 shadow-inner">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <h4 className="text-white font-black uppercase text-sm tracking-[0.2em] italic">Seguridad de Datos</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-xs text-zinc-500">1</div>
                    <p className="text-xs text-zinc-400"><span className="text-zinc-100 font-black">Borrador:</span> Puedes guardar tus cambios parcialmente. Tus datos están seguros en la nube pero aún son editables.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-xs text-zinc-950">2</div>
                    <p className="text-xs text-zinc-400">
                      <span className="text-emerald-500 font-black">Finalizar:</span> Una vez que completes los partidos de una Fase u Otra Fase, presiona <span className="text-white">"Finalizar Pronóstico"</span>. Esto <span className="text-emerald-400 font-bold uppercase italic underline">CONGELARÁ</span> tu cuenta para la competencia oficial.
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-64 aspect-square bg-zinc-900 rounded-[2.5rem] border border-zinc-800 flex flex-col items-center justify-center p-8 text-center gap-4">
                  <ShieldCheck className="w-16 h-16 text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Integridad de Pronóstico Certificada</span>
              </div>
            </div>
          </section>

          {/* MENSAJE FINAL */}
          <div className="flex items-center gap-4 px-8 py-6 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl">
            <Info className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
              Recuerda: El pronóstico utiliza el horario de <span className="text-white">Argentina (GMT-3)</span> para todos los cierres. Asegúrate de sincronizar tu reloj local para evitar bloqueos inesperados.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-10 bg-zinc-900 border-t border-zinc-800 flex justify-center">
           <button 
             onClick={onClose}
             className="px-20 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-[0.3em] italic rounded-3xl shadow-[0_15px_40px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95"
           >
             Entendido, Volver al Pronóstico
           </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentManual;
