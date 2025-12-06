'use client';

import {
  Calendar,
  ClipboardList,
  LayoutGrid,
  QrCode,
  UtensilsCrossed,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { PedidosManagement } from '../../components/mesero/PedidosManagement';
import { ReservasManagement } from '../../components/mesero/ReservasManagement';
import { ScanQRReserva } from '../../components/mesero/ScanQRReserva';
import { TablasMapa } from '../../components/mesero/TablasMapa';
import {
  MiPerfilEmpleado,
  PanelSidebar,
  PanelTopNav,
} from '../../components/panel';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/apiClient';

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
  | 'COMPLETADO'
  | 'CANCELADO';

export interface Mesa {
  id: string;
  id_empresa: string;
  nombre: string;
  capacidad: number;
  estado: MesaEstado;
  pedidos_count?: number;
  posicion_x?: number;
  posicion_y?: number;
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
  const [activeSection, setActiveSection] = useState<
    'mesas' | 'pedidos' | 'reservas' | 'qr'
  >('mesas');
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // Check authentication and role
  useEffect(() => {
    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
    }
  }, [isLoggedIn, userType, router]);

  const loadMesas = useCallback(async () => {
    try {
      const data = await api.empresa.getMesas();
      // Mapear respuesta del backend a interface Mesa
      const mesasData: Mesa[] = data.map((m: Record<string, unknown>) => ({
        id: String(m.id),
        id_empresa: String(m.id_local),
        nombre: m.nombre as string,
        capacidad: m.capacidad as number,
        estado: (m.estado as string).toUpperCase() as MesaEstado,
        pedidos_count: m.pedidos_count as number,
      }));
      setMesas(mesasData);
    } catch (error) {
      console.error('Error loading mesas:', error);
    }
  }, []);

  const loadPedidos = useCallback(async () => {
    try {
      const data = await api.empresa.getPedidos();
      // Mapear respuesta del backend a interface Pedido
      const pedidosData: Pedido[] = data.map((p: Record<string, unknown>) => ({
        id: String(p.id),
        id_mesa: String(p.id_mesa),
        fecha_pedido: p.creado_el as string,
        total: p.total as number,
        estado: (
          (p.estado as string) || 'INICIADO'
        ).toUpperCase() as PedidoEstado,
        creado_el: p.creado_el as string,
        mesa_nombre: p.mesa_nombre as string,
        lineas: (p.lineas as Array<Record<string, unknown>>)?.map((l) => ({
          id: String(l.id),
          id_pedido: String(p.id),
          id_producto: String(l.producto_id),
          producto_nombre: l.producto_nombre as string,
          cantidad: l.cantidad as number,
          precio_unitario: l.precio_unitario as number,
        })),
      }));
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Error loading pedidos:', error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    // eslint-disable-next-line
    loadMesas();

    loadPedidos();
  }, [loadMesas, loadPedidos]);

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

  const handlePedidoUpdate = (updatedPedido: Pedido) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === updatedPedido.id ? updatedPedido : p))
    );
  };

  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'mesas' as const, label: 'Mesas', icon: LayoutGrid },
    { id: 'pedidos' as const, label: 'Pedidos', icon: ClipboardList },
    { id: 'reservas' as const, label: 'Reservas', icon: Calendar },
    { id: 'qr' as const, label: 'Escanear QR', icon: QrCode },
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
        onNavigate={(id: string) =>
          setActiveSection(id as 'mesas' | 'pedidos' | 'reservas' | 'qr')
        }
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
              : activeSection === 'pedidos'
              ? 'Pedidos'
              : activeSection === 'reservas'
              ? 'Reservas'
              : 'Escanear QR'
          }
          pageDescription={
            activeSection === 'mesas'
              ? 'Gestiona las mesas del restaurante'
              : activeSection === 'pedidos'
              ? 'Gestiona los pedidos de las mesas'
              : activeSection === 'reservas'
              ? 'Gestiona las reservas del dia'
              : 'Escanea codigo QR de reservas'
          }
          user={user}
          onOpenProfile={() => setShowProfile(true)}
        />

        {/* Content Area - Area clara con esquina redondeada */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] rounded-tl-2xl">
          {activeSection === 'mesas' && (
            <TablasMapa
              mesas={mesas}
              onMesaUpdate={handleMesaUpdate}
              onMesaCreate={handleMesaCreate}
              onMesaDelete={handleMesaDelete}
              onRefresh={loadMesas}
            />
          )}
          {activeSection === 'pedidos' && (
            <PedidosManagement
              pedidos={pedidos}
              mesas={mesas}
              onPedidoUpdate={handlePedidoUpdate}
              onRefresh={loadPedidos}
            />
          )}
          {activeSection === 'reservas' && <ReservasManagement mesas={mesas} />}
          {activeSection === 'qr' && (
            <ScanQRReserva mesas={mesas} onMesaUpdate={handleMesaUpdate} />
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
