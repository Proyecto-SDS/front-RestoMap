'use client';

import { Loader2, MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DireccionData, useAddressSearch } from '../../hooks/useAddressSearch';

interface AddressSearchInputProps {
  onSelect: (address: DireccionData) => void;
  initialValue?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function AddressSearchInput({
  onSelect,
  initialValue = '',
  error,
  disabled = false,
  placeholder = 'Ej: Av. Providencia 1234, Providencia',
}: AddressSearchInputProps) {
  const {
    setQuery,
    results,
    isLoading,
    error: searchError,
    clearResults,
    parseFeature,
  } = useAddressSearch();

  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(initialValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Abrir dropdown cuando hay resultados
  const hasContent = results.length > 0 || !!searchError;
  if (hasContent && !isOpen && displayValue.length >= 3) {
    setIsOpen(true);
  }

  const handleInputChange = (value: string) => {
    setDisplayValue(value);
    setQuery(value);
  };

  const handleSelect = (featureIndex: number) => {
    const feature = results[featureIndex];
    const parsed = parseFeature(feature);

    setDisplayValue(parsed.direccionCompleta);
    setIsOpen(false);
    clearResults();
    onSelect(parsed);
  };

  const handleClear = () => {
    setDisplayValue('');
    setQuery('');
    clearResults();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div className="relative">
        <MapPin
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || searchError) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-16 py-2.5 text-sm sm:text-base border rounded-xl
            focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]
            disabled:bg-[#F1F5F9] disabled:cursor-not-allowed
            ${error ? 'border-[#EF4444]' : 'border-[#E2E8F0]'}
          `}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 size={18} className="animate-spin text-[#F97316]" />
          </div>
        )}

        {/* Clear button */}
        {displayValue && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#F1F5F9] transition-colors"
          >
            <X size={16} className="text-[#64748B]" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (results.length > 0 || searchError) && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow:
              '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            zIndex: 50,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {searchError ? (
            <div style={{ padding: '24px 14px', textAlign: 'center' }}>
              <MapPin size={24} className="text-[#CBD5E1] mx-auto mb-2" />
              <p className="text-sm text-[#64748B]">{searchError}</p>
            </div>
          ) : (
            results.map((feature, index) => {
              const parsed = parseFeature(feature);
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => handleSelect(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    width: '100%',
                    padding: '12px 14px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    borderBottom:
                      index < results.length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  className="hover:bg-[#fff7ed]"
                >
                  <MapPin
                    size={16}
                    className="text-[#F97316] shrink-0 mt-0.5"
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#334155]">
                      {parsed.calle} {parsed.numero}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {parsed.comuna && `${parsed.comuna}, `}Santiago, Chile
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Error message */}
      {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}
