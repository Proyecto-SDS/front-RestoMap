'use client';

import React from 'react';

export interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function SecondaryButton({
  size = 'md',
  children,
  disabled,
  className = '',
  ...props
}: SecondaryButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-4 py-2.5',
    lg: 'px-5 py-3',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        bg-transparent
        border-2 border-[#E2E8F0]
        text-[#334155]
        rounded-xl
        transition-all duration-200
        hover:bg-[#F1F5F9]
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
