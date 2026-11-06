import React, { useState, useMemo } from 'react';
import { 
  Warehouse, 
  Store, 
  Plus, 
  Search, 
  ArrowRightLeft, 
  Edit3, 
  Trash2, 
  Clock, 
  AlertTriangle,
  Minus,
  Download
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatearFechaCorta, evaluarAlertaLote } from '../utils/dateUtils';
import { Lote } from '../types/inventory';

interface UbicacionViewProps {
  tipo: 'camara' | 'mural';
  onNuevoLote: (ubicacion: 'camara' | 'mural') => void;
  onEditarLote: (lote: Lote) => void;
  onTraspasarLote: (lote: Lote) => void;
}

export const UbicacionView: React.FC<UbicacionViewProps> = ({
  tipo,
  onNuevoLote,
  onEditarLote,
  onTraspasarLote
}) => {
  const { 
    camaraLotes, 
    muralLotes, 
    productos, 
    eliminarLote, 
    ajustarCajasLote,
    exportarCSV 
  } = useInventory();

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [orden, setOrden] = useState<'vencimiento' | 'retiro' | 'nombre' | 'cajas'>('retiro');

  const lotes = tipo === 'camara' ? camaraLotes : muralLotes;
  const isCamara = tipo === 'camara';

  const productoMap = useMemo(() => {
    const map = new Map<number, typeof productos[0]>();
    productos.forEach(p => map.set(p.id, p));
    return map;
  }, [productos]);

  // Extract unique categories available in this view
  const categoriasDisponibles = useMemo(() => {
    const set = new Set<string>();
    lotes.forEach(l => {
      const p = productoMap.get(l.productoId);
      if (p?.categoria) set.add(p.categoria);
    });
    return Array.from(set).sort();
  }, [lotes, productoMap]);

  // Filter and sort lotes
  const lotesFiltrados = useMemo(() => {
    return lotes
      .filter(l => {
        const prod = productoMap.get(l.productoId);
        if (!prod) return false;

        if (categoriaFiltro !== 'todas' && prod.categoria !== categoriaFiltro) {
          return false;
        }

        if (busqueda.trim()) {
          const q = busqueda.toLowerCase();
          const matchName = prod.nombre.toLowerCase().includes(q);
          const matchCat = prod.categoria.toLowerCase().includes(q);
          if (!matchName && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (orden === 'vencimiento') {
          return a.vencimiento.localeCompare(b.vencimiento);
        }
        if (orden === 'retiro') {
          return a.retiro.localeCompare(b.retiro);
        }
        if (orden === 'cajas') {
          return b.cajas - a.cajas;
        }
        if (orden === 'nombre') {
          const pA = productoMap.get(a.productoId)?.nombre || '';
          const pB = productoMap.get(b.productoId)?.nombre || '';
          return pA.localeCompare(pB);
        }
        return 0;
      });
  }, [lotes, productoMap, categoriaFiltro, busqueda, orden]);

  const totalCajas = lotesFiltrados.reduce((acc, l) => acc + l.cajas, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${
              isCamara 
                ? 'bg-blue-950/80 border border-blue-800/60 text-blue-400' 
                : 'bg-emerald-950/80 border border-emerald-800/60 text-emerald-400'
            }`}>
              {isCamara ? <Warehouse className="w-6 h-6" /> : <Store className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{isCamara ? 'Control en Cámara Frigorífica' : 'Control en Mural de Ventas'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {isCamara 
                  ? 'Almacenamiento de cortes en cajas cerradas a temperatura controlada.' 
                  : 'Vitrinas y estantes de exhibición directa al público.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportarCSV(tipo)}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Descargar listado en Excel (CSV)"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={() => onNuevoLote(tipo)}
              className={`px-4 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                isCamara 
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/50' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Ingresar Lote</span>
            </button>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por corte..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60"
            />
          </div>

          <div>
            <select
              value={categoriaFiltro}
              onChange={e => setCategoriaFiltro(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none cursor-pointer"
            >
              <option value="todas">Todas las categorías ({categoriasDisponibles.length})</option>
              {categoriasDisponibles.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={orden}
              onChange={e => setOrden(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none cursor-pointer"
            >
              <option value="retiro">Ordenar por Fecha de Retiro (Próximos)</option>
              <option value="vencimiento">Ordenar por Fecha de Vencimiento</option>
              <option value="cajas">Ordenar por Cantidad de Cajas</option>
              <option value="nombre">Ordenar por Nombre de Corte (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-3 border-t border-slate-800/60 font-medium">
          <span>{lotesFiltrados.length} lote(s) encontrados</span>
          <span className="font-bold text-white tabular-nums">Total: {totalCajas} cajas</span>
        </div>
      </div>

      {/* Lotes Table & Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {lotesFiltrados.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-300">
              No hay productos registrados en {isCamara ? 'Cámara' : 'Mural'}
            </p>
            <p className="text-xs text-slate-500">
              Haga clic en "Ingresar Lote" para registrar el primer lote de carne.
            </p>
            <button
              onClick={() => onNuevoLote(tipo)}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Lote Ahora</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-bold">
                  <th className="p-4">Corte / Marca</th>
                  <th className="p-4 text-center">Cajas (Stock)</th>
                  <th className="p-4">F. Vencimiento</th>
                  <th className="p-4">F. Retiro</th>
                  <th className="p-4">F. Alerta</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {lotesFiltrados.map(lote => {
                  const prod = productoMap.get(lote.productoId);
                  const alerta = prod ? evaluarAlertaLote(lote, prod) : null;

                  return (
                    <tr 
                      key={lote.id} 
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Corte & Brand */}
                      <td className="p-4">
                        <div className="font-extrabold text-sm text-white">
                          {prod?.nombre || 'Corte'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {prod?.categoria || 'General'}
                          {lote.notas && <span className="text-slate-500"> · {lote.notas}</span>}
                        </div>
                      </td>

                      {/* Stock with Touch Stepper */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => ajustarCajasLote(lote.id, tipo, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Restar 1 caja"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className={`w-8 font-extrabold text-sm tabular-nums text-center ${
                            isCamara ? 'text-blue-400' : 'text-emerald-400'
                          }`}>
                            {lote.cajas}
                          </span>

                          <button
                            onClick={() => ajustarCajasLote(lote.id, tipo, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Sumar 1 caja"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Expiration date */}
                      <td className="p-4 font-semibold text-white tabular-nums">
                        <div>{lote.vencimiento}</div>
                        <div className="text-[11px] text-slate-500">{formatearFechaCorta(lote.vencimiento)}</div>
                      </td>

                      {/* Withdrawal date */}
                      <td className="p-4 font-bold text-amber-300 tabular-nums">
                        <div>{lote.retiro}</div>
                        <div className="text-[10px] text-slate-500">{lote.diasRetiroAnt} días antes</div>
                      </td>

                      {/* Alert date */}
                      <td className="p-4 text-slate-300 tabular-nums">
                        <div>{lote.alertaFecha}</div>
                        <div className="text-[10px] text-slate-500">{lote.diasAlertaAnt} días antes</div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {alerta ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            alerta.estado === 'vencido' 
                              ? 'bg-red-950 text-red-200 border border-red-800/80' 
                              : alerta.estado === 'retiro_vencido' 
                              ? 'bg-red-950 text-red-300 border border-red-800/70' 
                              : alerta.estado === 'retirar_hoy' 
                              ? 'bg-amber-950 text-amber-200 border border-amber-800/80' 
                              : alerta.estado === 'alerta_activa' 
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' 
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          }`}>
                            <span>{alerta.mensaje}</span>
                          </span>
                        ) : '-'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onTraspasarLote(lote)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title={`Traspasar a ${isCamara ? 'Mural' : 'Cámara'}`}
                          >
                            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                          </button>

                          <button
                            onClick={() => onEditarLote(lote)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Editar parámetros del lote"
                          >
                            <Edit3 className="w-4 h-4 text-blue-400" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar este lote de ${prod?.nombre}?`)) {
                                eliminarLote(lote.id, tipo);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar lote"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
