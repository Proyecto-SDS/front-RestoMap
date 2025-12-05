'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { GenerarBoleta } from '../../components/mesero/GenerarBoleta';
import { PedidosManagement } from '../../components/mesero/PedidosManagement';
import { ScanQRReserva } from '../../components/mesero/ScanQRReserva';
import { SidebarMesero } from '../../components/mesero/SidebarMesero';
import { TablasMapa } from '../../components/mesero/TablasMapa';
import { TopNavMesero } from '../../components/mesero/TopNavMesero';
import { useAuth } from '../../context/AuthContext';

export type MesaEstado =
  | 'DISPONIBLE'
  | 'OCUPADA'
  | 'PIDIENDO'
  | 'EN_COCINA'
  | 'COMIENDO'
  | 'PIDIENDO_CUENTA'
  | 'PAGADO';
export type PedidoEstado =
  | 'TOMADO'
  | 'EN_COCINA'
  | 'LISTO'
  | 'ENTREGADO'
  | 'PAGADO'
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
    'mesas' | 'pedidos' | 'boleta' | 'qr'
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
    // Mock API call - GET /api/empresa/mesas
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockMesas: Mesa[] = [
      {
        id: '1',
        id_empresa: '1',
        nombre: 'Mesa 1',
        capacidad: 4,
        estado: 'DISPONIBLE',
        pedidos_count: 0,
      },
      {
        id: '2',
        id_empresa: '1',
        nombre: 'Mesa 2',
        capacidad: 2,
        estado: 'OCUPADA',
        pedidos_count: 1,
      },
      {
        id: '3',
        id_empresa: '1',
        nombre: 'Mesa 3',
        capacidad: 6,
        estado: 'PIDIENDO',
        pedidos_count: 0,
      },
      {
        id: '4',
        id_empresa: '1',
        nombre: 'Mesa 4',
        capacidad: 4,
        estado: 'EN_COCINA',
        pedidos_count: 2,
      },
      {
        id: '5',
        id_empresa: '1',
        nombre: 'Mesa 5',
        capacidad: 2,
        estado: 'COMIENDO',
        pedidos_count: 1,
      },
      {
        id: '6',
        id_empresa: '1',
        nombre: 'Mesa 6',
        capacidad: 4,
        estado: 'PIDIENDO_CUENTA',
        pedidos_count: 1,
      },
      {
        id: '7',
        id_empresa: '1',
        nombre: 'Mesa 7',
        capacidad: 8,
        estado: 'DISPONIBLE',
        pedidos_count: 0,
      },
      {
        id: '8',
        id_empresa: '1',
        nombre: 'Mesa 8',
        capacidad: 4,
        estado: 'DISPONIBLE',
        pedidos_count: 0,
      },
      {
        id: '9',
        id_empresa: '1',
        nombre: 'Mesa 9',
        capacidad: 2,
        estado: 'OCUPADA',
        pedidos_count: 1,
      },
    ];

    setMesas(mockMesas);
  }, []);

  const loadPedidos = useCallback(async () => {
    // Mock API call - GET /api/empresa/pedidos
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockPedidos: Pedido[] = [
      {
        id: 'PED-001',
        id_mesa: '2',
        id_usuario: 'U1',
        fecha_pedido: new Date().toISOString(),
        total: 24500,
        estado: 'EN_COCINA',
        creado_el: new Date(Date.now() - 15 * 60000).toISOString(),
        mesa_nombre: 'Mesa 2',
        usuario_nombre: 'Juan Pérez',
        lineas: [
          {
            id: 'L1',
            id_pedido: 'PED-001',
            id_producto: 'P1',
            producto_nombre: 'Lomo Saltado',
            cantidad: 1,
            precio_unitario: 15000,
          },
          {
            id: 'L2',
            id_pedido: 'PED-001',
            id_producto: 'P2',
            producto_nombre: 'Pisco Sour',
            cantidad: 2,
            precio_unitario: 4750,
          },
        ],
        notas: 'Sin cebolla',
      },
      {
        id: 'PED-002',
        id_mesa: '4',
        fecha_pedido: new Date().toISOString(),
        total: 32000,
        estado: 'LISTO',
        creado_el: new Date(Date.now() - 25 * 60000).toISOString(),
        mesa_nombre: 'Mesa 4',
        lineas: [
          {
            id: 'L3',
            id_pedido: 'PED-002',
            id_producto: 'P3',
            producto_nombre: 'Ceviche',
            cantidad: 2,
            precio_unitario: 12000,
          },
          {
            id: 'L4',
            id_pedido: 'PED-002',
            id_producto: 'P4',
            producto_nombre: 'Cerveza',
            cantidad: 2,
            precio_unitario: 4000,
          },
        ],
      },
      {
        id: 'PED-003',
        id_mesa: '5',
        fecha_pedido: new Date().toISOString(),
        total: 18000,
        estado: 'ENTREGADO',
        creado_el: new Date(Date.now() - 40 * 60000).toISOString(),
        mesa_nombre: 'Mesa 5',
        lineas: [
          {
            id: 'L5',
            id_pedido: 'PED-003',
            id_producto: 'P5',
            producto_nombre: 'Pizza Margherita',
            cantidad: 1,
            precio_unitario: 14000,
          },
          {
            id: 'L6',
            id_pedido: 'PED-003',
            id_producto: 'P6',
            producto_nombre: 'Agua Mineral',
            cantidad: 2,
            precio_unitario: 2000,
          },
        ],
      },
      {
        id: 'PED-004',
        id_mesa: '6',
        fecha_pedido: new Date().toISOString(),
        total: 45000,
        estado: 'ENTREGADO',
        creado_el: new Date(Date.now() - 50 * 60000).toISOString(),
        mesa_nombre: 'Mesa 6',
        usuario_nombre: 'María González',
        lineas: [
          {
            id: 'L7',
            id_pedido: 'PED-004',
            id_producto: 'P7',
            producto_nombre: 'Sushi Roll Premium',
            cantidad: 2,
            precio_unitario: 18000,
          },
          {
            id: 'L8',
            id_pedido: 'PED-004',
            id_producto: 'P8',
            producto_nombre: 'Sake',
            cantidad: 3,
            precio_unitario: 3000,
          },
        ],
      },
    ];

    setPedidos(mockPedidos);
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

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Sidebar */}
      <SidebarMesero activeItem={activeSection} onNavigate={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <TopNavMesero user={user} />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
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
          {activeSection === 'boleta' && (
            <GenerarBoleta
              mesas={mesas}
              pedidos={pedidos}
              user={user}
              onPedidoUpdate={handlePedidoUpdate}
              onMesaUpdate={handleMesaUpdate}
            />
          )}
          {activeSection === 'qr' && (
            <ScanQRReserva mesas={mesas} onMesaUpdate={handleMesaUpdate} />
          )}
        </main>
      </div>
    </div>
  );
}
