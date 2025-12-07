'use client';

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Pedido } from '../../screens/cocinero/DashboardCocineroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { Toast, useToast } from '../notifications/Toast';

interface PedidoCarouselModalProps {
  pedido: Pedido;
  columnTitle: string;
  position: { current: number; total: number };
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onUpdate: (pedido: Pedido) => void;
}

export function PedidoCarouselModal({
  pedido,
  columnTitle,
  position,
  onClose,
  onNavigate,
  onUpdate,
}: PedidoCarouselModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Swipe detection
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNavigate('next');
    } else if (isRightSwipe) {
      onNavigate('prev');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        onNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  // Calculate time since order
  const getTimeSince = () => {
    const now = new Date();
    const created = new Date(pedido.creado_el);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

    if (diffMinutes < 1) return 'recien';
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `hace ${diffHours}h ${diffMinutes % 60}m`;
  };

  // Get urgency level
  const getUrgency = () => {
    const now = new Date();
    const created = new Date(pedido.creado_el);
    const diffMinutes = (now.getTime() - created.getTime()) / 60000;

    if (diffMinutes > 30) return 'critical';
    if (diffMinutes > 15) return 'urgent';
    return 'normal';
  };

  const urgency = getUrgency();
  const timeSince = getTimeSince();

  // Handle status change
  const handleStatusChange = async (
    newEstado: 'RECEPCION' | 'EN_PROCESO' | 'TERMINADO'
  ) => {
    setIsLoading(true);

    try {
      // Mock API call - en produccion seria PATCH /api/empresa/pedidos/{id}
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedPedido = {
        ...pedido,
        estado: newEstado,
      };

      onUpdate(updatedPedido);

      const messages: Record<string, string> = {
        RECEPCION: 'Pedido recibido',
        EN_PROCESO: 'Pedido en proceso',
        TERMINADO: 'Pedido listo para servir!',
      };

      showToast('success', messages[newEstado]);
    } catch {
      showToast('error', 'Error al actualizar el pedido');
    } finally {
      setIsLoading(false);
    }
  };

  // Get button config based on status
  const getActionButton = () => {
    if (pedido.estado === 'RECEPCION') {
      return (
        <PrimaryButton
          onClick={() => handleStatusChange('EN_PROCESO')}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full bg-[#3B82F6] hover:bg-[#2563EB]"
        >
          Comenzar Preparacion
        </PrimaryButton>
      );
    } else if (pedido.estado === 'EN_PROCESO') {
      return (
        <PrimaryButton
          onClick={() => handleStatusChange('TERMINADO')}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full bg-[#22C55E] hover:bg-[#16A34A]"
        >
          Marcar como Listo
        </PrimaryButton>
      );
    } else if (pedido.estado === 'TERMINADO') {
      return (
        <button
          disabled
          className="w-full px-4 py-3 text-sm bg-[#E2E8F0] text-[#94A3B8] rounded-lg cursor-not-allowed"
        >
          Esperando mesero
        </button>
      );
    }
    return null;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Header */}
          <div className="bg-[#1E293B] text-white p-4 flex items-center justify-between">
            <button
              onClick={() => onNavigate('prev')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              disabled={position.total <= 1}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-center">
              <h2 className="font-semibold">{columnTitle.toUpperCase()}</h2>
              <p className="text-sm text-white/70">
                ({position.current}/{position.total})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('next')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                disabled={position.total <= 1}
              >
                <ChevronRight size={24} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Mesa and urgency */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#334155]">
                  {pedido.mesa_nombre}
                </h3>
                <p className="text-sm text-[#64748B]">Pedido #{pedido.id}</p>
              </div>
              {urgency !== 'normal' && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                    urgency === 'critical'
                      ? 'bg-[#EF4444] text-white'
                      : 'bg-[#F97316] text-white'
                  }`}
                >
                  <AlertTriangle size={14} />
                  <span className="text-sm font-medium">
                    {urgency === 'critical' ? 'Muy urgente' : 'Urgente'}
                  </span>
                </div>
              )}
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 text-[#64748B]">
              <Clock size={16} />
              <span className="text-sm">{timeSince}</span>
            </div>

            {/* Items */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2">
              {pedido.lineas.map((linea) => (
                <div
                  key={linea.id}
                  className="flex justify-between items-start py-2 border-b border-[#E2E8F0] last:border-0"
                >
                  <div className="flex-1">
                    <span className="text-[#334155] font-medium">
                      {linea.cantidad}x {linea.producto_nombre}
                    </span>
                    {linea.notas && (
                      <p className="text-xs text-[#F97316] italic mt-1">
                        {linea.notas}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes if exists */}
            {pedido.notas && (
              <div className="bg-[#FEF3C7] rounded-xl p-4">
                <p className="text-sm text-[#92400E]">
                  <span className="font-medium">Nota:</span> {pedido.notas}
                </p>
              </div>
            )}

            {/* Action button */}
            <div className="pt-2">{getActionButton()}</div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </>
  );
}
