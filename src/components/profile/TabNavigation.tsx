interface TabNavigationProps {
  activeTab: 'reservas' | 'opiniones' | 'favoritos' | 'historial';
  onTabChange: (
    tab: 'reservas' | 'opiniones' | 'favoritos' | 'historial'
  ) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white rounded-t-2xl shadow-sm mb-0">
      <div className="flex border-b border-[#E2E8F0]">
        <button
          onClick={() => onTabChange('reservas')}
          className={`flex-1 px-6 py-4 text-sm transition-colors ${
            activeTab === 'reservas'
              ? 'border-b-3 border-[#F97316] text-[#F97316]'
              : 'text-[#64748B] hover:text-[#334155]'
          }`}
        >
          Mis Reservas
        </button>
        <button
          onClick={() => onTabChange('opiniones')}
          className={`flex-1 px-6 py-4 text-sm transition-colors ${
            activeTab === 'opiniones'
              ? 'border-b-3 border-[#F97316] text-[#F97316]'
              : 'text-[#64748B] hover:text-[#334155]'
          }`}
        >
          Mis Opiniones
        </button>
        <button
          onClick={() => onTabChange('favoritos')}
          className={`flex-1 px-6 py-4 text-sm transition-colors ${
            activeTab === 'favoritos'
              ? 'border-b-3 border-[#F97316] text-[#F97316]'
              : 'text-[#64748B] hover:text-[#334155]'
          }`}
        >
          Mis Favoritos
        </button>
        <button
          onClick={() => onTabChange('historial')}
          className={`flex-1 px-6 py-4 text-sm transition-colors ${
            activeTab === 'historial'
              ? 'border-b-3 border-[#F97316] text-[#F97316]'
              : 'text-[#64748B] hover:text-[#334155]'
          }`}
        >
          Historial
        </button>
      </div>
    </div>
  );
}
