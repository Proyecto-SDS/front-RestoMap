'use client';

import { ChevronDown, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function TopNav() {
  const router = useRouter();
  const { empresa, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = empresa?.nombre?.charAt(0).toUpperCase() || 'E';

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
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Establecimiento name */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden w-10 h-10 bg-linear-to-br from-[#F97316] to-[#EF4444] rounded-xl flex items-center justify-center">
            <span className="text-white">{initials}</span>
          </div>
          <div>
            <h2 className="text-lg text-[#334155]">{empresa?.nombre || 'Establecimiento'}</h2>
            <p className="text-xs text-[#94A3B8] hidden md:block">Panel de Administración</p>
          </div>
        </div>

        {/* Right: User avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-[#F1F5F9] rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-10 h-10 bg-linear-to-br from-[#F97316] to-[#EF4444] rounded-full flex items-center justify-center">
              <span className="text-white">{initials}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm text-[#334155]">{empresa?.nombre}</p>
              <p className="text-xs text-[#94A3B8]">Administrador</p>
            </div>
            <ChevronDown size={16} className={`text-[#94A3B8] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-2 z-50">
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <p className="text-sm text-[#334155]">{empresa?.nombre}</p>
                <p className="text-xs text-[#94A3B8]">Administrador</p>
                {empresa?.correo && (
                  <p className="text-xs text-[#94A3B8] mt-1">{empresa.correo}</p>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
