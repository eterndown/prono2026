
import React, { useState, useEffect } from 'react';
import { Clock, Lock, ShieldAlert } from 'lucide-react';

interface CountdownTimerProps {
  currentTime: Date;
  targetDate: string;
  label: string;
  isManuallyOverridden?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  currentTime,
  targetDate, 
  label, 
  isManuallyOverridden
}) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const diff = target - currentTime.getTime();

    if (diff <= 0) {
      setTimeLeft(null);
      setIsExpired(true);
    } else {
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ d, h, m, s });
      setIsExpired(false);
    }
  }, [targetDate, currentTime]);

  if (isManuallyOverridden) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl shadow-xl animate-pulse">
        <ShieldAlert className="w-4 h-4 text-amber-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 italic">
          Pronósticos cerrados por administración
        </span>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl shadow-xl">
        <Lock className="w-4 h-4 text-rose-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 italic">
          {label} Cerrada
        </span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const totalHours = timeLeft.d * 24 + timeLeft.h;
  let colorClass = "text-emerald-500";
  let borderClass = "border-emerald-500/30";
  let bgClass = "bg-emerald-500/5";

  if (totalHours < 24) {
    colorClass = "text-rose-500";
    borderClass = "border-rose-500/30";
    bgClass = "bg-rose-500/5";
  } else if (totalHours < 48) {
    colorClass = "text-amber-500";
    borderClass = "border-amber-500/30";
    bgClass = "bg-amber-500/5";
  }

  return (
    <div className={`flex items-center gap-4 px-5 py-3 ${bgClass} border ${borderClass} rounded-2xl shadow-xl transition-all duration-500`}>
      <Clock className={`w-4 h-4 ${colorClass} animate-pulse`} />
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">
          {label} cierra en:
        </span>
        <div className={`text-xs font-black uppercase tracking-tighter ${colorClass} tabular-nums`}>
          {timeLeft.d > 0 && `${timeLeft.d}d `}
          {String(timeLeft.h).padStart(2, '0')}h : {String(timeLeft.m).padStart(2, '0')}m : {String(timeLeft.s).padStart(2, '0')}s
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
