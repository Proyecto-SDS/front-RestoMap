'use client';

export interface TabItem {
  id: string;
  label: string;
  value: string;
}

export interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabValue: string) => void;
}

export function TabNavigation({
  tabs,
  activeTab,
  onChange,
}: TabNavigationProps) {
  return (
    <div
      className="flex gap-6 border-b border-[#E2E8F0] overflow-x-auto scrollbar-hide"
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`
              relative
              px-1 py-3
              whitespace-nowrap
              transition-colors duration-200
              ${
                isActive
                  ? 'text-[#F97316]'
                  : 'text-[#64748B] hover:text-[#334155]'
              }
            `}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
