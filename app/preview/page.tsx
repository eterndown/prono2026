'use client'

import React, { useState } from 'react';
import { Trophy, Users, Settings, LogOut, Loader2, Radio, LayoutGrid, Flag, Zap, GitFork, BarChart3 } from 'lucide-react';

interface Prediction {
  id: number;
  match_id: number;
  local_goals: string;
  visitor_goals: string;
  phase: string;
}

const mockPredictions: Prediction[] = [
  { id: 1, match_id: 1, local_goals: '2', visitor_goals: '1', phase: 'Grupos' },
  { id: 2, match_id: 2, local_goals: '1', visitor_goals: '1', phase: 'Grupos' },
  { id: 3, match_id: 3, local_goals: '3', visitor_goals: '0', phase: 'Grupos' },
  { id: 4, match_id: 4, local_goals: '0', visitor_goals: '2', phase: 'Grupos' },
  { id: 5, match_id: 5, local_goals: '2', visitor_goals: '2', phase: 'Grupos' },
  { id: 6, match_id: 73, local_goals: '2', visitor_goals: '1', phase: 'Dieciseisavos' },
  { id: 7, match_id: 74, local_goals: '1', visitor_goals: '0', phase: 'Dieciseisavos' },
  { id: 8, match_id: 75, local_goals: '2', visitor_goals: '2', phase: 'Octavos' },
  { id: 9, match_id: 76, local_goals: '3', visitor_goals: '1', phase: 'Cuartos' },
];

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'live' | 'admin'>('overview');
  const [activeLiveTab, setActiveLiveTab] = useState<'groups' | 'ranking' | 'standings' | 'knockout' | 'bracket'>('groups');

  const user = {
    username: 'usuario_demo',
    email: 'demo@mundial2026.com',
    is_admin: false,
    is_frozen: false,
  };

  const stats = {
    completed: 45,
    total: 104,
    percentage: 43,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-black uppercase italic">Mundial 2026</h1>
              <p className="text-xs text-zinc-500">Portal de Predicciones</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="font-bold text-sm">@{user.username}</p>
              <span className="text-xs text-zinc-500">Modo Preview</span>
            </div>
            <button className="bg-rose-500/10 hover:bg-rose-500 px-4 py-2 rounded-lg border border-rose-500/20 text-rose-500 hover:text-white font-bold text-xs uppercase transition-all">
              <LogOut className="w-4 h-4 inline mr-2" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-zinc-900/50 border-b border-zinc-800 px-6 py-4 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Panel General
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'predictions'
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Predicciones
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'live'
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 animate-pulse" />
            En Vivo
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-2">Estado</h3>
                <p className="text-3xl font-black text-emerald-500">
                  {user.is_frozen ? 'Finalizado' : 'Activo'}
                </p>
                <p className="text-xs text-zinc-600 mt-2">Listo para pronosticar</p>
              </div>
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-800 rounded-2xl p-6 hover:border-blue-500/30 transition-colors">
                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-2">Progreso</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-3xl font-black text-blue-500">{stats.completed}</p>
                    <p className="text-xs text-zinc-600">de {stats.total}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-xl font-black text-blue-400">{stats.percentage}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-2">Información</h3>
                <p className="text-lg font-black text-zinc-300">Copa Mundial 2026</p>
                <p className="text-xs text-zinc-600 mt-2">USA, México y Canadá</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                  Información del Torneo
                </h2>
                <div className="space-y-3 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>104 partidos totales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>7 fases de competencia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>Sistema de predicciones en vivo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>Sincronización con resultados oficiales</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8">
                <h2 className="text-xl font-black uppercase mb-4 text-amber-500">Próximas Acciones</h2>
                <div className="space-y-3">
                  <div className="bg-zinc-900/50 p-4 rounded-lg">
                    <p className="text-sm font-bold text-amber-400">Fase de Grupos</p>
                    <p className="text-xs text-zinc-500 mt-1">Completa tus predicciones para los 48 partidos</p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-lg">
                    <p className="text-sm font-bold text-amber-400">Fase Eliminatoria</p>
                    <p className="text-xs text-zinc-500 mt-1">Abierta después del 25 de junio</p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-lg">
                    <p className="text-sm font-bold text-amber-400">Finalizar Pronóstico</p>
                    <p className="text-xs text-zinc-500 mt-1">Congela tu pronóstico antes de la Final</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-3xl font-black uppercase mb-2">Mis Predicciones</h2>
              <p className="text-zinc-500">Total: {mockPredictions.length} predicciones guardadas</p>
            </div>

            <div className="space-y-6">
              {['Grupos', 'Dieciseisavos', 'Octavos', 'Cuartos'].map((phase) => (
                <div key={phase} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-8 bg-emerald-500"></div>
                    <h3 className="text-lg font-black uppercase text-white">{phase}</h3>
                    <div className="flex-1 h-[1px] bg-zinc-800"></div>
                    <span className="text-xs text-zinc-500 font-bold">
                      {mockPredictions.filter(p => p.phase === phase).length} partidos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockPredictions
                      .filter(p => p.phase === phase)
                      .map((pred) => (
                        <div key={pred.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-emerald-500/30 transition-colors">
                          <p className="text-xs text-zinc-500 mb-3">Partido #{pred.match_id}</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-black text-emerald-500">{pred.local_goals}</span>
                            <span className="text-xl font-bold text-zinc-600">-</span>
                            <span className="text-2xl font-black text-blue-500">{pred.visitor_goals}</span>
                          </div>
                          <p className="text-[10px] text-zinc-600 text-center mt-3">Predicción guardada</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-8">
              <button className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-8 py-3 rounded-lg font-bold text-sm uppercase hover:bg-zinc-700 transition-all">
                Guardar Borrador
              </button>
              <button className="bg-emerald-500 text-zinc-950 px-8 py-3 rounded-lg font-bold text-sm uppercase hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                Finalizar Pronóstico
              </button>
            </div>
          </div>
        )}

        {/* Live Tab */}
        {activeTab === 'live' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Cup 2026 Vivo</h2>
              </div>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.4em]">Resultados Oficiales Sincronizados en Tiempo Real</p>
            </div>

            {/* Live Tabs */}
            <div className="flex flex-wrap gap-2 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800 w-fit">
              {[
                { id: 'groups' as const, label: 'Grupos', icon: LayoutGrid },
                { id: 'ranking' as const, label: 'Ranking 3ros', icon: Flag },
                { id: 'standings' as const, label: 'Clasificación', icon: BarChart3 },
                { id: 'knockout' as const, label: 'Eliminatorias', icon: Zap },
                { id: 'bracket' as const, label: 'Llaves', icon: GitFork },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveLiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      activeLiveTab === tab.id
                        ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/20'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Live Content */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              {activeLiveTab === 'groups' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-black uppercase">Fase de Grupos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((group) => (
                      <div key={group} className="space-y-4">
                        <h4 className="text-lg font-black text-white">Grupo {group}</h4>
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-zinc-800 p-3 rounded-lg flex justify-between items-center">
                              <span className="text-sm font-bold text-zinc-400">Partido {i}</span>
                              <span className="text-lg font-black text-emerald-500">2-1</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeLiveTab === 'ranking' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase mb-6">Top 8 Mejores Terceros</h3>
                  <div className="space-y-2">
                    {[
                      { pos: 1, team: 'Uruguay', pts: 7, dg: 2, gf: 4 },
                      { pos: 2, team: 'Paraguay', pts: 6, dg: 1, gf: 3 },
                      { pos: 3, team: 'Colombia', pts: 6, dg: 0, gf: 3 },
                      { pos: 4, team: 'Chile', pts: 5, dg: -1, gf: 2 },
                      { pos: 5, team: 'Ecuador', pts: 4, dg: -2, gf: 1 },
                      { pos: 6, team: 'Costa Rica', pts: 3, dg: -3, gf: 1 },
                      { pos: 7, team: 'Honduras', pts: 1, dg: -4, gf: 0 },
                      { pos: 8, team: 'Panamá', pts: 0, dg: -5, gf: 0 },
                    ].map((row) => (
                      <div key={row.pos} className={`flex items-center justify-between p-4 rounded-lg ${row.pos <= 8 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-zinc-800'}`}>
                        <div className="flex items-center gap-4 flex-1">
                          <span className={`w-8 font-black text-center ${row.pos <= 8 ? 'text-emerald-500' : 'text-zinc-600'}`}>{row.pos}</span>
                          <span className="font-bold text-sm">{row.team}</span>
                        </div>
                        <div className="flex gap-6 text-sm font-bold">
                          <span className="w-6 text-right">{row.pts}</span>
                          <span className={`w-6 text-right ${row.dg > 0 ? 'text-emerald-500' : 'text-zinc-500'}`}>
                            {row.dg > 0 ? '+' : ''}{row.dg}
                          </span>
                          <span className="w-6 text-right text-zinc-600">{row.gf}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeLiveTab === 'standings' && (
                <div className="text-center py-12">
                  <p className="text-xl font-bold text-zinc-500">Tabla de Clasificación Oficial</p>
                  <p className="text-sm text-zinc-600 mt-2">Sincronizada con resultados en tiempo real</p>
                </div>
              )}

              {activeLiveTab === 'knockout' && (
                <div className="text-center py-12">
                  <p className="text-xl font-bold text-zinc-500">Partidos de Eliminatorias</p>
                  <p className="text-sm text-zinc-600 mt-2">Se mostrarán después del 25 de junio</p>
                </div>
              )}

              {activeLiveTab === 'bracket' && (
                <div className="text-center py-12">
                  <p className="text-xl font-bold text-zinc-500">Llaves del Torneo</p>
                  <p className="text-sm text-zinc-600 mt-2">Visualización de las llaves en tiempo real</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
