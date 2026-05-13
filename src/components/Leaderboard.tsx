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

  // Cargar ranking desde el Backend (Single Source of Truth)
  const loadRanking = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllScores();
      if (response.success && response.data?.scores) {
        // El backend ya devuelve los datos ordenados y calculados
        setRanking(response.data.scores.map((item: any, index: number) => ({
          position: index + 1,
          userId: item.userId,
          username: item.username,
          scoreGroups: item.puntajeGrupos || 0,
          scoreKnockout: item.puntajeEliminatorias || 0,
          scoreTotal: item.puntajeTotal || 0,
          aciertosExactos: item.aciertosExactos || 0,
          bonificacionesPenales: item.bonificacionesPenales || 0,
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

  // Filtrar por búsqueda
  const filteredRanking = useMemo(() => {
    if (!searchTerm.trim()) return ranking;
    const term = searchTerm.toLowerCase();
    return ranking.filter((entry) =>
      entry.username.toLowerCase().includes(term)
    );
  }, [ranking, searchTerm]);

  // Ordenar tabla
  const sortedRanking = useMemo(() => {
    const sortable = [...filteredRanking];
    sortable.sort((a, b) => {
      const { key, direction } = sortConfig;
      const multiplier = direction === "asc" ? 1 : -1;

      if (key === "username") {
        return multiplier * a.username.localeCompare(b.username);
      }
      if (key === "position") {
        return multiplier * (a.position - b.position);
      }

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
      const defaultDirection = key === "username" ? "asc" : "desc";
      return { key, direction: defaultDirection };
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

  const handleDownload = async (username: string) => {
    const user = ranking.find((r) => r.username === username);
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await api.downloadUserProgress(user.userId);
      if (response.success && response.data?.content) {
        const blob = new Blob([response.data.content], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.data.filename || `progreso-${username}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error descargando progreso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportRankingPDF = () => {
    // Mantén tu función actual de exportación PDF
    // exportarRankingPDF(sortedRanking);
    console.log("Export PDF Ranking - Pendiente de implementación");
  };

  const currentUserEntry = ranking.find((e) => e.username === currentUser?.username);

  return (
    <div className="space-y-6">
      {/* Header */}
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
            onClick={handleExportRankingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 text-xs font-black uppercase transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF Ranking
          </button>

          <button
            onClick={() => { loadRanking(); onRefresh?.(); }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 text-xs font-black uppercase transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar usuario por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
        />
      </div>

      {/* Mi posición */}
      {currentUserEntry && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-emerald-400">#{currentUserEntry.position}</span>
            <div>
              <p className="text-sm font-bold text-white">@{currentUserEntry.username}</p>
              <p className="text-xs text-zinc-500">{currentUserEntry.scoreTotal} puntos totales</p>
            </div>
          </div>
          <button
            onClick={() => handleDownload(currentUserEntry.username)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-black uppercase transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Mi Progreso
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="max-h-[65vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-950 z-10">
              <tr className="text-xs font-black uppercase text-zinc-500 border-b border-zinc-800">
                <th className="px-4 py-4 text-left w-16 cursor-pointer" onClick={() => requestSort("position")}>
                  # <SortIcon column="position" />
                </th>
                <th className="px-4 py-4 text-left cursor-pointer" onClick={() => requestSort("username")}>
                  Usuario <SortIcon column="username" />
                </th>
                <th className="px-4 py-4 text-center cursor-pointer" onClick={() => requestSort("scoreGroups")}>
                  Grupos <SortIcon column="scoreGroups" />
                </th>
                <th className="px-4 py-4 text-center cursor-pointer" onClick={() => requestSort("scoreKnockout")}>
                  Eliminatorias <SortIcon column="scoreKnockout" />
                </th>
                <th className="px-4 py-4 text-center font-black text-white cursor-pointer" onClick={() => requestSort("scoreTotal")}>
                  TOTAL <SortIcon column="scoreTotal" />
                </th>
                <th className="px-4 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sortedRanking.map((entry) => {
                const isCurrent = entry.username === currentUser?.username;
                return (
                  <tr key={entry.username} className={`hover:bg-zinc-800/50 transition-colors ${isCurrent ? "bg-emerald-500/10" : ""}`}>
                    <td className="px-4 py-4 font-black text-lg">{entry.position}</td>
                    <td className="px-4 py-4 font-bold">@{entry.username}</td>
                    <td className="px-4 py-4 text-center text-zinc-400">{entry.scoreGroups}</td>
                    <td className="px-4 py-4 text-center text-zinc-400">{entry.scoreKnockout}</td>
                    <td className="px-4 py-4 text-center font-black text-lg text-white">{entry.scoreTotal}</td>
                    <td className="px-4 py-4 text-right">
                      {isCurrent && (
                        <button
                          onClick={() => handleDownload(entry.username)}
                          className="p-2 hover:bg-zinc-700 rounded-lg text-emerald-400"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
