'use client';

import React from 'react';

export interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function FilterChip({
  label,
  active = false,
  onClick,
  icon,
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5
        rounded-full
        transition-all duration-150
        whitespace-nowrap
        ${
          active
            ? 'bg-[#F97316] text-white'
            : 'bg-white text-[#334155] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
        }
      `}
      aria-pressed={active}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="text-sm">{label}</span>
    </button>
  );
}
