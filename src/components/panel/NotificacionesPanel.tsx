'use client';

import { Bell, CheckCheck, Clock, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Notificacion,
  useNotificaciones,
} from '../../context/NotificacionesContext';

function formatTiempoRelativo(fecha: Date): string {
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffSeg = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSeg / 60);
  const diffHoras = Math.floor(diffMin / 60);

  if (diffSeg < 60) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHoras < 24) return `Hace ${diffHoras}h`;
  return fecha.toLocaleDateString('es-CL');
}

function getIconoTipo(tipo: Notificacion['tipo']) {
  switch (tipo) {
    case 'urgente':
      return { color: 'text-red-500', bg: 'bg-red-100' };
    case 'expirado':
      return { color: 'text-orange-500', bg: 'bg-orange-100' };
    case 'alerta':
      return { color: 'text-yellow-500', bg: 'bg-yellow-100' };
    case 'info':
    default:
      return { color: 'text-blue-500', bg: 'bg-blue-100' };
  }
}

interface NotificacionItemProps {
  notificacion: Notificacion;
  onMarcarLeida: (id: string) => void;
}

function NotificacionItem({
  notificacion,
  onMarcarLeida,
}: NotificacionItemProps) {
  const estilos = getIconoTipo(notificacion.tipo);

  return (
    <div
      className={`p-3 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
        !notificacion.leida ? 'bg-blue-50/50' : ''
      }`}
      onClick={() => onMarcarLeida(notificacion.id)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${estilos.bg}`}
        >
          <Clock size={14} className={estilos.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm text-[#334155] truncate">
              {notificacion.titulo}
            </span>
            {!notificacion.leida && (
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">
            {notificacion.mensaje}
          </p>
          <span className="text-xs text-[#94A3B8] mt-1 block">
            {formatTiempoRelativo(notificacion.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function NotificacionesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    notificaciones,
    noLeidas,
    marcarComoLeida,
    marcarTodasLeidas,
    limpiarNotificaciones,
  } = useNotificaciones();

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Boton campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={20} className="text-[#64748B]" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <h3 className="font-semibold text-[#334155]">Notificaciones</h3>
            <div className="flex items-center gap-1">
              {noLeidas > 0 && (
                <button
                  onClick={marcarTodasLeidas}
                  className="p-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors"
                  title="Marcar todas como leidas"
                >
                  <CheckCheck size={16} className="text-[#64748B]" />
                </button>
              )}
              {notificaciones.length > 0 && (
                <button
                  onClick={limpiarNotificaciones}
                  className="p-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors"
                  title="Limpiar notificaciones"
                >
                  <Trash2 size={16} className="text-[#64748B]" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors"
              >
                <X size={16} className="text-[#64748B]" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={32} className="mx-auto text-[#CBD5E1] mb-2" />
                <p className="text-sm text-[#94A3B8]">No hay notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notificacion) => (
                <NotificacionItem
                  key={notificacion.id}
                  notificacion={notificacion}
                  onMarcarLeida={marcarComoLeida}
                />
              ))
            )}
          </div>

          {/* Footer con contador */}
          {notificaciones.length > 0 && (
            <div className="px-4 py-2 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <p className="text-xs text-[#94A3B8] text-center">
                {notificaciones.length} notificaciones
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
