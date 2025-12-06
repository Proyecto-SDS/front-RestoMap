'use client';

import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

  const handleNavigation = (item: MenuItem) => {
    if (useRouterNavigation && item.path) {
      router.push(item.path);
    } else if (onNavigate) {
      onNavigate(item.id);
    }
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 pb-6">
        <div className="flex items-center gap-3">
          {/* Logo con glow effect */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-xl blur-xl opacity-60"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
              }}
            />
            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
                boxShadow:
                  '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Image
                src="/logo.png"
                alt="RestoMap"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <span
              className="text-base font-semibold"
              style={{ color: '#F8FAFC' }}
            >
              {title}
            </span>
            <span className="text-xs font-medium" style={{ color: '#64748B' }}>
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-5 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.2) 50%, transparent 100%)',
        }}
      />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className="relative w-full rounded-xl transition-all duration-200"
                  style={{
                    padding: '10px 12px',
                  }}
                >
                  {/* Active Background with glow */}
                  {isActive && (
                    <>
                      {/* Outer glow */}
                      <div
                        className="absolute inset-0 rounded-xl opacity-30 blur-sm"
                        style={{
                          background:
                            'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
                        }}
                      />
                      {/* Main background */}
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(236, 72, 153, 0.08) 100%)',
                          border: '1px solid rgba(249, 115, 22, 0.25)',
                        }}
                      />
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                        style={{
                          background:
                            'linear-gradient(180deg, #F97316 0%, #EC4899 100%)',
                          boxShadow: '0 0 12px rgba(249, 115, 22, 0.6)',
                        }}
                      />
                    </>
                  )}

                  {/* Content */}
                  <div className="relative flex items-center gap-3">
                    {/* Icon Container */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                          : 'rgba(51, 65, 85, 0.5)',
                        boxShadow: isActive
                          ? '0 4px 12px rgba(249, 115, 22, 0.35)'
                          : 'none',
                      }}
                    >
                      <ItemIcon
                        size={18}
                        style={{
                          color: isActive ? '#FFFFFF' : '#94A3B8',
                        }}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className="text-sm font-medium transition-colors duration-200"
                      style={{
                        color: isActive ? '#F8FAFC' : '#94A3B8',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div
          className="h-px mb-4"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.2) 50%, transparent 100%)',
          }}
        />
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: '#10B981',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
              animation: 'pulse 2s infinite',
            }}
          />
          <span style={{ color: '#64748B', fontSize: '12px' }}>
            RestoMap v1.0
          </span>
        </div>
      </div>

      {/* Keyframe animation para el pulse */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 h-full w-72 z-50
          transform transition-transform duration-300 ease-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onCloseMobileMenu}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <X size={20} style={{ color: '#94A3B8' }} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:block w-64 flex-shrink-0 h-full"
        style={{
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
