import { Producto, Lote, RegistroTraspaso } from '../types/inventory';
import { getHoyISO, sumarDias, calcularFechasLote } from '../utils/dateUtils';

export const CATEGORIAS_DEFAULT = [
  'Farmer',
  'Pampa Verde',
  'El Origen',
  'Campo Osorno',
  'Angus Prime',
  'Cortes Criollos'
];

export const PRODUCTOS_INICIALES: Producto[] = [
  { id: 1, nombre: 'Lomo Vetado', categoria: 'Farmer', unidad: 'cajas' },
  { id: 2, nombre: 'Lomo Liso', categoria: 'Pampa Verde', unidad: 'cajas' },
  { id: 3, nombre: 'Asado Carnicero', categoria: 'El Origen', unidad: 'cajas' },
  { id: 4, nombre: 'Abastero', categoria: 'Campo Osorno', unidad: 'cajas' },
  { id: 5, nombre: 'Sobrecostilla', categoria: 'Farmer', unidad: 'cajas' },
  { id: 6, nombre: 'Asado de Tira', categoria: 'Pampa Verde', unidad: 'cajas' },
  { id: 7, nombre: 'Punta de Ganso', categoria: 'Angus Prime', unidad: 'cajas' },
  { id: 8, nombre: 'Filete Limpio', categoria: 'Farmer', unidad: 'cajas' },
  { id: 9, nombre: 'Costillar Ahumado / Cerdo', categoria: 'Cortes Criollos', unidad: 'cajas' },
  { id: 10, nombre: 'Entraña Fina', categoria: 'Angus Prime', unidad: 'cajas' }
];

export function generarLotesIniciales(): { camara: Lote[]; mural: Lote[] } {
  const hoy = getHoyISO();

  // 1. Un lote con retiro hoy (Urgente para probar)
  const fVencHoyRetiro = sumarDias(hoy, 2);
  const calc1 = calcularFechasLote(fVencHoyRetiro, 2, 1);

  // 2. Un lote con retiro vencido hace 1 día
  const fVencRetiroPasado = sumarDias(hoy, 1);
  const calc2 = calcularFechasLote(fVencRetiroPasado, 2, 1);

  // 3. Un lote con alerta activa (faltan 2 días para el retiro)
  const fVencAlerta = sumarDias(hoy, 5);
  const calc3 = calcularFechasLote(fVencAlerta, 3, 2);

  // 4. Lotes frescos estándar
  const fVencFresca1 = sumarDias(hoy, 12);
  const calc4 = calcularFechasLote(fVencFresca1, 2, 2);

  const fVencFresca2 = sumarDias(hoy, 18);
  const calc5 = calcularFechasLote(fVencFresca2, 3, 2);

  const fVencFresca3 = sumarDias(hoy, 25);
  const calc6 = calcularFechasLote(fVencFresca3, 2, 1);

  const camara: Lote[] = [
    {
      id: 101,
      productoId: 1, // Lomo Vetado
      ubicacion: 'camara',
      cajas: 4,
      vencimiento: fVencAlerta,
      diasRetiroAnt: 3,
      diasAlertaAnt: 2,
      retiro: calc3.retiro,
      alertaFecha: calc3.alertaFecha,
      notas: 'Lote recepción lunes'
    },
    {
      id: 102,
      productoId: 4, // Abastero
      ubicacion: 'camara',
      cajas: 6,
      vencimiento: fVencFresca1,
      diasRetiroAnt: 2,
      diasAlertaAnt: 2,
      retiro: calc4.retiro,
      alertaFecha: calc4.alertaFecha
    },
    {
      id: 103,
      productoId: 7, // Punta de Ganso
      ubicacion: 'camara',
      cajas: 3,
      vencimiento: fVencFresca2,
      diasRetiroAnt: 3,
      diasAlertaAnt: 2,
      retiro: calc5.retiro,
      alertaFecha: calc5.alertaFecha
    },
    {
      id: 104,
      productoId: 8, // Filete Limpio
      ubicacion: 'camara',
      cajas: 2,
      vencimiento: fVencFresca3,
      diasRetiroAnt: 2,
      diasAlertaAnt: 1,
      retiro: calc6.retiro,
      alertaFecha: calc6.alertaFecha
    }
  ];

  const mural: Lote[] = [
    {
      id: 201,
      productoId: 2, // Lomo Liso
      ubicacion: 'mural',
      cajas: 2,
      vencimiento: fVencHoyRetiro,
      diasRetiroAnt: 2,
      diasAlertaAnt: 1,
      retiro: calc1.retiro,
      alertaFecha: calc1.alertaFecha,
      notas: 'Exhibido en vitrina central'
    },
    {
      id: 202,
      productoId: 3, // Asado Carnicero
      ubicacion: 'mural',
      cajas: 1,
      vencimiento: fVencRetiroPasado,
      diasRetiroAnt: 2,
      diasAlertaAnt: 1,
      retiro: calc2.retiro,
      alertaFecha: calc2.alertaFecha,
      notas: 'Prioridad de venta / oferta'
    },
    {
      id: 203,
      productoId: 5, // Sobrecostilla
      ubicacion: 'mural',
      cajas: 3,
      vencimiento: fVencFresca1,
      diasRetiroAnt: 2,
      diasAlertaAnt: 2,
      retiro: calc4.retiro,
      alertaFecha: calc4.alertaFecha
    },
    {
      id: 204,
      productoId: 10, // Entraña Fina
      ubicacion: 'mural',
      cajas: 2,
      vencimiento: fVencFresca2,
      diasRetiroAnt: 3,
      diasAlertaAnt: 2,
      retiro: calc5.retiro,
      alertaFecha: calc5.alertaFecha
    }
  ];

  return { camara, mural };
}

export const TRASPASOS_INICIALES: RegistroTraspaso[] = [
  {
    id: 'traspaso-1',
    fechaHora: new Date(Date.now() - 3600000 * 4).toISOString(),
    productoId: 2,
    productoNombre: 'Lomo Liso',
    categoria: 'Pampa Verde',
    origen: 'camara',
    destino: 'mural',
    cajas: 2,
    vencimiento: sumarDias(getHoyISO(), 4)
  }
];
