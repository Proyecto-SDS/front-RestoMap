'use client';

import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CustomScrollbar } from '../layout/CustomScrollbar';

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
  icon: IconComponent,
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
    <>
      {/* Logo/Brand */}
      <div className="border-b border-[#E2E8F0] flex-shrink-0">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EF4444] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <IconComponent size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-[#334155]">{title}</h1>
            <p className="text-xs text-[#94A3B8]">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <CustomScrollbar className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FFF7ED] to-[#FFEDD5] text-[#EA580C] font-medium'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155]'
                  }`}
                >
                  <ItemIcon
                    size={20}
                    className={isActive ? 'text-[#F97316]' : ''}
                  />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </CustomScrollbar>

      {/* Footer */}
      <div className="p-4 border-t border-[#E2E8F0] flex-shrink-0">
        <p className="text-xs text-[#94A3B8] text-center">ReservaYa v1.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Bot\u00f3n cerrar en m\u00f3vil */}
        <div className="flex justify-end p-4 border-b border-[#E2E8F0]">
          <button
            onClick={onCloseMobileMenu}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <X size={24} className="text-[#334155]" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E2E8F0] flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
