
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Partido, LetraGrupo, Clasificacion, Usuario, Pronostico, InfoEstadio, GlobalSettings, TimeConfig, Fase } from './types';
import { GRUPOS, EQUIPOS, PARTIDOS_INICIALES, ESTADIOS, DEADLINE_GROUPS, DEADLINE_KNOCKOUT, getFlagUrl } from './constants';
import { calcularPosiciones, obtenerMejoresTerceros, resolverLlaves, isValidScore, simularPenales, checkPensValidity } from './services/fifaLogic';
import { api } from './services/api';
import { MatchCard } from './components/MatchCard';
import DetailedStandingsView from './components/DetailedStandingsView';
import ScoresFixturesView from './components/ScoresFixturesView';
import KnockoutFullBracket from './components/KnockoutFullBracket';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import TournamentManual from './components/TournamentManual';
import StandingsSidebar from './components/StandingsSidebar';
import StadiumMapModal from './components/StadiumMapModal';
import CountdownTimer from './components/CountdownTimer';
import { Trophy, LayoutGrid, Layers, BarChart3, Clock, ShieldCheck, Loader2, Eye, EyeOff, GitFork, Wand2, Eraser, ShieldAlert, BookOpen, Printer, Menu, AlertCircle, Zap, Filter, Radio, ChevronRight, Flag } from 'lucide-react';

type VistaActiva = 'vivo' | 'calendario' | 'grupos' | 'clasificacion' | 'eliminatorias' | 'llaves' | 'admin';
type SubVistaVivo = 'grupos_vivo' | 'ranking3_vivo' | 'clasificacion_vivo' | 'eliminatorias_vivo' | 'llaves_vivo';

const App: React.FC = () => {
  // --- CONFIGURACIÓN DE TIEMPO ---
  const [appTime, setAppTime] = useState<Date>(new Date());
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [isTimeManual, setIsTimeManual] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAppTime(new Date(Date.now() + timeOffset));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeOffset]);

  const updateVirtualOffset = useCallback((targetDate: Date) => {
    const offset = targetDate.getTime() - Date.now();
    setTimeOffset(offset);
    setIsTimeManual(true);
  }, []);

  const resetVirtualTime = useCallback(() => {
    setTimeOffset(0);
    setIsTimeManual(false);
  }, []);

  const generateEmptyPronos = (): Record<number, Pronostico> => {
    const data: Record<number, Pronostico> = {};
    for (let i = 1; i <= 104; i++) {
      data[i] = { local: "-", visitante: "-", penalesLocal: "-", penalesVisitante: "-" };
    }
    return data;
  };

  const [user, setUser] = useState<Usuario | null>(() => {
    if (typeof window === 'undefined') return null;
    const s = localStorage.getItem('fifa_session');
    return s ? JSON.parse(s) : null;
  });
  
  const [activeTab, setActiveTab] = useState<VistaActiva>('vivo');
  const [activeLiveSubTab, setActiveLiveSubTab] = useState<SubVistaVivo>('grupos_vivo');
  const [selectedStadium, setSelectedStadium] = useState<InfoEstadio | null>(null);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [pronosticos, setPronosticos] = useState<Record<number, Pronostico>>(generateEmptyPronos());
  const [realScores, setRealScores] = useState<Record<number, Pronostico>>({}); // Resultados Oficiales del Admin
  
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    groupsPhaseLocked: false,
    knockoutPhaseLocked: false,
    manualLockedMatchIds: [],
    manualUnlockedMatchIds: []
  });

  const [showKnockoutTeams, setShowKnockoutTeams] = useState(false);
  const todasFasesEliminatorias: Fase[] = ['Dieciseisavos', 'Octavos', 'Cuartos', 'Semis', 'TercerPuesto', 'Final'];
  const [selectedEliminatoriasFases, setSelectedEliminatoriasFases] = useState<Fase[]>(todasFasesEliminatorias);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 4000);
  }, []);

  const isAdmin = useMemo(() => user?.isAdmin === true || String(user?.isAdmin) === 'true', [user]);
  const isFrozen = useMemo(() => user?.isFrozen === true || String(user?.isFrozen) === 'true', [user]);

  // --- LÓGICA DE BLOQUEO CENTRALIZADA ---
  const isMatchLocked = useCallback((match: Partido) => {
    if (globalSettings.manualLockedMatchIds.includes(match.id)) return true;
    if (globalSettings.manualUnlockedMatchIds.includes(match.id)) return false;
    
    const deadlineGroups = new Date(DEADLINE_GROUPS);
    const deadlineKnockout = new Date(DEADLINE_KNOCKOUT);
    const startKnockout = new Date("2026-06-25T00:00:00-03:00");

    if (match.fase === 'Grupos') {
      if (globalSettings.groupsPhaseLocked) return true;
      return appTime >= deadlineGroups;
    }

    // Fases de Eliminatorias
    if (globalSettings.knockoutPhaseLocked) return true;
    if (appTime < startKnockout) return true; // Bloqueo antes del 25/06
    if (appTime >= deadlineKnockout) return true; // Bloqueo después del 28/06 15h

    return false;
  }, [globalSettings, appTime]);

  const loadData = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await api.getInitialData(userId);
      if (res.success) {
        if (res.data.userPronos) setPronosticos(res.data.userPronos);
        if (res.data.realScores) setRealScores(res.data.realScores);
        if (res.data.globalSettings) {
          const gs = res.data.globalSettings as GlobalSettings;
          setGlobalSettings(gs);
          if (gs.timeConfig?.modoTiempo === 'SIMULACION' && gs.timeConfig.fechaSimulacion) {
            updateVirtualOffset(new Date(gs.timeConfig.fechaSimulacion));
          }
        }
      }
    } catch (e) { toast("Error de sincronización", "error"); } finally { setIsLoading(false); }
  }, [toast, updateVirtualOffset]);

  useEffect(() => { if (user?.id) loadData(user.id); }, [user?.id, loadData]);

  // TABLA DEL USUARIO (PARA GRUPOS)
  const tablaGeneral = useMemo(() => {
    const res: Record<LetraGrupo, Clasificacion[]> = {} as any;
    GRUPOS.forEach(g => {
      const ms = PARTIDOS_INICIALES.filter(m => m.grupo === g).map(m => ({
        ...m, 
        golesLocal: pronosticos[m.id]?.local ?? null, 
        golesVisitante: pronosticos[m.id]?.visitante ?? null,
      }));
      res[g] = calcularPosiciones(g, ms, EQUIPOS.filter(e => e.grupo === g).map(e => e.id));
    });
    return res;
  }, [pronosticos]);

  const mejoresTerceros = useMemo(() => obtenerMejoresTerceros(tablaGeneral), [tablaGeneral]);

  // TABLA OFICIAL (PARA ELIMINATORIAS) - BASADA EN RESULTADOS DEL ADMIN
  const tablaOficial = useMemo(() => {
    const res: Record<LetraGrupo, Clasificacion[]> = {} as any;
    GRUPOS.forEach(g => {
      const ms = PARTIDOS_INICIALES.filter(m => m.grupo === g).map(m => ({
        ...m, 
        golesLocal: realScores[m.id]?.local ?? null, 
        golesVisitante: realScores[m.id]?.visitante ?? null,
      }));
      res[g] = calcularPosiciones(g, ms, EQUIPOS.filter(e => e.grupo === g).map(e => e.id));
    });
    return res;
  }, [realScores]);

  const mejoresTercerosOficiales = useMemo(() => obtenerMejoresTerceros(tablaOficial), [tablaOficial]);

  const emptyTablaGeneral = useMemo(() => {
    const res: Record<LetraGrupo, Clasificacion[]> = {} as any;
    GRUPOS.forEach(g => {
      res[g] = calcularPosiciones(g, [], EQUIPOS.filter(e => e.grupo === g).map(e => e.id));
    });
    return res;
  }, []);

// --- RESOLUCIÓN DE LLAVES (Sincronizado con Lógica Pro) ---
  const llaves = useMemo(() => {
    const startKnockout = new Date("2026-06-25T00:00:00-03:00");
    const isDateInWindow = appTime >= startKnockout;
    
    // Si la fecha llegó o el usuario habilitó ver equipos, permitimos resolver
    const canResolveTeams = (showKnockoutTeams || isDateInWindow) && !globalSettings.knockoutPhaseLocked;
    
    // Verificamos si el Admin ya cargó algún resultado real para activar la prioridad
    const hasOfficialData = Object.values(realScores).some((s: Pronostico) => isValidScore(s.local));

    // Pasamos los datos del Admin como "respaldo real"
    const datosAdmin = { 
      posiciones: tablaOficial, 
      terceros: mejoresTercerosOficiales 
    };

    return resolverLlaves(
      canResolveTeams ? tablaGeneral : ({} as any), 
      canResolveTeams ? mejoresTerceros : [], 
      pronosticos,
      datosAdmin,
      hasOfficialData // Switch de prioridad automática
    );
  }, [showKnockoutTeams, tablaGeneral, mejoresTerceros, tablaOficial, mejoresTercerosOficiales, pronosticos, appTime, globalSettings.knockoutPhaseLocked, realScores]);

  // LLAVES PARA LA VISTA VIVO (Fija en datos 100% reales)
  const llavesOficiales = useMemo(() => {
    return resolverLlaves(tablaOficial, mejoresTercerosOficiales, realScores, undefined, true);
  }, [tablaOficial, mejoresTercerosOficiales, realScores]);

  const actMatch = useCallback((id: number, l: any, v: any, pl?: any, pv?: any) => {
    if (isFrozen) return;
    const allMatches = [...PARTIDOS_INICIALES, ...llaves];
    const match = allMatches.find(m => m.id === id);
    
    if (match && isMatchLocked(match)) {
      toast("Fase bloqueada por fecha o configuración", "error");
      return;
    }
    
    if (id > 72) {
      setShowKnockoutTeams(true);
    }

    setPronosticos(prev => ({ 
      ...prev, 
      [id]: { local: l, visitante: v, penalesLocal: pl, penalesVisitante: pv, esSimulacion: false } 
    }));
  }, [isFrozen, isMatchLocked, llaves, toast]);

  const handleRandomGroups = () => {
    if (globalSettings.groupsPhaseLocked || appTime >= new Date(DEADLINE_GROUPS)) {
      toast("Fase de Grupos bloqueada", "error");
      return;
    }
    setShowKnockoutTeams(false);
    const newPronos = { ...pronosticos };
    let c = 0;
    PARTIDOS_INICIALES.forEach(m => {
      if (!isMatchLocked(m)) {
        const gl = Math.floor(Math.random() * 4);
        const gv = Math.floor(Math.random() * 4);
        newPronos[m.id] = { local: gl, visitante: gv, penalesLocal: "-", penalesVisitante: "-", esSimulacion: true };
        c++;
      }
    });
    setPronosticos(newPronos);
    toast(`Grupos: ${c} partidos simulados ✨`);
  };

  const handleRandomKnockout = () => {
    const startKnockout = new Date("2026-06-25T00:00:00-03:00");
    const deadlineKnockout = new Date(DEADLINE_KNOCKOUT);

    if (appTime < startKnockout) {
      toast("Bloqueado: Dieciseisavos abren el 25/06", "error");
      return;
    }

    if (globalSettings.knockoutPhaseLocked || appTime >= deadlineKnockout) {
      toast("Fase de Eliminatorias cerrada", "error");
      return;
    }

    setShowKnockoutTeams(true); 
    const newPronos = { ...pronosticos };
    let c = 0;
    
    llaves.forEach(m => {
      if (!isMatchLocked(m) && m.equipoLocal && m.equipoVisitante) {
        const gl = Math.floor(Math.random() * 4);
        const gv = Math.floor(Math.random() * 4);
        let pl: any = "-";
        let pv: any = "-";
        if (gl === gv) {
          const pens = simularPenales();
          pl = pens.golesLocal; pv = pens.golesVisitante;
        }
        newPronos[m.id] = { local: gl, visitante: gv, penalesLocal: pl, penalesVisitante: pv, esSimulacion: true };
        c++;
      }
    });

    if (c === 0) {
      toast("No hay equipos definidos para simular (Esperando carga del Admin)", "error");
    } else {
      setPronosticos(newPronos);
      toast(`Eliminatorias: ${c} resultados generados ✨`);
    }
  };

  const handleEraseGroups = () => {
    if (globalSettings.groupsPhaseLocked || appTime >= new Date(DEADLINE_GROUPS)) {
      toast("Fase de Grupos bloqueada", "error");
      return;
    }
    setShowKnockoutTeams(false);
    const newPronos = { ...pronosticos };
    PARTIDOS_INICIALES.forEach(m => {
      newPronos[m.id] = { local: "-", visitante: "-", penalesLocal: "-", penalesVisitante: "-" };
    });
    setPronosticos(newPronos);
    toast("Resultados de Grupos borrados");
  };

  const handleEraseKnockout = () => {
    const startKnockout = new Date("2026-06-25T00:00:00-03:00");
    if (appTime < startKnockout || globalSettings.knockoutPhaseLocked) {
      toast("Acción bloqueada en esta fecha", "error");
      return;
    }
    setShowKnockoutTeams(false); 
    const newPronos = { ...pronosticos };
    llaves.forEach(m => {
      newPronos[m.id] = { local: "-", visitante: "-", penalesLocal: "-", penalesVisitante: "-" };
    });
    setPronosticos(newPronos);
    toast("Eliminatorias reiniciadas");
  };

  const globalValidation = useMemo(() => {
    const allMatches = [...PARTIDOS_INICIALES, ...llaves].filter(m => !isMatchLocked(m));
    const incomplete = allMatches.filter(m => !isValidScore(pronosticos[m.id]?.local) || !isValidScore(pronosticos[m.id]?.visitante));
    return {
      isValid: incomplete.length === 0,
      incompleteCount: incomplete.length
    };
  }, [pronosticos, llaves, isMatchLocked]);

  const handleSaveProgress = async (freeze = false) => {
    if (freeze && !globalValidation.isValid) {
      toast(`Faltan ${globalValidation.incompleteCount} pronósticos`, "error");
      return;
    }
    setIsLoading(true);
    const sanitizedPronos: Record<number, Pronostico> = {};
    for (let i = 1; i <= 104; i++) {
      const p = pronosticos[i] || { local: "-", visitante: "-", penalesLocal: "-", penalesVisitante: "-" };
      sanitizedPronos[i] = {
        local: (p.local !== null && p.local !== "-" && p.local !== "") ? String(p.local) : "-",
        visitante: (p.visitante !== null && p.visitante !== "-" && p.visitante !== "") ? String(p.visitante) : "-",
        penalesLocal: (p.penalesLocal !== null && p.penalesLocal !== "-" && p.penalesLocal !== "") ? String(p.penalesLocal) : "-",
        penalesVisitante: (p.penalesVisitante !== null && p.penalesVisitante !== "-" && p.penalesVisitante !== "") ? String(p.penalesVisitante) : "-"
      };
    }
    try {
      const res = await api.savePredictions(user!.id, user!.username, sanitizedPronos, freeze);
      if (res.success) {
        toast(freeze ? "PRONÓSTICO FINALIZADO 🏆" : "Borrador guardado");
        if (freeze) {
          const newUser = { ...user!, isFrozen: true };
          setUser(newUser);
          localStorage.setItem('fifa_session', JSON.stringify(newUser));
        }
      } else toast("Error al guardar: " + res.message, "error");
    } catch (e) { toast("Error de conexión", "error"); } finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('fifa_session');
    setUser(null);
  };

  const toggleEliminatoriaFase = (fase: Fase) => {
    setSelectedEliminatoriasFases(prev => 
      prev.includes(fase) ? prev.filter(f => f !== fase) : [...prev, fase]
    );
  };

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (isRegistering) {
      const res = await api.register({
        nombre: data.nombre as string,
        apellido: data.apellido as string,
        email: data.email as string,
        username: data.u as string,
        password: data.p as string
      });
      if (res.success) {
        toast("Cuenta creada. Ahora puedes ingresar.");
        setIsRegistering(false);
      } else toast(res.message || "Error al registrar", "error");
    } else {
      const res = await api.login(data.u as string, data.p as string);
      if (res.success) {
        const loggedUser = res.data as Usuario;
        if (loggedUser.activo === false || String(loggedUser.activo) === 'false') {
          toast("Cuenta suspendida", "error");
        } else {
          setUser(loggedUser);
          localStorage.setItem('fifa_session', JSON.stringify(loggedUser));
        }
      } else toast("Credenciales incorrectas", "error");
    }
    setIsLoading(false);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 text-zinc-100 font-sans">
      <div className="w-full max-w-md bg-zinc-900 p-8 sm:p-10 rounded-[2.5rem] border border-zinc-800 text-center space-y-8 shadow-2xl animate-in fade-in zoom-in duration-500">
        <Trophy className="w-16 h-16 text-emerald-500 mx-auto" />
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">Mundial 2026</h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">{isRegistering ? 'Crear nueva cuenta' : 'Portal de Acceso'}</p>
        </div>
        <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
          {isRegistering && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
              <input name="nombre" placeholder="Nombre" required className="bg-zinc-800 border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500" />
              <input name="apellido" placeholder="Apellido" required className="bg-zinc-800 border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
          )}
          {isRegistering && <input name="email" type="email" placeholder="Correo electrónico" required className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500" />}
          <input name="u" placeholder="Usuario" required className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500" />
          <div className="relative">
            <input name="p" type={showPassword ? 'text' : 'password'} placeholder="Contraseña" required className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-emerald-500">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-emerald-500 p-4 rounded-xl font-black uppercase text-xs tracking-widest text-zinc-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isRegistering ? 'Registrar Cuenta' : 'Ingresar'}
          </button>
        </form>
        <div className="space-y-4 pt-4 border-t border-zinc-800/50 text-center">
          <button onClick={() => { setIsRegistering(!isRegistering); setShowPassword(false); }} className="text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400 tracking-widest">
            {isRegistering ? '¿Ya tienes cuenta? Ingresa aquí' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-x-hidden">
        {isLoading && <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>}
        
        <header className="sticky top-0 z-[60] bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 h-[64px] flex items-center px-6 no-print">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-emerald-500 w-6 h-6" />
              <span className="font-black italic uppercase text-lg tracking-tighter">Mundial 2026</span>
            </div>
            <nav className="hidden lg:flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
              {['vivo', 'calendario', 'grupos', 'clasificacion', 'eliminatorias', 'llaves', 'admin']
                .filter(id => id !== 'admin' || isAdmin)
                .map((id) => (
                <button 
                  key={id} 
                  onClick={() => setActiveTab(id as any)} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 'text-zinc-500 hover:text-white'}`}
                >
                  {id === 'vivo' && <Radio className={`w-3 h-3 ${activeTab === 'vivo' ? 'animate-pulse' : ''}`} />}
                  {id}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end leading-none">
                <span className="text-[12px] font-black text-white italic truncate max-w-[150px]">
                  @{user?.username}
                </span>
                <span className="text-[9px] font-bold text-zinc-500 tabular-nums tracking-tighter">
                  ({user?.id})
                </span>
              </div>
              <button onClick={() => setShowSidebar(true)} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-emerald-500 hover:bg-zinc-800 transition-colors"><Menu className="w-5 h-5" /></button>
              <button onClick={handleLogout} className="bg-rose-500/10 hover:bg-rose-500 px-3 py-2 rounded-xl border border-rose-500/20 text-rose-500 hover:text-white font-black text-[10px] uppercase transition-all">Salir</button>
            </div>
          </div>
        </header>

        <div className="bg-zinc-900/40 border-b border-zinc-900 px-6 py-4 no-print">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6">
            <CountdownTimer currentTime={appTime} targetDate={DEADLINE_GROUPS} label="Fase de Grupos" isManuallyOverridden={globalSettings.groupsPhaseLocked} />
            <div className="h-8 w-[1px] bg-zinc-800 hidden md:block"></div>
            <CountdownTimer currentTime={appTime} targetDate={DEADLINE_KNOCKOUT} label="Fase Clasificatoria" isManuallyOverridden={globalSettings.knockoutPhaseLocked} />
            {isTimeManual && (
              <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Simulación de Tiempo Activa (24H)</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-950/20 border-b border-zinc-900 px-6 py-4 no-print">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
             <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-2">
                   <button onClick={() => window.print()} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400"><Printer className="w-4 h-4" /></button>
                   <button onClick={() => setShowManual(true)} className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl font-black text-[10px] uppercase"><BookOpen className="w-4 h-4" /> Guía</button>
                </div>
                {activeTab !== 'vivo' && !isFrozen && (
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-1 gap-1">
                      <button 
                        onClick={handleRandomGroups} 
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg font-black text-[9px] uppercase hover:bg-emerald-500/20 transition-all"
                      >
                        <Wand2 className="w-3.5 h-3.5" /> Sim Grupos
                      </button>
                      <button 
                        onClick={handleEraseGroups} 
                        className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Borrar Grupos"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-1 gap-1">
                      <button 
                        onClick={handleRandomKnockout} 
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg font-black text-[9px] uppercase hover:bg-emerald-500/20 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" /> Sim Eliminatorias
                      </button>
                      <button 
                        onClick={handleEraseKnockout} 
                        className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Borrar Eliminatorias"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
             </div>
             {activeTab !== 'vivo' && !isFrozen && (
               <div className="flex items-center gap-3">
                  <button onClick={() => handleSaveProgress(false)} className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-zinc-700 transition-all">Guardar Borrador</button>
                  <button onClick={() => handleSaveProgress(true)} disabled={!globalValidation.isValid} className={`bg-emerald-500 text-zinc-950 px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg transition-all ${!globalValidation.isValid ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}>Finalizar Pronóstico</button>
               </div>
             )}
             {isFrozen && (
               <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Pronóstico Finalizado y Protegido</span>
               </div>
             )}
          </div>
        </div>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
              {activeTab === 'vivo' && (
                <div className="space-y-12 animate-in fade-in duration-700">
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Cup 2026 Vivo 📡</h2>
                       </div>
                       <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] pl-5">Resultados Oficiales Sincronizados en Tiempo Real</p>
                    </div>

                    <div className="flex flex-wrap gap-2 no-print bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 self-start">
                      {[
                        { id: 'grupos_vivo', label: 'Fase Grupos', icon: LayoutGrid },
                        { id: 'ranking3_vivo', label: 'Ranking 3ros', icon: Flag },
                        { id: 'clasificacion_vivo', label: 'Clasificación', icon: BarChart3 },
                        { id: 'eliminatorias_vivo', label: 'Eliminatorias', icon: Zap },
                        { id: 'llaves_vivo', label: 'Llaves', icon: GitFork }
                      ].map((sub) => (
                        <button 
                          key={sub.id} 
                          onClick={() => setActiveLiveSubTab(sub.id as SubVistaVivo)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeLiveSubTab === sub.id ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/20 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                          <sub.icon className="w-3.5 h-3.5" />
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeLiveSubTab === 'grupos_vivo' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {GRUPOS.map(g => (
                        <div key={g} className="space-y-4">
                          <h3 className="text-xl font-black text-white italic uppercase border-b border-zinc-900 pb-2 flex justify-between items-center px-1">
                            Grupo {g}
                            <span className="text-[10px] text-zinc-700 tracking-widest">LIVE</span>
                          </h3>
                          <div className="space-y-3">
                            {PARTIDOS_INICIALES.filter(m => m.grupo === g).map(m => (
                              <MatchCard 
                                key={m.id} 
                                match={m} 
                                prediction={realScores[m.id] || { local: "-", visitante: "-" }} 
                                onUpdate={() => {}} 
                                disabled={true}
                                isReadOnly={true}
                                onSelectStadium={setSelectedStadium} 
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeLiveSubTab === 'ranking3_vivo' && (
                    <div className="max-w-3xl mx-auto space-y-6">
                      <div className="bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-8 opacity-10"><Flag className="w-32 h-32 text-emerald-500" /></div>
                        <h3 className="text-2xl font-black uppercase italic text-white mb-8 tracking-tighter">Tabla de Mejores Terceros (Top 8)</h3>
                        <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950/50">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[10px] font-black uppercase text-zinc-600 border-b border-zinc-800">
                                <th className="px-6 py-5 w-14">#</th>
                                <th className="px-6 py-5">Equipo</th>
                                <th className="px-4 py-5 text-center">PTS</th>
                                <th className="px-4 py-5 text-center">DG</th>
                                <th className="px-4 py-5 text-center">GF</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                              {mejoresTercerosOficiales.map((t, idx) => {
                                const team = EQUIPOS.find(e => e.id === t.equipoId);
                                const avanza = idx < 8;
                                return (
                                  <tr key={t.equipoId} className={`${avanza ? 'bg-emerald-500/5' : 'opacity-40'} hover:bg-zinc-900/50 transition-colors`}>
                                    <td className={`px-6 py-5 font-black ${avanza ? 'text-emerald-500' : 'text-zinc-700'}`}>{idx + 1}</td>
                                    <td className="px-6 py-5 flex items-center gap-4">
                                      <div className="w-8 h-5 rounded overflow-hidden border border-zinc-800">
                                        <img src={getFlagUrl(team?.id || null)} className="w-full h-full object-cover" />
                                      </div>
                                      <span className="font-black uppercase text-xs text-zinc-300">{team?.nombre}</span>
                                    </td>
                                    <td className="px-4 py-5 text-center font-black text-white">{t.puntos}</td>
                                    <td className={`px-4 py-5 text-center font-black ${t.dg > 0 ? 'text-emerald-500' : 'text-zinc-500'}`}>{t.dg > 0 ? `+${t.dg}` : t.dg}</td>
                                    <td className="px-4 py-5 text-center font-bold text-zinc-600">{t.gf}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-8 flex items-center gap-3 text-zinc-500">
                           <AlertCircle className="w-4 h-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest italic">Los mejores 8 avanzan a Dieciseisavos por criterios oficiales de desempate.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeLiveSubTab === 'clasificacion_vivo' && <DetailedStandingsView tablaGeneral={tablaOficial} isReadOnly={true} />}

                  {activeLiveSubTab === 'eliminatorias_vivo' && (
                    <div className="space-y-16">
                      {todasFasesEliminatorias.map(fase => {
                        const matchesByFase = llavesOficiales.filter(m => m.fase === fase);
                        if (matchesByFase.length === 0) return null;
                        return (
                          <div key={fase} className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex items-center gap-4">
                              <div className="h-[2px] w-12 bg-emerald-500 rounded-full"></div>
                              <h3 className="text-2xl font-black uppercase text-white italic tracking-tighter">
                                {fase === 'TercerPuesto' ? 'Final por el Tercer Puesto' : fase}
                              </h3>
                              <div className="flex-1 h-[1px] bg-zinc-900"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                              {matchesByFase.map(m => (
                                <MatchCard 
                                  key={m.id} 
                                  match={m} 
                                  prediction={realScores[m.id] || { local: "-", visitante: "-" }} 
                                  onUpdate={() => {}} 
                                  disabled={true}
                                  isReadOnly={true}
                                  onSelectStadium={setSelectedStadium} 
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeLiveSubTab === 'llaves_vivo' && (
                    <KnockoutFullBracket 
                      llaves={llavesOficiales} 
                      pronosticos={realScores} 
                      onUpdate={() => {}} 
                      disabled={true} 
                      isSimulationComplete={false} 
                    />
                  )}
                </div>
              )}

              {activeTab === 'admin' && isAdmin && (
                <AdminPanel 
                  currentUser={user!} 
                  onUpdateUser={(u) => setUser(u)}
                  globalSettings={globalSettings}
                  setGlobalSettings={setGlobalSettings}
                  allMatches={[...PARTIDOS_INICIALES, ...llaves]}
                  toast={toast}
                  appTime={appTime}
                  setAppTime={updateVirtualOffset}
                  isTimeManual={isTimeManual}
                  setIsTimeManual={resetVirtualTime}
                  setRealScores={setRealScores}
                />
              )}
              {activeTab === 'calendario' && <ScoresFixturesView pronosticos={pronosticos} eliminatorias={llaves} onUpdate={actMatch} disabled={isFrozen} onSelectStadium={setSelectedStadium} />}
              {activeTab === 'grupos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {GRUPOS.map(g => (
                    <div key={g} className="space-y-4">
                      <h3 className="text-xl font-black text-white italic uppercase border-b border-zinc-900 pb-2">Grupo {g}</h3>
                      <div className="space-y-3">
                        {PARTIDOS_INICIALES.filter(m => m.grupo === g).map(m => (
                          <MatchCard key={m.id} match={m} prediction={pronosticos[m.id] || { local: "-", visitante: "-" }} onUpdate={actMatch} disabled={isFrozen || isMatchLocked(m)} onSelectStadium={setSelectedStadium} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'clasificacion' && <DetailedStandingsView tablaGeneral={tablaGeneral} isReadOnly={isFrozen} />}
              {activeTab === 'eliminatorias' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex flex-col gap-6 no-print">
                    <div className="flex items-center gap-3">
                      <Filter className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-sm font-black uppercase tracking-widest italic text-white">Filtrar Tramos de Eliminación</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setSelectedEliminatoriasFases(todasFasesEliminatorias)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedEliminatoriasFases.length === todasFasesEliminatorias.length ? 'bg-emerald-500 text-zinc-950 border-emerald-400' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white'}`}
                      >
                        Ver Todo
                      </button>
                      <button 
                        onClick={() => setSelectedEliminatoriasFases([])}
                        className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white"
                      >
                        Ocultar Todo
                      </button>
                      <div className="w-[1px] h-8 bg-zinc-800 mx-2 self-center"></div>
                      {todasFasesEliminatorias.map(fase => (
                        <button
                          key={fase}
                          onClick={() => toggleEliminatoriaFase(fase)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedEliminatoriasFases.includes(fase) ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white'}`}
                        >
                          {fase === 'TercerPuesto' ? '3er Puesto' : fase}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-16">
                    {todasFasesEliminatorias.map(fase => {
                      if (!selectedEliminatoriasFases.includes(fase)) return null;
                      const matchesByFase = llaves.filter(m => m.fase === fase);
                      if (matchesByFase.length === 0) return null;

                      return (
                        <div key={fase} className="space-y-8 animate-in fade-in duration-500">
                          <div className="flex items-center gap-4">
                            <div className="h-[2px] w-12 bg-emerald-500 rounded-full"></div>
                            <h3 className="text-2xl font-black uppercase text-white italic tracking-tighter">
                              {fase === 'TercerPuesto' ? 'Final por el Tercer Puesto' : fase}
                            </h3>
                            <div className="flex-1 h-[1px] bg-zinc-900"></div>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">{matchesByFase.length} Partido{matchesByFase.length > 1 ? 's' : ''}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {matchesByFase.map(m => (
                              <MatchCard 
                                key={m.id} 
                                match={m} 
                                prediction={pronosticos[m.id] || { local: "-", visitante: "-" }} 
                                onUpdate={actMatch} 
                                disabled={isFrozen || isMatchLocked(m)} 
                                onSelectStadium={setSelectedStadium} 
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {selectedEliminatoriasFases.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-zinc-900/10 rounded-[4rem] border-2 border-dashed border-zinc-800">
                      <LayoutGrid className="w-16 h-16 text-zinc-800" />
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-600 italic">Selecciona un tramo para visualizar los partidos</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'llaves' && <KnockoutFullBracket llaves={llaves} pronosticos={pronosticos} onUpdate={actMatch} disabled={isFrozen} isSimulationComplete={false} />}
          </div>
        </main>
        
        <StandingsSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} tablaGeneral={tablaGeneral} mejoresTerceros={mejoresTerceros} />
        <TournamentManual isOpen={showManual} onClose={() => setShowManual(false)} />
        <StadiumMapModal isOpen={!!selectedStadium} estadio={selectedStadium} onClose={() => setSelectedStadium(null)} />
        
        {showToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-bottom-5">
            <div className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border shadow-2xl ${showToast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-zinc-950' : 'bg-rose-500 border-rose-400 text-white'}`}>
              {showToast.message}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
