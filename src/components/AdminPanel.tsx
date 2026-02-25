import React, { useState, useEffect, useMemo } from 'react';
import { Usuario, GlobalSettings, Partido, Pronostico, TimeConfig, LetraGrupo, Clasificacion } from '../types';
import { api } from '../services/api';
import { getFlagUrl, EQUIPOS, PARTIDOS_INICIALES, GRUPOS } from '../constants';
import { resolverLlaves, calcularPosiciones, obtenerMejoresTerceros, isValidScore, simularPenales, checkPensValidity } from '../services/fifaLogic';
import { Users, Lock, Unlock, Settings, Terminal, Clock, RefreshCw, Zap, Search, ShieldAlert, History, Wand2, Save, Loader2, UserCheck, UserMinus, Trash2, CheckCircle2, AlertCircle, Flag } from 'lucide-react';

interface Props {
  currentUser: Usuario;
  onUpdateUser: (u: Usuario) => void;
  globalSettings: GlobalSettings;
  setGlobalSettings: (s: GlobalSettings) => void;
  allMatches: Partido[];
  toast: (msg: string, type?: 'success' | 'error') => void;
  appTime: Date;
  setAppTime: (d: Date) => void;
  isTimeManual: boolean;
  setIsTimeManual: () => void;
  setRealScores: React.Dispatch<React.SetStateAction<Record<number, Pronostico>>>;
}

const AdminPanel: React.FC<Props> = ({ 
  currentUser, 
  onUpdateUser,
  globalSettings, 
  setGlobalSettings, 
  allMatches, 
  toast, 
  appTime, 
  setAppTime,
  isTimeManual,
  setIsTimeManual,
  setRealScores: setGlobalRealScores
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'bloqueos' | 'resultado_oficial' | 'logs'>('usuarios');
  const [users, setUsers] = useState<Usuario[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingTime, setIsSavingTime] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [realScores, setRealScores] = useState<Record<number, Pronostico>>({});

  const formatMilitar = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const formatLocalDate = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [virtualDateInput, setVirtualDateInput] = useState(formatLocalDate(appTime));

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminGetUsers(currentUser.username);
      if (res.success && Array.isArray(res.data)) setUsers(res.data);
    } catch (e) { setUsers([]); } finally { setIsLoading(false); }
  };

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminGetLogs(currentUser.username);
      if (res.success && Array.isArray(res.data)) setAuditLogs(res.data);
    } catch (e) { setAuditLogs([]); } finally { setIsLoading(false); }
  };

  const fetchRealResults = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInitialData(currentUser.id);
      if (res.success && res.data.realScores) {
        setRealScores(res.data.realScores);
      }
    } catch (e) { toast("Error al cargar resultados reales", "error"); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (activeSubTab === 'usuarios') fetchUsers();
    if (activeSubTab === 'logs') fetchAuditLogs();
    if (activeSubTab === 'resultado_oficial') fetchRealResults();
  }, [activeSubTab]);

// Funciones para actualizar los resultados en el estado local del Admin
  const updateScore = (id: number, side: 'L' | 'V', val: string) => {
    setRealScores(prev => {
      const current = prev[id] || { local: "-", visitante: "-", penalesLocal: "-", penalesVisitante: "-" };
      return {
        ...prev,
        [id]: {
          ...current,
          [side === 'L' ? 'local' : 'visitante']: val === "" ? "-" : val
        }
      };
    });
  };

  const updatePens = (id: number, side: 'L' | 'V', val: string) => {
    setRealScores(prev => {
      const current = prev[id] || { local: "-", visitante: "-", penalesLocal: "-", penalesVisitante: "-" };
      return {
        ...prev,
        [id]: {
          ...current,
          [side === 'L' ? 'penalesLocal' : 'penalesVisitante']: val === "" ? "-" : val
        }
      };
    });
  };

  // --- LÓGICA DE RESOLUCIÓN OFICIAL PARA ADMIN ---
  const tablaOficialAdmin = useMemo(() => {
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

  const mejoresTercerosOficialAdmin = useMemo(() => obtenerMejoresTerceros(tablaOficialAdmin), [tablaOficialAdmin]);

// --- DENTRO DE AdminPanel.tsx ---

// Reemplaza tu useMemo de llavesOficialesAdmin por este:
const llavesOficialesAdmin = useMemo(() => {
    const datosAdmin = { 
      posiciones: tablaOficialAdmin, 
      terceros: mejoresTercerosOficialAdmin 
    };
    return resolverLlaves(
      tablaOficialAdmin, 
      mejoresTercerosOficialAdmin, 
      realScores,
      datosAdmin,
      true // Prioridad absoluta a los resultados oficiales del Admin
    );
  }, [tablaOficialAdmin, mejoresTercerosOficialAdmin, realScores]);

  /**
   * REGLA DE ORO PARA EL RESULTADO OFICIAL
   
  const checkPensValidity = (pl: any, pv: any) => {
    if (!isValidScore(pl) || !isValidScore(pv)) return true;
    const nA = parseInt(String(pl), 10);
    const nB = parseInt(String(pv), 10);
    if (nA === nB) return false;
    const max = Math.max(nA, nB);
    const min = Math.min(nA, nB);
    const diff = max - min;
    if (max <= 5) {
      const validPairs = [[1,0],[2,0],[2,1],[3,0],[3,1],[3,2],[4,1],[4,2],[4,3],[5,3],[5,4]];
      return validPairs.some(pair => pair[0] === max && pair[1] === min);
    } 
    return diff === 1;
  };*/

  const handleUpdateRealScore = (id: number, l: any, v: any, pl?: any, pv?: any) => {
    setRealScores(prev => ({
      ...prev,
      [id]: { 
        local: l === "" ? "-" : l, 
        visitante: v === "" ? "-" : v, 
        penalesLocal: pl === "" ? "-" : pl, 
        penalesVisitante: pv === "" ? "-" : pv 
      }
    }));
  };

  const simulateAllReal = () => {
    const simulated: Record<number, Pronostico> = {};
    for (let i = 1; i <= 104; i++) {
      const gl = Math.floor(Math.random() * 5);
      const gv = Math.floor(Math.random() * 5);
      let pl: any = "-";
      let pv: any = "-";
      
      if (i > 72 && gl === gv) {
        const resPens = simularPenales();
        pl = String(resPens.golesLocal);
        pv = String(resPens.golesVisitante);
      }
      simulated[i] = { 
        local: String(gl), 
        visitante: String(gv), 
        penalesLocal: pl, 
        penalesVisitante: pv 
      };
    }
    setRealScores(simulated);
    toast("Simulación de 104 partidos generada (Siguiendo Regla de Oro)");
  };

  const clearAndSaveReal = async () => {
    const empty: Record<number, Pronostico> = {};
    for (let i = 1; i <= 104; i++) {
      empty[i] = { local: "-", visitante: "-", penalesLocal: "-", penalesVisitante: "-" };
    }
    setRealScores(empty);
    
    setIsLoading(true);
    try {
      const res = await api.adminSaveRealResults(currentUser.username, empty);
      if (res.success) toast("Resultados reseteados");
    } catch (e) { toast("Error de conexión", "error"); } finally { setIsLoading(false); }
  };

const saveRealResults = () => {
    // 1. Iniciamos carga breve
    setIsLoading(true);

    const sanitized: Record<number, any> = {};
    allMatches.forEach(m => {
      const s = realScores[m.id];
      if (s) {
        const fix = (v: any) => (v === 0 || v === "0") ? "0" : (v && v !== "-" ? String(v) : "-");
        const valL = fix(s.local);
        const valV = fix(s.visitante);
        const valPL = fix(s.penalesLocal);
        const valPV = fix(s.penalesVisitante);

        sanitized[m.id] = {
          local: valL,
          visitante: valV,
          penalesLocal: valPL,
          penalesVisitante: valPV
        };

        // ACTUALIZACIÓN DIRECTA DE OBJETOS (Pedido del usuario)
        m.golesLocal = valL;
        m.golesVisitante = valV;
        m.penalesLocal = valPL;
        m.penalesVisitante = valPV;
      }
    });

    // 2. ACTUALIZACIÓN DEL ESTADO GLOBAL (Para que VIVO refleje los cambios de inmediato)
    setGlobalRealScores(prev => ({
      ...prev,
      ...sanitized
    }));

    // 3. DISPARAR AL SERVIDOR (Fire and forget)
    api.adminSaveRealResults(currentUser.username, sanitized).catch(e => console.error(e));

    // 4. LIBERAR UI
    setTimeout(() => {
      setIsLoading(false);
      toast("Resultados actualizados localmente y sincronizando con el servidor...", "success");
    }, 500);
  };

  const toggleUserStatus = async (targetId: string, currentStatus: boolean) => {
    setIsLoading(true);
    const res = await api.adminUpdateUser(currentUser.username, targetId, { activo: !currentStatus });
    if (res.success) {
      toast(`Cuenta ${!currentStatus ? 'HABILITADA' : 'SUSPENDIDA'}`);
      await fetchUsers();
    }
    setIsLoading(false);
  };

  const unfreezeUser = async (targetId: string) => {
    setIsLoading(true);
    try {
      const res = await api.adminUpdateUser(currentUser.username, targetId, { isFrozen: false });
      if (res.success) { 
        toast("Pronóstico desbloqueado"); 
        await fetchUsers(); 
        if (targetId === currentUser.id) {
          const updatedUser = { ...currentUser, isFrozen: false };
          onUpdateUser(updatedUser);
          localStorage.setItem('fifa_session', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      toast("Error al desbloquear", "error");
    } finally { 
      setIsLoading(false); 
    }
  };

  const persistVirtualTime = async () => {
    if (!virtualDateInput) return toast("Fecha inválida", "error");
    setIsSavingTime(true);
    try {
      const targetDate = new Date(virtualDateInput);
      const res = await api.adminUpdateTimeConfig(currentUser.username, {
        modoTiempo: 'SIMULACION',
        fechaSimulacion: targetDate.toISOString()
      });
      if (res.success) { setAppTime(targetDate); toast("Fecha aplicada ✨"); }
    } finally { setIsSavingTime(false); }
  };

  const persistResetTime = async () => {
    setIsSavingTime(true);
    try {
      const res = await api.adminUpdateTimeConfig(currentUser.username, {
        modoTiempo: 'PRESENTE',
        fechaSimulacion: null
      });
      if (res.success) { setIsTimeManual(); toast("Tiempo real restablecido"); }
    } finally { setIsSavingTime(false); }
  };

  const filteredMatches = useMemo(() => {
    const total = [];
    for(let i=1; i<=104; i++) {
        const m = allMatches.find(match => match.id === i);
        if(m) total.push(m);
    }
    const searchLower = searchTerm.toLowerCase().trim();
    return total.filter(m => {
      const local = EQUIPOS.find(e => e.id === m.equipoLocal);
      const visitante = EQUIPOS.find(e => e.id === m.equipoVisitante);
      
      return (
        m.id.toString().includes(searchLower) || 
        m.fase.toLowerCase().includes(searchLower) ||
        m.estadio?.toLowerCase().includes(searchLower) ||
        local?.nombre.toLowerCase().includes(searchLower) ||
        visitante?.nombre.toLowerCase().includes(searchLower) ||
        m.placeholderLocal?.toLowerCase().includes(searchLower) ||
        m.placeholderVisitante?.toLowerCase().includes(searchLower)
      );
    });
  }, [allMatches, searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Settings className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">Centro de Mando</h2>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Panel de Gobernanza Global • Formato 24H</p>
          </div>
        </div>
        <nav className="flex flex-wrap bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 shadow-xl no-print">
           {[
             { id: 'usuarios', label: 'Cuentas', icon: Users },
             { id: 'bloqueos', label: 'Gobernanza', icon: ShieldAlert },
             { id: 'resultado_oficial', label: 'Resultado Oficial', icon: Wand2 },
             { id: 'logs', label: 'Auditoría', icon: Terminal }
           ].map(t => (
             <button key={t.id} onClick={() => setActiveSubTab(t.id as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === t.id ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
               <t.icon className="w-3.5 h-3.5" /> {t.label}
             </button>
           ))}
        </nav>
      </div>

      <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20">
              <Clock className={`w-10 h-10 text-emerald-500 ${!isTimeManual ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase text-emerald-400 italic tracking-tighter leading-none mb-1">Reloj Maestro (24H)</h4>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-mono font-black text-white tabular-nums tracking-tighter">{formatMilitar(appTime)}</span>
                <div className={`flex items-center gap-2 px-3 py-1 border rounded-full ${isTimeManual ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
                   {isTimeManual ? <Save className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                   <span className="text-[9px] font-black uppercase tracking-widest italic">{isTimeManual ? 'Simulando' : 'Real'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900 p-4 rounded-3xl border border-zinc-800 w-full md:w-auto">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest pl-1">Ajustar Tiempo Virtual</span>
              <input type="datetime-local" value={virtualDateInput} onChange={(e) => setVirtualDateInput(e.target.value)} lang="es-AR" step="60" className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="flex gap-2 self-end">
              <button onClick={persistVirtualTime} disabled={isSavingTime} className="px-6 py-3 bg-emerald-500 text-zinc-950 rounded-xl hover:bg-emerald-400 font-black uppercase text-[10px] tracking-widest">
                {isSavingTime ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
              </button>
              <button onClick={persistResetTime} disabled={isSavingTime} className="p-3 bg-zinc-800 text-zinc-400 rounded-xl border border-zinc-700">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden min-h-[500px] flex flex-col">
        {activeSubTab === 'usuarios' && (
          <div className="p-8 space-y-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3"><Users className="w-5 h-5 text-emerald-500" /> Usuarios</h3>
               <div className="relative w-64">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                 <input placeholder="Buscar usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-all" />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-zinc-600 border-b border-zinc-800/50">
                    <th className="px-4 py-4">Usuario</th>
                    <th className="px-4 py-4 text-center">Rango</th>
                    <th className="px-4 py-4 text-center">Estado Prono</th>
                    <th className="px-4 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-emerald-500/5 group">
                      <td className="px-4 py-5 font-black text-xs text-white">@{u.username}</td>
                      <td className="px-4 py-5 text-center">
                        {u.isAdmin ? <Zap className="w-4 h-4 text-amber-500 mx-auto" /> : <span className="text-[9px] text-zinc-700">Participante</span>}
                      </td>
                      <td className="px-4 py-5 text-center">
                        {u.isFrozen ? <Lock className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <Unlock className="w-3.5 h-3.5 text-zinc-700 mx-auto" />}
                      </td>
                      <td className="px-4 py-5 text-right flex justify-end gap-2">
                         {u.isFrozen && (
                           <button 
                             onClick={() => unfreezeUser(u.id)} 
                             className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-zinc-950 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 border border-emerald-500/20"
                           >
                             <Unlock className="w-3 h-3" /> Descongelar
                           </button>
                         )}
                         <button onClick={() => toggleUserStatus(u.id, u.activo)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${u.activo ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' : 'bg-rose-500 text-white border border-rose-400'}`}>
                           {u.activo ? 'Suspender' : 'Habilitar'}
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'resultado_oficial' && (
          <div className="p-8 space-y-8 flex flex-col flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3">
                  <Wand2 className="w-5 h-5 text-emerald-500" /> Motor de Clasificación Oficial
                </h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Gestión de resultados del torneo real</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={simulateAllReal} className="flex-1 md:flex-none px-6 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl font-black text-[10px] uppercase hover:bg-amber-500/20">Sim</button>
                <button onClick={clearAndSaveReal} className="flex-1 md:flex-none px-6 py-3 bg-zinc-800 border border-zinc-700 text-zinc-500 rounded-xl font-black text-[10px] uppercase hover:text-rose-500 hover:border-rose-500/50 transition-all flex items-center justify-center gap-2">
                   <Trash2 className="w-3.5 h-3.5" /> Vaciar
                </button>
                <button onClick={saveRealResults} disabled={isLoading} className="flex-1 md:flex-none px-8 py-3 bg-emerald-500 text-zinc-950 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar Resultados</>}
                </button>
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                placeholder="Filtrar por ID, Equipo, Estadio o Fase..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-all" 
              />
            </div>

            <div className="flex-1 overflow-x-auto rounded-3xl border border-zinc-800 shadow-inner bg-zinc-950/20">
              <table className="w-full text-left text-[11px] border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-zinc-950 text-zinc-600 text-[9px] font-black uppercase tracking-widest border-b border-zinc-800">
                    <th className="px-6 py-4 w-16">ID</th>
                    <th className="px-6 py-4">Fase</th>
                    <th className="px-6 py-4 text-center">Partido</th>
                    <th className="px-6 py-4 text-center w-52">Marcador Oficial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
{filteredMatches.map(m => {
  const score = realScores[m.id] || { local: "-", visitante: "-", penalesLocal: "-", penalesVisitante: "-" };
  const isKO = m.fase !== 'Grupos';
  const isDraw = isValidScore(score.local) && isValidScore(score.visitante) && parseInt(String(score.local)) === parseInt(String(score.visitante));
  
  // Resolvemos quiénes juegan basándonos en la lógica oficial
  const cruceResuelto = m.id > 72 ? llavesOficialesAdmin.find(lx => lx.id === m.id) : null;
  
  // idLocal e idVisitante ahora son dinámicos
  const idLocal = cruceResuelto ? cruceResuelto.equipoLocal : m.equipoLocal;
  const idVisitante = cruceResuelto ? cruceResuelto.equipoVisitante : m.equipoVisitante;

  const localTeam = EQUIPOS.find(e => e.id === idLocal);
  const visitanteTeam = EQUIPOS.find(e => e.id === idVisitante);

  const pensValid = checkPensValidity(score.penalesLocal, score.penalesVisitante);

return (
                      <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4 font-black text-emerald-500">#{m.id}</td>
                        <td className="px-6 py-4 font-black uppercase text-zinc-500 text-[10px] tracking-tight">{m.fase}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-center gap-6">
                              <div className="flex items-center gap-3 justify-end w-48" title={m.placeholderLocal}>
                                <span className={`text-[10px] font-black uppercase text-right truncate ${localTeam ? 'text-zinc-200' : 'text-zinc-600 italic'}`}>
                                  {localTeam?.nombre || m.placeholderLocal}
                                </span>
                                <div className="w-8 h-5 rounded-sm overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900 shadow-sm">
                                  <img src={getFlagUrl(idLocal)} className="w-full h-full object-cover" alt="" />
                                </div>
                              </div>

                              <span className="text-zinc-800 text-[8px] font-black">VS</span>

                              <div className="flex items-center gap-3 justify-start w-48" title={m.placeholderVisitante}>
                                <div className="w-8 h-5 rounded-sm overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900 shadow-sm">
                                  <img src={getFlagUrl(idVisitante)} className="w-full h-full object-cover" alt="" />
                                </div>
                                <span className={`text-[10px] font-black uppercase truncate ${visitanteTeam ? 'text-zinc-200' : 'text-zinc-600 italic'}`}>
                                  {visitanteTeam?.nombre || m.placeholderVisitante}
                                </span>
                              </div>
                           </div>
                           {m.estadio && (
                             <div className="text-center mt-1">
                               <span className="text-[7px] text-zinc-700 font-bold uppercase tracking-widest">{m.estadio}</span>
                             </div>
                           )}
                        </td>
<td className="px-6 py-4">
  <div className="flex flex-col items-center gap-2">
    <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 group-hover:border-emerald-500/30 transition-all">
      {/* Goles Local */}
      <input 
        type="text" 
        value={score.local === "-" ? "" : score.local} 
        onChange={(e) => updateScore(m.id, 'L', e.target.value)} 
        placeholder="-" 
        className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg text-center font-black text-white text-sm outline-none focus:border-emerald-500" 
      />
      <span className="text-zinc-800 font-black">:</span>
      {/* Goles Visitante */}
      <input 
        type="text" 
        value={score.visitante === "-" ? "" : score.visitante} 
        onChange={(e) => updateScore(m.id, 'V', e.target.value)} 
        placeholder="-" 
        className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg text-center font-black text-white text-sm outline-none focus:border-emerald-500" 
      />
    </div>

    {isKO && isDraw && (
      <div className="flex flex-col items-center gap-1 animate-in slide-in-from-top-1">
        <div className="flex items-center gap-2">
          <span className={`text-[7px] font-black uppercase italic ${!pensValid ? 'text-rose-500' : 'text-amber-500'}`}>Pen:</span>
          {/* Penales Local */}
          <input 
            type="text" 
            value={score.penalesLocal === "-" ? "" : score.penalesLocal} 
            onChange={(e) => updatePens(m.id, 'L', e.target.value)} 
            placeholder="P" 
            className={`w-7 h-7 bg-zinc-950 border rounded-lg text-center text-[10px] font-black outline-none transition-all ${!pensValid ? 'border-rose-500 text-rose-500' : 'border-amber-500/20 text-amber-500'}`} 
          />
          {/* Penales Visitante */}
          <input 
            type="text" 
            value={score.penalesVisitante === "-" ? "" : score.penalesVisitante} 
            onChange={(e) => updatePens(m.id, 'V', e.target.value)} 
            placeholder="P" 
            className={`w-7 h-7 bg-zinc-950 border rounded-lg text-center text-[10px] font-black outline-none transition-all ${!pensValid ? 'border-rose-500 text-rose-500' : 'border-amber-500/20 text-amber-500'}`} 
          />
        </div>
      </div>
    )}
  </div>
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'bloqueos' && (
           <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-zinc-950 p-6 rounded-[2rem] border border-zinc-800 space-y-6">
                    <h4 className="text-sm font-black uppercase text-emerald-500 italic flex items-center gap-3"><ShieldAlert className="w-5 h-5" /> Fases</h4>
                    <div className="space-y-4">
                       {[
                         { id: 'groupsPhaseLocked', label: 'Grupos', current: globalSettings.groupsPhaseLocked },
                         { id: 'knockoutPhaseLocked', label: 'Playoffs', current: globalSettings.knockoutPhaseLocked }
                       ].map(phase => (
                         <div key={phase.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                            <span className="text-xs font-black uppercase text-zinc-400">{phase.label}</span>
                            <button onClick={() => setGlobalSettings({...globalSettings, [phase.id]: !phase.current})} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${phase.current ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-zinc-950'}`}>{phase.current ? 'Bloqueado' : 'Habilitado'}</button>
                         </div>
                       ))}
                    </div>
                  </div>
              </div>
           </div>
        )}

        {activeSubTab === 'logs' && (
          <div className="p-8 space-y-6 flex-1 flex flex-col">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3"><History className="w-5 h-5 text-emerald-500" /> Auditoría</h3>
                <button onClick={fetchAuditLogs} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-emerald-500 transition-all"><RefreshCw className="w-3.5 h-3.5" /></button>
             </div>
             <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
                {auditLogs.map((log, i) => (
                  <div key={i} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-start gap-4">
                     <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800"><Terminal className="w-4 h-4 text-emerald-600" /></div>
                     <div className="flex-1">
                        <div className="flex justify-between mb-1">
                           <span className="text-[9px] font-black text-emerald-500 uppercase">{log[2] || 'SISTEMA'}</span>
                           <span className="text-[9px] font-mono text-zinc-600">{new Date(log[0]).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400"><span className="text-white font-black">@{log[1]}</span>: {log[3]} - {log[4]}</p>
                     </div>
                  </div>
                )).reverse()}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;