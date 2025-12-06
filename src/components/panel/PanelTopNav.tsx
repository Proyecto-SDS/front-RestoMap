'use client';

import { ChevronDown, LogOut, Menu, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

interface PanelTopNavProps {
  panelName: string;
  pageTitle?: string;
  pageDescription?: string;
  user?: User | null;
  onOpenProfile?: () => void;
  onToggleMobileMenu?: () => void;
}

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
    if (onOpenProfile) {
      onOpenProfile();
    }
  };

  const capitalizeRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className="flex-shrink-0 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Nombre del Local y Título de Página */}
        <div className="flex items-center gap-3">
          {/* Botón hamburguesa en móvil */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors -ml-2"
          >
            <Menu size={24} className="text-[#334155]" />
          </button>
          <div>
            <h2 className="text-lg text-[#334155] font-medium">
              {pageTitle ? `${localName} - ${pageTitle}` : localName}
            </h2>
            <p className="text-xs text-[#94A3B8] hidden md:block">
              {pageDescription || panelName}
            </p>
          </div>
        </div>

        {/* Right: User Info + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-[#F1F5F9] rounded-lg px-3 py-2 transition-colors"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm text-[#334155] font-medium">
                {employeeName}
              </p>
              <p className="text-xs text-[#94A3B8]">
                {capitalizeRole(employeeRole)}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={`text-[#94A3B8] transition-transform ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-2 z-[55]">
              {/* User Info in Dropdown */}
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <p className="text-sm text-[#334155] font-medium">
                  {employeeName}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  {capitalizeRole(employeeRole)}
                </p>
                {user?.email && (
                  <p className="text-xs text-[#94A3B8] mt-1">{user.email}</p>
                )}
              </div>

              {/* Mi Perfil */}
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#334155] hover:bg-[#F1F5F9] transition-colors"
              >
                <UserIcon size={16} />
                Mi Perfil
              </button>

              {/* Navegar como Cliente */}
              <button
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#3B82F6] hover:bg-[#EFF6FF] transition-colors"
              >
                <UserIcon size={16} />
                Navegar como Cliente
              </button>

              {/* Cerrar sesión */}
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
