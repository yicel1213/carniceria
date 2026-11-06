import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  Warehouse, 
  Store, 
  Calendar, 
  Download,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatearFechaCorta } from '../utils/dateUtils';
import { Lote } from '../types/inventory';

interface AlertasViewProps {
  onAbrirTraspaso: (lote: Lote) => void;
  onEditarLote: (lote: Lote) => void;
}

export const AlertasView: React.FC<AlertasViewProps> = ({ onAbrirTraspaso, onEditarLote }) => {
  const { alertas, exportarCSV } = useInventory();
  
  const [diasFiltro, setDiasFiltro] = useState<number>(3);
  const [filtroUbicacion, setFiltroUbicacion] = useState<'todas' | 'camara' | 'mural'>('todas');
  const [busqueda, setBusqueda] = useState<string>('');

  // Filter alerts based on criteria
  const alertasFiltradas = useMemo(() => {
    return alertas.filter(item => {
      // Location filter
      if (filtroUbicacion !== 'todas' && item.lote.ubicacion !== filtroUbicacion) {
        return false;
      }

      // Search filter
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const matchesName = item.producto.nombre.toLowerCase().includes(q);
        const matchesCat = item.producto.categoria.toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
      }

      // Anticipation filter:
      // An item is shown if:
      // 1. It is already due or overdue (diffDiasRetiro <= 0)
      // 2. OR diffDiasRetiro <= diasFiltro
      // 3. OR diffDiasAlerta <= 0
      if (diasFiltro === 999) return true; // Show all
      return item.diffDiasRetiro <= diasFiltro || item.diffDiasAlerta <= 0;
    });
  }, [alertas, filtroUbicacion, busqueda, diasFiltro]);

  // Group by product for clean presentation
  const agrupadoPorProducto = useMemo(() => {
    const map = new Map<number, {
      productoId: number;
      nombre: string;
      categoria: string;
      items: typeof alertasFiltradas;
    }>();

    alertasFiltradas.forEach(a => {
      const pId = a.producto.id;
      if (!map.has(pId)) {
        map.set(pId, {
          productoId: pId,
          nombre: a.producto.nombre,
          categoria: a.producto.categoria,
          items: []
        });
      }
      map.get(pId)!.items.push(a);
    });

    return Array.from(map.values());
  }, [alertasFiltradas]);

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Reporte de Vencimientos Próximos y Retiros
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Monitoreo preventivo de lotes en almacenamiento y vitrina para evitar vencimientos en piso.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => exportarCSV('alertas')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Exportar Reporte (CSV)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por corte o marca..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60"
            />
          </div>

          {/* Anticipation selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">Anticipación:</span>
            <select
              value={diasFiltro}
              onChange={e => setDiasFiltro(Number(e.target.value))}
              className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value={1} className="bg-slate-900 text-white">1 día de aviso</option>
              <option value={2} className="bg-slate-900 text-white">2 días de aviso</option>
              <option value={3} className="bg-slate-900 text-white">3 días de aviso (Recomendado)</option>
              <option value={5} className="bg-slate-900 text-white">5 días de aviso</option>
              <option value={7} className="bg-slate-900 text-white">7 días de aviso</option>
              <option value={999} className="bg-slate-900 text-white">Mostrar todos los lotes</option>
            </select>
          </div>

          {/* Location segmented buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setFiltroUbicacion('todas')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filtroUbicacion === 'todas' 
                  ? 'bg-slate-800 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroUbicacion('camara')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filtroUbicacion === 'camara' 
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60 shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cámara
            </button>
            <button
              onClick={() => setFiltroUbicacion('mural')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filtroUbicacion === 'mural' 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mural
            </button>
          </div>

        </div>
      </div>

      {/* Alerts Table / Grouped list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {agrupadoPorProducto.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              No hay alertas pendientes para este criterio
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Todos los lotes en Cámara y Mural se encuentran dentro de sus plazos normales de retiro y consumo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {agrupadoPorProducto.map(grupo => (
              <div key={grupo.productoId} className="p-4 sm:p-5 space-y-3 hover:bg-slate-850/30 transition-colors">
                
                {/* Product Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-white">
                      {grupo.nombre}
                    </h3>
                    <span className="text-xs text-slate-400">
                      · {grupo.categoria}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {grupo.items.length} lote(s) con aviso
                  </span>
                </div>

                {/* Batches Sublist */}
                <div className="space-y-2">
                  {grupo.items.map(item => {
                    const l = item.lote;
                    const isCamara = l.ubicacion === 'camara';

                    // Determine tag style based on severity
                    let estadoBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
                    let estadoIcon = <Clock className="w-3.5 h-3.5" />;
                    
                    if (item.estado === 'vencido') {
                      estadoBadgeClass = 'bg-red-950 text-red-200 border-red-800/80';
                      estadoIcon = <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
                    } else if (item.estado === 'retiro_vencido') {
                      estadoBadgeClass = 'bg-red-950 text-red-300 border-red-800/80';
                      estadoIcon = <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
                    } else if (item.estado === 'retirar_hoy') {
                      estadoBadgeClass = 'bg-amber-950 text-amber-200 border-amber-700/80';
                      estadoIcon = <Clock className="w-3.5 h-3.5 text-amber-400" />;
                    } else if (item.estado === 'alerta_activa') {
                      estadoBadgeClass = 'bg-amber-950/60 text-amber-300 border-amber-800/50';
                      estadoIcon = <Clock className="w-3.5 h-3.5 text-amber-400" />;
                    }

                    return (
                      <div 
                        key={l.id}
                        className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        {/* Batch Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                          {/* Ubicacion label */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${
                            isCamara 
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-800/50' 
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                          }`}>
                            {isCamara ? <Warehouse className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                            <span>{isCamara ? 'Cámara' : 'Mural'}</span>
                          </span>

                          <span className="font-extrabold text-white text-sm tabular-nums">
                            {l.cajas} {l.cajas === 1 ? 'caja' : 'cajas'}
                          </span>

                          <div className="text-slate-300 flex items-center gap-1">
                            <span className="text-slate-500">Vence:</span>
                            <span className="font-semibold text-white tabular-nums">{l.vencimiento}</span>
                            <span className="text-slate-400 text-[11px]">({formatearFechaCorta(l.vencimiento)})</span>
                          </div>

                          <div className="text-slate-300 flex items-center gap-1">
                            <span className="text-slate-500">Retiro:</span>
                            <span className="font-bold text-amber-300 tabular-nums">{l.retiro}</span>
                            <span className="text-slate-500 text-[10px]">({l.diasRetiroAnt}d antes)</span>
                          </div>

                          <div className="text-slate-400 flex items-center gap-1">
                            <span className="text-slate-500">Aviso:</span>
                            <span className="tabular-nums text-slate-300">{l.alertaFecha}</span>
                          </div>
                        </div>

                        {/* Status Label & Actions */}
                        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${estadoBadgeClass}`}>
                            {estadoIcon}
                            <span>{item.mensaje}</span>
                          </span>

                          {isCamara && (
                            <button
                              onClick={() => onAbrirTraspaso(l)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Traspasar cajas de este lote a Mural"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Traspasar</span>
                            </button>
                          )}

                          <button
                            onClick={() => onEditarLote(l)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
