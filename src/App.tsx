/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header, TabId } from './components/Header';
import { MenuPrincipal } from './components/MenuPrincipal';
import { AlertasView } from './components/AlertasView';
import { UbicacionView } from './components/UbicacionView';
import { IngresoYTraspasoView } from './components/IngresoYTraspasoView';
import { CatalogoView } from './components/CatalogoView';
import { RespaldoView } from './components/RespaldoView';
import { ModalLote } from './components/ModalLote';
import { ModalNotificacion, NotificacionInfo } from './components/ModalNotificacion';
import { Lote, Producto } from './types/inventory';
import { ArrowLeft, Plus } from 'lucide-react';

const AppContent: React.FC = () => {
  const [tabActiva, setTabActiva] = useState<TabId>('menu');

  // Modal Lote states
  const [modalLoteAbierto, setModalLoteAbierto] = useState(false);
  const [ubicacionInicialModal, setUbicacionInicialModal] = useState<'camara' | 'mural'>('camara');
  const [loteAEditar, setLoteAEditar] = useState<Lote | null>(null);

  // Transfer batch preselection when coming from Alertas or Ubicacion
  const [loteParaTraspaso, setLoteParaTraspaso] = useState<{ id: number; ubicacion: 'camara' | 'mural'; productoId: number } | null>(null);

  // Notification Modal
  const [notificacion, setNotificacion] = useState<NotificacionInfo | null>(null);

  const handleAbrirNuevoLote = (ubi: 'camara' | 'mural' = 'camara') => {
    setLoteAEditar(null);
    setUbicacionInicialModal(ubi);
    setModalLoteAbierto(true);
  };

  const handleEditarLote = (lote: Lote) => {
    setLoteAEditar(lote);
    setUbicacionInicialModal(lote.ubicacion);
    setModalLoteAbierto(true);
  };

  const handleIniciarTraspaso = (lote: Lote) => {
    setLoteParaTraspaso({
      id: lote.id,
      ubicacion: lote.ubicacion,
      productoId: lote.productoId
    });
    setTabActiva('movimiento');
  };

  const handleNuevoIngresoParaCorte = (prod: Producto) => {
    setLoteAEditar(null);
    setUbicacionInicialModal('camara');
    setModalLoteAbierto(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Header
        tabActiva={tabActiva}
        onCambiarTab={(tab) => {
          setTabActiva(tab);
          if (tab !== 'movimiento') {
            setLoteParaTraspaso(null);
          }
        }}
        onAbrirIngresoModal={() => handleAbrirNuevoLote('camara')}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Breadcrumb / Back button when navigating subviews */}
        {tabActiva !== 'menu' && (
          <div className="flex items-center justify-between pb-1">
            <button
              onClick={() => {
                setTabActiva('menu');
                setLoteParaTraspaso(null);
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-850 px-3.5 py-1.5 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Menú Principal</span>
            </button>

            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Control de Stock y Vencimientos
            </span>
          </div>
        )}

        {/* Tab views */}
        {tabActiva === 'menu' && (
          <MenuPrincipal
            onNavegar={(tab) => setTabActiva(tab)}
            onAbrirModal={handleAbrirNuevoLote}
          />
        )}

        {tabActiva === 'alertas' && (
          <AlertasView
            onAbrirTraspaso={handleIniciarTraspaso}
            onEditarLote={handleEditarLote}
          />
        )}

        {tabActiva === 'camara' && (
          <UbicacionView
            tipo="camara"
            onNuevoLote={handleAbrirNuevoLote}
            onEditarLote={handleEditarLote}
            onTraspasarLote={handleIniciarTraspaso}
          />
        )}

        {tabActiva === 'mural' && (
          <UbicacionView
            tipo="mural"
            onNuevoLote={handleAbrirNuevoLote}
            onEditarLote={handleEditarLote}
            onTraspasarLote={handleIniciarTraspaso}
          />
        )}

        {tabActiva === 'movimiento' && (
          <IngresoYTraspasoView
            subTabInicial={loteParaTraspaso ? 'traspaso' : 'nuevo'}
            lotePreseleccionado={loteParaTraspaso}
            onExito={() => {
              setNotificacion({
                titulo: '¡Operación Exitosa!',
                mensaje: 'El registro se ha procesado y guardado en el inventario.',
                tipo: 'exito'
              });
              setLoteParaTraspaso(null);
            }}
          />
        )}

        {tabActiva === 'catalogo' && (
          <CatalogoView
            onNuevoIngresoParaCorte={handleNuevoIngresoParaCorte}
          />
        )}

        {tabActiva === 'respaldo' && (
          <RespaldoView />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-400">Stock de Inventario Carnicería</strong> · Control de Cámara, Mural y Vencimientos
          </div>
          <div>
            Persistencia Local Activa · Datos protegidos en el dispositivo
          </div>
        </div>
      </footer>

      {/* Reusable Modal for Batch Ingestion / Edit */}
      <ModalLote
        abierto={modalLoteAbierto}
        ubicacionInicial={ubicacionInicialModal}
        loteAEditar={loteAEditar}
        onCerrar={() => {
          setModalLoteAbierto(false);
          setLoteAEditar(null);
        }}
        onExito={(msg) => {
          setNotificacion({
            titulo: '¡Guardado!',
            mensaje: msg,
            tipo: 'exito'
          });
        }}
      />

      {/* Notification Toast Modal */}
      <ModalNotificacion
        info={notificacion}
        onCerrar={() => setNotificacion(null)}
      />

    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}
