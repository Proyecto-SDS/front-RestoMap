'use client';

import { BarChart3, Calendar, ChefHat, Home, LogOut, Settings, Users, UtensilsCrossed, Wine } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeItem?: string;
}

export function Sidebar({ activeItem }: SidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard-admin' },
    { id: 'empleados', label: 'Empleados', icon: Users, path: '/dashboard-admin/empleados' },
    { id: 'metricas', label: 'Métricas', icon: BarChart3, path: '/dashboard-admin/metricas' },
    { id: 'mesero', label: 'Panel Mesero', icon: UtensilsCrossed, path: '/dashboard-mesero' },
    { id: 'cocinero', label: 'Panel Cocina', icon: ChefHat, path: '/dashboard-cocinero' },
    { id: 'bartender', label: 'Panel Barra', icon: Wine, path: '/dashboard-bartender' },
    { id: 'reservas', label: 'Panel Reservas', icon: Calendar, path: '/dashboard-reservas' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, path: '/dashboard-admin/configuracion' },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const isActive = (itemId: string, path: string) => {
    // If activeItem prop is provided, use it; otherwise use pathname
    if (activeItem) {
      return activeItem === itemId;
    }
    return pathname === path;
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[260px] bg-white border-r border-[#E2E8F0] min-h-screen sticky top-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#F97316] to-[#EF4444] rounded-xl flex items-center justify-center">
            <span className="text-white">R</span>
          </div>
          <div>
            <h2 className="text-[#334155]">ReservaYa</h2>
            <p className="text-xs text-[#94A3B8]">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id, item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${active
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