'use client';

import {
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  User as UserIcon,
} from 'lucide-react';
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

  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <header
      className="flex-shrink-0"
      style={{
        background: '#1E293B',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2.5 rounded-xl transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            aria-label="Abrir menu"
          >
            <Menu size={20} style={{ color: '#E2E8F0' }} />
          </button>

          {/* Page Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1
                className="text-base lg:text-lg font-semibold"
                style={{ color: '#F8FAFC' }}
              >
                {pageTitle || localName}
              </h1>
              {pageTitle && (
                <>
                  <div
                    className="hidden sm:block w-1 h-1 rounded-full"
                    style={{ background: '#475569' }}
                  />
                  <span
                    className="hidden sm:block text-sm font-medium"
                    style={{ color: '#64748B' }}
                  >
                    {localName}
                  </span>
                </>
              )}
            </div>
            <p
              className="hidden md:block text-xs font-medium mt-0.5"
              style={{ color: '#64748B' }}
            >
              {pageDescription || panelName}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Ver como cliente button */}
          <button
            onClick={() => router.push('/')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <Globe size={16} style={{ color: '#94A3B8' }} />
            <span
              style={{ color: '#CBD5E1', fontSize: '13px', fontWeight: 500 }}
            >
              Ver como cliente
            </span>
          </button>

          {/* Divider */}
          <div
            className="hidden sm:block w-px h-8"
            style={{ background: 'rgba(148, 163, 184, 0.15)' }}
          />

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all duration-200"
              style={{
                background: showDropdown
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!showDropdown) {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showDropdown) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* Avatar with gradient border */}
              <div className="relative">
                {/* Gradient border */}
                <div
                  className="absolute -inset-0.5 rounded-xl"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
                  }}
                />
                {/* Avatar inner */}
                <div
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(145deg, #334155 0%, #1E293B 100%)',
                  }}
                >
                  <span
                    className="text-sm font-semibold"
                    style={{ color: '#F8FAFC' }}
                  >
                    {getInitials(employeeName)}
                  </span>
                </div>
              </div>

              {/* User info - desktop */}
              <div className="hidden md:flex flex-col items-start">
                <span
                  className="text-sm font-medium leading-tight"
                  style={{ color: '#F8FAFC' }}
                >
                  {employeeName}
                </span>
                <span
                  className="text-xs leading-tight"
                  style={{ color: '#64748B' }}
                >
                  {capitalizeRole(employeeRole)}
                </span>
              </div>

              {/* Chevron */}
              <ChevronDown
                size={16}
                style={{
                  color: '#64748B',
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms',
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl py-2 z-[60]"
                style={{
                  background:
                    'linear-gradient(180deg, #1E293B 0%, #172033 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow:
                    '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* User Header */}
                <div
                  className="px-4 py-3 mb-1"
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className="absolute -inset-0.5 rounded-xl"
                        style={{
                          background:
                            'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
                        }}
                      />
                      <div
                        className="relative w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            'linear-gradient(145deg, #334155 0%, #1E293B 100%)',
                        }}
                      >
                        <span
                          className="text-sm font-semibold"
                          style={{ color: '#F8FAFC' }}
                        >
                          {getInitials(employeeName)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: '#F8FAFC' }}
                      >
                        {employeeName}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: '#64748B' }}
                      >
                        {capitalizeRole(employeeRole)}
                      </p>
                      {user?.email && (
                        <p
                          className="text-xs truncate mt-0.5"
                          style={{ color: '#475569' }}
                        >
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {/* Mi Perfil */}
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-150"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(71, 85, 105, 0.5)' }}
                    >
                      <UserIcon size={16} style={{ color: '#94A3B8' }} />
                    </div>
                    <span style={{ color: '#E2E8F0', fontSize: '14px' }}>
                      Mi Perfil
                    </span>
                  </button>

                  {/* Ver como cliente (mobile) */}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 sm:hidden"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(71, 85, 105, 0.5)' }}
                    >
                      <Globe size={16} style={{ color: '#94A3B8' }} />
                    </div>
                    <span style={{ color: '#E2E8F0', fontSize: '14px' }}>
                      Ver como cliente
                    </span>
                  </button>
                </div>

                {/* Logout Section */}
                <div
                  className="pt-1 mt-1"
                  style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-150"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(239, 68, 68, 0.15)' }}
                    >
                      <LogOut size={16} style={{ color: '#F87171' }} />
                    </div>
                    <span style={{ color: '#F87171', fontSize: '14px' }}>
                      Cerrar sesion
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
