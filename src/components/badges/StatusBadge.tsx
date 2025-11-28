import type { EstablishmentStatus } from '../../types';

export interface StatusBadgeProps {
  status: EstablishmentStatus;
  closingTime?: string | null;
}

export function StatusBadge({ status, closingTime }: StatusBadgeProps) {
  const isOpen = status === 'open';

  return (
    <span
      className={`
        inline-block
        px-2 py-1
        rounded-md
        text-xs
        ${
          isOpen
            ? 'bg-[#22C55E]/10 text-[#22C55E]'
            : 'bg-[#94A3B8]/10 text-[#94A3B8]'
        }
      `}
    >
      {isOpen && closingTime
        ? `Abierto hasta ${closingTime}`
        : isOpen
        ? 'Abierto'
        : 'Cerrado'}
    </span>
  );
}
