'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinLocal: (localId: number) => void;
  joinPedido: (pedidoId: number) => void;
  leaveRoom: (room: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

// URL del backend
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Singleton global del socket - se crea fuera de React
let globalSocket: Socket | null = null;

function getOrCreateSocket(): Socket {
  if (!globalSocket && typeof window !== 'undefined') {
    globalSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity, // Reconexión infinita para apps en tiempo real
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000, // Máximo 5 segundos entre intentos
    });
  }
  return globalSocket!;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  // Usar lazy initialization con useState para obtener el socket
  const [socket] = useState<Socket | null>(() => {
    if (typeof window === 'undefined') return null;
    return getOrCreateSocket();
  });

  // Inicializar isConnected basado en el estado actual del socket
  const [isConnected, setIsConnected] = useState(
    () => socket?.connected ?? false
  );

  // Guardar las salas activas para re-unirse al reconectar
  const activeRoomsRef = React.useRef<
    Set<{ type: 'local' | 'pedido'; id: number }>
  >(new Set());

  const rejoinRooms = useCallback(() => {
    if (!socket) return;
    activeRoomsRef.current.forEach((room) => {
      if (room.type === 'local') {
        console.log('[Socket] Re-uniendo a local:', room.id);
        socket.emit('join_local', { local_id: room.id });
      } else if (room.type === 'pedido') {
        console.log('[Socket] Re-uniendo a pedido:', room.id);
        socket.emit('join_pedido', { pedido_id: room.id });
      }
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log('[Socket] Conectado:', socket.id);
      setIsConnected(true);
      // Re-unirse a todas las salas activas
      rejoinRooms();
    };

    const onDisconnect = () => {
      console.log('[Socket] Desconectado');
      setIsConnected(false);
    };

    const onError = (err: Error) => {
      console.log('[Socket] Error:', err.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
    };
  }, [socket, rejoinRooms]);

  const joinLocal = useCallback(
    (localId: number) => {
      // Guardar sala para re-join
      activeRoomsRef.current.add({ type: 'local', id: localId });
      socket?.emit('join_local', { local_id: localId });
    },
    [socket]
  );

  const joinPedido = useCallback(
    (pedidoId: number) => {
      // Guardar sala para re-join
      activeRoomsRef.current.add({ type: 'pedido', id: pedidoId });
      socket?.emit('join_pedido', { pedido_id: pedidoId });
    },
    [socket]
  );

  const leaveRoom = useCallback(
    (room: string) => {
      // Remover sala del tracking
      activeRoomsRef.current.forEach((r) => {
        if (`${r.type}_${r.id}` === room) {
          activeRoomsRef.current.delete(r);
        }
      });
      socket?.emit('leave_room', { room });
    },
    [socket]
  );

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      joinLocal,
      joinPedido,
      leaveRoom,
    }),
    [socket, isConnected, joinLocal, joinPedido, leaveRoom]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
