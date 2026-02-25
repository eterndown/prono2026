
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../services/errorLogger';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  /**
   * Making children optional fixes potential errors when ErrorBoundary is used as a wrapper.
   */
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Standard React Error Boundary component.
 */
// Use Component directly from 'react' to ensure proper inheritance and type recognition.
class ErrorBoundary extends Component<Props, State> {
  // Explicitly declare props and state properties for better TypeScript inference and to fix "Property 'props' does not exist" and "Property 'state' does not exist" errors.
  public props: Props;
  public state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
    // Manually assign props to ensure visibility in certain TypeScript environments.
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our custom logger service.
    logger.log(`Render Error: ${error.message}`, 'error', {
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  private handleReset = () => {
    // Clear local data and redirect to a clean URL to recover from potential state-related crashes.
    localStorage.removeItem('fifa_predictions');
    window.location.href = window.location.pathname;
  };

  public render() {
    // Correctly accessing state inherited from Component.
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-8 bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">¡Algo salió mal!</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Se ha detectado un error crítico en el pronóstico. Los detalles han sido registrados para su análisis.
              </p>
            </div>

            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-left overflow-hidden">
              <p className="text-[10px] font-mono text-rose-400 break-words line-clamp-3">
                {this.state.error?.message}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-emerald-500 p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all text-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar Carga
              </button>
              <button 
                onClick={this.handleReset}
                className="w-full bg-zinc-800 p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-700 transition-all text-xs text-zinc-400 flex items-center justify-center gap-2 border border-zinc-700"
              >
                <Home className="w-4 h-4" /> Resetear Datos Locales
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Access children from props inherited from Component.
    return this.props.children;
  }
}

export default ErrorBoundary;
