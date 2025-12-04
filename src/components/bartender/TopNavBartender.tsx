import { ChevronDown, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

import type { Empresa } from '../../types';

interface TopNavBartenderProps {
  empresa?: Empresa | null;
}

export function TopNavBartender({ empresa: empresaProp }: TopNavBartenderProps = {}) {
  const { logout, empresa: empresaContext } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const empresa = empresaProp || empresaContext;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
    // Assuming setIsMenuOpen is defined elsewhere or will be added by the user
    // setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Empresa Info */}
        <div className="flex items-center gap-3">
          {empresa?.logo ? (
            <ImageWithFallback
              src="/logo.png"
              alt="RestoMap Logo"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-linear-to-br from-[#F97316] to-[#EF4444] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">
                {empresa?.nombre?.[0] || 'R'}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-sm text-[#334155]">
              {empresa?.nombre || 'Establecimiento'}
            </h1>
            <p className="text-xs text-[#94A3B8]">Panel de Barra</p>
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="w-8 h-8 bg-[#F1F5F9] rounded-full flex items-center justify-center">
              <User size={16} className="text-[#64748B]" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs text-[#334155]">Bartender</p>
              <p className="text-xs text-[#94A3B8]">Barra</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-[#64748B] transition-transform ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-2">
              <div className="px-4 py-2 border-b border-[#E2E8F0]">
                <p className="text-xs text-[#94A3B8]">Rol</p>
                <p className="text-sm text-[#334155]">Bartender</p>
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
