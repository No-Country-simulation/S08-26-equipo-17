// Tipos para las pestañas
export type TabOption = 'expensas' | 'visitas' | 'entregas' | 'reservas';

interface Tab {
  id: TabOption;
  label: string;
}

const TABS: Tab[] = [
  { id: 'expensas', label: 'Expensas' },
  { id: 'visitas', label: 'Visitas' },
  { id: 'entregas', label: 'Entregas' },
  { id: 'reservas', label: 'Reservas' },
];

interface HubTabsProps {
  activeTab: TabOption;
  onChange: (tab: TabOption) => void;
}

export const HubTabs = ({ activeTab, onChange }: HubTabsProps) => {
  return (
    <div className="w-full flex justify-center items-center">
      <nav
        className="flex justify-between gap-1 p-1 rounded-full w-max bg-background-components min-w-full sm:min-w-0  border border-border-components"
        role="tablist"
        aria-label="Pestañas del Hub"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              className={`
                px-3 py-2 text-xs font-medium rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400
                ${isActive ? 'bg-pressed-button' : 'text-neutral-400'}
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
