'use client';

import { ChevronDown } from 'lucide-react';
import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectDropdownProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function SelectDropdown({
  label,
  error,
  options,
  placeholder = 'Seleccionar...',
  required,
  className = '',
  id,
  onChange,
  ...props
}: SelectDropdownProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-1.5 text-[#334155]">
          {label}
          {required && <span className="text-[#EF4444] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={`
            w-full
            px-3 py-2
            pr-10
            border
            ${hasError ? 'border-[#EF4444]' : 'border-[#E2E8F0]'}
            rounded-xl
            appearance-none
            bg-white
            transition-all duration-200
            focus:outline-none
            ${
              hasError
                ? 'focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                : 'focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20'
            }
            disabled:bg-[#F1F5F9] disabled:cursor-not-allowed
            ${className}
          `}
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
          size={20}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-[#EF4444] text-sm">{error}</p>
      )}
    </div>
  );
}
