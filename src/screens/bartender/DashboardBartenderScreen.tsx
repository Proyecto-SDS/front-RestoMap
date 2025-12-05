'use client';

import { Package, Wine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InventarioBartender } from '../../components/bartender/InventarioBartender';
import { KanbanBoard } from '../../components/cocinero/KanbanBoard';
import {
  MiPerfilEmpleado,
  PanelSidebar,
  PanelTopNav,
} from '../../components/panel';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/apiClient';
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
      console.error('Error loading pedidos barra:', error);
    }
  };

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

  const menuItems = [
    { id: 'pedidos' as const, label: 'Pedidos', icon: Wine },
    { id: 'inventario' as const, label: 'Inventario', icon: Package },
  ];

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      {/* Sidebar */}
      <PanelSidebar
        title="Panel Bar"
        subtitle="Bartender"
        icon={Wine}
        menuItems={menuItems}
        activeItem={activeSection}
        onNavigate={(id: string) =>
          setActiveSection(id as 'pedidos' | 'inventario')
        }
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <PanelTopNav
          panelName="Panel de Barra"
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

      {/* Modal Mi Perfil */}
      <MiPerfilEmpleado
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
      />
    </div>
  );
}
