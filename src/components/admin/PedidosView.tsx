import { useState } from 'react';
import { Package, UtensilsCrossed, ChefHat, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
// Importamos la tarjeta que creamos en el paso anterior
import { KitchenCard } from './KitchenCard';

// --- TIPOS DE DATOS ---
type OrderStatus =
  | 'pendiente'
  | 'en_preparacion'
  | 'listo'
  | 'entregado'
  | 'cancelado';

interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface Order {
  id: number;
  tableNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: string;
  total: number;
  waiter: string;
}

// --- DATOS MOCK (Ejemplos) ---
const initialOrders: Order[] = [
  {
    id: 1,
    tableNumber: 'M8',
    items: [
      { name: 'Ensalada César', quantity: 1 },
      { name: 'Salmón a la Parrilla', quantity: 1 },
    ],
    status: 'en_preparacion',
    timestamp: '14:30',
    total: 38.9,
    waiter: 'Carlos M.',
  },
  {
    id: 2,
    tableNumber: 'T2',
    items: [
      { name: 'Hamburguesa Clásica', quantity: 1, notes: 'Sin cebolla' },
      { name: 'Pasta Carbonara', quantity: 1 },
    ],
    status: 'pendiente',
    timestamp: '14:45',
    total: 21.5,
    waiter: 'Ana L.',
  },
  {
    id: 3,
    tableNumber: 'M4',
    items: [
      { name: 'Tiramisú', quantity: 2 },
      { name: 'Cerveza Artesanal', quantity: 2 },
    ],
    status: 'listo',
    timestamp: '14:20',
    total: 34.5,
    waiter: 'Carlos M.',
  },
  {
    id: 4,
    tableNumber: 'M1',
    items: [
      { name: 'Pizza Margarita', quantity: 1 },
      { name: 'Coca Cola Zero', quantity: 2 },
    ],
    status: 'pendiente',
    timestamp: '14:50',
    total: 18.0,
    waiter: 'Roberto S.',
  },
];

// Datos de inventario
const inventoryData = [
  { id: 1, name: 'Lechuga Romana', stock: 15, unit: 'kg', status: 'ok' },
  { id: 2, name: 'Salmón Fresco', stock: 8, unit: 'kg', status: 'ok' },
  { id: 3, name: 'Aceite de Oliva', stock: 2, unit: 'L', status: 'critico' },
  { id: 4, name: 'Queso Parmesano', stock: 5, unit: 'kg', status: 'bajo' },
];

export function PedidosView() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [showInventory, setShowInventory] = useState(false);

  // Función para mover el estado del pedido
  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    if (newStatus === 'en_preparacion')
      toast.success('👨‍🍳 Pedido en preparación');
    if (newStatus === 'listo') toast.success('✅ ¡Pedido listo para servir!');
    if (newStatus === 'entregado') toast.success('👋 Pedido entregado');
  };

  // Filtros de conteo
  const nuevosOrders = orders.filter((o) => o.status === 'pendiente');
  const preparandoOrders = orders.filter((o) => o.status === 'en_preparacion');
  const listosOrders = orders.filter((o) => o.status === 'listo');

  // Filtrar lista según la pestaña activa
  const displayedOrders =
    activeTab === 'todos'
      ? orders.filter(
          (o) => o.status !== 'entregado' && o.status !== 'cancelado'
        )
      : orders.filter((o) => {
          if (activeTab === 'nuevos') return o.status === 'pendiente';
          if (activeTab === 'preparando') return o.status === 'en_preparacion';
          if (activeTab === 'listos') return o.status === 'listo';
          return false;
        });

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Panel de Cocina - KDS
          </h1>
          <p className="text-slate-500">
            Gestiona todos los pedidos desde la cocina
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
          onClick={() => setShowInventory(true)}
        >
          <Package className="h-4 w-4 mr-2" />
          Inventario de Comida
        </Button>
      </div>

      {/* Tarjetas de Resumen (Estilo Figma) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Nuevos */}
        <div
          onClick={() => setActiveTab('nuevos')}
          className={`
            relative overflow-hidden rounded-2xl border-2 p-6 cursor-pointer transition-all hover:shadow-md h-32 flex flex-col justify-center
            ${
              activeTab === 'nuevos'
                ? 'border-red-400 bg-red-50 ring-2 ring-red-200'
                : 'border-red-200 bg-white'
            }
          `}
        >
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            Nuevos Pedidos
          </h3>
          <span className="text-5xl font-bold text-orange-500">
            {nuevosOrders.length}
          </span>
        </div>

        {/* Card Preparando */}
        <div
          onClick={() => setActiveTab('preparando')}
          className={`
            relative overflow-hidden rounded-2xl border-2 p-6 cursor-pointer transition-all hover:shadow-md h-32 flex flex-col justify-center
            ${
              activeTab === 'preparando'
                ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                : 'border-orange-200 bg-white'
            }
          `}
        >
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            En Preparación
          </h3>
          <span className="text-5xl font-bold text-amber-500">
            {preparandoOrders.length}
          </span>
        </div>

        {/* Card Listos */}
        <div
          onClick={() => setActiveTab('listos')}
          className={`
            relative overflow-hidden rounded-2xl border-2 p-6 cursor-pointer transition-all hover:shadow-md h-32 flex flex-col justify-center
            ${
              activeTab === 'listos'
                ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                : 'border-green-200 bg-white'
            }
          `}
        >
          <h3 className="text-lg font-medium text-slate-600 mb-2">Listos</h3>
          <span className="text-5xl font-bold text-green-500">
            {listosOrders.length}
          </span>
        </div>
      </div>

      {/* Filtros de Pestaña */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 rounded-none h-auto p-0 gap-8 mb-6">
          <TabsTrigger
            value="todos"
            className="rounded-none border-b-2 border-transparent px-4 py-3 text-base text-slate-500 data-[state=active]:border-slate-800 data-[state=active]:text-slate-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Todos
          </TabsTrigger>
          <TabsTrigger
            value="nuevos"
            className="rounded-none border-b-2 border-transparent px-4 py-3 text-base text-slate-500 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold"
          >
            Nuevos ({nuevosOrders.length})
          </TabsTrigger>
          <TabsTrigger
            value="preparando"
            className="rounded-none border-b-2 border-transparent px-4 py-3 text-base text-slate-500 data-[state=active]:border-amber-500 data-[state=active]:text-amber-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Preparando ({preparandoOrders.length})
          </TabsTrigger>
          <TabsTrigger
            value="listos"
            className="rounded-none border-b-2 border-transparent px-4 py-3 text-base text-slate-500 data-[state=active]:border-green-500 data-[state=active]:text-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Listos ({listosOrders.length})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {displayedOrders.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <UtensilsCrossed className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-600">
                No hay pedidos en esta categoría
              </h3>
              <p className="text-slate-400">¡Buen trabajo equipo! 🔥</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {displayedOrders.map((order) => (
                <KitchenCard
                  key={order.id}
                  id={order.id}
                  table={order.tableNumber}
                  waiter={order.waiter}
                  time={order.timestamp}
                  total={order.total}
                  items={order.items}
                  status={order.status as any}
                  onAction={() => {
                    if (order.status === 'pendiente')
                      handleStatusChange(order.id, 'en_preparacion');
                    else if (order.status === 'en_preparacion')
                      handleStatusChange(order.id, 'listo');
                    else if (order.status === 'listo')
                      handleStatusChange(order.id, 'entregado');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Tabs>

      {/* Modal de Inventario */}
      <Dialog open={showInventory} onOpenChange={setShowInventory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inventario de Comida</DialogTitle>
            <DialogDescription>
              Estado actual de ingredientes críticos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {inventoryData.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100"
              >
                <span className="font-medium text-slate-700">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 font-mono">
                    {item.stock} {item.unit}
                  </span>
                  <Badge
                    variant={
                      item.status === 'critico'
                        ? 'destructive'
                        : item.status === 'bajo'
                        ? 'secondary'
                        : 'default'
                    }
                    className={
                      item.status === 'ok'
                        ? 'bg-green-500 hover:bg-green-600'
                        : ''
                    }
                  >
                    {item.status === 'critico'
                      ? 'Crítico'
                      : item.status === 'bajo'
                      ? 'Bajo'
                      : 'En Stock'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
