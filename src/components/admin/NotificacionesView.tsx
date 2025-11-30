import { useState } from 'react';
import { X, Check, Clock, UtensilsCrossed, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificacionesViewProps {
  onClose: () => void;
  onClearAll: () => void;
}

interface Notification {
  id: number;
  icon: 'food' | 'warning';
  message: string;
  timeAgo: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    icon: 'food',
    message: 'Mesa 8 - Ensalada César está lista para servir',
    timeAgo: 'hace 7 minutos',
    read: false,
  },
  {
    id: 2,
    icon: 'warning',
    message: 'Salmón a la Parrilla ya no está disponible',
    timeAgo: 'hace 32 minutos',
    read: false,
  },
  {
    id: 3,
    icon: 'food',
    message: 'Mesa 4 - Pedido completado y listo para entregar',
    timeAgo: 'hace 45 minutos',
    read: false,
  },
];

export function NotificacionesView({ onClose, onClearAll }: NotificacionesViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    onClearAll();
  };

  const handleMarkRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-start justify-end">
      <div className="bg-white h-full w-full md:w-[500px] shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Notificaciones</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Marcar todas leídas
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              No hay notificaciones
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 
                  flex items-start gap-3 hover:shadow-md transition-shadow
                  cursor-pointer relative
                `}
                onClick={() => handleMarkRead(notification.id)}
              >
                {/* Icono */}
                <div className="flex-shrink-0">
                  {notification.icon === 'food' ? (
                    <div className="bg-white rounded-lg p-2">
                      <UtensilsCrossed className="h-6 w-6 text-orange-500" />
                    </div>
                  ) : (
                    <div className="bg-amber-100 rounded-lg p-2">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {notification.timeAgo}
                  </p>
                </div>

                {/* Indicador de no leído */}
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
