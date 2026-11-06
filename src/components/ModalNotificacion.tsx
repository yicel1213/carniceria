import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface NotificacionInfo {
  titulo: string;
  mensaje: string;
  tipo?: 'exito' | 'advertencia' | 'error';
}

interface ModalNotificacionProps {
  info: NotificacionInfo | null;
  onCerrar: () => void;
}

export const ModalNotificacion: React.FC<ModalNotificacionProps> = ({ info, onCerrar }) => {
  if (!info) return null;

  const tipo = info.tipo || 'exito';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Icon */}
        <div className="flex justify-center">
          {tipo === 'exito' && (
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          )}
          {tipo === 'advertencia' && (
            <div className="w-14 h-14 rounded-full bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
          )}
          {tipo === 'error' && (
            <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">
            {info.titulo}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {info.mensaje}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onCerrar}
          className="w-full py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-950/40 cursor-pointer"
        >
          Aceptar
        </button>

      </div>
    </div>
  );
};
