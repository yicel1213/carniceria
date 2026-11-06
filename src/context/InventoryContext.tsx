import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Producto, Lote, RegistroTraspaso, FilaFechaForm, InfoAlertaLote } from '../types/inventory';
import { 
  PRODUCTOS_INICIALES, 
  CATEGORIAS_DEFAULT, 
  generarLotesIniciales, 
  TRASPASOS_INICIALES 
} from '../data/initialData';
import { calcularFechasLote, evaluarAlertaLote } from '../utils/dateUtils';

interface MultiplesLotesParams {
  productoId?: number;
  nuevoProductoNombre?: string;
  categoria: string;
  ubicacion: 'camara' | 'mural' | 'ambos';
  cajasSimple?: number;
  cajasCamara?: number;
  cajasMural?: number;
  filasFechas: FilaFechaForm[];
  notas?: string;
}

interface TraspasoParams {
  productoId: number;
  loteId: number;
  origen: 'camara' | 'mural';
  destino: 'camara' | 'mural';
  cajas: number;
}

interface InventoryContextType {
  productos: Producto[];
  camaraLotes: Lote[];
  muralLotes: Lote[];
  categorias: string[];
  traspasos: RegistroTraspaso[];
  alertas: InfoAlertaLote[];
  contadorAlertasCriticas: number;
  contadorAlertasTotales: number;
  stats: {
    totalCajasCamara: number;
    totalCajasMural: number;
    totalCajasTotal: number;
    totalProductos: number;
    totalLotes: number;
  };
  // Actions
  agregarProducto: (nombre: string, categoria: string) => Producto;
  editarProducto: (id: number, nombre: string, categoria: string) => void;
  eliminarProducto: (id: number) => void;
  agregarMultiplesLotes: (params: MultiplesLotesParams) => { ok: boolean; mensaje: string };
  editarLote: (loteId: number, ubicacion: 'camara' | 'mural', data: Partial<Lote>) => void;
  eliminarLote: (loteId: number, ubicacion: 'camara' | 'mural') => void;
  ajustarCajasLote: (loteId: number, ubicacion: 'camara' | 'mural', delta: number) => void;
  ejecutarTraspaso: (params: TraspasoParams) => { ok: boolean; mensaje: string };
  agregarCategoria: (nombre: string) => void;
  restablecerDatos: () => void;
  exportarDatosJSON: () => void;
  exportarCSV: (tipo?: 'todos' | 'camara' | 'mural' | 'alertas') => void;
  importarDatosJSON: (contenidoJson: string) => { ok: boolean; mensaje: string };
}

const STORAGE_KEY = 'carniceria_inventory_v2';

const InventoryContext = createContext<InventoryContextType | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productos, setProductos] = useState<Producto[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_productos`);
      return saved ? JSON.parse(saved) : PRODUCTOS_INICIALES;
    } catch {
      return PRODUCTOS_INICIALES;
    }
  });

  const [categorias, setCategorias] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_categorias`);
      return saved ? JSON.parse(saved) : CATEGORIAS_DEFAULT;
    } catch {
      return CATEGORIAS_DEFAULT;
    }
  });

  const [camaraLotes, setCamaraLotes] = useState<Lote[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_camara`);
      if (saved) return JSON.parse(saved);
      const inicial = generarLotesIniciales();
      return inicial.camara;
    } catch {
      return generarLotesIniciales().camara;
    }
  });

  const [muralLotes, setMuralLotes] = useState<Lote[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_mural`);
      if (saved) return JSON.parse(saved);
      const inicial = generarLotesIniciales();
      return inicial.mural;
    } catch {
      return generarLotesIniciales().mural;
    }
  });

  const [traspasos, setTraspasos] = useState<RegistroTraspaso[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_traspasos`);
      return saved ? JSON.parse(saved) : TRASPASOS_INICIALES;
    } catch {
      return TRASPASOS_INICIALES;
    }
  });

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_productos`, JSON.stringify(productos));
    } catch (e) {
      console.error('Error saving productos', e);
    }
  }, [productos]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_categorias`, JSON.stringify(categorias));
    } catch (e) {
      console.error('Error saving categorias', e);
    }
  }, [categorias]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_camara`, JSON.stringify(camaraLotes));
    } catch (e) {
      console.error('Error saving camara', e);
    }
  }, [camaraLotes]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_mural`, JSON.stringify(muralLotes));
    } catch (e) {
      console.error('Error saving mural', e);
    }
  }, [muralLotes]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_traspasos`, JSON.stringify(traspasos));
    } catch (e) {
      console.error('Error saving traspasos', e);
    }
  }, [traspasos]);

  // Product map for quick lookups
  const productoMap = useMemo(() => {
    const map = new Map<number, Producto>();
    productos.forEach(p => map.set(p.id, p));
    return map;
  }, [productos]);

  // Evaluated Alerts
  const alertas = useMemo(() => {
    const lista: InfoAlertaLote[] = [];
    const todosLotes = [
      ...camaraLotes.map(l => ({ ...l, ubicacion: 'camara' as const })),
      ...muralLotes.map(l => ({ ...l, ubicacion: 'mural' as const }))
    ];

    todosLotes.forEach(lote => {
      const prod = productoMap.get(lote.productoId);
      if (prod) {
        lista.push(evaluarAlertaLote(lote, prod));
      }
    });

    // Sort: most critical first (vencido -> retiro_vencido -> retirar_hoy -> alerta_activa)
    const priorityWeight: Record<string, number> = {
      vencido: 100,
      retiro_vencido: 90,
      retirar_hoy: 80,
      alerta_activa: 70,
      alerta_proxima: 40,
      optimo: 10
    };

    return lista.sort((a, b) => {
      const pDiff = (priorityWeight[b.estado] || 0) - (priorityWeight[a.estado] || 0);
      if (pDiff !== 0) return pDiff;
      return a.diffDiasRetiro - b.diffDiasRetiro;
    });
  }, [camaraLotes, muralLotes, productoMap]);

  const contadorAlertasCriticas = useMemo(() => {
    return alertas.filter(a => a.estado === 'vencido' || a.estado === 'retiro_vencido' || a.estado === 'retirar_hoy').length;
  }, [alertas]);

  const contadorAlertasTotales = useMemo(() => {
    return alertas.filter(a => a.estado !== 'optimo').length;
  }, [alertas]);

  const stats = useMemo(() => {
    const totalCajasCamara = camaraLotes.reduce((acc, l) => acc + (l.cajas || 0), 0);
    const totalCajasMural = muralLotes.reduce((acc, l) => acc + (l.cajas || 0), 0);
    return {
      totalCajasCamara,
      totalCajasMural,
      totalCajasTotal: totalCajasCamara + totalCajasMural,
      totalProductos: productos.length,
      totalLotes: camaraLotes.length + muralLotes.length
    };
  }, [camaraLotes, muralLotes, productos]);

  // Actions
  const agregarCategoria = useCallback((nombre: string) => {
    const trim = nombre.trim();
    if (!trim) return;
    setCategorias(prev => (prev.includes(trim) ? prev : [...prev, trim]));
  }, []);

  const agregarProducto = useCallback((nombre: string, categoria: string): Producto => {
    const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    const catFinal = categoria.trim() || 'Sin Categoría';
    const nuevo: Producto = {
      id: nuevoId,
      nombre: nombre.trim(),
      categoria: catFinal,
      unidad: 'cajas'
    };
    setProductos(prev => [...prev, nuevo]);
    agregarCategoria(catFinal);
    return nuevo;
  }, [productos, agregarCategoria]);

  const editarProducto = useCallback((id: number, nombre: string, categoria: string) => {
    setProductos(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, nombre: nombre.trim(), categoria: categoria.trim() };
      }
      return p;
    }));
    agregarCategoria(categoria);
  }, [agregarCategoria]);

  const eliminarProducto = useCallback((id: number) => {
    setProductos(prev => prev.filter(p => p.id !== id));
    setCamaraLotes(prev => prev.filter(l => l.productoId !== id));
    setMuralLotes(prev => prev.filter(l => l.productoId !== id));
  }, []);

  const agregarMultiplesLotes = useCallback((params: MultiplesLotesParams) => {
    let prodId = params.productoId;
    let prodObj: Producto | undefined;

    if (!prodId && params.nuevoProductoNombre) {
      prodObj = agregarProducto(params.nuevoProductoNombre, params.categoria);
      prodId = prodObj.id;
    } else if (prodId) {
      prodObj = productoMap.get(prodId);
      if (prodObj && params.categoria && prodObj.categoria !== params.categoria) {
        editarProducto(prodId, prodObj.nombre, params.categoria);
      }
    }

    if (!prodId) {
      return { ok: false, mensaje: 'Debe seleccionar o ingresar un producto.' };
    }

    if (!params.filasFechas || params.filasFechas.length === 0) {
      return { ok: false, mensaje: 'Debe ingresar al menos una fecha de vencimiento.' };
    }

    const nuevosCamara: Lote[] = [];
    const nuevosMural: Lote[] = [];

    params.filasFechas.forEach(f => {
      const { retiro, alertaFecha } = calcularFechasLote(f.vencimiento, f.diasRetiroAnt, f.diasAlertaAnt);

      if (params.ubicacion === 'ambos') {
        const cajasCam = Number(params.cajasCamara) || 0;
        const cajasMur = Number(params.cajasMural) || 0;

        if (cajasCam > 0) {
          nuevosCamara.push({
            id: Date.now() + Math.floor(Math.random() * 10000),
            productoId: prodId!,
            ubicacion: 'camara',
            cajas: cajasCam,
            vencimiento: f.vencimiento,
            diasRetiroAnt: f.diasRetiroAnt,
            diasAlertaAnt: f.diasAlertaAnt,
            retiro,
            alertaFecha,
            notas: params.notas
          });
        }

        if (cajasMur > 0) {
          nuevosMural.push({
            id: Date.now() + Math.floor(Math.random() * 10000) + 1,
            productoId: prodId!,
            ubicacion: 'mural',
            cajas: cajasMur,
            vencimiento: f.vencimiento,
            diasRetiroAnt: f.diasRetiroAnt,
            diasAlertaAnt: f.diasAlertaAnt,
            retiro,
            alertaFecha,
            notas: params.notas
          });
        }
      } else {
        const cajas = Number(params.cajasSimple) || 1;
        const nuevo: Lote = {
          id: Date.now() + Math.floor(Math.random() * 10000),
          productoId: prodId!,
          ubicacion: params.ubicacion,
          cajas,
          vencimiento: f.vencimiento,
          diasRetiroAnt: f.diasRetiroAnt,
          diasAlertaAnt: f.diasAlertaAnt,
          retiro,
          alertaFecha,
          notas: params.notas
        };

        if (params.ubicacion === 'camara') {
          nuevosCamara.push(nuevo);
        } else {
          nuevosMural.push(nuevo);
        }
      }
    });

    if (nuevosCamara.length > 0) {
      setCamaraLotes(prev => [...prev, ...nuevosCamara]);
    }
    if (nuevosMural.length > 0) {
      setMuralLotes(prev => [...prev, ...nuevosMural]);
    }

    const totalIngresadas = nuevosCamara.length + nuevosMural.length;
    return { 
      ok: true, 
      mensaje: `Se registraron con éxito ${totalIngresadas} lote(s) en ${params.ubicacion === 'ambos' ? 'Cámara y Mural' : params.ubicacion}.` 
    };
  }, [agregarProducto, productoMap, editarProducto]);

  const editarLote = useCallback((loteId: number, ubicacion: 'camara' | 'mural', data: Partial<Lote>) => {
    const updater = (lista: Lote[]) => lista.map(l => {
      if (l.id === loteId) {
        const v = data.vencimiento ?? l.vencimiento;
        const dR = data.diasRetiroAnt ?? l.diasRetiroAnt;
        const dA = data.diasAlertaAnt ?? l.diasAlertaAnt;
        const { retiro, alertaFecha } = calcularFechasLote(v, dR, dA);
        return {
          ...l,
          ...data,
          vencimiento: v,
          diasRetiroAnt: dR,
          diasAlertaAnt: dA,
          retiro,
          alertaFecha
        };
      }
      return l;
    });

    if (ubicacion === 'camara') {
      setCamaraLotes(updater);
    } else {
      setMuralLotes(updater);
    }
  }, []);

  const eliminarLote = useCallback((loteId: number, ubicacion: 'camara' | 'mural') => {
    if (ubicacion === 'camara') {
      setCamaraLotes(prev => prev.filter(l => l.id !== loteId));
    } else {
      setMuralLotes(prev => prev.filter(l => l.id !== loteId));
    }
  }, []);

  const ajustarCajasLote = useCallback((loteId: number, ubicacion: 'camara' | 'mural', delta: number) => {
    const setter = ubicacion === 'camara' ? setCamaraLotes : setMuralLotes;
    setter(prev => {
      return prev.map(l => {
        if (l.id === loteId) {
          const nuevas = Math.max(0, l.cajas + delta);
          return { ...l, cajas: nuevas };
        }
        return l;
      }).filter(l => l.cajas > 0);
    });
  }, []);

  const ejecutarTraspaso = useCallback((params: TraspasoParams) => {
    const { productoId, loteId, origen, destino, cajas } = params;

    if (origen === destino) {
      return { ok: false, mensaje: 'El origen y el destino deben ser diferentes.' };
    }

    if (cajas <= 0) {
      return { ok: false, mensaje: 'La cantidad de cajas a traspasar debe ser mayor a 0.' };
    }

    const fuente = origen === 'camara' ? camaraLotes : muralLotes;
    const loteOrigen = fuente.find(l => l.id === loteId);

    if (!loteOrigen) {
      return { ok: false, mensaje: 'No se encontró el lote de origen seleccionado.' };
    }

    if (cajas > loteOrigen.cajas) {
      return { ok: false, mensaje: `Stock insuficiente. Solo hay ${loteOrigen.cajas} cajas en este lote.` };
    }

    // 1. Descontar o remover de origen
    if (origen === 'camara') {
      setCamaraLotes(prev => prev.map(l => {
        if (l.id === loteId) return { ...l, cajas: l.cajas - cajas };
        return l;
      }).filter(l => l.cajas > 0));
    } else {
      setMuralLotes(prev => prev.map(l => {
        if (l.id === loteId) return { ...l, cajas: l.cajas - cajas };
        return l;
      }).filter(l => l.cajas > 0));
    }

    // 2. Sumar o crear en destino (si existe mismo producto con misma fecha de vencimiento, acumula)
    const setDestino = destino === 'camara' ? setCamaraLotes : setMuralLotes;
    setDestino(prev => {
      const matchIndex = prev.findIndex(l => l.productoId === productoId && l.vencimiento === loteOrigen.vencimiento);
      if (matchIndex >= 0) {
        const copy = [...prev];
        copy[matchIndex] = {
          ...copy[matchIndex],
          cajas: copy[matchIndex].cajas + cajas
        };
        return copy;
      } else {
        const nuevoLoteDestino: Lote = {
          id: Date.now() + Math.floor(Math.random() * 10000),
          productoId,
          ubicacion: destino,
          cajas,
          vencimiento: loteOrigen.vencimiento,
          diasRetiroAnt: loteOrigen.diasRetiroAnt,
          diasAlertaAnt: loteOrigen.diasAlertaAnt,
          retiro: loteOrigen.retiro,
          alertaFecha: loteOrigen.alertaFecha,
          notas: `Traspaso desde ${origen}`
        };
        return [...prev, nuevoLoteDestino];
      }
    });

    // 3. Registrar en historial
    const prod = productoMap.get(productoId);
    const registro: RegistroTraspaso = {
      id: `traspaso-${Date.now()}`,
      fechaHora: new Date().toISOString(),
      productoId,
      productoNombre: prod?.nombre || 'Corte',
      categoria: prod?.categoria || 'General',
      origen,
      destino,
      cajas,
      vencimiento: loteOrigen.vencimiento
    };
    setTraspasos(prev => [registro, ...prev]);

    return { 
      ok: true, 
      mensaje: `Se traspasaron con éxito ${cajas} caja(s) de ${prod?.nombre} de ${origen} a ${destino}.` 
    };
  }, [camaraLotes, muralLotes, productoMap]);

  const restablecerDatos = useCallback(() => {
    const lotes = generarLotesIniciales();
    setProductos(PRODUCTOS_INICIALES);
    setCategorias(CATEGORIAS_DEFAULT);
    setCamaraLotes(lotes.camara);
    setMuralLotes(lotes.mural);
    setTraspasos(TRASPASOS_INICIALES);
  }, []);

  const exportarDatosJSON = useCallback(() => {
    const data = {
      version: 2,
      exportadoEn: new Date().toISOString(),
      productos,
      categorias,
      camaraLotes,
      muralLotes,
      traspasos
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo_carniceria_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [productos, categorias, camaraLotes, muralLotes, traspasos]);

  const exportarCSV = useCallback((tipo: 'todos' | 'camara' | 'mural' | 'alertas' = 'todos') => {
    let rows: Array<string[]> = [];
    const encabezados = [
      'Ubicación',
      'Categoría / Marca',
      'Corte / Producto',
      'Cajas',
      'Fecha Vencimiento',
      'Días Antes Retiro',
      'Fecha Retiro',
      'Días Alerta',
      'Fecha Alerta',
      'Estado Alerta'
    ];
    rows.push(encabezados);

    const todosLotes = [
      ...camaraLotes.map(l => ({ ...l, ubi: 'Cámara' })),
      ...muralLotes.map(l => ({ ...l, ubi: 'Mural' }))
    ];

    todosLotes.forEach(l => {
      const prod = productoMap.get(l.productoId);
      if (!prod) return;
      const alerta = evaluarAlertaLote(l, prod);

      if (tipo === 'camara' && l.ubi !== 'Cámara') return;
      if (tipo === 'mural' && l.ubi !== 'Mural') return;
      if (tipo === 'alertas' && alerta.estado === 'optimo') return;

      rows.push([
        l.ubi,
        prod.categoria,
        prod.nombre,
        String(l.cajas),
        l.vencimiento,
        String(l.diasRetiroAnt),
        l.retiro,
        String(l.diasAlertaAnt),
        l.alertaFecha,
        alerta.mensaje
      ]);
    });

    const csvContent = '\uFEFF' + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_carniceria_${tipo}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [camaraLotes, muralLotes, productoMap]);

  const importarDatosJSON = useCallback((contenidoJson: string) => {
    try {
      const data = JSON.parse(contenidoJson);
      if (!data.productos || !data.camaraLotes || !data.muralLotes) {
        return { ok: false, mensaje: 'El archivo JSON no tiene la estructura de inventario válida.' };
      }
      setProductos(data.productos);
      if (Array.isArray(data.categorias)) setCategorias(data.categorias);
      setCamaraLotes(data.camaraLotes);
      setMuralLotes(data.muralLotes);
      if (Array.isArray(data.traspasos)) setTraspasos(data.traspasos);
      return { ok: true, mensaje: 'Datos restaurados correctamente.' };
    } catch {
      return { ok: false, mensaje: 'Error al interpretar el archivo JSON.' };
    }
  }, []);

  const value = {
    productos,
    camaraLotes,
    muralLotes,
    categorias,
    traspasos,
    alertas,
    contadorAlertasCriticas,
    contadorAlertasTotales,
    stats,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    agregarMultiplesLotes,
    editarLote,
    eliminarLote,
    ajustarCajasLote,
    ejecutarTraspaso,
    agregarCategoria,
    restablecerDatos,
    exportarDatosJSON,
    exportarCSV,
    importarDatosJSON
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory debe usarse dentro de un InventoryProvider');
  }
  return context;
};
