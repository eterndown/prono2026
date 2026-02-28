'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Users, Settings, LogOut, Loader2 } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  is_frozen: boolean;
}

interface Prediction {
  id: string;
  match_id: number;
  local_goals: string;
  visitor_goals: string;
}

export default function TournamentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'admin'>('overview');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, email, is_admin, is_frozen')
        .eq('id', authUser.id)
        .maybeSingle();

      if (userError) throw userError;

      if (userData) {
        setUser(userData as User);

        const { data: predictionsData } = await supabase
          .from('predictions')
          .select('id, match_id, local_goals, visitor_goals')
          .eq('user_id', authUser.id)
          .order('match_id');

        if (predictionsData) {
          setPredictions(predictionsData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <Trophy className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <p className="text-xl font-bold mb-4">Inicia sesión para continuar</p>
          <p className="text-zinc-400">Por favor, utiliza la autenticación de Supabase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
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
              {user.is_admin && (
                <span className="text-xs text-emerald-500 font-bold">Administrador</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-rose-500/10 hover:bg-rose-500 px-4 py-2 rounded-lg border border-rose-500/20 text-rose-500 hover:text-white font-bold text-xs uppercase transition-all"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-zinc-900/50 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Panel General
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-all ${
              activeTab === 'predictions'
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Predicciones ({predictions.length})
          </button>
          {user.is_admin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-all ${
                activeTab === 'admin'
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Admin
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-2">Estado</h3>
                <p className="text-3xl font-black text-emerald-500">
                  {user.is_frozen ? 'Finalizado' : 'Activo'}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-2">Predicciones</h3>
                <p className="text-3xl font-black text-white">{predictions.length}/104</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-2">Rol</h3>
                <p className="text-3xl font-black text-blue-500">
                  {user.is_admin ? 'Admin' : 'Usuario'}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-black uppercase mb-4">Información del Torneo</h2>
              <div className="space-y-3 text-zinc-400">
                <p>✓ 104 partidos totales</p>
                <p>✓ 4 fases: Grupos, Dieciseisavos, Octavos, Cuartos, Semis, 3er Puesto, Final</p>
                <p>✓ Sistema de predicciones en tiempo real</p>
                {user.is_frozen && <p className="text-emerald-500 font-bold">✓ Tu pronóstico está finalizado y protegido</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase">Mis Predicciones</h2>
            {predictions.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                <p className="text-zinc-400">No hay predicciones aún</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictions.slice(0, 9).map((pred) => (
                  <div key={pred.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <p className="text-xs text-zinc-500 mb-2">Partido #{pred.match_id}</p>
                    <p className="text-lg font-black">
                      {pred.local_goals} - {pred.visitor_goals}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && user.is_admin && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase">Panel de Administración</h2>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
              <p className="text-amber-500 font-bold">Panel en construcción</p>
              <p className="text-amber-500 text-sm">Próximamente: gestión de resultados oficiales, usuarios y configuración</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
