'use client';

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pedido } from '../../screens/cocinero/DashboardCocineroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { Toast, useToast } from '../notifications/Toast';

interface PedidoCarouselModalProps {
  pedidos: Pedido[];
  currentIndex: number;
  columnTitle: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onUpdate: (pedido: Pedido) => void;
}

export function PedidoCarouselModal({
  pedidos,
  currentIndex,
  columnTitle,
  onClose,
  onNavigate,
  onUpdate,
}: PedidoCarouselModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const minSwipeDistance = 60;

  const pedido = pedidos[currentIndex];
  const total = pedidos.length;

  // Navigation
  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const goToNext = useCallback(() => {
    if (currentIndex < total - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, total, onNavigate]);

  // Drag handlers
  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  }, []);

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      const diff = clientX - startX;
      // Add resistance at edges
      const atStart = currentIndex === 0 && diff > 0;
      const atEnd = currentIndex === total - 1 && diff < 0;
      const resistance = atStart || atEnd ? 0.3 : 1;
      setDragOffset(diff * resistance);
    },
    [isDragging, startX, currentIndex, total]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    if (Math.abs(dragOffset) > minSwipeDistance) {
      if (dragOffset > 0) {
        goToPrev();
      } else {
        goToNext();
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    setStartX(0);
  }, [isDragging, dragOffset, goToPrev, goToNext]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrev, goToNext]);

  // Calculate time since order entered current state
  const getTimeSince = (p: Pedido) => {
    const now = new Date();
    const stateTime = new Date(p.actualizado_el || p.creado_el);
    const diffMinutes = Math.floor(
      (now.getTime() - stateTime.getTime()) / 60000
    );

    if (diffMinutes < 1) return 'recien';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ${diffMinutes % 60}m`;
  };

  // Get urgency level
  const getUrgency = (p: Pedido) => {
    const now = new Date();
    const stateTime = new Date(p.actualizado_el || p.creado_el);
    const diffMinutes = (now.getTime() - stateTime.getTime()) / 60000;

    if (diffMinutes > 30) return 'critical';
    if (diffMinutes > 15) return 'urgent';
    return 'normal';
  };

  // Handle status change
  const handleStatusChange = async (
    newEstado: 'RECEPCION' | 'EN_PROCESO' | 'TERMINADO'
  ) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedPedido = {
        ...pedido,
        estado: newEstado,
      };

      onUpdate(updatedPedido);

      const messages: Record<string, string> = {
        RECEPCION: 'Pedido recibido',
        EN_PROCESO: 'Pedido en proceso',
        TERMINADO: 'Pedido listo!',
      };

      showToast('success', messages[newEstado]);
    } catch {
      showToast('error', 'Error al actualizar');
    } finally {
      setIsLoading(false);
    }
  };

  // Get action button
  const getActionButton = (p: Pedido) => {
    if (p.estado === 'RECEPCION') {
      return (
        <PrimaryButton
          onClick={() => handleStatusChange('EN_PROCESO')}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full bg-[#3B82F6] hover:bg-[#2563EB]"
        >
          Comenzar
        </PrimaryButton>
      );
    } else if (p.estado === 'EN_PROCESO') {
      return (
        <PrimaryButton
          onClick={() => handleStatusChange('TERMINADO')}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full bg-[#22C55E] hover:bg-[#16A34A]"
        >
          Listo
        </PrimaryButton>
      );
    } else if (p.estado === 'TERMINADO') {
      return (
        <button
          disabled
          className="w-full px-4 py-2 text-sm bg-[#E2E8F0] text-[#94A3B8] rounded-lg cursor-not-allowed"
        >
          Esperando mesero
        </button>
      );
    }
    return null;
  };

  // Render a single card
  const renderCard = (p: Pedido, index: number) => {
    const isCenter = index === currentIndex;
    const offset = index - currentIndex;
    const urgency = getUrgency(p);
    const timeSince = getTimeSince(p);

    // Calculate transform and opacity based on position
    const baseTranslate = offset * 280;
    const translateXValue = baseTranslate + (isCenter ? dragOffset : 0);
    const scale = isCenter ? 1 : 0.85;
    const opacity = Math.abs(offset) > 1 ? 0 : isCenter ? 1 : 0.6;
    const zIndex = isCenter ? 10 : 5 - Math.abs(offset);

    if (Math.abs(offset) > 2) return null;

    return (
      <div
        key={p.id}
        className="absolute left-1/2 w-[320px] transition-all duration-300 ease-out select-none"
        style={{
          transform: `translateX(calc(-50% + ${translateXValue}px)) scale(${scale})`,
          opacity,
          zIndex,
          transition: isDragging ? 'none' : 'all 0.3s ease-out',
        }}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${
            isCenter ? '' : 'pointer-events-none'
          }`}
        >
          {/* Card Header */}
          <div
            className={`p-4 ${
              urgency === 'critical'
                ? 'bg-[#EF4444]'
                : urgency === 'urgent'
                ? 'bg-[#F97316]'
                : 'bg-[#1E293B]'
            } text-white`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{p.mesa_nombre}</h3>
                <p className="text-xs text-white/70">Pedido #{p.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span className="text-sm font-medium">{timeSince}</span>
              </div>
            </div>
            {urgency !== 'normal' && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                <AlertTriangle size={12} />
                <span>
                  {urgency === 'critical' ? 'Muy urgente' : 'Urgente'}
                </span>
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
            {p.lineas.map((linea) => (
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

            {p.notas && (
              <div className="bg-[#FEF3C7] rounded-lg p-3 mt-2">
                <p className="text-xs text-[#92400E]">
                  <span className="font-medium">Nota:</span> {p.notas}
                </p>
              </div>
            )}
          </div>

          {/* Card Action */}
          {isCenter && <div className="p-4 pt-0">{getActionButton(p)}</div>}
        </div>
      </div>
    );
  };

  if (!pedido) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 z-50 flex flex-col"
        onClick={onClose}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white">
          <div>
            <h2 className="text-xl font-bold">{columnTitle}</h2>
            <p className="text-sm text-white/70">
              {currentIndex + 1} de {total} pedidos
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Carousel Container */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Cards */}
          <div className="absolute inset-0 flex items-center justify-center">
            {pedidos.map((p, i) => renderCard(p, i))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-20"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            disabled={currentIndex === total - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-20"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 p-4">
          {pedidos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(i);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Keyboard hint */}
        <div className="text-center pb-4">
          <span className="text-xs text-white/50">
            Usa las flechas del teclado para navegar
          </span>
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
