import { LucideIcon } from 'lucide-react';
import { PrimaryButton } from '../buttons/PrimaryButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  buttonText,
  onButtonClick,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <div className="flex justify-center mb-4">
        <Icon size={60} className="text-[#CBD5E1]" />
      </div>
      <h3 className="text-[#334155] mb-2">{title}</h3>
      <p className="text-[#94A3B8] mb-6 max-w-md mx-auto">{subtitle}</p>
      <PrimaryButton onClick={onButtonClick}>{buttonText}</PrimaryButton>
    </div>
  );
}
