import React, { useState } from 'react';
import { 
  DownloadCloud, 
  UploadCloud, 
  FileSpreadsheet, 
  Smartphone, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  HardDrive
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const RespaldoView: React.FC = () => {
  const { 
    exportarDatosJSON, 
    exportarCSV, 
    importarDatosJSON, 
    restablecerDatos, 
    stats 
  } = useInventory();

  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contenido = event.target?.result as string;
      const res = importarDatosJSON(contenido);
      if (res.ok) {
        setFeedback({ tipo: 'ok', texto: '¡Copia de seguridad restaurada con éxito!' });
      } else {
        setFeedback({ tipo: 'error', texto: res.mensaje });
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('¿Está seguro de restablecer el inventario a los datos iniciales de prueba? Se reemplazarán los datos actuales.')) {
      restablecerDatos();
      setFeedback({ tipo: 'ok', texto: 'Datos restablecidos a la configuración inicial de prueba.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Instalación Móvil y Respaldos
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Instale la aplicación en su teléfono y gestione copias de seguridad de sus cortes y lotes.
            </p>
          </div>
        </div>

        {feedback && (
          <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 text-xs sm:text-sm font-semibold shadow-md ${
            feedback.tipo === 'ok' 
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' 
              : 'bg-red-950/80 border-red-800 text-red-200'
          }`}>
            {feedback.tipo === 'ok' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{feedback.texto}</span>
          </div>
        )}
      </div>

      {/* PWA Mobile Installation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">
            Cómo Usar como App en tu Celular (PWA)
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Esta aplicación web está diseñada para funcionar a pantalla completa en teléfonos inteligentes y tablets de carnicería sin necesidad de pasar por tiendas de aplicaciones.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Android */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>En Android (Google Chrome)</span>
            </div>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Abra este enlace en el navegador <strong>Chrome</strong>.</li>
              <li>Toque el botón de opciones <strong>(tres puntos verticales arriba a la derecha)</strong>.</li>
              <li>Seleccione <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
              <li>Tendrá el ícono directo en su pantalla con acceso instantáneo.</li>
            </ol>
          </div>

          {/* iPhone */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>En iPhone (Safari)</span>
            </div>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Abra este enlace en el navegador <strong>Safari</strong>.</li>
              <li>Toque el botón <strong>Compartir</strong> (ícono de cuadro con flecha hacia arriba).</li>
              <li>Desplace hacia abajo y elija <strong>"Agregar al inicio"</strong>.</li>
              <li>Toque "Agregar" para tener la app instalada en su pantalla.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Export & Backup Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            Exportar y Respaldar Inventario
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Descargue sus datos en cualquier momento para auditorías, impresión o para transferir a otro equipo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Download CSV for Excel */}
          <button
            onClick={() => exportarCSV('todos')}
            className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all text-left flex items-start gap-3 group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Descargar Excel (CSV)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Planilla compatible con Microsoft Excel, Google Sheets y LibreOffice.
              </p>
            </div>
          </button>

          {/* Download JSON Backup */}
          <button
            onClick={exportarDatosJSON}
            className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all text-left flex items-start gap-3 group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/60 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Copia de Seguridad (JSON)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Archivo completo de restauración para migrar a otro teléfono o tablet.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Restore & Reset Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <UploadCloud className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">
            Restaurar y Reinicio de Datos
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <div>
            <h4 className="text-sm font-bold text-white">Importar Copia de Seguridad</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Cargue un archivo .json generado previamente para reestablecer su stock.
            </p>
          </div>
          <label className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer text-center shrink-0">
            <span>Seleccionar Archivo JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleArchivoSeleccionado}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-red-950/20 border border-red-900/40 rounded-xl">
          <div>
            <h4 className="text-sm font-bold text-white">Restablecer Datos de Demostración</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Restaura los 10 cortes de ejemplo y lotes sincronizados con la fecha de hoy.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-bold text-red-300 hover:text-white bg-red-950/80 hover:bg-red-800 border border-red-800/80 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Restablecer a Ejemplo
          </button>
        </div>
      </div>

    </div>
  );
};
