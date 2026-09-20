'use client';
import { QuickActions } from '@/app/components/QuickActions';
import { ContactList } from '@/app/components/ContactList';
import { TodaySection } from '@/app/components/TodaySection';
import { useState, type ReactNode } from 'react';
import { HubTabs, type TabOption } from './HubTabs';
import { FastSelector } from '@/app/components/FastSelector';
import { CalendarIcon, IdCardIcon, PackageIcon, WalletIcon } from './HubIcons';
import { StatusBadge } from '@/app/components/StatusBadge';
import { ExpenseBreakdown } from '@/app/components/ExpenseBreakdown';
import { formatCurrency } from '@/app/components/utils/ExpenseFormatters';
import type { Expense } from '@/app/components/utils/types';

interface HubPanel {
  eyebrow: string;
  title: string;
  detail: string;
  buttonTitle: string;
  icon: ReactNode;
  href: string;
  badge?: ReactNode;
  children?: ReactNode;
}

// TODO: reemplazar por datos reales (API / query)
const MOCK_EXPENSE: Expense = {
  total: 184250,
  periodLabel: 'Septiembre de 2026',
  dueLabel: 'vence hoy',
  status: 'pending',
  commonExpenses: 178900,
  unitExpenses: 5350,
  share: 1.897,
};

const buildExpensesPanel = (expense: Expense): HubPanel => ({
  eyebrow: 'Expensa del mes',
  title: formatCurrency(expense.total),
  detail: `${expense.periodLabel} · ${expense.dueLabel}`,
  buttonTitle: 'Ver el detalle y los gastos del consorcio',
  icon: <WalletIcon />,
  href: '/expenses',
  badge: <StatusBadge status={expense.status} />,
  children: (
    <ExpenseBreakdown
      commonExpenses={expense.commonExpenses}
      unitExpenses={expense.unitExpenses}
      share={expense.share}
    />
  ),
});

const HUB_PANELS: Record<TabOption, HubPanel> = {
  expensas: buildExpensesPanel(MOCK_EXPENSE),
  visitas: {
    eyebrow: 'Visitas de hoy',
    title: '02',
    detail: '1 pase vigente',
    buttonTitle: 'Ver mis visitas y pases',
    icon: <IdCardIcon />,
    href: '/visits', // placeholder
  },
  entregas: {
    eyebrow: 'En recepción',
    title: '01',
    detail: '1 paquete para retirar',
    buttonTitle: 'Ver las entregas de la unidad',
    icon: <PackageIcon />,
    href: '/deliveries', // placeholder
  },
  reservas: {
    eyebrow: 'Tu próxima reserva',
    title: 'SUM',
    detail: 'Hoy · 20:30',
    buttonTitle: 'Ver mis reservas',
    icon: <CalendarIcon />,
    href: '/reservations', // placeholder
  },
};

export function Hub() {
  const [activeTab, setActiveTab] = useState<TabOption>('expensas');
  const panel = HUB_PANELS[activeTab];

  return (
    <div className="w-full p-4 grid gap-4 ">
      <HubTabs activeTab={activeTab} onChange={setActiveTab} />
      <div role="tabpanel" aria-label={activeTab}>
        <FastSelector {...panel} />
      </div>
      <QuickActions />
      <ContactList />
      <TodaySection />
    </div>
  );
}
