'use client';

import { LogOut, Package, Wine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface SidebarBartenderProps {
  activeItem: 'pedidos' | 'inventario';
  onNavigate: (item: 'pedidos' | 'inventario') => void;
}

export function SidebarBartender({ activeItem, onNavigate }: SidebarBartenderProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'pedidos' as const, label: 'Pedidos', icon: Wine },
    { id: 'inventario' as const, label: 'Inventario', icon: Package },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[260px] bg-white border-r border-[#E2E8F0] min-h-screen sticky top-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EF4444] rounded-xl flex items-center justify-center">
            <Wine size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-[#334155]">Panel Barra</h2>
            <p className="text-xs text-[#94A3B8]">Bartender</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${
                    active
                      ? 'bg-orange-50 text-[#F97316] border-l-4 border-[#F97316]'
                      : 'text-[#64748B] hover:bg-[#F1F5F9]'
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#E2E8F0]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#EF4444] hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
