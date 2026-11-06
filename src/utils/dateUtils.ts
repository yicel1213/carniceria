import { Lote, Producto, InfoAlertaLote, EstadoAlerta } from '../types/inventory';

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getHoyISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Subtracts days from an ISO date string (YYYY-MM-DD)
 */
export function restarDias(fechaIso: string, dias: number): string {
  if (!fechaIso) return '';
  const [y, m, d] = fechaIso.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  fecha.setDate(fecha.getDate() - dias);
  
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds days to an ISO date string (YYYY-MM-DD)
 */
export function sumarDias(fechaIso: string, dias: number): string {
  if (!fechaIso) return '';
  const [y, m, d] = fechaIso.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  fecha.setDate(fecha.getDate() + dias);
  
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates Retiro and Alerta dates from Vencimiento and intervals
 */
export function calcularFechasLote(vencimiento: string, diasRetiroAnt: number, diasAlertaAnt: number) {
  const retiro = restarDias(vencimiento, diasRetiroAnt);
  const alertaFecha = restarDias(retiro, diasAlertaAnt);
  return { retiro, alertaFecha };
}

/**
 * Difference in calendar days between target date and base date (default today).
 * Positive: target is in future.
 * Negative: target has passed.
 * 0: today.
 */
export function diferenciaDias(fechaIso: string, baseIso: string = getHoyISO()): number {
  if (!fechaIso) return 0;
  const [y1, m1, d1] = fechaIso.split('-').map(Number);
  const [y2, m2, d2] = baseIso.split('-').map(Number);
  
  const t1 = new Date(y1, m1 - 1, d1).getTime();
  const t2 = new Date(y2, m2 - 1, d2).getTime();
  
  return Math.round((t1 - t2) / (1000 * 60 * 60 * 24));
}

/**
 * Format ISO date for human display in Spanish (e.g., "15 Jun 2026")
 */
export function formatearFechaCorta(fechaIso: string): string {
  if (!fechaIso) return '-';
  const parts = fechaIso.split('-');
  if (parts.length !== 3) return fechaIso;
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const dia = parts[2];
  const mes = meses[parseInt(parts[1], 10) - 1] || parts[1];
  const anio = parts[0];
  return `${dia} ${mes} ${anio}`;
}

/**
 * Analyzes lote against today's date and returns alert categorization
 */
export function evaluarAlertaLote(lote: Lote, producto: Producto): InfoAlertaLote {
  const diffDiasVencimiento = diferenciaDias(lote.vencimiento);
  const diffDiasRetiro = diferenciaDias(lote.retiro);
  const diffDiasAlerta = diferenciaDias(lote.alertaFecha);

  let estado: EstadoAlerta = 'optimo';
  let mensaje = 'Vigente y en rango';

  if (diffDiasVencimiento < 0) {
    estado = 'vencido';
    mensaje = `¡Producto Vencido! Hace ${Math.abs(diffDiasVencimiento)} días`;
  } else if (diffDiasRetiro < 0) {
    estado = 'retiro_vencido';
    mensaje = `¡Fecha de retiro cumplida hace ${Math.abs(diffDiasRetiro)} días!`;
  } else if (diffDiasRetiro === 0) {
    estado = 'retirar_hoy';
    mensaje = '¡Retirar Hoy!';
  } else if (diffDiasAlerta <= 0) {
    estado = 'alerta_activa';
    mensaje = `Retiro en ${diffDiasRetiro} ${diffDiasRetiro === 1 ? 'día' : 'días'}`;
  } else if (diffDiasAlerta <= 3) {
    estado = 'alerta_proxima';
    mensaje = `Próximo a entrar en alerta (${diffDiasAlerta}d)`;
  }

  return {
    lote,
    producto,
    diffDiasRetiro,
    diffDiasVencimiento,
    diffDiasAlerta,
    estado,
    mensaje
  };
}
