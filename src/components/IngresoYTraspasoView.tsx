import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  ArrowRightLeft, 
  History, 
  Plus, 
  Trash2, 
  Warehouse, 
  Store, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { FilaFechaForm } from '../types/inventory';
import { getHoyISO, sumarDias, calcularFechasLote, formatearFechaCorta } from '../utils/dateUtils';

interface IngresoYTraspasoViewProps {
  subTabInicial?: 'nuevo' | 'traspaso' | 'historial';
  lotePreseleccionado?: { id: number; ubicacion: 'camara' | 'mural'; productoId: number } | null;
  onExito?: () => void;
}

export const IngresoYTraspasoView: React.FC<IngresoYTraspasoViewProps> = ({
  subTabInicial = 'nuevo',
  lotePreseleccionado,
  onExito
}) => {
  const {
    productos,
    categorias,
    camaraLotes,
    muralLotes,
    traspasos,
    agregarMultiplesLotes,
    ejecutarTraspaso
  } = useInventory();

  const [subTab, setSubTab] = useState<'nuevo' | 'traspaso' | 'historial'>(subTabInicial);
  const [mensajeFeedback, setMensajeFeedback] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Form State: Ingresar Nuevo Lote
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(categorias[0] || 'Farmer');
  const [otraCategoria, setOtraCategoria] = useState<string>('');
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>(productos[0]?.id ? String(productos[0].id) : 'otro');
  const [otroProductoNombre, setOtroProductoNombre] = useState<string>('');
  
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<'camara' | 'mural' | 'ambos'>('camara');
  const [cajasSimple, setCajasSimple] = useState<number>(1);
  const [cajasCamara, setCajasCamara] = useState<number>(1);
  const [cajasMural, setCajasMural] = useState<number>(1);
  const [notas, setNotas] = useState<string>('');

  // Fechas (up to 10 rows)
  const hoyStr = getHoyISO();
  const [filasFechas, setFilasFechas] = useState<FilaFechaForm[]>([
    {
      id: 'f-1',
      vencimiento: sumarDias(hoyStr, 15),
      diasRetiroAnt: 2,
      diasAlertaAnt: 1
    }
  ]);

  // Form State: Traspaso
  const [traspasoProductoId, setTraspasoProductoId] = useState<number>(
    lotePreseleccionado?.productoId || productos[0]?.id || 1
  );
  const [traspasoOrigen, setTraspasoOrigen] = useState<'camara' | 'mural'>(
    lotePreseleccionado?.ubicacion || 'camara'
  );
  const [traspasoDestino, setTraspasoDestino] = useState<'camara' | 'mural'>(
    lotePreseleccionado?.ubicacion === 'mural' ? 'camara' : 'mural'
  );
  const [traspasoLoteId, setTraspasoLoteId] = useState<number>(
    lotePreseleccionado?.id || 0
  );
  const [traspasoCajas, setTraspasoCajas] = useState<number>(1);

  // If preselected lote is passed, activate traspaso tab
  useEffect(() => {
    if (lotePreseleccionado) {
      setSubTab('traspaso');
      setTraspasoOrigen(lotePreseleccionado.ubicacion);
      setTraspasoDestino(lotePreseleccionado.ubicacion === 'camara' ? 'mural' : 'camara');
      setTraspasoProductoId(lotePreseleccionado.productoId);
      setTraspasoLoteId(lotePreseleccionado.id);
    }
  }, [lotePreseleccionado]);

  // Filter available lotes for transfer based on selected product and source
  const lotesOrigenDisponibles = (traspasoOrigen === 'camara' ? camaraLotes : muralLotes).filter(
    l => l.productoId === traspasoProductoId
  );

  // Ensure selected lote in transfer is valid
  useEffect(() => {
    if (lotesOrigenDisponibles.length > 0) {
      if (!lotesOrigenDisponibles.some(l => l.id === traspasoLoteId)) {
        setTraspasoLoteId(lotesOrigenDisponibles[0].id);
      }
    } else {
      setTraspasoLoteId(0);
    }
  }, [traspasoProductoId, traspasoOrigen, lotesOrigenDisponibles]);

  // Add date row (up to 10)
  const handleAgregarFilaFecha = () => {
    if (filasFechas.length >= 10) {
      setMensajeFeedback({ tipo: 'error', texto: 'Límite alcanzado: máximo 10 fechas por registro.' });
      return;
    }
    const ultima = filasFechas[filasFechas.length - 1];
    const nuevaFecha = ultima ? sumarDias(ultima.vencimiento, 7) : sumarDias(hoyStr, 15);
    setFilasFechas(prev => [
      ...prev,
      {
        id: `f-${Date.now()}-${Math.random()}`,
        vencimiento: nuevaFecha,
        diasRetiroAnt: ultima ? ultima.diasRetiroAnt : 2,
        diasAlertaAnt: ultima ? ultima.diasAlertaAnt : 1
      }
    ]);
  };

  const handleEliminarFilaFecha = (id: string) => {
    if (filasFechas.length <= 1) {
      setMensajeFeedback({ tipo: 'error', texto: 'Debe mantener al menos una fecha de vencimiento.' });
      return;
    }
    setFilasFechas(prev => prev.filter(f => f.id !== id));
  };

  const handleActualizarFilaFecha = (id: string, campo: keyof FilaFechaForm, valor: any) => {
    setFilasFechas(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, [campo]: valor };
      }
      return f;
    }));
  };

  // Submit Ingreso
  const handleGuardarIngreso = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeFeedback(null);

    const catFinal = categoriaSeleccionada === 'otro' ? otraCategoria.trim() : categoriaSeleccionada;
    if (!catFinal) {
      setMensajeFeedback({ tipo: 'error', texto: 'Por favor escriba el nombre de la categoría.' });
      return;
    }

    const isNuevoProd = productoSeleccionado === 'otro';
    if (isNuevoProd && !otroProductoNombre.trim()) {
      setMensajeFeedback({ tipo: 'error', texto: 'Por favor escriba el nombre del nuevo corte.' });
      return;
    }

    const res = agregarMultiplesLotes({
      productoId: isNuevoProd ? undefined : Number(productoSeleccionado),
      nuevoProductoNombre: isNuevoProd ? otroProductoNombre.trim() : undefined,
      categoria: catFinal,
      ubicacion: ubicacionSeleccionada,
      cajasSimple,
      cajasCamara,
      cajasMural,
      filasFechas,
      notas: notas.trim() || undefined
    });

    if (res.ok) {
      setMensajeFeedback({ tipo: 'ok', texto: res.mensaje });
      // Reset form
      setCajasSimple(1);
      setCajasCamara(1);
      setCajasMural(1);
      setNotas('');
      setOtroProductoNombre('');
      if (onExito) {
        setTimeout(onExito, 1200);
      }
    } else {
      setMensajeFeedback({ tipo: 'error', texto: res.mensaje });
    }
  };

  // Submit Traspaso
  const handleEjecutarTraspaso = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeFeedback(null);

    if (!traspasoLoteId) {
      setMensajeFeedback({ tipo: 'error', texto: 'Seleccione un lote de origen válido.' });
      return;
    }

    const res = ejecutarTraspaso({
      productoId: traspasoProductoId,
      loteId: traspasoLoteId,
      origen: traspasoOrigen,
      destino: traspasoDestino,
      cajas: traspasoCajas
    });

    if (res.ok) {
      setMensajeFeedback({ tipo: 'ok', texto: res.mensaje });
      setTraspasoCajas(1);
      if (onExito) {
        setTimeout(onExito, 1200);
      }
    } else {
      setMensajeFeedback({ tipo: 'error', texto: res.mensaje });
    }
  };

  // Find currently selected transfer batch for info display
  const loteOrigenActual = lotesOrigenDisponibles.find(l => l.id === traspasoLoteId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <button
          onClick={() => { setSubTab('nuevo'); setMensajeFeedback(null); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'nuevo'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ingresar Producto</span>
        </button>

        <button
          onClick={() => { setSubTab('traspaso'); setMensajeFeedback(null); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'traspaso'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Traspaso (Cámara ⇄ Mural)</span>
        </button>

        <button
          onClick={() => { setSubTab('historial'); setMensajeFeedback(null); }}
          className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'historial'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Ver registro de traspasos"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Historial</span>
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {mensajeFeedback && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all shadow-md ${
          mensajeFeedback.tipo === 'ok' 
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' 
            : 'bg-red-950/80 border-red-800 text-red-200'
        }`}>
          {mensajeFeedback.tipo === 'ok' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{mensajeFeedback.texto}</span>
        </div>
      )}

      {/* Subtab 1: Formulario Ingresar Producto */}
      {subTab === 'nuevo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-red-500" />
              <span>Formulario de Ingreso de Producto y Lotes</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Registre corte, marca, ubicación de almacenamiento y hasta 10 fechas de vencimiento simultáneas.
            </p>
          </div>

          <form onSubmit={handleGuardarIngreso} className="space-y-5">
            
            {/* 1. Categoría / Marca */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoría / Marca
              </label>
              <select
                value={categoriaSeleccionada}
                onChange={e => setCategoriaSeleccionada(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="otro">+ Nueva categoría (Escribir nombre)...</option>
              </select>

              {categoriaSeleccionada === 'otro' && (
                <input
                  type="text"
                  value={otraCategoria}
                  onChange={e => setOtraCategoria(e.target.value)}
                  placeholder="Escriba el nombre de la nueva categoría (Ej. Cabaña Las Lilas)..."
                  required
                  className="mt-2 w-full bg-slate-950 border border-red-500/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                />
              )}
            </div>

            {/* 2. Corte / Producto */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre de Producto (Corte)
              </label>
              <select
                value={productoSeleccionado}
                onChange={e => setProductoSeleccionado(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
              >
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.categoria})
                  </option>
                ))}
                <option value="otro">+ Nuevo Corte (Escribir nombre)...</option>
              </select>

              {productoSeleccionado === 'otro' && (
                <input
                  type="text"
                  value={otroProductoNombre}
                  onChange={e => setOtroProductoNombre(e.target.value)}
                  placeholder="Escriba el nombre del nuevo corte (Ej. Tomahawk Angus)..."
                  required
                  className="mt-2 w-full bg-slate-950 border border-red-500/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                />
              )}
            </div>

            {/* 3. Ubicación & Stock */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Ubicación (¿Dónde se guardará ese stock?)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setUbicacionSeleccionada('camara')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    ubicacionSeleccionada === 'camara'
                      ? 'bg-blue-950/80 border-blue-600 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Warehouse className="w-4 h-4" />
                  <span>Cámara</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUbicacionSeleccionada('mural')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    ubicacionSeleccionada === 'mural'
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Mural</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUbicacionSeleccionada('ambos')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    ubicacionSeleccionada === 'ambos'
                      ? 'bg-purple-950/80 border-purple-600 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Warehouse className="w-3.5 h-3.5" />
                    <span>+</span>
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <span>Ambos</span>
                </button>
              </div>

              {/* Stock Inputs based on selected location */}
              {ubicacionSeleccionada !== 'ambos' ? (
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Cantidad de Cajas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cajasSimple}
                    onChange={e => setCajasSimple(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-blue-400 mb-1">
                      Cajas en Cámara
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={cajasCamara}
                      onChange={e => setCajasCamara(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Fechas y Parámetros (Hasta 10 fechas) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Fechas de Vencimiento ({filasFechas.length}/10)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Cálculo automático de fecha de retiro y aviso preventivo.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAgregarFilaFecha}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Fecha</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {filasFechas.map((fila, idx) => {
                  const { retiro, alertaFecha } = calcularFechasLote(fila.vencimiento, fila.diasRetiroAnt, fila.diasAlertaAnt);

                  return (
                    <div 
                      key={fila.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-900 pb-1.5">
                        <span>Lote #{idx + 1}</span>
                        {filasFechas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEliminarFilaFecha(fila.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded"
                            title="Eliminar esta fecha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            ¿Cuándo Vence?
                          </label>
                          <input
                            type="date"
                            value={fila.vencimiento}
                            onChange={e => handleActualizarFilaFecha(fila.id, 'vencimiento', e.target.value)}
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            Días antes para Retiro
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={fila.diasRetiroAnt}
                            onChange={e => handleActualizarFilaFecha(fila.id, 'diasRetiroAnt', Math.max(0, Number(e.target.value)))}
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white text-center focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            Días antes para Alerta
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={fila.diasAlertaAnt}
                            onChange={e => handleActualizarFilaFecha(fila.id, 'diasAlertaAnt', Math.max(0, Number(e.target.value)))}
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white text-center focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Computed Preview Pill */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1 text-slate-400">
                        <div>
                          <span>Fecha Retiro calculada: </span>
                          <strong className="text-amber-300 tabular-nums">{retiro || '-'}</strong>
                          <span className="text-slate-500 text-[10px]"> ({formatearFechaCorta(retiro)})</span>
                        </div>
                        <span aria-hidden="true">·</span>
                        <div>
                          <span>Fecha Alerta: </span>
                          <strong className="text-slate-200 tabular-nums">{alertaFecha || '-'}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Notas adicionales / N° de Guía o Lote (Opcional)
              </label>
              <input
                type="text"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Ej. Guía 4590, Frigorífico Temuco..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Guardar Registro en Inventario</span>
            </button>

          </form>
        </div>
      )}

      {/* Subtab 2: Formulario Traspaso */}
      {subTab === 'traspaso' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-500" />
              <span>Traspaso Asistido de Cajas</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Mueva cajas de Cámara Frigorífica a Mural de Exhibición (o retorno) manteniendo la trazabilidad del lote.
            </p>
          </div>

          <form onSubmit={handleEjecutarTraspaso} className="space-y-5">
            
            {/* Cut Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seleccionar Corte a Traspasar
              </label>
              <select
                value={traspasoProductoId}
                onChange={e => setTraspasoProductoId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.categoria})
                  </option>
                ))}
              </select>
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Origen (De dónde)
                </label>
                <select
                  value={traspasoOrigen}
                  onChange={e => {
                    const orig = e.target.value as 'camara' | 'mural';
                    setTraspasoOrigen(orig);
                    setTraspasoDestino(orig === 'camara' ? 'mural' : 'camara');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
                >
                  <option value="camara">Cámara (Frío)</option>
                  <option value="mural">Mural (Exhibición)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Destino (Hacia dónde)
                </label>
                <select
                  value={traspasoDestino}
                  onChange={e => {
                    const dest = e.target.value as 'camara' | 'mural';
                    setTraspasoDestino(dest);
                    setTraspasoOrigen(dest === 'camara' ? 'mural' : 'camara');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
                >
                  <option value="mural">Mural (Exhibición)</option>
                  <option value="camara">Cámara (Frío)</option>
                </select>
              </div>
            </div>

            {/* Batch Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lote de Origen Específico ({lotesOrigenDisponibles.length} disponibles)
              </label>
              {lotesOrigenDisponibles.length === 0 ? (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                  No hay lotes de este corte en {traspasoOrigen === 'camara' ? 'Cámara' : 'Mural'}.
                </div>
              ) : (
                <select
                  value={traspasoLoteId}
                  onChange={e => setTraspasoLoteId(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                >
                  {lotesOrigenDisponibles.map(l => (
                    <option key={l.id} value={l.id}>
                      Vence: {l.vencimiento} — Stock: {l.cajas} cajas (Retiro: {l.retiro})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Number of boxes */}
            {loteOrigenActual && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">Cantidad de Cajas a Mover</span>
                  <span className="text-slate-400">
                    Stock disponible en este lote: <strong className="text-white">{loteOrigenActual.cajas}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={loteOrigenActual.cajas}
                    value={traspasoCajas}
                    onChange={e => setTraspasoCajas(Math.min(loteOrigenActual.cajas, Math.max(1, Number(e.target.value))))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTraspasoCajas(loteOrigenActual.cajas)}
                    className="px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 rounded-xl whitespace-nowrap cursor-pointer"
                  >
                    Todo ({loteOrigenActual.cajas})
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={lotesOrigenDisponibles.length === 0}
              className={`w-full py-3.5 text-sm font-bold text-white rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                lotesOrigenDisponibles.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50'
              }`}
            >
              <ArrowRightLeft className="w-5 h-5" />
              <span>Confirmar y Ejecutar Traspaso</span>
            </button>

          </form>
        </div>
      )}

      {/* Subtab 3: Historial de Traspasos */}
      {subTab === 'historial' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <span>Historial de Movimientos de Carne</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registro de traspasos ejecutados entre almacenamiento y vitrinas.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 tabular-nums">
              {traspasos.length} registros
            </span>
          </div>

          {traspasos.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No hay traspasos registrados aún.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {traspasos.map(item => {
                const dateObj = new Date(item.fechaHora);
                const fechaStr = dateObj.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
                const horaStr = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white text-sm">
                        {item.cajas} {item.cajas === 1 ? 'caja' : 'cajas'} de {item.productoNombre}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Marca: {item.categoria}</span>
                        <span aria-hidden="true">·</span>
                        <span>Vencimiento: {item.vencimiento}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 font-semibold text-slate-300">
                        <span className="capitalize">{item.origen}</span>
                        <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                        <span className="capitalize">{item.destino}</span>
                      </div>

                      <div className="text-right text-[11px] text-slate-500 tabular-nums">
                        <div>{fechaStr}</div>
                        <div>{horaStr}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
