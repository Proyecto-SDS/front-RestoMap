'use client';

import { Calendar, LayoutGrid, QrCode, UtensilsCrossed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useSocket } from '../../context/SocketContext';
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
  descripcion?: string;
  capacidad: number;
  orden: number;
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
  const { socket, isConnected, joinLocal } = useSocket();
  const [activeSection, setActiveSection] = useState<
    'mesas' | 'reservas' | 'qr'
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
        }))
        .sort((a: Mesa, b: Mesa) => a.orden - b.orden);
      setMesas(mesasData);
    } catch (error) {
      console.error('Error loading mesas:', error);
    }
  }, []);

  // Join local room on load
  useEffect(() => {
    if (user?.id_local && isConnected) {
      joinLocal(Number(user.id_local));
      console.log('Mesero unido a sala local:', user.id_local);
    }
  }, [user?.id_local, isConnected, joinLocal]);

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
      setMesas((prev) =>
        prev.map((mesa) =>
          mesa.id === String(data.mesa_id)
            ? { ...mesa, estado: 'OCUPADA' }
            : mesa
        )
      );
    };

    socket.on('mesa_actualizada', handleMesaActualizada);
    socket.on('qr_escaneado', handleQREscaneado);

    return () => {
      socket.off('mesa_actualizada', handleMesaActualizada);
      socket.off('qr_escaneado', handleQREscaneado);
    };
  }, [socket]);

  // Load initial data on mount
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      void (async () => {
        try {
          const data = await api.empresa.getMesas();
          const mesasData: Mesa[] = data
            .map((m: Record<string, unknown>) => ({
              id: String(m.id),
              nombre: m.nombre as string,
              descripcion: (m.descripcion as string) || '',
              estado: (m.estado as string).toUpperCase() as MesaEstado,
              capacidad: m.capacidad as number,
              orden: (m.orden as number) ?? 0,
              pedidos_count: m.pedidos_count as number,
            }))
            .sort((a: Mesa, b: Mesa) => a.orden - b.orden);
          setMesas(mesasData);
        } catch (error) {
          console.error('Error loading mesas:', error);
        }
      })();
    }
  }, []);

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
          setActiveSection(id as 'mesas' | 'reservas' | 'qr');
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
              : 'Escanear QR'
          }
          pageDescription={
            activeSection === 'mesas'
              ? 'Gestiona las mesas del restaurante'
              : activeSection === 'reservas'
              ? 'Gestiona las reservas del dia'
              : 'Escanea codigo QR de reservas'
          }
          user={user}
          onOpenProfile={() => setShowProfile(true)}
        />

        {/* Content Area - Area clara con esquina redondeada */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC]">
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
