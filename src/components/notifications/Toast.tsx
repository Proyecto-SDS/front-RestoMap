'use client';

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

export function Toast({
  type,
  message,
  duration = 3000,
  onClose,
  isVisible,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isExiting) return null;

  const config = {
    success: {
      bg: 'bg-[#22C55E]',
      icon: <CheckCircle2 size={20} />,
    },
    error: {
      bg: 'bg-[#EF4444]',
      icon: <XCircle size={20} />,
    },
    info: {
      bg: 'bg-[#3B82F6]',
      icon: <Info size={20} />,
    },
    warning: {
      bg: 'bg-[#F59E0B]',
      icon: <AlertTriangle size={20} />,
    },
  };

  const { bg, icon } = config[type];

  return (
    <div
      className={`
        fixed top-4 right-4 md:right-4 left-4 md:left-auto
        z-[60]
        flex items-center gap-3
        px-4 py-3
        ${bg}
        text-white
        rounded-xl
        shadow-lg
        max-w-md
        pointer-events-auto
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="shrink-0">{icon}</div>
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast Manager Hook
export function useToast() {
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
    isVisible: boolean;
  } | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => (prev ? { ...prev, isVisible: false } : null));
  };

  return { toast, showToast, hideToast };
}
