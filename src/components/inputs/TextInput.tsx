'use client';

import React from 'react';

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextInput({
  label,
  error,
  helperText,
  required,
  className = '',
  id,
  ...props
}: TextInputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-1.5 text-[#334155]">
          {label}
          {required && <span className="text-[#EF4444] ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full
          px-3 py-2
          border
          ${hasError ? 'border-[#EF4444]' : 'border-[#E2E8F0]'}
          rounded-xl
          placeholder:text-[#64748B]
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
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-[#EF4444] text-sm">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-[#64748B] text-sm">{helperText}</p>
      )}
    </div>
  );
}
