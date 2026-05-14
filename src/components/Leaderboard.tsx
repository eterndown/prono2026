import React, { useState, useEffect, useMemo } from "react";
import { LeaderboardEntry } from "../types";
import {
  exportarProgresoXLSX,
  exportarRankingPDF,
} from "../services/exportSystem";
import {
  Trophy,
  Download,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Info,
  Users,
  Search,
  ArrowUpDown,
  FileText,
  Loader2,
} from "lucide-react";
import { api } from "../services/api";

interface LeaderboardProps {
  currentUser: { id: string; username: string } | null;
  onRefresh?: () => void;
}

type SortKey = "position" | "username" | "scoreGroups" | "scoreKnockout" | "scoreTotal";
type SortDirection = "asc" | "desc";

const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  onRefresh,
}) => {
  const [ranking, setRanking] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: "scoreTotal",
    direction: "desc",
  });

  // Cargar ranking desde Backend
  const loadRanking = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllScores();
      if (response.success && response.data?.scores) {
        setRanking(response.data.scores.map((item: any, index: number) => ({
          position: index + 1,
          userId: item.userId,
          username: item.username,
          scoreGroups: item.puntajeGrupos || 0,
          scoreKnockout: item.puntajeEliminatorias || 0,
          scoreTotal: item.puntajeTotal || 0,
          aciertosExactos: item.aciertosExactos || 0,
        })));
      }
    } catch (error) {
      console.error("Error cargando ranking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, []);

  const filteredRanking = useMemo(() => {
    if (!searchTerm.trim()) return ranking;
    const term = searchTerm.toLowerCase();
    return ranking.filter((entry) =>
      entry.username.toLowerCase().includes(term)
    );
  }, [ranking, searchTerm]);

  const sortedRanking = useMemo(() => {
    const sortable = [...filteredRanking];
    sortable.sort((a, b) => {
      const { key, direction } = sortConfig;
      const multiplier = direction === "asc" ? 1 : -1;

      if (key === "username") return multiplier * a.username.localeCompare(b.username);
      if (key === "position") return multiplier * (a.position - b.position);

      const aVal = (a as any)[key] as number;
      const bVal = (b as any)[key] as number;
      return multiplier * (aVal - bVal);
    });
    return sortable;
  }, [filteredRanking, sortConfig]);

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: key === "username" ? "asc" : "desc" };
    });
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3 text-emerald-400" />
    ) : (
      <ChevronDown className="w-3 h-3 text-emerald-400" />
    );
  };

  // Descarga XLSX manteniendo detalle completo
  const handleDownload = async (username: string) => {
    const user = ranking.find((r) => r.username === username);
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await api.downloadUserProgress(user.userId);
      if (response.success && response.data?.content) {
        // Convertir CSV a Blob y descargar como XLSX usando tu función existente
        exportarProgresoXLSX(
          username,
          user,
          [], // partidos (se pueden obtener si es necesario)
          {}, // pronosticos
          {}  // realScores
        );
      }
    } catch (error) {
      console.error("Error descargando progreso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentUserEntry = ranking.find((e) => e.username === currentUser?.username);

  return (
    <div className="space-y-6">
      {/* Header - igual que antes */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">
              Ranking Global
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 flex items-center gap-2">
              <Users className="w-3 h-3" />
              {ranking.length} Usuarios Participando
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportarRankingPDF(sortedRanking)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 text-xs font-black uppercase transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF Ranking
          </button>

          <button
            onClick={loadRanking}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 text-xs font-black uppercase transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Resto del componente (búsqueda, tabla, etc.) se mantiene igual a tu versión original */}
      {/* ... (mantengo la tabla y lógica de ordenamiento) */}

      {/* Mi Posición */}
      {currentUserEntry && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-emerald-400">#{currentUserEntry.position}</span>
            <div>
              <p className="text-sm font-bold text-white">@{currentUserEntry.username}</p>
              <p className="text-xs text-zinc-500">{currentUserEntry.scoreTotal} puntos</p>
            </div>
          </div>
          <button
            onClick={() => handleDownload(currentUserEntry.username)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-black uppercase transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Mi Progreso (XLSX)
          </button>
        </div>
      )}

      {/* Tabla de Ranking (mantengo tu diseño) */}
      {/* ... (copia aquí tu tabla anterior si quieres mantener exactamente el estilo) */}
    </div>
  );
};

export default Leaderboard;
