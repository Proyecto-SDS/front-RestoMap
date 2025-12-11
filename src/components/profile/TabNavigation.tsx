interface TabNavigationProps {
  activeTab: 'reservas' | 'opiniones' | 'favoritos' | 'historial';
  onTabChange: (
    tab: 'reservas' | 'opiniones' | 'favoritos' | 'historial'
  ) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'reservas' as const, label: 'Reservas' },
    { id: 'opiniones' as const, label: 'Opiniones' },
    { id: 'favoritos' as const, label: 'Favoritos' },
    { id: 'historial' as const, label: 'Historial' },
  ];

  return (
    <div className="bg-white rounded-t-2xl shadow-sm mb-0">
      <div className="flex border-b border-[#E2E8F0] overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 min-w-[80px] sm:min-w-0 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm 
              whitespace-nowrap transition-colors
              ${
                activeTab === tab.id
                  ? 'border-b-3 border-[#F97316] text-[#F97316] font-medium'
                  : 'text-[#64748B] hover:text-[#334155]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
