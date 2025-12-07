'use client';

import { ChefHat, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { InventarioCocinero } from '../../components/cocinero/InventarioCocinero';
import { KanbanBoard } from '../../components/cocinero/KanbanBoard';
import { CustomScrollbar } from '../../components/layout/CustomScrollbar';
import {
  MiPerfilEmpleado,
  PanelSidebar,
  PanelTopNav,
} from '../../components/panel';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../utils/apiClient';

export type PedidoEstado =
  | 'INICIADO'
  | 'RECEPCION'
  | 'EN_PROCESO'
  | 'TERMINADO'
  | 'COMPLETADO'
  | 'CANCELADO';

export interface LineaPedido {
  id: string;
  id_pedido: string;
  id_producto: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  notas?: string;
}

export interface Pedido {
  id: string;
  id_mesa: string;
  mesa_nombre: string;
  id_usuario?: string;
  fecha_pedido: string;
  total: number;
  estado: PedidoEstado;
  creado_el: string;
  lineas: LineaPedido[];
  notas?: string;
}

export interface Producto {
  id: string;
  id_empresa: string;
  id_categoria: string;
  categoria_nombre: string;
  nombre: string;
  precio: number;
  estado: 'disponible' | 'agotado' | 'inactivo';
}

interface PedidosByEstado {
  tomados: Pedido[];
  en_proceso: Pedido[];
  listos: Pedido[];
  entregados: Pedido[];
}

export default function DashboardCocineroScreen() {
  const router = useRouter();
  const { user, userType, isLoggedIn } = useAuth();
  const { socket, isConnected, authenticate, joinLocal } = useSocket();
  const [activeSection, setActiveSection] = useState<'pedidos' | 'inventario'>(
    'pedidos'
  );
  const [pedidos, setPedidos] = useState<PedidosByEstado>({
    tomados: [],
    en_proceso: [],
    listos: [],
    entregados: [],
  });
  const [productos, setProductos] = useState<Producto[]>([]);

  // Check authentication
  useEffect(() => {
    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
    }
  }, [isLoggedIn, userType, router]);

  const loadPedidos = useCallback(async () => {
    try {
      const data = await api.empresa.getPedidosCocina();
      const pedidosList = data.map((p: Record<string, unknown>) => ({
        id: String(p.id),
        id_mesa: String(p.id_mesa),
        mesa_nombre: p.mesa_nombre as string,
        fecha_pedido: p.creado_el as string,
        total: (p.total as number) || 0,
        estado: ((p.estado as string) || 'INICIADO').toUpperCase(),
        creado_el: p.creado_el as string,
        lineas:
          (p.lineas as Array<Record<string, unknown>>)?.map((l) => ({
            id: String(l.id),
            id_pedido: String(p.id),
            id_producto: String(l.producto_id),
            producto_nombre: l.producto_nombre as string,
            cantidad: l.cantidad as number,
            precio_unitario: l.precio_unitario as number,
          })) || [],
      })) as Pedido[];

      setPedidos({
        tomados: pedidosList.filter((p) => p.estado === 'INICIADO'),
        en_proceso: pedidosList.filter(
          (p) => p.estado === 'RECEPCION' || p.estado === 'EN_PROCESO'
        ),
        listos: pedidosList.filter((p) => p.estado === 'TERMINADO'),
        entregados: pedidosList.filter((p) => p.estado === 'COMPLETADO'),
      });
    } catch (error) {
      console.error('Error loading pedidos:', error);
    }
  }, []);

  // WebSocket Integration and authenticate
  useEffect(() => {
    if (user?.id_local && isConnected) {
      authenticate(Number(user.id), user.name || 'Cocinero', 'cocinero');
      joinLocal(Number(user.id_local));
      console.log('Cocinero unido a sala local:', user.id_local);
    }
  }, [
    user?.id_local,
    user?.id,
    user?.name,
    isConnected,
    authenticate,
    joinLocal,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      console.log('WS: Actualización recibida');
      loadPedidos(); // Recargar kanban
    };

    socket.on('nueva_encomienda', handleUpdate);
    socket.on('estado_encomienda', handleUpdate);

    return () => {
      socket.off('nueva_encomienda', handleUpdate);
      socket.off('estado_encomienda', handleUpdate);
    };
  }, [socket, loadPedidos]);

  const loadProductos = useCallback(async () => {
    try {
      const data = await api.empresa.getProductos();
      const productosList = data.map((p: Record<string, unknown>) => ({
        id: String(p.id),
        id_empresa: String(p.id_local),
        id_categoria: String(p.categoria_id),
        categoria_nombre: p.categoria_nombre as string,
        nombre: p.nombre as string,
        precio: p.precio as number,
        estado: (p.estado as string) || 'disponible',
      })) as Producto[];
      setProductos(productosList);
    } catch (error) {
      console.error('Error loading productos:', error);
    }
  }, []);

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
      if (updatedPedido.estado === 'INICIADO') {
        newState.tomados.push(updatedPedido);
      } else if (
        updatedPedido.estado === 'RECEPCION' ||
        updatedPedido.estado === 'EN_PROCESO'
      ) {
        newState.en_proceso.push(updatedPedido);
      } else if (updatedPedido.estado === 'TERMINADO') {
        newState.listos.push(updatedPedido);
      } else if (updatedPedido.estado === 'COMPLETADO') {
        newState.entregados.push(updatedPedido);
      }

      return newState;
    });
  };

  const handleProductoUpdate = (updatedProducto: Producto) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === updatedProducto.id ? updatedProducto : p))
    );
  };

  // ... (otros handlers)

  // Load initial data
  useEffect(() => {
    // eslint-disable-next-line
    loadPedidos();
    loadProductos();
  }, [loadPedidos, loadProductos]);

  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'pedidos' as const, label: 'Pedidos', icon: ChefHat },
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
        subtitle="Panel Cocina"
        icon={ChefHat}
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
          panelName="Panel de Cocina"
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          pageTitle={
            activeSection === 'pedidos' ? 'Pedidos' : 'Inventario de Cocina'
          }
          pageDescription={
            activeSection === 'pedidos'
              ? 'Gestiona los pedidos de comida en tiempo real'
              : 'Gestiona la disponibilidad de productos. Los productos NO disponibles no aparecerán en el menú del cliente.'
          }
          user={user}
          onOpenProfile={() => setShowProfile(true)}
        />

        {/* Content Area - Area clara con esquina redondeada */}
        <CustomScrollbar className="flex-1 p-6 bg-[#F8FAFC]">
          {activeSection === 'pedidos' && (
            <KanbanBoard
              pedidos={pedidos}
              onPedidoUpdate={handlePedidoUpdate}
              onRefresh={loadPedidos}
            />
          )}
          {activeSection === 'inventario' && (
            <InventarioCocinero
              productos={productos}
              onProductoUpdate={handleProductoUpdate}
              onRefresh={loadProductos}
            />
          )}
        </CustomScrollbar>
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
