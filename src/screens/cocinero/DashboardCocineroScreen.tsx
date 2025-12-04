'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InventarioCocinero } from '../../components/cocinero/InventarioCocinero';
import { KanbanBoard } from '../../components/cocinero/KanbanBoard';
import { SidebarCocinero } from '../../components/cocinero/SidebarCocinero';
import { TopNavCocinero } from '../../components/cocinero/TopNavCocinero';
import { useAuth } from '../../context/AuthContext';

export type PedidoEstado = 'TOMADO' | 'EN_PROCESO' | 'LISTO' | 'ENTREGADO';

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
  disponible: boolean;
}

interface PedidosByEstado {
  tomados: Pedido[];
  en_proceso: Pedido[];
  listos: Pedido[];
  entregados: Pedido[];
}

export default function DashboardCocineroScreen() {
  const router = useRouter();
  const { empresa, userType, isLoggedIn } = useAuth();
  const [activeSection, setActiveSection] = useState<'pedidos' | 'inventario'>('pedidos');
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



  const loadPedidos = async () => {
    // Mock API call - GET /api/empresa/pedidos?estado=tomado,en_proceso,listo,entregado
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockPedidos: Pedido[] = [
      {
        id: 'ORD-001',
        id_mesa: '2',
        mesa_nombre: 'Mesa 2',
        fecha_pedido: new Date().toISOString(),
        total: 24500,
        estado: 'TOMADO',
        creado_el: new Date(Date.now() - 3 * 60000).toISOString(),
        lineas: [
          { id: 'L1', id_pedido: 'ORD-001', id_producto: 'P1', producto_nombre: 'Lomo Saltado', cantidad: 1, precio_unitario: 15000 },
          { id: 'L2', id_pedido: 'ORD-001', id_producto: 'P2', producto_nombre: 'Papas Fritas', cantidad: 2, precio_unitario: 4750, notas: 'Sin sal' },
        ],
        notas: 'Sin cebolla'
      },
      {
        id: 'ORD-002',
        id_mesa: '4',
        mesa_nombre: 'Mesa 4',
        fecha_pedido: new Date().toISOString(),
        total: 32000,
        estado: 'EN_PROCESO',
        creado_el: new Date(Date.now() - 18 * 60000).toISOString(),
        lineas: [
          { id: 'L3', id_pedido: 'ORD-002', id_producto: 'P3', producto_nombre: 'Ceviche', cantidad: 2, precio_unitario: 12000 },
          { id: 'L4', id_pedido: 'ORD-002', id_producto: 'P4', producto_nombre: 'Arroz', cantidad: 2, precio_unitario: 4000 },
        ]
      },
      {
        id: 'ORD-003',
        id_mesa: '5',
        mesa_nombre: 'Mesa 5',
        fecha_pedido: new Date().toISOString(),
        total: 18000,
        estado: 'EN_PROCESO',
        creado_el: new Date(Date.now() - 12 * 60000).toISOString(),
        lineas: [
          { id: 'L5', id_pedido: 'ORD-003', id_producto: 'P5', producto_nombre: 'Pizza Margherita', cantidad: 1, precio_unitario: 14000 },
          { id: 'L6', id_pedido: 'ORD-003', id_producto: 'P6', producto_nombre: 'Ensalada César', cantidad: 1, precio_unitario: 4000 },
        ]
      },
      {
        id: 'ORD-004',
        id_mesa: '6',
        mesa_nombre: 'Mesa 6',
        fecha_pedido: new Date().toISOString(),
        total: 45000,
        estado: 'LISTO',
        creado_el: new Date(Date.now() - 25 * 60000).toISOString(),
        lineas: [
          { id: 'L7', id_pedido: 'ORD-004', id_producto: 'P7', producto_nombre: 'Sushi Roll Premium', cantidad: 2, precio_unitario: 18000 },
          { id: 'L8', id_pedido: 'ORD-004', id_producto: 'P8', producto_nombre: 'Sopa Miso', cantidad: 3, precio_unitario: 3000 },
        ],
        notas: 'Mesa celebrando cumpleaños'
      },
      {
        id: 'ORD-005',
        id_mesa: '1',
        mesa_nombre: 'Mesa 1',
        fecha_pedido: new Date().toISOString(),
        total: 35000,
        estado: 'TOMADO',
        creado_el: new Date(Date.now() - 35 * 60000).toISOString(),
        lineas: [
          { id: 'L9', id_pedido: 'ORD-005', id_producto: 'P9', producto_nombre: 'Parrillada para 2', cantidad: 1, precio_unitario: 28000 },
          { id: 'L10', id_pedido: 'ORD-005', id_producto: 'P10', producto_nombre: 'Ensalada Mixta', cantidad: 2, precio_unitario: 3500 },
        ]
      },
      {
        id: 'ORD-006',
        id_mesa: '7',
        mesa_nombre: 'Mesa 7',
        fecha_pedido: new Date().toISOString(),
        total: 16000,
        estado: 'LISTO',
        creado_el: new Date(Date.now() - 8 * 60000).toISOString(),
        lineas: [
          { id: 'L11', id_pedido: 'ORD-006', id_producto: 'P11', producto_nombre: 'Hamburguesa Clásica', cantidad: 2, precio_unitario: 8000 },
        ]
      },
      {
        id: 'ORD-007',
        id_mesa: '3',
        mesa_nombre: 'Mesa 3',
        fecha_pedido: new Date().toISOString(),
        total: 27000,
        estado: 'ENTREGADO',
        creado_el: new Date(Date.now() - 45 * 60000).toISOString(),
        lineas: [
          { id: 'L12', id_pedido: 'ORD-007', id_producto: 'P12', producto_nombre: 'Lasagna', cantidad: 1, precio_unitario: 16000 },
          { id: 'L13', id_pedido: 'ORD-007', id_producto: 'P13', producto_nombre: 'Tiramisu', cantidad: 2, precio_unitario: 5500 },
        ]
      },
    ];

    // Group by estado
    setPedidos({
      tomados: mockPedidos.filter(p => p.estado === 'TOMADO'),
      en_proceso: mockPedidos.filter(p => p.estado === 'EN_PROCESO'),
      listos: mockPedidos.filter(p => p.estado === 'LISTO'),
      entregados: mockPedidos.filter(p => p.estado === 'ENTREGADO'),
    });
  };

  const loadProductos = async () => {
    // Mock API call - GET /api/empresa/productos?excluir_bartender=true
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockProductos: Producto[] = [
      { id: 'P1', id_empresa: '1', id_categoria: 'C1', categoria_nombre: 'Comidas', nombre: 'Lomo Saltado', precio: 15000, disponible: true },
      { id: 'P2', id_empresa: '1', id_categoria: 'C1', categoria_nombre: 'Comidas', nombre: 'Ceviche', precio: 12000, disponible: true },
      { id: 'P3', id_empresa: '1', id_categoria: 'C1', categoria_nombre: 'Comidas', nombre: 'Pizza Margherita', precio: 14000, disponible: true },
      { id: 'P4', id_empresa: '1', id_categoria: 'C1', categoria_nombre: 'Comidas', nombre: 'Hamburguesa Clásica', precio: 8000, disponible: false },
      { id: 'P5', id_empresa: '1', id_categoria: 'C1', categoria_nombre: 'Comidas', nombre: 'Lasagna', precio: 16000, disponible: true },
      { id: 'P6', id_empresa: '1', id_categoria: 'C1', categoria_nombre: 'Comidas', nombre: 'Parrillada para 2', precio: 28000, disponible: true },
      { id: 'P7', id_empresa: '1', id_categoria: 'C2', categoria_nombre: 'Acompañamientos', nombre: 'Papas Fritas', precio: 4000, disponible: true },
      { id: 'P8', id_empresa: '1', id_categoria: 'C2', categoria_nombre: 'Acompañamientos', nombre: 'Ensalada César', precio: 5000, disponible: true },
      { id: 'P9', id_empresa: '1', id_categoria: 'C2', categoria_nombre: 'Acompañamientos', nombre: 'Arroz', precio: 3000, disponible: true },
      { id: 'P10', id_empresa: '1', id_categoria: 'C3', categoria_nombre: 'Postres', nombre: 'Tiramisu', precio: 5500, disponible: true },
      { id: 'P11', id_empresa: '1', id_categoria: 'C3', categoria_nombre: 'Postres', nombre: 'Cheesecake', precio: 6000, disponible: false },
      { id: 'P12', id_empresa: '1', id_categoria: 'C3', categoria_nombre: 'Postres', nombre: 'Brownie con Helado', precio: 4500, disponible: true },
      { id: 'P13', id_empresa: '1', id_categoria: 'C4', categoria_nombre: 'Bebidas Sin Alcohol', nombre: 'Agua Mineral', precio: 2000, disponible: true },
      { id: 'P14', id_empresa: '1', id_categoria: 'C4', categoria_nombre: 'Bebidas Sin Alcohol', nombre: 'Jugo Natural', precio: 3500, disponible: true },
      { id: 'P15', id_empresa: '1', id_categoria: 'C4', categoria_nombre: 'Bebidas Sin Alcohol', nombre: 'Limonada', precio: 3000, disponible: true },
    ];

    setProductos(mockProductos);
  };

  const handlePedidoUpdate = (updatedPedido: Pedido) => {
    // Remove from old column and add to new column
    setPedidos(prev => {
      const newState = { ...prev };
      
      // Remove from all columns
      Object.keys(newState).forEach(key => {
        newState[key as keyof PedidosByEstado] = newState[key as keyof PedidosByEstado].filter(
          p => p.id !== updatedPedido.id
        );
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

  const handleProductoUpdate = (updatedProducto: Producto) => {
    setProductos(prev => prev.map(p => p.id === updatedProducto.id ? updatedProducto : p));
  };

  // Load initial data
  useEffect(() => {
    // eslint-disable-next-line
    loadPedidos();
     
    loadProductos();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Sidebar */}
      <SidebarCocinero activeItem={activeSection} onNavigate={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <TopNavCocinero empresa={empresa} />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
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
        </main>
      </div>
    </div>
  );
}
