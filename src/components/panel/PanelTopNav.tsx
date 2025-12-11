'use client';

import {
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  User as UserIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';
import { NotificacionesPanel } from './NotificacionesPanel';

// ============================================
// TIPOS
// ============================================

interface PanelTopNavProps {
  panelName: string;
  pageTitle?: string;
  pageDescription?: string;
  user?: User | null;
  onOpenProfile?: () => void;
  onToggleMobileMenu?: () => void;
}

// ============================================
// ESTILOS CSS-IN-JS
// ============================================

const styles = {
  header: {
    background: '#1a1f2e',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },

  // Boton menu mobile
  menuButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '10px',
  },

  // Avatar con borde gradiente
  avatarOuter: {
    position: 'relative' as const,
    padding: '2px',
    background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
    borderRadius: '12px',
  },
  avatarInner: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #2d3748 0%, #1a1f2e 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dropdown
  dropdown: {
    position: 'absolute' as const,
    right: 0,
    top: '100%',
    marginTop: '8px',
    width: '260px',
    background: 'linear-gradient(180deg, #1e2433 0%, #181d29 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    zIndex: 60,
  },

  // Dropdown item
  dropdownItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },

  // Icon container en dropdown
  dropdownIcon: (color: string) => ({
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function PanelTopNav({
  panelName,
  pageTitle,
  pageDescription,
  user: userProp,
  onOpenProfile,
  onToggleMobileMenu,
}: PanelTopNavProps) {
  const { logout, user: userContext } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = userProp || userContext;
  const localName = user?.nombre_local || 'Establecimiento';
  const employeeName = user?.name || 'Usuario';
  const employeeRole = user?.rol || 'Empleado';

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    onOpenProfile?.();
  };

  const capitalizeRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="flex-shrink-0" style={styles.header}>
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* ===== SECCION IZQUIERDA ===== */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Boton menu mobile */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden hover:bg-white/10 transition-colors shrink-0"
            style={styles.menuButton}
            aria-label="Abrir menu"
          >
            <Menu size={20} color="#e2e8f0" />
          </button>

          {/* Info de pagina */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xs sm:text-sm lg:text-base font-semibold text-white truncate">
                {pageTitle || localName}
              </h1>
              {pageTitle && (
                <>
                  <span className="hidden lg:block text-slate-600">-</span>
                  <span className="hidden lg:block text-sm text-slate-500 font-medium truncate">
                    {localName}
                  </span>
                </>
              )}
            </div>
            <p className="hidden lg:block text-xs text-slate-600 mt-0.5 truncate">
              {pageDescription || panelName}
            </p>
          </div>
        </div>

        {/* ===== SECCION DERECHA ===== */}
        <div className="flex items-center gap-2">
          {/* Panel de Notificaciones */}
          <NotificacionesPanel />

          {/* ===== DROPDOWN DE USUARIO ===== */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-1.5 pr-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              {/* Avatar con borde gradiente */}
              <div style={styles.avatarOuter}>
                <div style={styles.avatarInner}>
                  <span className="text-sm font-semibold text-white">
                    {getInitials(employeeName)}
                  </span>
                </div>
              </div>

              {/* Info usuario (desktop) */}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-white leading-tight">
                  {employeeName}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  {capitalizeRole(employeeRole)}
                </span>
              </div>

              {/* Chevron */}
              <ChevronDown
                size={16}
                color="#64748b"
                style={{
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {/* ===== MENU DROPDOWN ===== */}
            {showDropdown && (
              <div style={styles.dropdown}>
                {/* Header del usuario */}
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    {/* Avatar grande */}
                    <div style={{ ...styles.avatarOuter, padding: '2px' }}>
                      <div
                        style={{
                          ...styles.avatarInner,
                          width: '44px',
                          height: '44px',
                        }}
                      >
                        <span className="text-base font-semibold text-white">
                          {getInitials(employeeName)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {employeeName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {capitalizeRole(employeeRole)}
                      </p>
                      {user?.email && (
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items del menu */}
                <div className="py-1">
                  {/* Mi Perfil */}
                  <button
                    onClick={handleProfileClick}
                    style={styles.dropdownItem}
                    className="hover:bg-white/5"
                  >
                    <div style={styles.dropdownIcon('rgba(71, 85, 105, 0.5)')}>
                      <UserIcon size={16} color="#94a3b8" />
                    </div>
                    <span className="text-sm text-slate-300">Mi Perfil</span>
                  </button>

                  {/* Ver como cliente */}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      router.push('/');
                    }}
                    style={styles.dropdownItem}
                    className="hover:bg-white/5"
                  >
                    <div style={styles.dropdownIcon('rgba(71, 85, 105, 0.5)')}>
                      <Globe size={16} color="#94a3b8" />
                    </div>
                    <span className="text-sm text-slate-300">
                      Ver como cliente
                    </span>
                  </button>
                </div>

                {/* Separador y logout */}
                <div className="border-t border-white/5 py-1">
                  <button
                    onClick={handleLogout}
                    style={styles.dropdownItem}
                    className="hover:bg-red-500/10"
                  >
                    <div style={styles.dropdownIcon('rgba(239, 68, 68, 0.15)')}>
                      <LogOut size={16} color="#f87171" />
                    </div>
                    <span className="text-sm text-red-400">Cerrar sesion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
