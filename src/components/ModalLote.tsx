import React, { useState, useEffect } from 'react';
import { 
  X, 
  Warehouse, 
  Store, 
  Plus, 
  Trash2, 
  Calendar,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Lote, FilaFechaForm } from '../types/inventory';
import { getHoyISO, sumarDias, calcularFechasLote, formatearFechaCorta } from '../utils/dateUtils';

interface ModalLoteProps {
  abierto: boolean;
  ubicacionInicial?: 'camara' | 'mural';
  loteAEditar?: Lote | null;
  onCerrar: () => void;
  onExito: (mensaje: string) => void;
}

export const ModalLote: React.FC<ModalLoteProps> = ({
  abierto,
  ubicacionInicial = 'camara',
  loteAEditar,
  onCerrar,
  onExito
}) => {
  const { 
    productos, 
    categorias, 
    agregarMultiplesLotes, 
    editarLote 
  } = useInventory();

  const hoyStr = getHoyISO();

  // Form states
  const [categoriaSel, setCategoriaSel] = useState<string>('Farmer');
  const [otraCategoria, setOtraCategoria] = useState<string>('');
  const [productoSel, setProductoSel] = useState<string>('1');
  const [otroCorteNombre, setOtroCorteNombre] = useState<string>('');

  const [ubicacionSel, setUbicacionSel] = useState<'camara' | 'mural' | 'ambos'>(ubicacionInicial);
  const [cajasSimple, setCajasSimple] = useState<number>(1);
  const [cajasCamara, setCajasCamara] = useState<number>(1);
  const [cajasMural, setCajasMural] = useState<number>(1);
  const [notas, setNotas] = useState<string>('');

  // Fechas array (up to 10)
  const [filasFechas, setFilasFechas] = useState<FilaFechaForm[]>([
    {
      id: 'f-init',
      vencimiento: sumarDias(hoyStr, 15),
      diasRetiroAnt: 2,
      diasAlertaAnt: 1
    }
  ]);

  // Synchronize when modal opens or edits
  useEffect(() => {
    if (loteAEditar) {
      const prod = productos.find(p => p.id === loteAEditar.productoId);
      if (prod) {
        setCategoriaSel(prod.categoria);
        setProductoSel(String(prod.id));
      }
      setUbicacionSel(loteAEditar.ubicacion);
      setCajasSimple(loteAEditar.cajas);
      setNotas(loteAEditar.notas || '');
      setFilasFechas([
        {
          id: 'f-edit',
          vencimiento: loteAEditar.vencimiento,
          diasRetiroAnt: loteAEditar.diasRetiroAnt,
          diasAlertaAnt: loteAEditar.diasAlertaAnt
        }
      ]);
    } else {
      setUbicacionSel(ubicacionInicial);
      setCajasSimple(1);
      setCajasCamara(1);
      setCajasMural(1);
      setNotas('');
      setCategoriaSel(categorias[0] || 'Farmer');
      setProductoSel(productos[0]?.id ? String(productos[0].id) : 'otro');
      setOtraCategoria('');
      setOtroCorteNombre('');
      setFilasFechas([
        {
          id: `f-${Date.now()}`,
          vencimiento: sumarDias(hoyStr, 15),
          diasRetiroAnt: 2,
          diasAlertaAnt: 1
        }
      ]);
    }
  }, [abierto, loteAEditar, ubicacionInicial, productos, categorias, hoyStr]);

  if (!abierto) return null;

  const handleAgregarFilaFecha = () => {
    if (filasFechas.length >= 10) return;
    const ultima = filasFechas[filasFechas.length - 1];
    setFilasFechas(prev => [
      ...prev,
      {
        id: `f-${Date.now()}-${Math.random()}`,
        vencimiento: ultima ? sumarDias(ultima.vencimiento, 7) : sumarDias(hoyStr, 15),
        diasRetiroAnt: ultima?.diasRetiroAnt ?? 2,
        diasAlertaAnt: ultima?.diasAlertaAnt ?? 1
      }
    ]);
  };

  const handleEliminarFilaFecha = (id: string) => {
    if (filasFechas.length <= 1) return;
    setFilasFechas(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdateFila = (id: string, campo: keyof FilaFechaForm, val: any) => {
    setFilasFechas(prev => prev.map(f => {
      if (f.id === id) return { ...f, [campo]: val };
      return f;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const catFinal = categoriaSel === 'otro' ? otraCategoria.trim() : categoriaSel;
    if (!catFinal) return;

    if (loteAEditar) {
      // Editing existing single lote
      const f = filasFechas[0];
      editarLote(loteAEditar.id, loteAEditar.ubicacion, {
        cajas: cajasSimple,
        vencimiento: f.vencimiento,
        diasRetiroAnt: f.diasRetiroAnt,
        diasAlertaAnt: f.diasAlertaAnt,
        notas: notas.trim() || undefined
      });
      onExito('Lote actualizado correctamente.');
      onCerrar();
      return;
    }

    // Creating new lote(s)
    const isNuevoProd = productoSel === 'otro';
    const res = agregarMultiplesLotes({
      productoId: isNuevoProd ? undefined : Number(productoSel),
      nuevoProductoNombre: isNuevoProd ? otroCorteNombre.trim() : undefined,
      categoria: catFinal,
      ubicacion: ubicacionSel,
      cajasSimple,
      cajasCamara,
      cajasMural,
      filasFechas,
      notas: notas.trim() || undefined
    });

    if (res.ok) {
      onExito(res.mensaje);
      onCerrar();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg">
              {loteAEditar ? 'Editar Parámetros de Lote' : 'Ingresar Producto y Lote'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {loteAEditar ? 'Modificar cantidades o plazos de retiro' : 'Recepción de carne en almacenamiento o vitrinas'}
            </p>
          </div>
          <button 
            onClick={onCerrar}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Categoria / Marca */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Categoría / Marca
            </label>
            <select
              value={categoriaSel}
              onChange={e => setCategoriaSel(e.target.value)}
              disabled={!!loteAEditar}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 disabled:opacity-60"
            >
              {categorias.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="otro">+ Otra categoría...</option>
            </select>

            {categoriaSel === 'otro' && !loteAEditar && (
              <input
                type="text"
                value={otraCategoria}
                onChange={e => setOtraCategoria(e.target.value)}
                placeholder="Nombre de la nueva categoría..."
                required
                className="mt-2 w-full bg-slate-950 border border-red-500/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
              />
            )}
          </div>

          {/* Corte / Producto */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre Producto (Corte)
            </label>
            <select
              value={productoSel}
              onChange={e => setProductoSel(e.target.value)}
              disabled={!!loteAEditar}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 disabled:opacity-60"
            >
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.categoria})
                </option>
              ))}
              <option value="otro">+ Otro corte nuevo...</option>
            </select>

            {productoSel === 'otro' && !loteAEditar && (
              <input
                type="text"
                value={otroCorteNombre}
                onChange={e => setOtroCorteNombre(e.target.value)}
                placeholder="Nombre del nuevo corte de carne..."
                required
                className="mt-2 w-full bg-slate-950 border border-red-500/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
              />
            )}
          </div>

          {/* Location & Stock */}
          {!loteAEditar && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Ubicación del Stock
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setUbicacionSel('camara')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    ubicacionSel === 'camara'
                      ? 'bg-blue-950/80 border-blue-600 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Warehouse className="w-3.5 h-3.5" />
                  <span>Cámara</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUbicacionSel('mural')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    ubicacionSel === 'mural'
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Mural</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUbicacionSel('ambos')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    ubicacionSel === 'ambos'
                      ? 'bg-purple-950/80 border-purple-600 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Ambos</span>
                </button>
              </div>
            </div>
          )}

          {/* Boxes Input */}
          {ubicacionSel !== 'ambos' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stock (Cantidad de Cajas)
              </label>
              <input
                type="number"
                min="1"
                value={cajasSimple}
                onChange={e => setCajasSimple(Math.max(1, Number(e.target.value)))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-blue-400 mb-1">
                  Cajas en Cámara
                </label>
                <input
                  type="number"
                  min="0"
                  value={cajasCamara}
                  onChange={e => setCajasCamara(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">
                  Cajas en Mural
                </label>
                <input
                  type="number"
                  min="0"
                  value={cajasMural}
                  onChange={e => setCajasMural(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white"
                />
              </div>
            </div>
          )}

          {/* Dates & Expirations */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300">
                Fechas y Parámetros ({filasFechas.length} {filasFechas.length === 1 ? 'fecha' : 'fechas'})
              </label>
              {!loteAEditar && filasFechas.length < 10 && (
                <button
                  type="button"
                  onClick={handleAgregarFilaFecha}
                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir Fecha</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filasFechas.map((f, i) => {
                const { retiro, alertaFecha } = calcularFechasLote(f.vencimiento, f.diasRetiroAnt, f.diasAlertaAnt);
                return (
                  <div key={f.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Vencimiento</label>
                        <input
                          type="date"
                          value={f.vencimiento}
                          onChange={e => handleUpdateFila(f.id, 'vencimiento', e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Días antes retiro</label>
                        <input
                          type="number"
                          min="0"
                          value={f.diasRetiroAnt}
                          onChange={e => handleUpdateFila(f.id, 'diasRetiroAnt', Math.max(0, Number(e.target.value)))}
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Días alerta antes</label>
                        <input
                          type="number"
                          min="0"
                          value={f.diasAlertaAnt}
                          onChange={e => handleUpdateFila(f.id, 'diasAlertaAnt', Math.max(0, Number(e.target.value)))}
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white text-center"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span>Retiro: <strong className="text-amber-300 tabular-nums">{retiro}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Alerta: <strong className="text-slate-200 tabular-nums">{alertaFecha}</strong></span>
                      </div>
                      {!loteAEditar && filasFechas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleEliminarFilaFecha(f.id)}
                          className="text-red-400 hover:text-red-300 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onCerrar}
              className="w-1/2 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md cursor-pointer"
            >
              {loteAEditar ? 'Guardar Cambios' : 'Guardar Lote(s)'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
