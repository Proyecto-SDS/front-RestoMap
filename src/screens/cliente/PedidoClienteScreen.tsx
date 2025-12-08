'use client';

import {
  AlertCircle,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CancelarPedidoModal } from '../../components/cliente/CancelarPedidoModal';
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
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuth();
  const { socket, isConnected, authenticate, joinPedido } = useSocket();

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
  const [notaExpandida, setNotaExpandida] = useState<number | null>(null);

  // Pedido
  const [pedidoInfo, setPedidoInfo] = useState<PedidoInfo | null>(null);
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [sesionActiva, setSesionActiva] = useState(true);

  // UI States
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vista, setVista] = useState<'menu' | 'seguimiento'>('menu');

  // Verificar si el pedido está finalizado (cancelado o completado)
  const pedidoFinalizado =
    pedidoInfo?.estado?.toLowerCase() === 'cancelado' ||
    pedidoInfo?.estado?.toLowerCase() === 'completado';

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

    // Autenticar para logs del backend
    const clientName = user?.name || 'Cliente';
    const clientId = user?.id ? Number(user.id) : 0;
    authenticate(clientId, clientName, 'cliente');

    // Unirse a la sala del pedido para recibir actualizaciones
    joinPedido(pedidoInfo.id);
    console.log('[Socket] Cliente unido a pedido:', pedidoInfo.id);

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

        // Si el pedido fue cancelado o completado, notificar y redirigir
        if (data.estado === 'CANCELADO') {
          // Mostrar notificación con mejor UX
          setTimeout(() => {
            alert(
              '❌ Tu pedido ha sido cancelado por el personal del restaurante.\n\nSi tienes alguna duda, por favor consulta con el mesero.'
            );
            // Redirigir al home
            router.push('/');
          }, 500);
        } else if (data.estado === 'COMPLETADO') {
          // Mostrar notificación de pedido completado
          setTimeout(() => {
            alert(
              '✅ ¡Tu pedido ha sido completado y pagado!\n\n¡Gracias por tu visita! Esperamos verte pronto.'
            );
            // Redirigir al home
            router.push('/');
          }, 500);
        }
      }
    };

    socket.on('estado_encomienda', handleEstadoEncomienda);
    socket.on('estado_pedido', handleEstadoPedido);

    return () => {
      socket.off('estado_encomienda', handleEstadoEncomienda);
      socket.off('estado_pedido', handleEstadoPedido);
    };
  }, [
    socket,
    pedidoInfo?.id,
    user?.id,
    user?.name,
    authenticate,
    joinPedido,
    router,
  ]);

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
    // Bloquear si pedido finalizado
    if (pedidoFinalizado) {
      alert(
        'Este pedido ya ha sido finalizado. No puedes agregar más productos.'
      );
      return;
    }
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

    // Bloquear si pedido finalizado
    if (pedidoFinalizado) {
      alert(
        'Este pedido ya ha sido finalizado. No puedes enviar más productos.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const productos = carrito.map((item) => ({
        id: item.producto.id,
        cantidad: item.cantidad,
        nota: item.nota,
      }));

      // Si hay encomiendas existentes, usar modificarPedido (reemplaza todo)
      // Si no hay encomiendas, usar agregarProductos (pedido nuevo)
      if (encomiendas.length > 0) {
        await api.cliente.modificarPedido(qrCodigo, productos);
      } else {
        await api.cliente.agregarProductos(qrCodigo, productos);
      }

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

  // Estado para loading de acciones
  const [actionLoading, setActionLoading] = useState<
    'rectificar' | 'cancelar' | null
  >(null);

  // Estado para modal de cancelar
  const [showCancelarModal, setShowCancelarModal] = useState(false);

  // Rectificar pedido (volver a INICIADO para modificar)
  const rectificarPedido = async () => {
    setActionLoading('rectificar');
    try {
      await api.cliente.rectificarPedido(qrCodigo);
      await cargarEstado();
    } catch (err) {
      console.error('Error rectificando pedido:', err);
      const errorMsg =
        err instanceof Error ? err.message : 'Error al rectificar el pedido';
      alert(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  // Manejar clic en tab Menú - solo cambia la vista (modo solo lectura si está en RECEPCION)
  const handleMenuClick = () => {
    setVista('menu');
  };

  // Manejar clic en "Agregar más productos" - rectifica, carga productos al carrito y cambia a vista menú
  const handleAgregarMasProductos = async () => {
    if (pedidoInfo?.estado?.toLowerCase() === 'recepcion') {
      await rectificarPedido();
    }

    // Cargar productos de las encomiendas existentes al carrito
    const productosEnCarrito: CarritoItem[] = [];

    // Buscar producto por nombre en las categorías
    const buscarProducto = (nombre: string): Producto | undefined => {
      for (const categoria of categorias) {
        const producto = categoria.productos.find((p) => p.nombre === nombre);
        if (producto) return producto;
      }
      return undefined;
    };

    // Recorrer todas las encomiendas y sus items
    for (const encomienda of encomiendas) {
      for (const item of encomienda.items) {
        const producto = buscarProducto(item.producto);
        if (producto) {
          // Verificar si ya existe en el carrito
          const existente = productosEnCarrito.find(
            (c) => c.producto.id === producto.id
          );
          if (existente) {
            existente.cantidad += item.cantidad;
            // Si tiene nota, mantener la última
            if (item.nota) existente.nota = item.nota;
          } else {
            productosEnCarrito.push({
              producto,
              cantidad: item.cantidad,
              nota: item.nota || '',
            });
          }
        }
      }
    }

    setCarrito(productosEnCarrito);
    setVista('menu');
  };

  // Determinar si el menú es solo lectura (solo se puede agregar productos en estado INICIADO)
  const menuSoloLectura = pedidoInfo?.estado?.toLowerCase() !== 'iniciado';

  // Cancelar pedido - confirmación via modal
  const confirmarCancelar = async () => {
    setActionLoading('cancelar');
    try {
      await api.cliente.cancelarPedido(qrCodigo);
      setShowCancelarModal(false);
      router.push('/');
    } catch (err) {
      console.error('Error cancelando pedido:', err);
      const errorMsg =
        err instanceof Error ? err.message : 'Error al cancelar el pedido';
      alert(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
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
      servido: {
        texto: 'Servido',
        color: 'bg-teal-100 text-teal-700',
        icon: '🍽️',
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

  // Vista para pedido cancelado
  if (pedidoInfo?.estado?.toLowerCase() === 'cancelado') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-[#334155]">
              {localInfo?.nombre}
            </h1>
            <p className="text-sm text-[#64748B]">{mesaInfo?.nombre}</p>
          </div>
        </header>

        {/* Contenido centrado */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-[#EF4444] mb-4">
              Pedido Cancelado
            </h2>
            <p className="text-[#64748B] mb-8">
              Tu pedido ha sido cancelado por el personal del restaurante. Si
              tienes alguna duda, por favor consulta con el mesero.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#F97316] text-white rounded-lg font-medium hover:bg-[#EA580C] transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista para pedido completado
  if (pedidoInfo?.estado?.toLowerCase() === 'completado') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-[#334155]">
              {localInfo?.nombre}
            </h1>
            <p className="text-sm text-[#64748B]">{mesaInfo?.nombre}</p>
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Mensaje de completado */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-[#22C55E] mb-2">
                ¡Pedido Completado!
              </h2>
              <p className="text-[#64748B]">
                Gracias por tu visita. Esperamos verte pronto.
              </p>
            </div>

            {/* Resumen del pedido */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-bold text-[#334155] mb-4">
                Resumen del pedido
              </h3>
              {encomiendas.map((encomienda, index) => (
                <div key={encomienda.id} className="mb-4 last:mb-0">
                  <p className="text-sm text-[#64748B] mb-2">
                    Pedido #{index + 1}
                  </p>
                  {encomienda.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-[#334155]">
                        {item.cantidad}x {item.producto}
                      </span>
                      <span className="text-[#64748B]">
                        {formatCurrency(item.precio_unitario * item.cantidad)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-[#334155]">Total</span>
                  <span className="text-[#F97316]">
                    {formatCurrency(pedidoInfo?.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-[#F97316] text-white rounded-lg font-medium hover:bg-[#EA580C] transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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
              {/* Toggle vista - Solo visible si hay encomiendas y NO está en estado iniciado */}
              {tienePedidosPrevios &&
                pedidoInfo?.estado?.toLowerCase() !== 'iniciado' && (
                  <div className="flex bg-[#F1F5F9] rounded-lg p-0.5 sm:p-1 flex-shrink-0">
                    <button
                      onClick={handleMenuClick}
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

            {/* Sub-header de estado - Solo visible si hay pedidos previos y NO es estado iniciado */}
            {tienePedidosPrevios &&
              pedidoInfo?.estado?.toLowerCase() !== 'iniciado' && (
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${estadoInfo.color}`}
                    >
                      <span>{estadoInfo.icon}</span>
                      <span>{estadoInfo.texto}</span>
                    </div>
                    {vista === 'menu' && !menuSoloLectura && (
                      <span className="text-xs text-[#64748B]">
                        Agregando más productos
                      </span>
                    )}
                    {vista === 'menu' && menuSoloLectura && (
                      <span className="text-xs text-[#64748B]">
                        Visualizando menú
                      </span>
                    )}
                  </div>
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
            {/* Banner de modo solo lectura */}
            {menuSoloLectura && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
                <div className="flex items-center gap-2 text-amber-800 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <p>
                    <span className="font-medium">Modo visualizacion.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Productos */}
            <div>
              {/* Productos agrupados por categoria */}
              <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-32">
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
                              className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-all active:scale-[0.99] group"
                            >
                              {/* Contenedor principal con imagen y contenido */}
                              <div className="p-3 sm:p-4 flex gap-3 sm:gap-4">
                                {producto.imagen && (
                                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[#F1F5F9]">
                                    <Image
                                      src={producto.imagen}
                                      alt={producto.nombre}
                                      width={96}
                                      height={96}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0 flex flex-col">
                                  <h3 className="font-semibold text-[#334155] text-sm sm:text-base leading-tight mb-1">
                                    {producto.nombre}
                                  </h3>
                                  {producto.descripcion && (
                                    <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2 mb-2">
                                      {producto.descripcion}
                                    </p>
                                  )}
                                  <div className="mt-auto flex items-center justify-between">
                                    <p className="text-[#F97316] font-bold text-base sm:text-lg">
                                      {formatCurrency(producto.precio)}
                                    </p>
                                    {!enCarrito && !menuSoloLectura && (
                                      <button
                                        onClick={() =>
                                          agregarAlCarrito(producto)
                                        }
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors font-medium text-xs sm:text-sm flex items-center gap-1.5 active:scale-95"
                                      >
                                        <Plus size={16} />
                                        <span>Agregar</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Controles de cantidad y nota (solo si está en carrito y NO es solo lectura) */}
                              {enCarrito && !menuSoloLectura && (
                                <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-3 sm:px-4 py-2.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          quitarDelCarrito(producto.id)
                                        }
                                        className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] transition-colors active:scale-95"
                                      >
                                        <Minus size={16} />
                                      </button>
                                      <span className="w-8 text-center font-semibold text-[#334155] text-sm">
                                        {enCarrito.cantidad}
                                      </span>
                                      <button
                                        onClick={() =>
                                          agregarAlCarrito(producto)
                                        }
                                        className="w-8 h-8 flex items-center justify-center bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors active:scale-95"
                                      >
                                        <Plus size={16} />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setNotaExpandida(
                                          notaExpandida === producto.id
                                            ? null
                                            : producto.id
                                        );
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white border border-transparent hover:border-[#E2E8F0]"
                                    >
                                      <StickyNote
                                        size={14}
                                        className={
                                          enCarrito.nota ||
                                          notaExpandida === producto.id
                                            ? 'text-[#F97316]'
                                            : 'text-[#94A3B8]'
                                        }
                                      />
                                      <span
                                        className={
                                          enCarrito.nota ||
                                          notaExpandida === producto.id
                                            ? 'text-[#F97316]'
                                            : 'text-[#64748B]'
                                        }
                                      >
                                        {notaExpandida === producto.id
                                          ? 'Cerrar'
                                          : enCarrito.nota
                                          ? 'Editar nota'
                                          : 'Agregar nota'}
                                      </span>
                                    </button>
                                  </div>

                                  {/* Input de nota expandible */}
                                  {notaExpandida === producto.id ? (
                                    <div className="mt-2 pt-2 border-t border-[#E2E8F0] animate-fade-in">
                                      <div className="flex items-start gap-2">
                                        <StickyNote
                                          size={14}
                                          className="text-[#F97316] mt-2 flex-shrink-0"
                                        />
                                        <input
                                          type="text"
                                          value={enCarrito.nota}
                                          onChange={(e) => {
                                            setCarrito((prev) =>
                                              prev.map((item) =>
                                                item.producto.id === producto.id
                                                  ? {
                                                      ...item,
                                                      nota: e.target.value,
                                                    }
                                                  : item
                                              )
                                            );
                                          }}
                                          placeholder="Ej: sin cebolla, extra salsa..."
                                          className="flex-1 text-xs px-2.5 py-1.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                                          autoFocus
                                        />
                                      </div>
                                    </div>
                                  ) : enCarrito.nota ? (
                                    <div className="mt-2 pt-2 border-t border-[#E2E8F0]">
                                      <p className="text-xs text-[#64748B] italic line-clamp-1">
                                        📝 {enCarrito.nota}
                                      </p>
                                    </div>
                                  ) : null}
                                </div>
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
                className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 bg-[#F97316] text-white rounded-full shadow-2xl hover:bg-[#EA580C] transition-all hover:scale-110 active:scale-95 z-40 flex items-center justify-center group"
              >
                <ShoppingCart
                  size={24}
                  className="sm:group-hover:scale-110 transition-transform"
                />
                <span className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-white text-[#F97316] rounded-full text-xs sm:text-sm font-bold flex items-center justify-center shadow-lg px-1.5">
                  {cantidadTotal}
                </span>
              </button>
            )}

            {/* Información flotante del total (opcional - se muestra al hacer scroll) */}
            {vista === 'menu' && carrito.length > 0 && (
              <div className="fixed bottom-24 right-6 bg-white rounded-full shadow-lg px-4 py-2 z-30 hidden sm:block">
                <p className="text-xs text-[#64748B] mb-0.5">Total</p>
                <p className="text-sm font-bold text-[#F97316]">
                  {formatCurrency(totalCarrito)}
                </p>
              </div>
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
                                  onClick={() =>
                                    agregarAlCarrito(item.producto)
                                  }
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
              {/* Lista de productos - todos juntos */}
              <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                  <span className="font-medium text-sm sm:text-base text-[#334155]">
                    Tu pedido
                  </span>
                  {/* Botón Modificar - Solo visible si sesión activa Y estado es iniciado o recepcion */}
                  {sesionActiva &&
                    (pedidoInfo?.estado?.toLowerCase() === 'iniciado' ||
                      pedidoInfo?.estado?.toLowerCase() === 'recepcion') && (
                      <button
                        onClick={handleAgregarMasProductos}
                        disabled={actionLoading === 'rectificar'}
                        className="px-3 py-1.5 text-xs sm:text-sm font-medium text-[#F97316] bg-[#FFF7ED] rounded-lg hover:bg-[#FFEDD5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {actionLoading === 'rectificar' ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Cargando...</span>
                          </>
                        ) : (
                          'Modificar'
                        )}
                      </button>
                    )}
                </div>
                <div className="p-3 sm:p-4 space-y-2">
                  {encomiendas.flatMap((enc) =>
                    enc.items.map((item) => (
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
                    ))
                  )}
                </div>
                {/* Total del pedido */}
                <div className="p-3 sm:p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-medium text-[#334155]">
                      Total
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-[#F97316]">
                      {formatCurrency(pedidoInfo?.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
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
                Estas a punto de enviar tu pedido. Puedes modificar tu pedido,
                si todavia esta en Recepcion.
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
      </div>

      {/* Modal de confirmación para cancelar pedido */}
      <CancelarPedidoModal
        isOpen={showCancelarModal}
        onClose={() => setShowCancelarModal(false)}
        onConfirm={confirmarCancelar}
        isLoading={actionLoading === 'cancelar'}
      />
    </>
  );
}
