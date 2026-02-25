
import React, { useState, useEffect } from 'react';
import { X, Terminal, Trash2, Clock, AlertCircle, Info } from 'lucide-react';
import { logger, LogEntry } from '../services/errorLogger';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SystemLogsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = logger.subscribe(setLogs);
      return unsubscribe;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatMilitar = (timestamp: string) => {
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date(timestamp));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl h-[70vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-black tracking-tighter uppercase italic">Logs de Depuración (24H)</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => logger.clear()}
              className="p-2 hover:bg-rose-500/10 rounded-xl text-zinc-500 hover:text-rose-500 transition-all"
              title="Limpiar historial"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 font-mono text-[10px] space-y-2 bg-black/40 scrollbar-hide">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-600 uppercase font-black tracking-widest italic">
              Terminal vacía • Sin actividad
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl flex gap-4 items-start group hover:border-zinc-700 transition-colors">
                <div className="shrink-0 pt-0.5">
                  {log.level === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  ) : log.level === 'warn' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <div className="space-y-1 overflow-hidden flex-1">
                  <div className="flex items-center gap-2 text-[8px] text-zinc-600">
                    <Clock className="w-2.5 h-2.5" />
                    <span className="tabular-nums">{formatMilitar(log.timestamp)}</span>
                    <span className={`px-1 rounded uppercase font-black tracking-widest ${
                      log.level === 'error' ? 'bg-rose-500/10 text-rose-500' :
                      log.level === 'warn' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {log.level}
                    </span>
                  </div>
                  <div className="text-zinc-300 break-words leading-relaxed">{log.message}</div>
                  {log.context && (
                    <pre className="mt-2 p-3 bg-black/50 rounded-xl text-zinc-500 text-[8px] overflow-x-auto border border-zinc-800/50">
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )).reverse()
          )}
        </div>
        
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 text-center">
          <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest italic">
            World Cup Engine v4.1.0 • Diagnostic Interface
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemLogsModal;
