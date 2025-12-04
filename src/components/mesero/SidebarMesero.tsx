'use client';

import { ClipboardList, LayoutGrid, LogOut, QrCode, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface SidebarMeseroProps {
  activeItem: 'mesas' | 'pedidos' | 'boleta' | 'qr';
  onNavigate: (item: 'mesas' | 'pedidos' | 'boleta' | 'qr') => void;
}

export function SidebarMesero({ activeItem, onNavigate }: SidebarMeseroProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const menuItems = [
    { id: 'mesas' as const, label: 'Mesas', icon: LayoutGrid },
    { id: 'pedidos' as const, label: 'Mis Pedidos', icon: ClipboardList },
    { id: 'boleta' as const, label: 'Boleta', icon: Receipt },
    { id: 'qr' as const, label: 'Escanear QR', icon: QrCode },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col sticky top-0 h-screen">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-r from-[#F97316] to-[#EF4444] rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">R</span>
          </div>
          <div>
            <h2 className="text-[#334155]">ReservaYa</h2>
            <p className="text-xs text-[#94A3B8]">Panel de Mesero</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-[#FFF7ED] text-[#F97316] shadow-sm'
                      : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155]'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-[#F97316] rounded-full"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#E2E8F0]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#EF4444] hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
