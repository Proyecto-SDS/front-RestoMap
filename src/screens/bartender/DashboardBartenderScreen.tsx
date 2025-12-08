'use client';

import { Bell, Package, Wine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { InventarioBartender } from '../../components/bartender/InventarioBartender';
import { KanbanBoard } from '../../components/cocinero/KanbanBoard';
import {
  MiPerfilEmpleado,
  PanelSidebar,
  PanelTopNav,
} from '../../components/panel';
import { useAuth } from '../../context/AuthContext';
import { useNotificaciones } from '../../context/NotificacionesContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../utils/apiClient';
import type { Pedido, Producto } from '../cocinero/DashboardCocineroScreen';

interface PedidosByEstado {
  tomados: Pedido[];
  en_proceso: Pedido[];
  listos: Pedido[];
}

export default function DashboardBartenderScreen() {
  const router = useRouter();
  const { user, userType, isLoggedIn } = useAuth();
  const { socket, isConnected, authenticate, joinLocal } = useSocket();
  const { agregarNotificacion } = useNotificaciones();
  const [activeSection, setActiveSection] = useState<'pedidos' | 'inventario'>(
    'pedidos'
  );
  const [pedidos, setPedidos] = useState<PedidosByEstado>({
    tomados: [],
    en_proceso: [],
    listos: [],
  });
  const [bebidas, setBebidas] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
    }
  }, [isLoggedIn, userType, router]);

  const loadPedidos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.empresa.getPedidosBarra();
      const pedidosList = data.map((p: Record<string, unknown>) => ({
        id: String(p.id),
        id_mesa: String(p.id_mesa),
        mesa_nombre: p.mesa_nombre as string,
        fecha_pedido: p.creado_el as string,
        total: (p.total as number) || 0,
        estado: ((p.estado as string) || 'INICIADO').toUpperCase(),
        creado_el: p.creado_el as string,
        actualizado_el: (p.actualizado_el as string) || undefined,
        lineas:
          (p.lineas as Array<Record<string, unknown>>)?.map((l) => ({
            id: String(l.id),
            id_pedido: String(p.id),
            id_producto: String(l.producto_id),
            producto_nombre: l.producto_nombre as string,
            cantidad: l.cantidad as number,
            precio_unitario: l.precio_unitario as number,
            notas: (l.observaciones as string) || undefined,
          })) || [],
      })) as Pedido[];

      setPedidos({
        tomados: pedidosList.filter((p) => p.estado === 'RECEPCION'),
        en_proceso: pedidosList.filter((p) => p.estado === 'EN_PROCESO'),
        listos: pedidosList.filter((p) => p.estado === 'TERMINADO'),
      });
    } catch (error) {
      console.error('Error loading pedidos barra:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadBebidas = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchBebidasAlcoholicas();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBebidasAlcoholicas = async () => {
    try {
      const data = await api.empresa.getProductos();
      // Filtrar solo bebidas (en producción filtrar por categoría)
      const bebidasList = data.map((p: Record<string, unknown>) => ({
        id: String(p.id),
        id_empresa: String(p.id_local || '1'),
        id_categoria: String(p.categoria_id || ''),
        categoria_nombre: (p.categoria_nombre as string) || '',
        nombre: p.nombre as string,
        precio: p.precio as number,
        estado: (p.estado as string) || 'disponible',
      })) as Producto[];
      setBebidas(bebidasList);
    } catch (error) {
      console.error('Error loading bebidas:', error);
    }
  };

  // Join WebSocket and authenticate
  useEffect(() => {
    if (user?.id_local && isConnected) {
      authenticate(Number(user.id), user.name || 'Bartender', 'bartender');
      joinLocal(Number(user.id_local));
      console.log('Bartender unido a sala local:', user.id_local);
    }
  }, [
    user?.id_local,
    user?.id,
    user?.name,
    isConnected,
    authenticate,
    joinLocal,
  ]);

  // Listen for WebSocket events -> Recargar kanban
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      console.log('WS: Actualización recibida');
      loadPedidos();
    };

    // Urgencia Kanban - pedido >30min en RECEPCION
    const handleUrgenciaKanban = (data: {
      pedido_id: number;
      mesa_nombre: string;
      minutos_espera: number;
    }) => {
      console.warn(
        `URGENCIA: Pedido ${data.mesa_nombre} lleva ${data.minutos_espera} min esperando!`
      );

      // Agregar al panel de notificaciones
      agregarNotificacion({
        tipo: 'urgente',
        titulo: 'Pedido URGENTE',
        mensaje: `${data.mesa_nombre} lleva ${data.minutos_espera} min esperando atención`,
        pedidoId: data.pedido_id,
        mesaNombre: data.mesa_nombre,
      });

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pedido URGENTE', {
          body: `${data.mesa_nombre} lleva ${data.minutos_espera} min esperando atención`,
          icon: '/icon.png',
          tag: `urgencia-${data.pedido_id}`,
        });
      }
    };

    // Pedido expirado/cancelado - remover del kanban
    const handlePedidoExpirado = () => {
      loadPedidos();
    };

    // Estado de pedido cambiado
    const handleEstadoPedido = (data: { estado: string }) => {
      if (data.estado === 'CANCELADO' || data.estado === 'COMPLETADO') {
        loadPedidos();
      }
    };

    socket.on('nueva_encomienda', handleUpdate);
    socket.on('estado_encomienda', handleUpdate);
    socket.on('urgencia_kanban', handleUrgenciaKanban);
    socket.on('pedido_expirado', handlePedidoExpirado);
    socket.on('estado_pedido', handleEstadoPedido);

    return () => {
      socket.off('nueva_encomienda', handleUpdate);
      socket.off('estado_encomienda', handleUpdate);
      socket.off('urgencia_kanban', handleUrgenciaKanban);
      socket.off('pedido_expirado', handlePedidoExpirado);
      socket.off('estado_pedido', handleEstadoPedido);
    };
  }, [socket, loadPedidos, agregarNotificacion]);

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

  const handlePedidoUpdate = (updatedPedido: Pedido) => {
    // Remove from old column and add to new column
    setPedidos((prev) => {
      const newState = { ...prev };

      // Remove from all columns
      Object.keys(newState).forEach((key) => {
        newState[key as keyof PedidosByEstado] = newState[
          key as keyof PedidosByEstado
        ].filter((p) => p.id !== updatedPedido.id);
      });

      // Add to appropriate column
      if (updatedPedido.estado === 'RECEPCION') {
        newState.tomados.push(updatedPedido);
      } else if (updatedPedido.estado === 'EN_PROCESO') {
        newState.en_proceso.push(updatedPedido);
      } else if (updatedPedido.estado === 'TERMINADO') {
        newState.listos.push(updatedPedido);
      }

      return newState;
    });
  };

  const handleBebidaUpdate = (updatedBebida: Producto) => {
    setBebidas((prev) =>
      prev.map((b) => (b.id === updatedBebida.id ? updatedBebida : b))
    );
  };

  // Load initial data
  useEffect(() => {
    loadPedidos();
    loadBebidas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'pedidos' as const, label: 'Pedidos', icon: Wine },
    { id: 'inventario' as const, label: 'Inventario', icon: Package },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#1a1f2e' }}
    >
      {/* Sidebar */}
      <PanelSidebar
        title="RestoMap"
        subtitle="Panel Barra"
        icon={Wine}
        menuItems={menuItems}
        activeItem={activeSection}
        onNavigate={(id: string) =>
          setActiveSection(id as 'pedidos' | 'inventario')
        }
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <PanelTopNav
          panelName="Panel de Barra"
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          pageTitle={
            activeSection === 'pedidos' ? 'Pedidos' : 'Inventario de Barra'
          }
          pageDescription={
            activeSection === 'pedidos'
              ? 'Gestiona los pedidos de bebidas en tiempo real'
              : 'Gestiona la disponibilidad de bebidas alcohólicas. Los productos NO disponibles no aparecerán en el menú del cliente.'
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
                  urgentes
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#64748B]">Cargando...</p>
              </div>
            </div>
          ) : (
            <>
              {activeSection === 'pedidos' && (
                <KanbanBoard
                  pedidos={pedidos}
                  onPedidoUpdate={handlePedidoUpdate}
                  onRefresh={loadPedidos}
                />
              )}
              {activeSection === 'inventario' && (
                <InventarioBartender
                  bebidas={bebidas}
                  onBebidaUpdate={handleBebidaUpdate}
                  onRefresh={fetchBebidasAlcoholicas}
                />
              )}
            </>
          )}
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
