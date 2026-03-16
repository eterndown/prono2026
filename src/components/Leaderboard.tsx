import React, { useState, useEffect, useMemo } from "react";
import { LeaderboardEntry, UserScore, Partido, Pronostico } from "../types";
import { generarRanking } from "../services/scoringSystem";
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
import { PARTIDOS_INICIALES } from "../constants";
import { api } from "../services/api";

interface LeaderboardProps {
  currentUser: { id: string; username: string } | null;
  allScores: UserScore[];
  realScores: Record<number, any>;
  onRefresh?: () => void;
  // Props necesarios para exportación XLSX
  todosLosPartidos?: Partido[];
  pronosticos?: Record<number, Pronostico>;
}

type SortKey =
  | "position"
  | "username"
  | "scoreGroups"
  | "scoreKnockout"
  | "scoreTotal";
type SortDirection = "asc" | "desc";

const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  allScores,
  realScores,
  onRefresh,
  todosLosPartidos = [],
  pronosticos = {},
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

  // Calcular ranking cuando cambien los scores
  useEffect(() => {
    if (allScores.length > 0) {
      const calculated = generarRanking(allScores, realScores);
      setRanking(calculated);
    }
  }, [allScores, realScores]);

  // Filtrar por búsqueda (username)
  const filteredRanking = useMemo(() => {
    if (!searchTerm.trim()) return ranking;
    const term = searchTerm.toLowerCase();
    return ranking.filter((entry) =>
      entry.username.toLowerCase().includes(term)
    );
  }, [ranking, searchTerm]);

  // Ordenar tabla con lógica mejorada
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

      // Para puntajes: mayor es mejor, pero respetamos dirección
      const aVal = a[key as keyof LeaderboardEntry] as number;
      const bVal = b[key as keyof LeaderboardEntry] as number;

      return multiplier * (aVal - bVal);
    });

    return sortable;
  }, [filteredRanking, sortConfig]);

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Cambiar dirección si ya está ordenado por esta columna
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      // Nueva columna: desc por defecto para puntajes, asc para username
      const defaultDirection = key === "username" ? "asc" : "desc";
      return { key, direction: defaultDirection };
    });
  };

  // Descargar progreso de usuario en XLSX - CORREGIDO
  const handleDownload = async (username: string) => {
    // Buscar el UserScore completo por username para obtener userId
    const userScore = allScores.find((s) => s.username === username);
    if (!userScore) {
      console.error(`Usuario ${username} no encontrado en allScores`);
      return;
    }

    setIsLoading(true);
    try {
      // Obtener pronósticos ESPECÍFICOS de este usuario desde el backend
      const userData = await api.getInitialData(userScore.userId);

      if (!userData.success) {
        console.error(
          `Error al obtener datos de ${username}:`,
          userData.message
        );
        return;
      }

      const userPronosticos = userData.data.userPronos || {};
      const partidos =
        todosLosPartidos.length > 0 ? todosLosPartidos : PARTIDOS_INICIALES;

      // Exportar con los pronósticos CORRECTOS del usuario
      exportarProgresoXLSX(
        username,
        userScore,
        partidos,
        userPronosticos, // ← AHORA usa pronósticos del usuario específico
        realScores
      );
    } catch (error) {
      console.error("Error descargando progreso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar ranking completo a PDF
  const handleExportRankingPDF = () => {
    exportarRankingPDF(ranking);
  };

  const currentUserEntry = ranking.find(
    (e) => e.username === currentUser?.username
  );

  // Icono de ordenamiento
  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3 text-emerald-400" />
    ) : (
      <ChevronDown className="w-3 h-3 text-emerald-400" />
    );
  };

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
          {/* Botón PDF Ranking */}
          <button
            onClick={handleExportRankingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 text-xs font-black uppercase transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF Ranking
          </button>

          {/* Botón Actualizar */}
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
          placeholder="Buscar usuario por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            ✕
          </button>
        )}
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
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            Mi Progreso (.xlsx)
          </button>
        </div>
      )}

      {/* Tabla de Ranking - CON SCROLL VERTICAL */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Header de la tabla */}
        <div className="bg-zinc-950/50 border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
              Ordenar por:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => requestSort("scoreTotal")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                  sortConfig.key === "scoreTotal"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <Trophy className="w-3 h-3" />
                Puntaje
                <SortIcon column="scoreTotal" />
              </button>
              <button
                onClick={() => requestSort("username")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                  sortConfig.key === "username"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <Users className="w-3 h-3" />
                Usuario
                <SortIcon column="username" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenedor con SCROLL VERTICAL para todos los usuarios */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-950/30 tracking-widest sticky top-0 z-10">
              <tr>
                <th
                  className="px-4 py-3 w-16 cursor-pointer hover:text-emerald-400 transition-colors"
                  onClick={() => requestSort("position")}
                >
                  <div className="flex items-center gap-1">
                    # <SortIcon column="position" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-emerald-400 transition-colors"
                  onClick={() => requestSort("username")}
                >
                  <div className="flex items-center gap-1">
                    Usuario <SortIcon column="username" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center cursor-pointer hover:text-emerald-400 transition-colors"
                  onClick={() => requestSort("scoreGroups")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Grupos <SortIcon column="scoreGroups" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center cursor-pointer hover:text-emerald-400 transition-colors"
                  onClick={() => requestSort("scoreKnockout")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Elim. <SortIcon column="scoreKnockout" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center font-black text-white cursor-pointer hover:text-emerald-400 transition-colors"
                  onClick={() => requestSort("scoreTotal")}
                >
                  <div className="flex items-center justify-center gap-1">
                    TOTAL <SortIcon column="scoreTotal" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {sortedRanking.map((entry) => {
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
                      {/* Solo el usuario actual puede descargar su progreso */}
                      {isCurrentUser ? (
                        <button
                          onClick={() => handleDownload(entry.username)}
                          disabled={isLoading}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                          title="Descargar tu progreso en Excel"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <span
                          className="text-zinc-700 text-[10px]"
                          title="Solo tu propio progreso"
                        >
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer de la tabla */}
        <div className="px-4 py-3 bg-zinc-950/30 border-t border-zinc-800 flex items-center justify-between text-[10px]">
          <span className="text-zinc-500">
            Mostrando {sortedRanking.length} de {ranking.length} usuarios
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-emerald-400 hover:text-emerald-300 font-black uppercase"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
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

      {/* Mensaje si la búsqueda no tiene resultados */}
      {searchTerm && sortedRanking.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/20 rounded-xl border border-zinc-800">
          <Search className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-zinc-500">
            No se encontraron usuarios con "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-3 text-emerald-400 text-[10px] font-black uppercase hover:text-emerald-300"
          >
            Ver todos los usuarios
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
