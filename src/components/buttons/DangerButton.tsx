'use client';

import React from 'react';

export interface DangerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

export function DangerButton({
  size = 'md',
  children,
  disabled,
  isLoading,
  className = '',
  ...props
}: DangerButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-4 py-2.5',
    lg: 'px-5 py-3',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        bg-[#EF4444]
        text-white
        rounded-xl
        transition-all duration-200
        hover:bg-[#DC2626]
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#EF4444]
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
