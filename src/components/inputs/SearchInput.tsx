'use client';

import { Search } from 'lucide-react';
import React from 'react';

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  showIcon?: boolean;
}

export function SearchInput({
  onSearch,
  showIcon = true,
  className = '',
  placeholder = 'Buscar...',
  ...props
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
    props.onChange?.(e);
  };

  return (
    <div className="relative w-full">
      {showIcon && (
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
          size={20}
        />
      )}
      <input
        type="text"
        className={`
          w-full
          px-3 py-2
          ${showIcon ? 'pl-10' : ''}
          border border-[#E2E8F0]
          rounded-xl
          placeholder:text-[#64748B]
          transition-all duration-200
          focus:outline-none
          focus:border-[#F97316]
          focus:ring-2
          focus:ring-[#F97316]/20
          ${className}
        `}
        placeholder={placeholder}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}
