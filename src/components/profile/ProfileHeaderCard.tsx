import { Edit2 } from 'lucide-react';
import type { User } from '../../types';
import { PrimaryButton } from '../buttons/PrimaryButton';

interface ProfileHeaderCardProps {
  user: User;
  onEditClick: () => void;
}

export function ProfileHeaderCard({
  user,
  onEditClick,
}: ProfileHeaderCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#F97316] to-[#EF4444] flex items-center justify-center text-white flex-shrink-0 shadow-lg">
          <span className="text-3xl">{getInitials(user.name)}</span>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-[#334155] mb-3">{user.name}</h2>
          <div className="space-y-2">
            <div className="text-[#64748B]">
              <span className="text-sm">{user.email}</span>
            </div>
            {user.phone && (
              <div className="text-[#64748B]">
                <span className="text-sm">{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto">
          <PrimaryButton
            size="md"
            onClick={onEditClick}
            className="w-full md:w-auto"
          >
            <Edit2 size={18} />
            Editar perfil
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
