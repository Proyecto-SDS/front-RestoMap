'use client';

import { ReactNode, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: ReactNode;
}

// Suscripcion vacia para useSyncExternalStore
const emptySubscribe = () => () => {};

// Detectar si estamos en cliente (montado)
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // getSnapshot en cliente
    () => false // getServerSnapshot en SSR
  );
}

export function ModalPortal({ children }: ModalPortalProps) {
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return createPortal(children, document.body);
}
