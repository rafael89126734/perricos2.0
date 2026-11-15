import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Envoltorio de seguridad para cada pestaña del panel admin:
 * si un componente lanza un error en render, se muestra un mensaje
 * en lugar de dejar la pantalla completamente en blanco.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Perricos Admin] Error en la pestaña:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="card p-10 bg-white text-center max-w-xl mx-auto">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <AlertTriangle size={26} />
          </div>
          <h3 className="font-display text-2xl text-[var(--bosque)] mb-2">
            Algo salió mal en esta sección
          </h3>
          <p className="text-sm text-[var(--tinta-suave)] mb-2">
            Ocurrió un error al mostrar <span className="font-bold">{this.props.tab || 'esta pestaña'}</span>.
            El resto del panel sigue funcionando.
          </p>
          <p className="text-xs text-[var(--tinta-suave)]/70 mb-6 font-mono break-words">
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="btn-primary px-6 py-3 text-[11px] uppercase tracking-[0.14em]"
          >
            <RotateCcw size={15} /> Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
