'use client';

import {
  Bell,
  Bug,
  Calendar,
  History,
  LayoutGrid,
  QrCode,
  UtensilsCrossed,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import HistorialPedidos from '../../components/gerente/HistorialPedidos';
import { MesaDetailContent } from '../../components/mesero/MesaDetailContent';
import { ReservasManagement } from '../../components/mesero/ReservasManagement';
import { ScanQRReserva } from '../../components/mesero/ScanQRReserva';
import { TablasMapa } from '../../components/mesero/TablasMapa';
import {
  MiPerfilEmpleado,
  PanelSidebar,
  PanelTopNav,
} from '../../components/panel';
import { useAuth } from '../../context/AuthContext';
import { useNotificaciones } from '../../context/NotificacionesContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../utils/apiClient';

// Importación dinámica del componente de debug
const DebugQRsPage = dynamic(
  () => import('../../app/dashboard-mesero/debug-qr/page'),
  { ssr: false }
);

// Estados del backend
export type MesaEstado =
  | 'DISPONIBLE'
  | 'RESERVADA'
  | 'OCUPADA'
  | 'FUERA_DE_SERVICIO';

export type PedidoEstado =
  | 'INICIADO'
  | 'RECEPCION'
  | 'EN_PROCESO'
  | 'TERMINADO'
  | 'SERVIDO'
  | 'COMPLETADO'
  | 'CANCELADO';

export interface Mesa {
  id: string;
  id_empresa: string;
  nombre: string;
  descripcion?: string;
  capacidad: number;
  orden: number;
  estado: MesaEstado;
  pedidos_count?: number;
  posicion_x?: number;
  posicion_y?: number;
  num_personas?: number;
  expiracion?: string; // ISO timestamp de expiración del pedido activo
}

export interface Pedido {
  id: string;
  id_mesa: string;
  id_usuario?: string;
  fecha_pedido: string;
  total: number;
  estado: PedidoEstado;
  creado_el: string;
  mesa_nombre?: string;
  usuario_nombre?: string;
  lineas?: LineaPedido[];
  notas?: string;
}

export interface LineaPedido {
  id: string;
  id_pedido: string;
  id_producto: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export default function DashboardMeseroScreen() {
  const router = useRouter();
  const { user, userType, isLoggedIn } = useAuth();
  const { socket, isConnected, authenticate, joinLocal } = useSocket();
  const { agregarNotificacion } = useNotificaciones();
  const [activeSection, setActiveSection] = useState<
    'mesas' | 'reservas' | 'qr' | 'debug-qr' | 'historial'
  >('mesas');
  const [mesas, setMesas] = useState<Mesa[]>([]);

  // Check authentication and role
  useEffect(() => {
    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
    }
  }, [isLoggedIn, userType, router]);

  const loadMesas = useCallback(async () => {
    try {
      const data = await api.empresa.getMesas();
      const mesasData: Mesa[] = data
        .map((m: Record<string, unknown>) => ({
          id: String(m.id),
          id_empresa: String(m.id_local),
          nombre: m.nombre as string,
          descripcion: (m.descripcion as string) || '',
          capacidad: m.capacidad as number,
          orden: (m.orden as number) ?? 0,
          estado: (m.estado as string).toUpperCase() as MesaEstado,
          pedidos_count: m.pedidos_count as number,
          num_personas: (m.num_personas as number) || undefined,
          expiracion: (m.expiracion as string) || undefined,
        }))
        .sort((a: Mesa, b: Mesa) => a.orden - b.orden);
      setMesas(mesasData);
    } catch (error) {
      console.error('Error loading mesas:', error);
    }
  }, []);

  // Join local room on load and authenticate
  useEffect(() => {
    if (user?.id_local && isConnected) {
      // Autenticar para identificar en logs del backend
      authenticate(Number(user.id), user.name || 'Mesero', 'mesero');
      joinLocal(Number(user.id_local));
      console.log('Mesero unido a sala local:', user.id_local);
    }
  }, [
    user?.id_local,
    user?.id,
    user?.name,
    isConnected,
    authenticate,
    joinLocal,
  ]);

  // Listen for WebSocket events
  useEffect(() => {
    if (!socket) return;

    const handleMesaActualizada = (data: {
      mesa_id: number;
      estado: string;
    }) => {
      console.log('WS: Mesa actualizada', data);
      setMesas((prev) =>
        prev.map((mesa) =>
          mesa.id === String(data.mesa_id)
            ? { ...mesa, estado: data.estado.toUpperCase() as MesaEstado }
            : mesa
        )
      );
    };

    const handleQREscaneado = (data: { mesa_id: number }) => {
      console.log('WS: QR Escaneado', data);
      // Recargar todas las mesas para obtener datos actualizados (incluyendo num_personas)
      void loadMesas();
    };

    // Alertas de pedidos (TERMINADO/SERVIDO)
    const handleAlertaPedido = (data: {
      pedido_id: number;
      mesa_id: number;
      mesa_nombre: string;
      tipo_alerta: string;
      mensaje: string;
      minutos_restantes?: number;
    }) => {
      console.log('WS: Alerta Pedido', data);

      // Mostrar notificación según tipo de alerta
      const isUrgente =
        data.tipo_alerta === 'terminado_10min' ||
        data.tipo_alerta === 'servido_5min';

      // Agregar al panel de notificaciones
      agregarNotificacion({
        tipo: isUrgente ? 'urgente' : 'alerta',
        titulo: isUrgente ? 'ALERTA URGENTE' : 'Alerta Pedido',
        mensaje: data.mensaje,
        pedidoId: data.pedido_id,
        mesaId: data.mesa_id,
        mesaNombre: data.mesa_nombre,
      });

      // Usar notificación del navegador si está permitida
      if (Notification.permission === 'granted') {
        new Notification(isUrgente ? 'ALERTA URGENTE' : 'Alerta Pedido', {
          body: data.mensaje,
          icon: '/icon.png',
          tag: `alerta-${data.pedido_id}-${data.tipo_alerta}`,
        });
      }

      // También mostrar en consola para desarrollo
      if (isUrgente) {
        console.warn(`ALERTA URGENTE: ${data.mensaje}`);
      }
    };

    // Pedido expirado (cancelación automática)
    const handlePedidoExpirado = (data: {
      pedido_id: number;
      mesa_id: number;
      mesa_nombre: string;
    }) => {
      console.log('WS: Pedido Expirado', data);

      // Agregar al panel de notificaciones
      agregarNotificacion({
        tipo: 'expirado',
        titulo: 'Pedido Expirado',
        mensaje: `El pedido de ${data.mesa_nombre} ha expirado y fue cancelado`,
        pedidoId: data.pedido_id,
        mesaId: data.mesa_id,
        mesaNombre: data.mesa_nombre,
      });

      // Notificación de expiración
      if (Notification.permission === 'granted') {
        new Notification('Pedido Expirado', {
          body: `El pedido de ${data.mesa_nombre} ha expirado y fue cancelado`,
          icon: '/icon.png',
          tag: `expirado-${data.pedido_id}`,
        });
      }

      // Recargar mesas para reflejar cambio de estado
      void loadMesas();
    };

    // Expiración actualizada (cuando se extiende tiempo o cambia estado)
    const handleExpiracionActualizada = (data: {
      mesa_id: number;
      expiracion: string | null;
    }) => {
      console.log('WS: Expiracion actualizada', data);
      setMesas((prev) =>
        prev.map((mesa) =>
          mesa.id === String(data.mesa_id)
            ? { ...mesa, expiracion: data.expiracion || undefined }
            : mesa
        )
      );
    };

    socket.on('mesa_actualizada', handleMesaActualizada);
    socket.on('qr_escaneado', handleQREscaneado);
    socket.on('alerta_pedido', handleAlertaPedido);
    socket.on('pedido_expirado', handlePedidoExpirado);
    socket.on('expiracion_actualizada', handleExpiracionActualizada);

    return () => {
      socket.off('mesa_actualizada', handleMesaActualizada);
      socket.off('qr_escaneado', handleQREscaneado);
      socket.off('alerta_pedido', handleAlertaPedido);
      socket.off('pedido_expirado', handlePedidoExpirado);
      socket.off('expiracion_actualizada', handleExpiracionActualizada);
    };
  }, [socket, loadMesas, agregarNotificacion]);

  // Estado de permisos de notificación (inicializado lazy)
  const [notificacionesPermitidas, setNotificacionesPermitidas] = useState<
    boolean | null
  >(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return null;
  });

  const solicitarPermisoNotificaciones = async () => {
    if ('Notification' in window) {
      const permiso = await Notification.requestPermission();
      setNotificacionesPermitidas(permiso === 'granted');
    }
  };

  // Load initial data on mount
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Carga inicial necesaria
      void loadMesas();
    }
  }, [loadMesas]);

  const handleMesaUpdate = (updatedMesa: Mesa) => {
    setMesas((prev) =>
      prev.map((m) => (m.id === updatedMesa.id ? updatedMesa : m))
    );
  };

  const handleMesaCreate = (newMesa: Mesa) => {
    setMesas((prev) => [...prev, newMesa]);
  };

  const handleMesaDelete = (mesaId: string) => {
    setMesas((prev) => prev.filter((m) => m.id !== mesaId));
  };

  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);

  const handleMesaSelect = (mesaId: string) => {
    setSelectedMesaId(mesaId);
  };

  const handleVolverMesas = () => {
    setSelectedMesaId(null);
  };

  const menuItems = [
    { id: 'mesas' as const, label: 'Mesas', icon: LayoutGrid },
    { id: 'reservas' as const, label: 'Reservas', icon: Calendar },
    { id: 'qr' as const, label: 'Escanear QR', icon: QrCode },
    { id: 'historial' as const, label: 'Historial', icon: History },
    { id: 'debug-qr' as const, label: 'Debug QRs', icon: Bug },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#1a1f2e' }}
    >
      {/* Sidebar */}
      <PanelSidebar
        title="RestoMap"
        subtitle="Panel Mesero"
        icon={UtensilsCrossed}
        menuItems={menuItems}
        activeItem={activeSection}
        onNavigate={(id: string) => {
          setActiveSection(
            id as 'mesas' | 'reservas' | 'qr' | 'debug-qr' | 'historial'
          );
          setSelectedMesaId(null);
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <PanelTopNav
          panelName="Panel de Mesero"
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          pageTitle={
            activeSection === 'mesas'
              ? 'Mesas'
              : activeSection === 'reservas'
              ? 'Reservas'
              : activeSection === 'historial'
              ? 'Historial'
              : activeSection === 'debug-qr'
              ? 'Debug QRs'
              : 'Escanear QR'
          }
          pageDescription={
            activeSection === 'mesas'
              ? 'Gestiona las mesas del restaurante'
              : activeSection === 'reservas'
              ? 'Gestiona las reservas del dia'
              : activeSection === 'historial'
              ? 'Ver historial de pedidos completados'
              : activeSection === 'debug-qr'
              ? 'Ver todos los QRs en la base de datos'
              : 'Escanea codigo QR de reservas'
          }
          user={user}
          onOpenProfile={() => setShowProfile(true)}
        />

        {/* Content Area - Area clara con esquina redondeada */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC]">
          {/* Banner de notificaciones */}
          {notificacionesPermitidas === false && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-blue-600" />
                <span className="text-sm text-blue-800">
                  Activa las notificaciones para recibir alertas de pedidos
                </span>
              </div>
              <button
                onClick={solicitarPermisoNotificaciones}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Activar
              </button>
            </div>
          )}
          {activeSection === 'mesas' &&
            (selectedMesaId ? (
              <MesaDetailContent
                mesaId={selectedMesaId}
                onVolver={handleVolverMesas}
              />
            ) : (
              <TablasMapa
                mesas={mesas}
                onMesaUpdate={handleMesaUpdate}
                onMesaCreate={handleMesaCreate}
                onMesaDelete={handleMesaDelete}
                onMesaSelect={handleMesaSelect}
                onRefresh={loadMesas}
              />
            ))}
          {activeSection === 'reservas' && <ReservasManagement mesas={mesas} />}
          {activeSection === 'qr' && (
            <ScanQRReserva mesas={mesas} onMesaUpdate={handleMesaUpdate} />
          )}
          {activeSection === 'historial' && <HistorialPedidos />}
          {activeSection === 'debug-qr' && <DebugQRsPage />}
        </main>
      </div>

      {/* Modal Mi Perfil */}
      <MiPerfilEmpleado
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
      />
    </div>
  );
}
