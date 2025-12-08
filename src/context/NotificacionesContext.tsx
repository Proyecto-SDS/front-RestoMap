'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

export interface Notificacion {
  id: string;
  tipo: 'alerta' | 'urgente' | 'expirado' | 'info';
  titulo: string;
  mensaje: string;
  timestamp: Date;
  leida: boolean;
  pedidoId?: number;
  mesaId?: number;
  mesaNombre?: string;
}

interface NotificacionesContextType {
  notificaciones: Notificacion[];
  noLeidas: number;
  agregarNotificacion: (
    notificacion: Omit<Notificacion, 'id' | 'timestamp' | 'leida'>
  ) => void;
  marcarComoLeida: (id: string) => void;
  marcarTodasLeidas: () => void;
  limpiarNotificaciones: () => void;
}

const NotificacionesContext = createContext<NotificacionesContextType | null>(
  null
);

const MAX_NOTIFICACIONES = 50;

export function NotificacionesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const agregarNotificacion = useCallback(
    (nueva: Omit<Notificacion, 'id' | 'timestamp' | 'leida'>) => {
      const notificacion: Notificacion = {
        ...nueva,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: new Date(),
        leida: false,
      };

      setNotificaciones((prev) => {
        const updated = [notificacion, ...prev];
        // Limitar a MAX_NOTIFICACIONES
        if (updated.length > MAX_NOTIFICACIONES) {
          return updated.slice(0, MAX_NOTIFICACIONES);
        }
        return updated;
      });
    },
    []
  );

  const marcarComoLeida = useCallback((id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  }, []);

  const marcarTodasLeidas = useCallback(() => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  }, []);

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([]);
  }, []);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <NotificacionesContext.Provider
      value={{
        notificaciones,
        noLeidas,
        agregarNotificacion,
        marcarComoLeida,
        marcarTodasLeidas,
        limpiarNotificaciones,
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}

export function useNotificaciones() {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error(
      'useNotificaciones debe usarse dentro de NotificacionesProvider'
    );
  }
  return context;
}
