import React, { useState, useEffect, useMemo } from "react";
import { LeaderboardEntry, UserScore } from "../types";
import { generarRanking, exportarProgresoCSV } from "../services/scoringSystem";
import {
  Trophy,
  Download,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Info,
  Users,
  Search,
} from "lucide-react";

interface LeaderboardProps {
  currentUser: { id: string; username: string } | null;
  allScores: UserScore[];
  realScores: Record<number, any>;
  onRefresh?: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  allScores,
  realScores,
  onRefresh,
}) => {
  const [ranking, setRanking] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LeaderboardEntry;
    direction: "asc" | "desc";
  }>({
    key: "scoreTotal",
    direction: "desc",
  });

  // Calcular ranking cuando cambien los scores
  useEffect(() => {
    if (allScores.length > 0) {
      const calculated = generarRanking(allScores, realScores);
      setRanking(calculated);
    }
  }, [allScores, realScores]);

  // Filtrar por búsqueda
  const filteredRanking = useMemo(() => {
    if (!searchTerm) return ranking;
    return ranking.filter((entry) =>
      entry.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ranking, searchTerm]);

  // Ordenar tabla
  const sortedRanking = useMemo(() => {
    const sortable = [...filteredRanking];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }
    return sortable;
  }, [filteredRanking, sortConfig]);

  const requestSort = (key: keyof LeaderboardEntry) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const handleDownload = (username: string) => {
    const userScore = allScores.find((s) => s.username === username);
    if (!userScore) return;

    const csv = exportarProgresoCSV(userScore);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prono2026-${username}-progreso.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentUserEntry = ranking.find(
    (e) => e.username === currentUser?.username
  );

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
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 text-xs font-black uppercase transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
        />
      </div>

      {/* Mi Posición (si está logueado) */}
      {currentUserEntry && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-emerald-400">
              #{currentUserEntry.position}
            </span>
            <div>
              <p className="text-sm font-bold text-white">
                @{currentUserEntry.username}
              </p>
              <p className="text-xs text-zinc-500">
                {currentUserEntry.scoreTotal} puntos totales
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDownload(currentUserEntry.username)}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-[10px] font-black uppercase transition-all"
          >
            <Download className="w-3 h-3" />
            Mi Progreso
          </button>
        </div>
      )}

      {/* Tabla de Ranking - Muestra TODOS los usuarios */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30">
        <table className="w-full text-left text-sm">
          <thead className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-950/50 tracking-widest">
            <tr>
              <th className="px-4 py-3 w-16">
                <button
                  onClick={() => requestSort("position")}
                  className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  #{" "}
                  {sortConfig.key === "position" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </button>
              </th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => requestSort("scoreGroups")}
                  className="flex items-center gap-1 justify-center hover:text-emerald-400 transition-colors"
                >
                  Grupos{" "}
                  {sortConfig.key === "scoreGroups" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => requestSort("scoreKnockout")}
                  className="flex items-center gap-1 justify-center hover:text-emerald-400 transition-colors"
                >
                  Elim.{" "}
                  {sortConfig.key === "scoreKnockout" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </button>
              </th>
              <th className="px-4 py-3 text-center font-black text-white">
                <button
                  onClick={() => requestSort("scoreTotal")}
                  className="flex items-center gap-1 justify-center hover:text-emerald-400 transition-colors"
                >
                  TOTAL{" "}
                  {sortConfig.key === "scoreTotal" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </button>
              </th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/30">
            {sortedRanking.map((entry, index) => {
              const isCurrentUser = entry.username === currentUser?.username;
              const isTop3 = entry.position <= 3;

              return (
                <tr
                  key={entry.username}
                  className={`hover:bg-zinc-800/30 transition-colors ${
                    isCurrentUser
                      ? "bg-emerald-500/5 ring-1 ring-emerald-500/20"
                      : ""
                  } ${isTop3 ? "bg-amber-500/5" : ""}`}
                >
                  <td
                    className={`px-4 py-4 font-black ${
                      isTop3
                        ? entry.position === 1
                          ? "text-amber-400"
                          : entry.position === 2
                          ? "text-zinc-300"
                          : "text-amber-600/80"
                        : "text-zinc-600"
                    }`}
                  >
                    {entry.position}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-black ${
                          isCurrentUser ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        @{entry.username}
                      </span>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-black uppercase">
                          Vos
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-zinc-400">
                    {entry.scoreGroups}
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-zinc-400">
                    {entry.scoreKnockout}
                  </td>
                  <td
                    className={`px-4 py-4 text-center font-black ${
                      isTop3 ? "text-amber-400" : "text-white"
                    }`}
                  >
                    {entry.scoreTotal}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleDownload(entry.username)}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-emerald-400 transition-colors"
                      title="Descargar progreso"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info de Criterios de Desempate */}
      <div className="flex items-start gap-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
        <Info className="w-4 h-4 text-zinc-500 mt-0.5" />
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Criterios de desempate: 1) Puntaje total → 2) Puntaje eliminatorias →
          3) Puntaje Final → 4) Más aciertos exactos → 5) Más bonificaciones de
          penales → 6) Empate mantenido
        </p>
      </div>

      {/* Mensaje si no hay usuarios */}
      {ranking.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
          <p className="text-sm font-bold text-zinc-600 uppercase">
            No hay usuarios aún
          </p>
          <p className="text-[10px] text-zinc-700 mt-2">
            Sé el primero en cargar tus pronósticos
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
