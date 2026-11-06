import React from 'react';
import { 
  Boxes, 
  Warehouse, 
  Store, 
  PlusCircle, 
  AlertTriangle, 
  Tags, 
  DownloadCloud, 
  Menu as MenuIcon, 
  X,
  Plus
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export type TabId = 'menu' | 'alertas' | 'camara' | 'mural' | 'movimiento' | 'catalogo' | 'respaldo';

interface HeaderProps {
  tabActiva: TabId;
  onCambiarTab: (tab: TabId) => void;
  onAbrirIngresoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ tabActiva, onCambiarTab, onAbrirIngresoModal }) => {
  const { contadorAlertasCriticas, contadorAlertasTotales } = useInventory();
  const [menuMovilAbierto, setMenuMovilAbierto] = React.useState(false);

  const navItems: Array<{ id: TabId; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'menu', label: 'Inicio', icon: <Boxes className="w-4 h-4" /> },
    { id: 'camara', label: 'Cámara', icon: <Warehouse className="w-4 h-4" /> },
    { id: 'mural', label: 'Mural', icon: <Store className="w-4 h-4" /> },
    { id: 'movimiento', label: 'Ingresar / Traspaso', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'catalogo', label: 'Catálogo', icon: <Tags className="w-4 h-4" /> },
    { 
      id: 'alertas', 
      label: 'Alertas', 
      icon: <AlertTriangle className="w-4 h-4" />, 
      badge: contadorAlertasCriticas > 0 ? contadorAlertasCriticas : (contadorAlertasTotales > 0 ? contadorAlertasTotales : undefined) 
    },
    { id: 'respaldo', label: 'Cloud / App', icon: <DownloadCloud className="w-4 h-4" /> }
  ];

  const handleSelectTab = (id: TabId) => {
    onCambiarTab(id);
    setMenuMovilAbierto(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark (Single text element with icon) */}
          <div 
            onClick={() => handleSelectTab('menu')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-md shadow-red-950/40 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block leading-none">
                Stock Carnicería
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 block leading-none">
                Cámara · Mural · Vencimientos
              </span>
            </div>
          </div>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = tabActiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'bg-red-950/80 text-red-200 border border-red-800/60' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold text-white bg-red-600 rounded-full tabular-nums shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Quick Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAbrirIngresoModal}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-xl transition-all shadow-md shadow-red-950/50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ingresar Lote</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
              aria-label="Abrir menú"
            >
              {menuMovilAbierto ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {menuMovilAbierto && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 px-4 py-3 space-y-1 shadow-2xl">
          {navItems.map(item => {
            const isActive = tabActiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-red-950/90 text-red-200 border border-red-800/60' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-red-600 rounded-full tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2">
            <button
              onClick={() => {
                setMenuMovilAbierto(false);
                onAbrirIngresoModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-950/50"
            >
              <Plus className="w-4 h-4" />
              <span>Ingresar Nuevo Lote</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
