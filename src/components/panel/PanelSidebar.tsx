'use client';

import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// ============================================
// TIPOS
// ============================================

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
}

interface PanelSidebarProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  menuItems: MenuItem[];
  activeItem: string;
  onNavigate?: (id: string) => void;
  useRouterNavigation?: boolean;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

// ============================================
// ESTILOS CSS-IN-JS
// ============================================

const styles = {
  // Sidebar container
  sidebar: {
    background: 'linear-gradient(180deg, #1a1f2e 0%, #151922 100%)',
  },

  // Logo section
  logoContainer: {
    position: 'relative' as const,
  },
  logoGlow: {
    position: 'absolute' as const,
    inset: '-4px',
    background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
    borderRadius: '16px',
    filter: 'blur(12px)',
    opacity: 0.4,
  },
  logoBox: {
    position: 'relative' as const,
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #252d3d 0%, #1a1f2e 100%)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  },

  // Divider
  divider: {
    height: '1px',
    background:
      'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)',
    margin: '0 20px',
  },

  // Menu item base
  menuItem: {
    position: 'relative' as const,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // Menu item active background
  menuItemActiveBg: {
    position: 'absolute' as const,
    inset: 0,
    background:
      'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%)',
    borderRadius: '12px',
    border: '1px solid rgba(249, 115, 22, 0.2)',
  },

  // Active left accent
  activeAccent: {
    position: 'absolute' as const,
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '24px',
    background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
    borderRadius: '0 4px 4px 0',
    boxShadow: '0 0 12px rgba(249, 115, 22, 0.6)',
  },

  // Icon container
  iconContainer: (isActive: boolean) => ({
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isActive
      ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
      : 'rgba(45, 55, 72, 0.6)',
    boxShadow: isActive ? '0 4px 12px rgba(249, 115, 22, 0.4)' : 'none',
    transition: 'all 0.2s ease',
  }),

  // Footer
  footerDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
  },
};

// ============================================
// COMPONENTE SIDEBAR CONTENT
// ============================================

function SidebarContent({
  title,
  subtitle,
  menuItems,
  activeItem,
  onItemClick,
}: {
  title: string;
  subtitle: string;
  menuItems: MenuItem[];
  activeItem: string;
  onItemClick: (item: MenuItem) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* ===== HEADER CON LOGO ===== */}
      <div
        style={{
          paddingLeft: '43px',
          paddingTop: '28px',
          paddingBottom: '29px',
          paddingRight: '20px',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo con efecto glow */}
          <div style={styles.logoContainer}>
            <div style={styles.logoGlow} />
            <div style={styles.logoBox}>
              <Image
                src="/logo.png"
                alt="RestoMap"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
          </div>

          {/* Texto del brand */}
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-white tracking-tight">
              {title}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* ===== DIVIDER ===== */}
      <div style={styles.divider} />

      {/* ===== MENU DE NAVEGACION ===== */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item)}
                  style={{
                    ...styles.menuItem,
                    background: isActive ? 'transparent' : 'transparent',
                  }}
                  className="group"
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background =
                        'rgba(255, 255, 255, 0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Background activo */}
                  {isActive && <div style={styles.menuItemActiveBg} />}

                  {/* Barra de acento izquierda */}
                  {isActive && <div style={styles.activeAccent} />}

                  {/* Contenedor del icono */}
                  <div style={styles.iconContainer(isActive)}>
                    <ItemIcon
                      size={18}
                      color={isActive ? '#ffffff' : '#94a3b8'}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className="relative text-[13px] font-medium"
                    style={{ color: isActive ? '#f8fafc' : '#94a3b8' }}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ===== FOOTER ===== */}
      <div className="p-4">
        <div style={styles.divider} className="mb-4" />
        <div className="flex items-center justify-center gap-2">
          <div style={styles.footerDot} />
          <span className="text-[11px] text-slate-600 font-medium">
            RestoMap v1.0
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function PanelSidebar({
  title,
  subtitle,
  menuItems,
  activeItem,
  onNavigate,
  useRouterNavigation = false,
  isMobileMenuOpen = false,
  onCloseMobileMenu,
}: PanelSidebarProps) {
  const router = useRouter();

  const handleItemClick = (item: MenuItem) => {
    if (useRouterNavigation && item.path) {
      router.push(item.path);
    } else if (onNavigate) {
      onNavigate(item.id);
    }
    onCloseMobileMenu?.();
  };

  const contentProps = {
    title,
    subtitle,
    menuItems,
    activeItem,
    onItemClick: handleItemClick,
  };

  return (
    <>
      {/* ===== OVERLAY MOBILE ===== */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* ===== SIDEBAR MOBILE ===== */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 h-full w-72 z-50
          transform transition-transform duration-300 ease-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={styles.sidebar}
      >
        {/* Boton cerrar */}
        <button
          onClick={onCloseMobileMenu}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>

        <SidebarContent {...contentProps} />
      </aside>

      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside
        className="hidden lg:flex flex-col w-64 h-full flex-shrink-0"
        style={styles.sidebar}
      >
        <SidebarContent {...contentProps} />
      </aside>
    </>
  );
}
