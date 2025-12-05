import { ReactNode } from 'react';

interface CustomScrollbarProps {
  children: ReactNode;
  className?: string;
}

export function CustomScrollbar({
  children,
  className = '',
}: CustomScrollbarProps) {
  return (
    <div
      className={`overflow-y-auto scrollbar-thin scrollbar-thumb-[#F97316] scrollbar-track-transparent hover:scrollbar-thumb-[#EA580C] ${className}`}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#F97316 transparent',
      }}
    >
      {children}
    </div>
  );
}
