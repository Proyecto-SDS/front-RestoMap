'use client';

import { ChevronDown, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Empresa } from '../../types';

interface TopNavMeseroProps {
  empresa: Empresa | null;
}

export function TopNavMesero({ empresa }: TopNavMeseroProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Establishment Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-r from-[#F97316] to-[#EF4444] rounded-lg flex items-center justify-center">
            <span className="text-white">
              {empresa?.nombre?.charAt(0) || 'R'}
            </span>
          </div>
          <div>
            <h1 className="text-[#334155]">{empresa?.nombre || 'Restaurante'}</h1>
            <p className="text-xs text-[#94A3B8]">Panel de Mesero</p>
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="w-8 h-8 bg-[#F1F5F9] rounded-full flex items-center justify-center">
              <User size={16} className="text-[#64748B]" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm text-[#334155]">Mesero</p>
              <p className="text-xs text-[#94A3B8]">{empresa?.correo || 'mesero@restaurante.cl'}</p>
            </div>
            <ChevronDown size={16} className="text-[#94A3B8]" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-2">
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <p className="text-sm text-[#334155]">Mesero</p>
                <p className="text-xs text-[#94A3B8]">{empresa?.correo || 'mesero@restaurante.cl'}</p>
                <p className="text-xs text-[#94A3B8] mt-1">Rol: Mesero</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors text-[#EF4444]"
              >
                <LogOut size={16} />
                <span className="text-sm">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
