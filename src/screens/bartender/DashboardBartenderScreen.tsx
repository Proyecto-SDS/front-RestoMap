'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InventarioBartender } from '../../components/bartender/InventarioBartender';
import { SidebarBartender } from '../../components/bartender/SidebarBartender';
import { TopNavBartender } from '../../components/bartender/TopNavBartender';
import { KanbanBoard } from '../../components/cocinero/KanbanBoard';
import { useAuth } from '../../context/AuthContext';
import type { Pedido, Producto } from '../cocinero/DashboardCocineroScreen';

interface PedidosByEstado {
  tomados: Pedido[];
  en_proceso: Pedido[];
  listos: Pedido[];
  entregados: Pedido[];
}

export default function DashboardBartenderScreen() {
  const router = useRouter();
  const { user, userType, isLoggedIn } = useAuth();
  const [activeSection, setActiveSection] = useState<'pedidos' | 'inventario'>(
    'pedidos'
  );
  const [pedidos, setPedidos] = useState<PedidosByEstado>({
    tomados: [],
    en_proceso: [],
    listos: [],
    entregados: [],
  });
  const [bebidas, setBebidas] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
    }
  }, [isLoggedIn, userType, router]);

  const loadPedidos = async () => {
    setIsLoading(true);
    try {
      await fetchPedidosBebidas();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBebidas = async () => {
    setIsLoading(true);
    try {
      await fetchBebidasAlcoholicas();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPedidosBebidas = async () => {
    // Mock API call - GET /api/empresa/pedidos?filtro=bebidas_alcoholicas
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockPedidos: Pedido[] = [
      {
        id: 'ORD-BAR-001',
        id_mesa: '3',
        mesa_nombre: 'Mesa 3',
        fecha_pedido: new Date().toISOString(),
        total: 18500,
        estado: 'TOMADO',
        creado_el: new Date(Date.now() - 2 * 60000).toISOString(),
        lineas: [
          {
            id: 'LB1',
            id_pedido: 'ORD-BAR-001',
            id_producto: 'B1',
            producto_nombre: 'Pisco Sour',
            cantidad: 2,
            precio_unitario: 6500,
          },
          {
            id: 'LB2',
            id_pedido: 'ORD-BAR-001',
            id_producto: 'B2',
            producto_nombre: 'Cerveza Kunstmann',
            cantidad: 3,
            precio_unitario: 3500,
          },
        ],
      },
      {
        id: 'ORD-BAR-002',
        id_mesa: '7',
        mesa_nombre: 'Mesa 7',
        fecha_pedido: new Date().toISOString(),
        total: 28000,
        estado: 'EN_PROCESO',
        creado_el: new Date(Date.now() - 20 * 60000).toISOString(),
        lineas: [
          {
            id: 'LB3',
            id_pedido: 'ORD-BAR-002',
            id_producto: 'B3',
            producto_nombre: 'Mojito',
            cantidad: 2,
            precio_unitario: 7500,
          },
          {
            id: 'LB4',
            id_pedido: 'ORD-BAR-002',
            id_producto: 'B4',
            producto_nombre: 'Margarita',
            cantidad: 2,
            precio_unitario: 8000,
          },
          {
            id: 'LB5',
            id_pedido: 'ORD-BAR-002',
            id_producto: 'B5',
            producto_nombre: 'Shot de Tequila',
            cantidad: 4,
            precio_unitario: 3000,
          },
        ],
        notas: 'Sin azúcar en los cócteles',
      },
      {
        id: 'ORD-BAR-003',
        id_mesa: '2',
        mesa_nombre: 'Mesa 2',
        fecha_pedido: new Date().toISOString(),
        total: 24000,
        estado: 'EN_PROCESO',
        creado_el: new Date(Date.now() - 10 * 60000).toISOString(),
        lineas: [
          {
            id: 'LB6',
            id_pedido: 'ORD-BAR-003',
            id_producto: 'B6',
            producto_nombre: 'Copa de Vino Tinto Casillero del Diablo',
            cantidad: 3,
            precio_unitario: 6500,
          },
          {
            id: 'LB7',
            id_pedido: 'ORD-BAR-003',
            id_producto: 'B7',
            producto_nombre: 'Aperol Spritz',
            cantidad: 1,
            precio_unitario: 7500,
          },
        ],
      },
      {
        id: 'ORD-BAR-004',
        id_mesa: '5',
        mesa_nombre: 'Mesa 5',
        fecha_pedido: new Date().toISOString(),
        total: 16500,
        estado: 'LISTO',
        creado_el: new Date(Date.now() - 18 * 60000).toISOString(),
        lineas: [
          {
            id: 'LB8',
            id_pedido: 'ORD-BAR-004',
            id_producto: 'B8',
            producto_nombre: 'Cerveza Corona',
            cantidad: 4,
            precio_unitario: 4000,
          },
          {
            id: 'LB9',
            id_pedido: 'ORD-BAR-004',
            id_producto: 'B9',
            producto_nombre: 'Chupito Jägermeister',
            cantidad: 2,
            precio_unitario: 2500,
          },
        ],
      },
      {
        id: 'ORD-BAR-005',
        id_mesa: '8',
        mesa_nombre: 'Mesa 8',
        fecha_pedido: new Date().toISOString(),
        total: 32000,
        estado: 'TOMADO',
        creado_el: new Date(Date.now() - 35 * 60000).toISOString(),
        lineas: [
          {
            id: 'LB10',
            id_pedido: 'ORD-BAR-005',
            id_producto: 'B10',
            producto_nombre: 'Gin Tonic Premium',
            cantidad: 2,
            precio_unitario: 9000,
          },
          {
            id: 'LB11',
            id_pedido: 'ORD-BAR-005',
            id_producto: 'B11',
            producto_nombre: 'Old Fashioned',
            cantidad: 2,
            precio_unitario: 8500,
          },
          {
            id: 'LB12',
            id_pedido: 'ORD-BAR-005',
            id_producto: 'B12',
            producto_nombre: 'Cerveza Heineken',
            cantidad: 2,
            precio_unitario: 3500,
          },
        ],
      },
      {
        id: 'ORD-BAR-006',
        id_mesa: '1',
        mesa_nombre: 'Mesa 1',
        fecha_pedido: new Date().toISOString(),
        total: 21000,
        estado: 'LISTO',
        creado_el: new Date(Date.now() - 6 * 60000).toISOString(),
        lineas: [
          {
            id: 'LB13',
            id_pedido: 'ORD-BAR-006',
            id_producto: 'B13',
            producto_nombre: 'Caipirinha',
            cantidad: 3,
            precio_unitario: 7000,
          },
        ],
      },
      {
        id: 'ORD-BAR-007',
        id_mesa: '4',
        mesa_nombre: 'Mesa 4',
        fecha_pedido: new Date().toISOString(),
        total: 13000,
        estado: 'ENTREGADO',
        creado_el: new Date(Date.now() - 50 * 60000).toISOString(),
        lineas: [
          {
            id: 'LB14',
            id_pedido: 'ORD-BAR-007',
            id_producto: 'B14',
            producto_nombre: 'Copa Vino Blanco Sauvignon Blanc',
            cantidad: 2,
            precio_unitario: 6500,
          },
        ],
      },
    ];

    // Group by estado
    setPedidos({
      tomados: mockPedidos.filter((p) => p.estado === 'TOMADO'),
      en_proceso: mockPedidos.filter((p) => p.estado === 'EN_PROCESO'),
      listos: mockPedidos.filter((p) => p.estado === 'LISTO'),
      entregados: mockPedidos.filter((p) => p.estado === 'ENTREGADO'),
    });
  };

  const fetchBebidasAlcoholicas = async () => {
    // Mock API call - GET /api/empresa/productos?categoria=bebidas_alcoholicas
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockBebidas: Producto[] = [
      {
        id: 'B1',
        id_empresa: '1',
        id_categoria: 'C5',
        categoria_nombre: 'Cervezas',
        nombre: 'Cerveza Kunstmann',
        precio: 3500,
        disponible: true,
      },
      {
        id: 'B2',
        id_empresa: '1',
        id_categoria: 'C5',
        categoria_nombre: 'Cervezas',
        nombre: 'Cerveza Corona',
        precio: 4000,
        disponible: true,
      },
      {
        id: 'B3',
        id_empresa: '1',
        id_categoria: 'C5',
        categoria_nombre: 'Cervezas',
        nombre: 'Cerveza Heineken',
        precio: 3500,
        disponible: true,
      },
      {
        id: 'B4',
        id_empresa: '1',
        id_categoria: 'C5',
        categoria_nombre: 'Cervezas',
        nombre: 'Cerveza Austral',
        precio: 3000,
        disponible: false,
      },
      {
        id: 'B5',
        id_empresa: '1',
        id_categoria: 'C6',
        categoria_nombre: 'Vinos',
        nombre: 'Copa Vino Tinto Casillero del Diablo',
        precio: 6500,
        disponible: true,
      },
      {
        id: 'B6',
        id_empresa: '1',
        id_categoria: 'C6',
        categoria_nombre: 'Vinos',
        nombre: 'Copa Vino Blanco Sauvignon Blanc',
        precio: 6500,
        disponible: true,
      },
      {
        id: 'B7',
        id_empresa: '1',
        id_categoria: 'C6',
        categoria_nombre: 'Vinos',
        nombre: 'Copa Vino Carmenere',
        precio: 7000,
        disponible: true,
      },
      {
        id: 'B8',
        id_empresa: '1',
        id_categoria: 'C7',
        categoria_nombre: 'Cócteles',
        nombre: 'Pisco Sour',
        precio: 6500,
        disponible: true,
      },
      {
        id: 'B9',
        id_empresa: '1',
        id_categoria: 'C7',
        categoria_nombre: 'Cócteles',
        nombre: 'Mojito',
        precio: 7500,
        disponible: true,
      },
      {
        id: 'B10',
        id_empresa: '1',
        id_categoria: 'C7',
        categoria_nombre: 'Cócteles',
        nombre: 'Margarita',
        precio: 8000,
        disponible: true,
      },
      {
        id: 'B11',
        id_empresa: '1',
        id_categoria: 'C7',
        categoria_nombre: 'Cócteles',
        nombre: 'Caipirinha',
        precio: 7000,
        disponible: true,
      },
      {
        id: 'B12',
        id_empresa: '1',
        id_categoria: 'C7',
        categoria_nombre: 'Cócteles',
        nombre: 'Gin Tonic Premium',
        precio: 9000,
        disponible: false,
      },
      {
        id: 'B13',
        id_empresa: '1',
        id_categoria: 'C7',
        categoria_nombre: 'Cócteles',
        nombre: 'Old Fashioned',
        precio: 8500,
        disponible: true,
      },
      {
        id: 'B14',
        id_empresa: '1',
        id_categoria: 'C7',
        categoria_nombre: 'Cócteles',
        nombre: 'Aperol Spritz',
        precio: 7500,
        disponible: true,
      },
      {
        id: 'B15',
        id_empresa: '1',
        id_categoria: 'C8',
        categoria_nombre: 'Licores',
        nombre: 'Shot de Tequila',
        precio: 3000,
        disponible: true,
      },
      {
        id: 'B16',
        id_empresa: '1',
        id_categoria: 'C8',
        categoria_nombre: 'Licores',
        nombre: 'Chupito Jägermeister',
        precio: 2500,
        disponible: true,
      },
      {
        id: 'B17',
        id_empresa: '1',
        id_categoria: 'C8',
        categoria_nombre: 'Licores',
        nombre: 'Ron Añejo',
        precio: 4500,
        disponible: true,
      },
      {
        id: 'B18',
        id_empresa: '1',
        id_categoria: 'C8',
        categoria_nombre: 'Licores',
        nombre: 'Whisky Johnnie Walker',
        precio: 5500,
        disponible: false,
      },
    ];

    setBebidas(mockBebidas);
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
      if (updatedPedido.estado === 'TOMADO') {
        newState.tomados.push(updatedPedido);
      } else if (updatedPedido.estado === 'EN_PROCESO') {
        newState.en_proceso.push(updatedPedido);
      } else if (updatedPedido.estado === 'LISTO') {
        newState.listos.push(updatedPedido);
      } else if (updatedPedido.estado === 'ENTREGADO') {
        newState.entregados.push(updatedPedido);
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

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Sidebar */}
      <SidebarBartender
        activeItem={activeSection}
        onNavigate={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <TopNavBartender user={user} />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
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
                  onRefresh={fetchPedidosBebidas}
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
    </div>
  );
}
