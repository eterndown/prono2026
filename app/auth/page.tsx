'use client'

import React, { useState } from 'react';
import { Trophy, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        console.log('Registrando usuario:', formData);
      } else {
        console.log('Iniciando sesión:', { username: formData.username, password: formData.password });
      }

      setTimeout(() => {
        setLoading(false);
        alert(isRegistering ? 'Registro completado' : 'Inicio de sesión completado');
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 text-zinc-100 font-sans">
      <div className="w-full max-w-md bg-zinc-900 p-8 sm:p-10 rounded-[2.5rem] border border-zinc-800 text-center space-y-8 shadow-2xl animate-in fade-in zoom-in duration-500">
        <Trophy className="w-16 h-16 text-emerald-500 mx-auto" />

        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
            Mundial 2026
          </h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">
            {isRegistering ? 'Crear nueva cuenta' : 'Portal de Acceso'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isRegistering && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
              <input
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 placeholder-zinc-600"
              />
              <input
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 placeholder-zinc-600"
              />
            </div>
          )}

          {isRegistering && (
            <input
              name="email"
              type="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 placeholder-zinc-600"
            />
          )}

          <input
            name="username"
            placeholder="Usuario"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 placeholder-zinc-600"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 pr-10 placeholder-zinc-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-emerald-500 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 p-4 rounded-xl font-black uppercase text-xs tracking-widest text-zinc-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : isRegistering ? (
              'Registrar Cuenta'
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <div className="space-y-4 pt-4 border-t border-zinc-800/50 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setShowPassword(false);
              setFormData({ nombre: '', apellido: '', email: '', username: '', password: '' });
            }}
            className="text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400 tracking-widest transition-colors"
          >
            {isRegistering
              ? '¿Ya tienes cuenta? Ingresa aquí'
              : '¿No tienes cuenta? Regístrate'}
          </button>

          <div className="pt-4">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Prueba rápida:</p>
            <a
              href="/preview"
              className="inline-block bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-[10px] font-bold uppercase text-emerald-500 transition-colors"
            >
              Ver Vista Preview
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
