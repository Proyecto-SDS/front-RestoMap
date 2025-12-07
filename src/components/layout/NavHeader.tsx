'use client';

import {
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  QrCode,
  User,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/apiClient';
import { ScanQRClienteModal } from '../cliente/ScanQRClienteModal';

export function NavHeader() {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [activeQr, setActiveQr] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Consultar pedido activo desde backend
  const checkPedidoActivo = useCallback(async () => {
    try {
      const response = await api.cliente.getPedidoActivo();
      if (response.tiene_pedido && response.qr_codigo) {
        setActiveQr(response.qr_codigo);
        // También guardar en localStorage para persistencia local
        localStorage.setItem('restomap_active_qr', response.qr_codigo);
      } else {
        setActiveQr(null);
        localStorage.removeItem('restomap_active_qr');
      }
    } catch {
      // Si falla (401, etc), usar localStorage como fallback
      const qr = localStorage.getItem('restomap_active_qr');
      setActiveQr(qr);
    }
  }, []);

  // Marcar componente como montado y consultar backend
  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
    // Primero leer de localStorage (rápido)
    const qr = localStorage.getItem('restomap_active_qr');
    setActiveQr(qr);
  }, []);

  // Consultar backend cuando el usuario está logueado
  useEffect(() => {
    if (!isMounted || !isLoggedIn) return;
    // eslint-disable-next-line
    checkPedidoActivo();
  }, [isMounted, isLoggedIn, checkPedidoActivo]);

  useEffect(() => {
    if (!isMounted) return;

    const checkQr = () => {
      const qr = localStorage.getItem('restomap_active_qr');
      setActiveQr(qr);
    };

    // Escuchar evento personalizado (mismo tab) y storage (otros tabs)
    window.addEventListener('qr-updated', checkQr);
    window.addEventListener('storage', checkQr);

    return () => {
      window.removeEventListener('qr-updated', checkQr);
      window.removeEventListener('storage', checkQr);
    };
  }, [isMounted]);

  // User is an employee if they have id_local
  const isEmployee = !!user?.id_local;
  // Ocultar boton QR si ya esta en pagina de pedido
  const isOnPedidoPage = pathname?.startsWith('/pedido');
  // Solo mostrar botón QR después de montar (evita hidratación incorrecta)
  const showQrButton =
    isMounted && isLoggedIn && !isEmployee && !isOnPedidoPage;

  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    const handleScroll = () => {
      setIsScrolled(mainElement.scrollTop > 10);
    };

    mainElement.addEventListener('scroll', handleScroll);
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
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
    router.push('/login');
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
  };

  const handleLoginClick = () => {
    router.push('/login');
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
  };

  const handleGoToDashboard = () => {
    if (!user) return;
    const rol = user.rol?.toLowerCase() || 'mesero';
    const dashboards: Record<string, string> = {
      admin: '/dashboard-gerente',
      gerente: '/dashboard-gerente',
      mesero: '/dashboard-mesero',
      cocinero: '/dashboard-cocinero',
      bartender: '/dashboard-bartender',
    };
    router.push(dashboards[rol] || '/dashboard-mesero');
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`
        fixed top-0 left-0 right-0 z-50
        bg-white
        transition-shadow duration-200
        ${isScrolled ? 'shadow-md' : ''}
      `}
      >
        <div className="w-full px-2 sm:px-4">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                <Image
                  src="/logo.png"
                  alt="RestoMap Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="hidden sm:block text-[#334155] font-semibold text-lg">
                RestoMap
              </span>
            </Link>

            <div className="flex-1" />

            {/* Right - User Menu (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {/* Boton Escanear QR - solo para usuarios logueados no empleados, no en pagina pedido */}
              {/* Boton Escanear QR o Ir al Pedido */}
              {showQrButton &&
                (activeQr ? (
                  <Link
                    href={`/pedido?qr=${activeQr}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#22C55E] text-white hover:bg-[#16A34A] transition-colors"
                  >
                    <UtensilsCrossed size={18} />
                    <span className="text-sm font-medium">Ir al Pedido</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors"
                  >
                    <QrCode size={18} />
                    <span className="text-sm font-medium">Escanear QR</span>
                  </button>
                ))}
              {isLoggedIn && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-[#334155] font-medium">
                      {user.name}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-[#94A3B8] transition-transform ${
                        showDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-2 z-[55]">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-[#E2E8F0]">
                        <p className="text-sm text-[#334155] font-medium">
                          {user.name}
                        </p>
                        <p className="text-xs text-[#94A3B8]">{user.email}</p>
                      </div>

                      {/* Mi Perfil */}
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                      >
                        <User size={16} />
                        Mi Perfil
                      </button>

                      {/* Panel de Gestion - solo para empleados */}
                      {isEmployee && (
                        <button
                          onClick={handleGoToDashboard}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#F97316] hover:bg-[#FFF7ED] transition-colors"
                        >
                          <Building2 size={16} />
                          Panel de Gestion
                        </button>
                      )}

                      {/* Cerrar sesion */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Cerrar sesion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors"
                >
                  <User size={18} />
                  <span>Ingresar</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${
              isMobileMenuOpen
                ? 'max-h-80 opacity-100'
                : 'max-h-0 opacity-0 pointer-events-none'
            }
          `}
          >
            <div className="py-4 border-t border-[#E2E8F0] space-y-2 bg-[#F8FAFC]">
              {isLoggedIn && user ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F97316] to-[#EF4444] flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#334155]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[#64748B]">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mi Perfil */}
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#334155] hover:bg-white transition-colors"
                  >
                    <User size={18} />
                    Mi Perfil
                  </button>

                  {/* Escanear QR - solo para clientes no empleados, no en pagina pedido */}
                  {/* Escanear QR o Ir al Pedido - movil */}
                  {showQrButton &&
                    (activeQr ? (
                      <Link
                        href={`/pedido?qr=${activeQr}`}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white bg-[#22C55E] hover:bg-[#16A34A] transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UtensilsCrossed size={18} />
                        Ir al Pedido
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setShowQRModal(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white bg-[#F97316] hover:bg-[#EA580C] transition-colors"
                      >
                        <QrCode size={18} />
                        Escanear QR
                      </button>
                    ))}

                  {/* Panel de Gestion - solo para empleados */}
                  {isEmployee && (
                    <button
                      onClick={handleGoToDashboard}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#F97316] hover:bg-[#FFF7ED] transition-colors"
                    >
                      <Building2 size={18} />
                      Panel de Gestion
                    </button>
                  )}

                  {/* Cerrar sesion */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    Cerrar sesion
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="w-full flex items-center justify-center gap-2 mx-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EF4444] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <User size={18} />
                  <span>Ingresar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal Escanear QR */}
      <ScanQRClienteModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </>
  );
}
