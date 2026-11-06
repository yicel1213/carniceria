import React, { useState, useMemo } from 'react';
import { 
  Tags, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Warehouse, 
  Store, 
  Boxes,
  CheckCircle2,
  X
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Producto } from '../types/inventory';
import { formatearFechaCorta } from '../utils/dateUtils';

interface CatalogoViewProps {
  onNuevoIngresoParaCorte: (producto: Producto) => void;
}

export const CatalogoView: React.FC<CatalogoViewProps> = ({ onNuevoIngresoParaCorte }) => {
  const { 
    productos, 
    camaraLotes, 
    muralLotes, 
    categorias, 
    agregarCategoria, 
    agregarProducto, 
    editarProducto, 
    eliminarProducto 
  } = useInventory();

  const [busqueda, setBusqueda] = useState('');
  const [modalCatAbierto, setModalCatAbierto] = useState(false);
  const [nombreNuevaCat, setNombreNuevaCat] = useState('');

  const [modalCorteAbierto, setModalCorteAbierto] = useState(false);
  const [corteEditando, setCorteEditando] = useState<Producto | null>(null);
  const [nombreCorteForm, setNombreCorteForm] = useState('');
  const [catCorteForm, setCatCorteForm] = useState(categorias[0] || 'Farmer');

  // Group products by category
  const productosPorCategoria = useMemo(() => {
    const mapa = new Map<string, Producto[]>();

    productos.forEach(p => {
      const cat = p.categoria || 'Sin Categoría';
      if (!mapa.has(cat)) mapa.set(cat, []);
      
      // Filter by search
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        if (p.nombre.toLowerCase().includes(q) || cat.toLowerCase().includes(q)) {
          mapa.get(cat)!.push(p);
        }
      } else {
        mapa.get(cat)!.push(p);
      }
    });

    return Array.from(mapa.entries()).filter(([_, list]) => list.length > 0);
  }, [productos, busqueda]);

  const handleCrearCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombreNuevaCat.trim()) {
      agregarCategoria(nombreNuevaCat.trim());
      setNombreNuevaCat('');
      setModalCatAbierto(false);
    }
  };

  const handleGuardarCorte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCorteForm.trim()) return;

    if (corteEditando) {
      editarProducto(corteEditando.id, nombreCorteForm.trim(), catCorteForm);
    } else {
      agregarProducto(nombreCorteForm.trim(), catCorteForm);
    }

    setModalCorteAbierto(false);
    setCorteEditando(null);
    setNombreCorteForm('');
  };

  const handleAbrirEditarCorte = (p: Producto) => {
    setCorteEditando(p);
    setNombreCorteForm(p.nombre);
    setCatCorteForm(p.categoria);
    setModalCorteAbierto(true);
  };

  const handleAbrirNuevoCorte = () => {
    setCorteEditando(null);
    setNombreCorteForm('');
    setCatCorteForm(categorias[0] || 'Farmer');
    setModalCorteAbierto(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/60">
                <Tags className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Lista de Productos por Categoría y Marca
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Catálogo consolidado de cortes vacunos, porcinos y especialidades con resumen de stock y fechas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalCatAbierto(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-400" />
              <span>Nueva Categoría</span>
            </button>

            <button
              onClick={handleAbrirNuevoCorte}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Corte</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="pt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por corte o marca de carne..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60"
            />
          </div>
        </div>
      </div>

      {/* Categories Groups List */}
      <div className="space-y-6">
        {productosPorCategoria.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            No se encontraron cortes que coincidan con la búsqueda.
          </div>
        ) : (
          productosPorCategoria.map(([categoriaNombre, listaCortes]) => (
            <div 
              key={categoriaNombre}
              className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <h3 className="font-extrabold text-white text-sm tracking-wide">
                    {categoriaNombre}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {listaCortes.length} corte(s) registrado(s)
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/60 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-bold">
                      <th className="p-3.5">Nombre Producto</th>
                      <th className="p-3.5">Stock Cámara</th>
                      <th className="p-3.5">Stock Mural</th>
                      <th className="p-3.5">Stock Total</th>
                      <th className="p-3.5">Fechas de Vencimiento</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs">
                    {listaCortes.map(prod => {
                      const lotesCam = camaraLotes.filter(l => l.productoId === prod.id);
                      const lotesMur = muralLotes.filter(l => l.productoId === prod.id);

                      const totalCam = lotesCam.reduce((acc, l) => acc + l.cajas, 0);
                      const totalMur = lotesMur.reduce((acc, l) => acc + l.cajas, 0);
                      const totalCajas = totalCam + totalMur;

                      const todasFechas = [...lotesCam, ...lotesMur];
                      const fechasUnicas = Array.from(new Set(todasFechas.map(l => l.vencimiento))).sort();

                      return (
                        <tr key={prod.id} className="hover:bg-slate-850/40 transition-colors">
                          <td className="p-3.5">
                            <span className="font-extrabold text-sm text-white block">
                              {prod.nombre}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {prod.categoria}
                            </span>
                          </td>

                          <td className="p-3.5 font-bold text-blue-400 tabular-nums">
                            {totalCam} {totalCam === 1 ? 'caja' : 'cajas'}
                          </td>

                          <td className="p-3.5 font-bold text-emerald-400 tabular-nums">
                            {totalMur} {totalMur === 1 ? 'caja' : 'cajas'}
                          </td>

                          <td className="p-3.5 font-extrabold text-white tabular-nums">
                            {totalCajas} {totalCajas === 1 ? 'caja' : 'cajas'}
                          </td>

                          <td className="p-3.5 text-slate-300">
                            {fechasUnicas.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {fechasUnicas.map(f => (
                                  <span 
                                    key={f}
                                    className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] tabular-nums"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500 italic text-xs">Sin lotes activos</span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => onNuevoIngresoParaCorte(prod)}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-700 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                                title="Ingresar nuevo lote de este corte"
                              >
                                + Lote
                              </button>

                              <button
                                onClick={() => handleAbrirEditarCorte(prod)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Editar nombre o categoría"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`¿Eliminar ${prod.nombre} del catálogo? Se borrarán también sus lotes.`)) {
                                    eliminarProducto(prod.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar corte"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nueva Categoría */}
      {modalCatAbierto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Crear Nueva Categoría / Marca</h3>
              <button 
                onClick={() => setModalCatAbierto(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCrearCategoria} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre de la Marca o Categoría
                </label>
                <input
                  type="text"
                  value={nombreNuevaCat}
                  onChange={e => setNombreNuevaCat(e.target.value)}
                  placeholder="Ej. Cabaña Las Lilas, Swift, Frigorífico Valdivia..."
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCatAbierto(false)}
                  className="w-1/2 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo / Editar Corte */}
      {modalCorteAbierto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {corteEditando ? 'Editar Corte de Carne' : 'Nuevo Corte de Carne'}
              </h3>
              <button 
                onClick={() => setModalCorteAbierto(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGuardarCorte} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre del Corte
                </label>
                <input
                  type="text"
                  value={nombreCorteForm}
                  onChange={e => setNombreCorteForm(e.target.value)}
                  placeholder="Ej. Punta de Ganso, Tomahawk, Entrecot..."
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Categoría / Marca Asignada
                </label>
                <select
                  value={catCorteForm}
                  onChange={e => setCatCorteForm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                >
                  {categorias.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCorteAbierto(false)}
                  className="w-1/2 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md"
                >
                  {corteEditando ? 'Guardar Cambios' : 'Crear Corte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
