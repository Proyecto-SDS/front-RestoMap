'use client';

import { LogOut, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function NavHeader() {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    const handleScroll = () => {
      setIsScrolled(mainElement.scrollTop > 10);
    };

    mainElement.addEventListener('scroll', handleScroll);
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    router.push('/login');
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        bg-white
        transition-shadow duration-200
        ${isScrolled ? 'shadow-md' : ''}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-linear-to-r from-[#F97316] to-[#EF4444] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="hidden sm:block text-[#334155] font-semibold">
              ReservaYa
            </span>
          </Link>

          <div className="flex-1" />

          {/* Right - User Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && user ? (
              <>
                <button
                  onClick={handleProfileClick}
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
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors text-[#334155]"
                >
                  <LogOut size={18} />
                  <span>Salir</span>
                </button>
              </>
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
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E2E8F0] space-y-4">
            {/* User Menu */}
            {isLoggedIn && user ? (
              <>
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-[#334155] font-medium">
                    {user.name}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors"
                >
                  <LogOut size={18} />
                  <span>Cerrar sesión</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors"
              >
                <User size={18} />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
