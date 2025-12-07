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
  authenticate: (userId: number, nombre: string, rol: string) => void;
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
  // Usamos Map con string key para evitar duplicados (Set no funciona bien con objetos)
  const activeRoomsRef = React.useRef<Map<string, 'local' | 'pedido'>>(
    new Map()
  );

  // Guardar datos del usuario autenticado para re-autenticar al reconectar
  const authDataRef = React.useRef<{
    userId: number;
    nombre: string;
    rol: string;
  } | null>(null);

  const rejoinRooms = useCallback(() => {
    if (!socket) return;
    // Re-autenticar primero
    if (authDataRef.current) {
      socket.emit('authenticate', authDataRef.current);
    }
    // Luego re-unirse a salas
    activeRoomsRef.current.forEach((type, key) => {
      const id = parseInt(key.split('_')[1]);
      if (type === 'local') {
        console.log('[Socket] Re-uniendo a local:', id);
        socket.emit('join_local', { local_id: id });
      } else if (type === 'pedido') {
        console.log('[Socket] Re-uniendo a pedido:', id);
        socket.emit('join_pedido', { pedido_id: id });
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

  const authenticate = useCallback(
    (userId: number, nombre: string, rol: string) => {
      // Solo autenticar si los datos cambiaron o es primera vez
      const current = authDataRef.current;
      if (
        current &&
        current.userId === userId &&
        current.nombre === nombre &&
        current.rol === rol
      ) {
        return; // Ya autenticado con los mismos datos
      }
      authDataRef.current = { userId, nombre, rol };
      socket?.emit('authenticate', { user_id: userId, nombre, rol });
    },
    [socket]
  );

  const joinLocal = useCallback(
    (localId: number) => {
      const key = `local_${localId}`;
      // Solo unirse si no está ya en el Map
      if (!activeRoomsRef.current.has(key)) {
        activeRoomsRef.current.set(key, 'local');
        socket?.emit('join_local', { local_id: localId });
      }
    },
    [socket]
  );

  const joinPedido = useCallback(
    (pedidoId: number) => {
      const key = `pedido_${pedidoId}`;
      // Solo unirse si no está ya en el Map
      if (!activeRoomsRef.current.has(key)) {
        activeRoomsRef.current.set(key, 'pedido');
        socket?.emit('join_pedido', { pedido_id: pedidoId });
      }
    },
    [socket]
  );

  const leaveRoom = useCallback(
    (room: string) => {
      activeRoomsRef.current.delete(room);
      socket?.emit('leave_room', { room });
    },
    [socket]
  );

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      authenticate,
      joinLocal,
      joinPedido,
      leaveRoom,
    }),
    [socket, isConnected, authenticate, joinLocal, joinPedido, leaveRoom]
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
