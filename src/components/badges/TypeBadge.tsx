import type { EstablishmentType } from '../../types';

export interface TypeBadgeProps {
  type: EstablishmentType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span
      className="
        inline-block
        px-2 py-1
        bg-linear-to-r from-[#FB923C] to-[#F87171]
        text-white
        rounded-md
        text-xs
      "
    >
      {type}
    </span>
  );
}
