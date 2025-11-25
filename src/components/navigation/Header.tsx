'use client';

import { MapPin, Menu, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SANTIAGO_COMMUNES } from '../../utils/constants';
import { SelectDropdown } from '../inputs/SelectDropdown';

export interface HeaderProps {
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  selectedCommune?: string;
  onCommuneChange?: (commune: string) => void;
  userName?: string;
  userAvatar?: string;
}

export function Header({
  onLogoClick,
  onLoginClick,
  selectedCommune,
  onCommuneChange,
  userName,
  userAvatar,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const communeOptions = SANTIAGO_COMMUNES.map((commune) => ({
    value: commune,
    label: commune,
  }));

  return (
    <header
      className={`
        sticky top-0 z-50
        bg-white
        transition-shadow duration-200
        ${isScrolled ? 'shadow-md' : ''}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-linear-to-r from-[#F97316] to-[#EF4444] rounded-lg flex items-center justify-center">
              <span className="text-white">R</span>
            </div>
            <span className="hidden sm:block text-[#334155]">ReservaYa</span>
          </button>

          {/* Center - Location Filter (Desktop) */}
          <div className="hidden md:block flex-1 max-w-xs">
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none z-10"
                size={18}
              />
              <SelectDropdown
                options={communeOptions}
                placeholder="Todas las comunas"
                value={selectedCommune}
                onChange={onCommuneChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Right - User Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {userName ? (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center">
                    <span className="text-white text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm text-[#334155]">{userName}</span>
              </button>
            ) : (
              <button
                onClick={onLoginClick}
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
            {/* Location Filter */}
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none z-10"
                size={18}
              />
              <SelectDropdown
                options={communeOptions}
                placeholder="Todas las comunas"
                value={selectedCommune}
                onChange={onCommuneChange}
                className="pl-10"
              />
            </div>

            {/* User Menu */}
            {userName ? (
              <button
                onClick={onLoginClick}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center">
                    <span className="text-white text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm text-[#334155]">{userName}</span>
              </button>
            ) : (
              <button
                onClick={onLoginClick}
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
