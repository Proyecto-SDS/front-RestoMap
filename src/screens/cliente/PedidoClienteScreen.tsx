'use client';

import {
  AlertCircle,
  CheckCircle,
  ChefHat,
  Clock,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  StickyNote,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../utils/apiClient';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

interface Categoria {
  id: number;
  nombre: string;
  productos: Producto[];
}

interface CarritoItem {
  producto: Producto;
  cantidad: number;
  nota: string;
}

interface Encomienda {
  id: number;
  estado: string;
  creado_el: string;
  items: Array<{
    id: number;
    producto: string;
    cantidad: number;
    precio_unitario: number;
    nota: string;
  }>;
}

interface PedidoInfo {
  id: number;
  estado: string;
  total: number;
  creado_el: string;
}

interface PedidoClienteScreenProps {
  qrCodigo: string;
}

export function PedidoClienteScreen({ qrCodigo }: PedidoClienteScreenProps) {
  const router = useRouter();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { socket, isConnected, joinPedido } = useSocket();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Info del local/mesa
  const [localInfo, setLocalInfo] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [mesaInfo, setMesaInfo] = useState<{
    id: number;
    nombre: string;
    capacidad: number;
  } | null>(null);

  // Menu
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);

  // Carrito
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [notaModal, setNotaModal] = useState<{
    item: CarritoItem;
    index: number;
  } | null>(null);
  const [notaTemp, setNotaTemp] = useState('');

  // Pedido
  const [pedidoInfo, setPedidoInfo] = useState<PedidoInfo | null>(null);
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [sesionActiva, setSesionActiva] = useState(true);

  // UI States
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vista, setVista] = useState<'menu' | 'seguimiento'>('menu');

  // Cargar estado del pedido
  const cargarEstado = useCallback(async () => {
    try {
      const response = await api.cliente.getEstado(qrCodigo);
      setPedidoInfo(response.pedido);
      setEncomiendas(response.encomiendas || []);
      setSesionActiva(response.sesion_activa);

      if (!response.sesion_activa) {
        setVista('seguimiento');
      }
    } catch (err) {
      console.error('Error cargando estado:', err);
    }
  }, [qrCodigo]);

  // Validar QR al cargar
  const validarQR = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.cliente.validarQR(qrCodigo);

      if (response.success) {
        setLocalInfo(response.local);
        setMesaInfo(response.mesa);
        setPedidoInfo(response.pedido);

        // Cargar menu
        const menuResponse = await api.cliente.getMenu(qrCodigo);
        setCategorias(menuResponse.categorias || []);

        // Si hay encomiendas previas (estado diferente a iniciado), cargar estado y mostrar seguimiento
        if (response.pedido.estado !== 'iniciado') {
          await cargarEstado();
          // Cambiar a vista de seguimiento automáticamente
          setVista('seguimiento');
        }

        // Guardar QR en localStorage para recuperar sesión
        if (typeof window !== 'undefined') {
          localStorage.setItem('restomap_active_qr', qrCodigo);
          // Disparar evento para actualizar Header inmediatamente
          window.dispatchEvent(new Event('qr-updated'));
        }
      } else {
        setError(response.error || 'QR invalido');
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al validar QR';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [qrCodigo, cargarEstado]);

  useEffect(() => {
    // Esperar a que cargue el estado de autenticacion
    if (isAuthLoading) return;

    if (!isLoggedIn) {
      // Usar 'from' que es el parametro que usa LoginScreen, con URL encoding
      const redirectUrl = encodeURIComponent(`/pedido?qr=${qrCodigo}`);
      router.push(`/login?from=${redirectUrl}`);
      return;
    }
    validarQR();
  }, [isLoggedIn, isAuthLoading, router, qrCodigo, validarQR]);

  // WebSocket: unirse a sala del pedido y escuchar eventos
  useEffect(() => {
    if (!socket || !pedidoInfo?.id) return;

    // Unirse a la sala del pedido para recibir actualizaciones
    joinPedido(pedidoInfo.id);
    console.log('[Socket] Unido a pedido:', pedidoInfo.id);

    // Escuchar cambios de estado de encomiendas
    const handleEstadoEncomienda = (data: {
      encomienda_id: number;
      estado: string;
    }) => {
      console.log('[Socket] Estado encomienda actualizado:', data);
      setEncomiendas((prev) =>
        prev.map((enc) =>
          enc.id === data.encomienda_id ? { ...enc, estado: data.estado } : enc
        )
      );
    };

    // Escuchar cambios de estado del pedido
    const handleEstadoPedido = (data: {
      pedido_id: number;
      estado: string;
    }) => {
      console.log('[Socket] Estado pedido actualizado:', data);
      if (data.pedido_id === pedidoInfo.id) {
        setPedidoInfo((prev) =>
          prev ? { ...prev, estado: data.estado } : prev
        );
      }
    };

    socket.on('estado_encomienda', handleEstadoEncomienda);
    socket.on('estado_pedido', handleEstadoPedido);

    return () => {
      socket.off('estado_encomienda', handleEstadoEncomienda);
      socket.off('estado_pedido', handleEstadoPedido);
    };
  }, [socket, pedidoInfo?.id, joinPedido]);

  // Polling como fallback (solo si no hay WebSocket conectado)
  useEffect(() => {
    if (!sesionActiva || encomiendas.length === 0) return;
    // Si WebSocket está conectado, usar intervalo más largo como fallback
    const interval = isConnected ? 30000 : 10000;

    const pollInterval = setInterval(() => {
      cargarEstado();
    }, interval);

    return () => clearInterval(pollInterval);
  }, [sesionActiva, encomiendas.length, cargarEstado, isConnected]);

  // Funciones del carrito
  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id);
      if (existente) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1, nota: '' }];
    });
  };

  const quitarDelCarrito = (productoId: number) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto.id === productoId);
      if (existente && existente.cantidad > 1) {
        return prev.map((item) =>
          item.producto.id === productoId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        );
      }
      return prev.filter((item) => item.producto.id !== productoId);
    });
  };

  const eliminarDelCarrito = (productoId: number) => {
    setCarrito((prev) =>
      prev.filter((item) => item.producto.id !== productoId)
    );
  };

  const guardarNota = () => {
    if (!notaModal) return;
    setCarrito((prev) =>
      prev.map((item, i) =>
        i === notaModal.index ? { ...item, nota: notaTemp } : item
      )
    );
    setNotaModal(null);
    setNotaTemp('');
  };

  const totalCarrito = carrito.reduce(
    (total, item) => total + item.producto.precio * item.cantidad,
    0
  );

  const cantidadTotal = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  // Enviar pedido
  const enviarPedido = async () => {
    if (carrito.length === 0) return;

    setIsSubmitting(true);
    try {
      const productos = carrito.map((item) => ({
        id: item.producto.id,
        cantidad: item.cantidad,
        nota: item.nota,
      }));

      await api.cliente.agregarProductos(qrCodigo, productos);

      // Limpiar carrito y actualizar estado
      setCarrito([]);
      setShowCarrito(false);
      setShowConfirmacion(false);
      await cargarEstado();
      setVista('seguimiento');
    } catch (err) {
      console.error('Error enviando pedido:', err);
      alert('Error al enviar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getEstadoConfig = (estado: string) => {
    const configs: Record<
      string,
      { label: string; color: string; icon: React.ReactNode }
    > = {
      pendiente: {
        label: 'Pendiente',
        color: '#94A3B8',
        icon: <Clock size={16} />,
      },
      en_preparacion: {
        label: 'En preparacion',
        color: '#F59E0B',
        icon: <ChefHat size={16} />,
      },
      lista: {
        label: 'Lista',
        color: '#22C55E',
        icon: <CheckCircle size={16} />,
      },
      entregada: {
        label: 'Entregada',
        color: '#3B82F6',
        icon: <Utensils size={16} />,
      },
    };
    return configs[estado] || configs.pendiente;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Loader2
            size={48}
            className="text-[#F97316] animate-spin mx-auto mb-4"
          />
          <p className="text-[#64748B]">Cargando menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#334155] mb-2">Error</h2>
          <p className="text-[#64748B] mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Mapear estado a texto amigable y color
  const getEstadoInfo = (estado: string) => {
    const estados: Record<
      string,
      { texto: string; color: string; icon: string }
    > = {
      iniciado: {
        texto: 'Iniciado',
        color: 'bg-gray-100 text-gray-600',
        icon: '⚪',
      },
      recepcion: {
        texto: 'En recepción',
        color: 'bg-yellow-100 text-yellow-700',
        icon: '🟡',
      },
      en_proceso: {
        texto: 'En preparación',
        color: 'bg-orange-100 text-orange-700',
        icon: '🟠',
      },
      terminado: {
        texto: 'Listo',
        color: 'bg-green-100 text-green-700',
        icon: '🟢',
      },
      completado: {
        texto: 'Completado',
        color: 'bg-blue-100 text-blue-700',
        icon: '✅',
      },
      cancelado: {
        texto: 'Cancelado',
        color: 'bg-red-100 text-red-700',
        icon: '❌',
      },
    };
    return estados[estado] || estados.iniciado;
  };

  const estadoInfo = getEstadoInfo(pedidoInfo?.estado || 'iniciado');
  const tienePedidosPrevios = encomiendas.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header con info local */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#334155] truncate">
                {localInfo?.nombre}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] truncate">
                {mesaInfo?.nombre}
              </p>
            </div>
            {/* Toggle vista - Solo visible si hay pedidos previos */}
            {tienePedidosPrevios && (
              <div className="flex bg-[#F1F5F9] rounded-lg p-0.5 sm:p-1 flex-shrink-0">
                <button
                  onClick={() => setVista('menu')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors ${
                    vista === 'menu'
                      ? 'bg-white text-[#334155] shadow-sm'
                      : 'text-[#64748B]'
                  }`}
                >
                  Menú
                </button>
                <button
                  onClick={() => setVista('seguimiento')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors ${
                    vista === 'seguimiento'
                      ? 'bg-white text-[#334155] shadow-sm'
                      : 'text-[#64748B]'
                  }`}
                >
                  <span className="hidden xs:inline">Mis </span>Pedidos
                </button>
              </div>
            )}
          </div>

          {/* Sub-header de estado - Solo visible si hay pedidos previos */}
          {tienePedidosPrevios && (
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${estadoInfo.color}`}
              >
                <span>{estadoInfo.icon}</span>
                <span>{estadoInfo.texto}</span>
              </div>
              {vista === 'menu' && (
                <span className="text-xs text-[#64748B]">
                  Agregando más productos
                </span>
              )}
            </div>
          )}

          {/* Filtros de categorias - Solo en vista menú */}
          {vista === 'menu' && (
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              <button
                onClick={() => setCategoriaActiva(null)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${
                  categoriaActiva === null
                    ? 'bg-[#F97316] text-white'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${
                    categoriaActiva === cat.id
                      ? 'bg-[#F97316] text-white'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {vista === 'menu' ? (
        <>
          {/* Productos */}
          <div>
            {/* Productos agrupados por categoria */}
            <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-24">
              {categorias
                .filter(
                  (cat) =>
                    categoriaActiva === null || cat.id === categoriaActiva
                )
                .map((categoria) => (
                  <section key={categoria.id}>
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[#334155] mb-3 sm:mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 sm:h-6 bg-[#F97316] rounded-full"></span>
                      {categoria.nombre}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
                      {categoria.productos.map((producto) => {
                        const enCarrito = carrito.find(
                          (item) => item.producto.id === producto.id
                        );
                        return (
                          <div
                            key={producto.id}
                            className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-3 sm:p-4 flex gap-3 sm:gap-4 hover:shadow-md transition-shadow active:scale-[0.99]"
                          >
                            {producto.imagen && (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#F1F5F9]">
                                <Image
                                  src={producto.imagen}
                                  alt={producto.nombre}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-[#334155] text-sm sm:text-base leading-tight">
                                {producto.nombre}
                              </h3>
                              {producto.descripcion && (
                                <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2 mt-0.5">
                                  {producto.descripcion}
                                </p>
                              )}
                              <p className="text-[#F97316] font-semibold mt-1 text-sm sm:text-base">
                                {formatCurrency(producto.precio)}
                              </p>
                            </div>
                            {enCarrito ? (
                              <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1">
                                <button
                                  onClick={() => agregarAlCarrito(producto)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#F97316] text-white rounded-full hover:bg-[#EA580C] transition-colors active:scale-95"
                                >
                                  <Plus size={14} className="sm:hidden" />
                                  <Plus size={16} className="hidden sm:block" />
                                </button>
                                <span className="text-xs sm:text-sm font-medium text-[#334155]">
                                  {enCarrito.cantidad}
                                </span>
                                <button
                                  onClick={() => quitarDelCarrito(producto.id)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#F1F5F9] text-[#64748B] rounded-full hover:bg-[#E2E8F0] transition-colors active:scale-95"
                                >
                                  <Minus size={14} className="sm:hidden" />
                                  <Minus
                                    size={16}
                                    className="hidden sm:block"
                                  />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => agregarAlCarrito(producto)}
                                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-[#F97316] text-white rounded-full hover:bg-[#EA580C] transition-colors self-center active:scale-95"
                              >
                                <Plus size={18} className="sm:hidden" />
                                <Plus size={20} className="hidden sm:block" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
            </main>
          </div>

          {/* Botón FAB flotante del carrito - siempre visible si hay items */}
          {vista === 'menu' && carrito.length > 0 && (
            <button
              onClick={() => setShowCarrito(true)}
              className="fixed bottom-6 right-6 w-16 h-16 bg-[#F97316] text-white rounded-full shadow-2xl hover:bg-[#EA580C] transition-all hover:scale-105 active:scale-95 z-40 flex items-center justify-center"
            >
              <ShoppingCart size={28} />
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-[#F97316] rounded-full text-sm font-bold flex items-center justify-center shadow-lg">
                {cantidadTotal}
              </span>
            </button>
          )}

          {/* Drawer del carrito */}
          {showCarrito && (
            <div className="fixed inset-0 z-50">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={() => setShowCarrito(false)}
              />
              {/* Panel lateral */}
              <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header del drawer */}
                <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#334155] flex items-center gap-2">
                    <ShoppingCart size={20} className="text-[#F97316]" />
                    Tu Pedido
                    {cantidadTotal > 0 && (
                      <span className="bg-[#F97316] text-white text-sm px-2 py-0.5 rounded-full">
                        {cantidadTotal}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => setShowCarrito(false)}
                    className="w-8 h-8 flex items-center justify-center text-[#64748B] hover:text-[#334155] hover:bg-[#F1F5F9] rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Items del carrito */}
                <div className="flex-1 overflow-y-auto p-4">
                  {carrito.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart
                        size={48}
                        className="text-[#E2E8F0] mx-auto mb-3"
                      />
                      <p className="text-[#94A3B8]">Tu carrito está vacío</p>
                      <p className="text-sm text-[#CBD5E1]">
                        Agrega productos para comenzar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {carrito.map((item, index) => (
                        <div
                          key={item.producto.id}
                          className="bg-[#F8FAFC] rounded-lg p-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[#334155] text-sm">
                                {item.producto.nombre}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-[#F97316]">
                                  {formatCurrency(item.producto.precio)}
                                </p>
                                <span className="text-sm font-medium text-[#334155]">
                                  {formatCurrency(
                                    item.producto.precio * item.cantidad
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() =>
                                  quitarDelCarrito(item.producto.id)
                                }
                                className="w-7 h-7 flex items-center justify-center bg-white border border-[#E2E8F0] rounded text-[#64748B] hover:bg-[#F1F5F9]"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-7 text-center text-sm font-medium">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => agregarAlCarrito(item.producto)}
                                className="w-7 h-7 flex items-center justify-center bg-[#F97316] text-white rounded hover:bg-[#EA580C]"
                              >
                                <Plus size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  eliminarDelCarrito(item.producto.id)
                                }
                                className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 ml-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {/* Input de nota inline */}
                          <div className="mt-2 pt-2 border-t border-[#E2E8F0]">
                            <div className="flex items-center gap-2">
                              <StickyNote
                                size={12}
                                className="text-[#94A3B8] flex-shrink-0"
                              />
                              <input
                                type="text"
                                value={item.nota}
                                onChange={(e) => {
                                  setCarrito((prev) =>
                                    prev.map((c, i) =>
                                      i === index
                                        ? { ...c, nota: e.target.value }
                                        : c
                                    )
                                  );
                                }}
                                placeholder="Sin cebolla, extra salsa..."
                                className="flex-1 text-xs px-2 py-1.5 border border-[#E2E8F0] rounded focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:border-[#F97316]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer del drawer */}
                {carrito.length > 0 && (
                  <div className="p-4 border-t border-[#E2E8F0] bg-white">
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Total</span>
                      <span className="text-[#F97316]">
                        {formatCurrency(totalCarrito)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowCarrito(false);
                        setShowConfirmacion(true);
                      }}
                      className="w-full py-3.5 bg-[#F97316] text-white rounded-xl font-semibold hover:bg-[#EA580C] transition-colors text-base"
                    >
                      Confirmar Pedido
                    </button>
                  </div>
                )}
              </aside>
            </div>
          )}
        </>
      ) : (
        /* Vista Seguimiento */
        <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Total del pedido */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-3 sm:p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-[#64748B]">
                  Total del pedido
                </span>
                <span className="text-lg sm:text-xl font-bold text-[#334155]">
                  {formatCurrency(pedidoInfo?.total || 0)}
                </span>
              </div>
            </div>

            {/* Encomiendas - ordenadas cronológicamente */}
            {[...encomiendas].reverse().map((enc, index) => {
              const config = getEstadoConfig(enc.estado);
              // El primero (más antiguo) es "Pedido", los siguientes son "Pedido Extra #N"
              const pedidoLabel =
                index === 0 ? 'Pedido' : `Pedido Extra #${index}`;
              return (
                <div
                  key={enc.id}
                  className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden"
                >
                  <div className="p-3 sm:p-4 border-b border-[#E2E8F0] flex items-center justify-between gap-2">
                    <span className="font-medium text-sm sm:text-base text-[#334155]">
                      {pedidoLabel}
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${config.color}20`,
                        color: config.color,
                      }}
                    >
                      {config.icon}
                      <span className="hidden xs:inline">{config.label}</span>
                      <span className="xs:hidden">
                        {config.label.split(' ')[0]}
                      </span>
                    </span>
                  </div>
                  <div className="p-3 sm:p-4 space-y-2">
                    {enc.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-2 text-xs sm:text-sm"
                      >
                        <span className="text-[#334155] min-w-0 flex-1">
                          <span className="font-medium">{item.cantidad}x</span>{' '}
                          {item.producto}
                          {item.nota && (
                            <span className="text-[#64748B] italic block sm:inline sm:ml-1 text-[11px] sm:text-xs">
                              ({item.nota})
                            </span>
                          )}
                        </span>
                        <span className="text-[#64748B] flex-shrink-0">
                          {formatCurrency(item.precio_unitario * item.cantidad)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Boton agregar mas */}
            {sesionActiva && (
              <button
                onClick={() => setVista('menu')}
                className="w-full py-2.5 sm:py-3 border-2 border-dashed border-[#E2E8F0] rounded-xl text-sm sm:text-base text-[#64748B] hover:border-[#F97316] hover:text-[#F97316] transition-colors active:scale-[0.99]"
              >
                + Agregar mas productos
              </button>
            )}
          </div>
        </main>
      )}

      {/* Modal Confirmacion */}
      {showConfirmacion && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 text-center">
            <h3 className="text-base sm:text-lg font-semibold text-[#334155] mb-2">
              Confirmar pedido?
            </h3>
            <p className="text-sm sm:text-base text-[#64748B] mb-4 sm:mb-6">
              Estas a punto de enviar tu pedido. Puedes seguir agregando
              productos despues si lo deseas.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowConfirmacion(false)}
                className="flex-1 py-2 sm:py-2.5 border border-[#E2E8F0] rounded-lg text-sm sm:text-base text-[#64748B] hover:bg-[#F1F5F9] active:bg-[#E2E8F0]"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={enviarPedido}
                disabled={isSubmitting}
                className="flex-1 py-2 sm:py-2.5 bg-[#F97316] text-white rounded-lg text-sm sm:text-base hover:bg-[#EA580C] active:bg-[#DC5211] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="sm:hidden animate-spin" />
                    <Loader2
                      size={16}
                      className="hidden sm:block animate-spin"
                    />
                    <span className="text-sm sm:text-base">Enviando...</span>
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nota */}
      {notaModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-[#334155] mb-3 sm:mb-4">
              Nota para{' '}
              <span className="text-[#F97316]">
                {notaModal.item.producto.nombre}
              </span>
            </h3>
            <textarea
              value={notaTemp}
              onChange={(e) => setNotaTemp(e.target.value)}
              placeholder="Ej: sin cebolla, extra salsa..."
              className="w-full p-2.5 sm:p-3 border border-[#E2E8F0] rounded-lg resize-none h-20 sm:h-24 focus:outline-none focus:ring-2 focus:ring-[#F97316] text-sm sm:text-base"
            />
            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
              <button
                onClick={() => {
                  setNotaModal(null);
                  setNotaTemp('');
                }}
                className="flex-1 py-2 sm:py-2.5 border border-[#E2E8F0] rounded-lg text-sm sm:text-base text-[#64748B] hover:bg-[#F1F5F9] active:bg-[#E2E8F0]"
              >
                Cancelar
              </button>
              <button
                onClick={guardarNota}
                className="flex-1 py-2 sm:py-2.5 bg-[#F97316] text-white rounded-lg text-sm sm:text-base hover:bg-[#EA580C] active:bg-[#DC5211]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
