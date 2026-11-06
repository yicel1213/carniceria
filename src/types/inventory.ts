export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  unidad?: string;
  codigo?: string;
}

export interface Lote {
  id: number;
  productoId: number;
  ubicacion: 'camara' | 'mural';
  cajas: number;
  vencimiento: string; // YYYY-MM-DD
  diasRetiroAnt: number;
  diasAlertaAnt: number;
  retiro: string; // YYYY-MM-DD (calculated)
  alertaFecha: string; // YYYY-MM-DD (calculated)
  creadoEn?: string;
  notas?: string;
}

export interface FilaFechaForm {
  id: string;
  vencimiento: string;
  diasRetiroAnt: number;
  diasAlertaAnt: number;
}

export interface RegistroTraspaso {
  id: string;
  fechaHora: string;
  productoId: number;
  productoNombre: string;
  categoria: string;
  origen: 'camara' | 'mural';
  destino: 'camara' | 'mural';
  cajas: number;
  vencimiento: string;
}

export type EstadoAlerta = 
  | 'vencido' 
  | 'retiro_vencido' 
  | 'retirar_hoy' 
  | 'alerta_activa' 
  | 'alerta_proxima' 
  | 'optimo';

export interface InfoAlertaLote {
  lote: Lote;
  producto: Producto;
  diffDiasRetiro: number; // days relative to retiro: < 0 is overdue, 0 is today, > 0 is future
  diffDiasVencimiento: number;
  diffDiasAlerta: number;
  estado: EstadoAlerta;
  mensaje: string;
}
