import React from 'react';
import { 
  Warehouse, 
  Store, 
  PlusCircle, 
  AlertTriangle, 
  Tags, 
  Smartphone, 
  ArrowRightLeft,
  ChevronRight,
  Clock,
  Boxes,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { TabId } from './Header';

interface MenuPrincipalProps {
  onNavegar: (tab: TabId) => void;
  onAbrirModal: (ubicacion?: 'camara' | 'mural') => void;
}

export const MenuPrincipal: React.FC<MenuPrincipalProps> = ({ onNavegar, onAbrirModal }) => {
  const { stats, contadorAlertasCriticas, contadorAlertasTotales, alertas } = useInventory();

  // Highlight urgent alert items (if any)
  const alertasCriticas = alertas.filter(a => a.estado === 'vencido' || a.estado === 'retiro_vencido' || a.estado === 'retirar_hoy');

  return (
    <div className="space-y-8 py-2">
      
      {/* Top Banner & Quick Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Panel de Control de Carnicería</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Inventario en tiempo real sincronizado localmente con cálculo automático de fechas de retiro.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistema Operativo</span>
            </span>
          </div>
        </div>

        {/* 4 Metric Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div 
            onClick={() => onNavegar('camara')}
            className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hover:border-blue-500/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Stock en Cámara</span>
              <Warehouse className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {stats.totalCajasCamara}
            </div>
            <div className="text-[11px] text-blue-400 font-medium mt-1">
              Cajas almacenadas en frío
            </div>
          </div>

          <div 
            onClick={() => onNavegar('mural')}
            className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hover:border-emerald-500/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Stock en Mural</span>
              <Store className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {stats.totalCajasMural}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">
              Cajas listas en vitrina
            </div>
          </div>

          <div 
            onClick={() => onNavegar('catalogo')}
            className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hover:border-purple-500/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Cortes y Marcas</span>
              <Tags className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {stats.totalProductos}
            </div>
            <div className="text-[11px] text-purple-300 font-medium mt-1">
              {stats.totalCajasTotal} cajas totales
            </div>
          </div>

          <div 
            onClick={() => onNavegar('alertas')}
            className={`bg-slate-950/70 border rounded-xl p-4 transition-colors cursor-pointer group ${
              contadorAlertasCriticas > 0 
                ? 'border-red-600/70 bg-red-950/20 hover:border-red-500' 
                : 'border-slate-800/80 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Atención / Retiros</span>
              <AlertTriangle className={`w-4 h-4 ${contadorAlertasCriticas > 0 ? 'text-red-400' : 'text-amber-400'} group-hover:scale-110 transition-transform`} />
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${contadorAlertasCriticas > 0 ? 'text-red-400' : 'text-white'}`}>
              {contadorAlertasTotales}
            </div>
            <div className={`text-[11px] font-semibold mt-1 ${contadorAlertasCriticas > 0 ? 'text-red-300' : 'text-slate-400'}`}>
              {contadorAlertasCriticas > 0 ? `${contadorAlertasCriticas} retiros urgentes!` : 'Todo en regla'}
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Warning Banner if any batch needs action today */}
      {alertasCriticas.length > 0 && (
        <div className="bg-red-950/50 border border-red-800/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-red-950/30">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Hay {alertasCriticas.length} lote(s) que requieren retiro inmediato
              </h3>
              <p className="text-xs text-red-200/90 mt-0.5">
                Revise las fechas de retiro para evitar mermas o productos fuera de plazo en exhibición.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavegar('alertas')}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-xl transition-colors shadow-md whitespace-nowrap self-end sm:self-auto cursor-pointer"
          >
            Ver Alertas Ahora
          </button>
        </div>
      )}

      {/* Primary Action Grid (Cards layout as in original design) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Accesos Principales
          </h3>
          <span className="text-xs text-slate-500">
            Seleccione una sección para operar
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Catálogo */}
          <button
            onClick={() => onNavegar('catalogo')}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all text-left flex flex-col justify-between group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 mb-4 group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white transition-all">
                <Tags className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                Ver Lista de Productos
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Catálogo completo de cortes organizado por marcas (Farmer, Pampa Verde, El Origen, etc.) con stock total.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 mt-2 border-t border-slate-800/60">
              <span>{stats.totalProductos} cortes activos</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Card 2: Cámara */}
          <button
            onClick={() => onNavegar('camara')}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 p-5 rounded-2xl transition-all text-left flex flex-col justify-between group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Warehouse className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                Cámara Frigorífica
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Control de almacenamiento en frío, stock de cajas por lote, fecha de vencimiento y cálculo de retiro.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 mt-2 border-t border-slate-800/60">
              <span>{stats.totalCajasCamara} cajas en frío</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Card 3: Mural */}
          <button
            onClick={() => onNavegar('mural')}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl transition-all text-left flex flex-col justify-between group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Store className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                Mural de Exhibición
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Productos en vitrina y exhibición listos para venta al cliente, con control de fechas de corte y retiro.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 mt-2 border-t border-slate-800/60">
              <span>{stats.totalCajasMural} cajas en exhibición</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Card 4: Ingresar / Traspaso */}
          <button
            onClick={() => onNavegar('movimiento')}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 p-5 rounded-2xl transition-all text-left flex flex-col justify-between group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                Ingresar y Traspasos
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ingreso de nuevos lotes con hasta 10 fechas simultáneas y traspaso asistido de Cámara a Mural.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 mt-2 border-t border-slate-800/60">
              <span>Recepción y movimientos</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Card 5: Alertas */}
          <button
            onClick={() => onNavegar('alertas')}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 p-5 rounded-2xl transition-all text-left flex flex-col justify-between group shadow-sm hover:shadow-md relative cursor-pointer"
          >
            {contadorAlertasTotales > 0 && (
              <span className="absolute top-4 right-4 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums shadow-sm">
                {contadorAlertasTotales} en seguimiento
              </span>
            )}
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                Alertas de Vencimiento
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Reporte de lotes próximos a vencer o que ya cumplieron los días de anticipación de retiro.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 mt-2 border-t border-slate-800/60">
              <span className={contadorAlertasCriticas > 0 ? 'text-red-400 font-bold' : ''}>
                {contadorAlertasCriticas > 0 ? `${contadorAlertasCriticas} críticos` : 'Sin urgencias'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Card 6: Respaldo y PWA */}
          <button
            onClick={() => onNavegar('respaldo')}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 p-5 rounded-2xl transition-all text-left flex flex-col justify-between group shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                Instalar App / Respaldos
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Exportar a Excel (CSV), copia de seguridad en JSON e instrucciones para instalar en tu celular como app.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 mt-2 border-t border-slate-800/60">
              <span>Exportar / Importar</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};
