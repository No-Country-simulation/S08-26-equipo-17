import { useState } from 'react';
import { HubTabs, type TabOption } from './HubTabs';
import { FastSelector } from './FastSelector';
export function Hub() {
  const [activeTab, setActiveTab] = useState<TabOption>('expensas');

  return (
    <div className="w-full p-4 grid gap-4">
      <HubTabs activeTab={activeTab} onChange={setActiveTab} />
      {/* 
      {activeTab === 'expensas' && <ExpensesView />}
      {activeTab === 'visitas' && <VisitorsView />}
      {activeTab === 'entregas' && <DeliveriesView />}
      {activeTab === 'reservas' && <BookingsView />} */}
      <FastSelector title="Cowork" subtitle="Tu proxima semana" />
    </div>
  );
}
