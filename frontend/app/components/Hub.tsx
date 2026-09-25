'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { HubTabs, type TabOption } from './HubTabs';
import { HubHeader } from './HubHeader';
import { FastSelector, type HubAction } from './FastSelector';
import { QuickActions } from './QuickActions';
import {
  CalendarIcon,
  ListIcon,
  PackageIcon,
  PieChartIcon,
  ScanIcon,
} from './HubIcons';
import { StatusDot } from './StatusDot';
import { formatCurrency } from '@/app/components/utils/ExpenseFormatters';
import type { Expense } from '@/app/components/utils/types';

interface HubPanel {
  eyebrow?: string;
  title: string;
  detail: ReactNode;
  primary: HubAction;
  secondary: HubAction[];
}

// TODO: reemplazar por datos reales (API / query)
const MOCK_EXPENSE: Expense = {
  total: 184250,
  periodLabel: 'Septiembre de 2026',
  dueLabel: 'Vence 20 sep',
  status: 'pending',
  commonExpenses: 178900,
  unitExpenses: 5350,
  share: 1.897,
};

// Todas las rutas son placeholders, ajustalas a las reales
const buildExpensesPanel = (expense: Expense): HubPanel => ({
  title: formatCurrency(expense.total),
  detail: (
    <>
      <span>{expense.dueLabel}</span>
      <StatusDot status={expense.status} />
    </>
  ),
  primary: { label: 'Pagar', href: '/expenses/pay' },
  secondary: [
    {
      label: 'Composición',
      href: '/expenses/composition',
      icon: <PieChartIcon />,
    },
    { label: 'Movimientos', href: '/expenses/movements', icon: <ListIcon /> },
  ],
});

const HUB_PANELS: Record<TabOption, HubPanel> = {
  expensas: buildExpensesPanel(MOCK_EXPENSE),
  visitas: {
    eyebrow: 'Hoy',
    title: '2 visitas',
    detail: 'Pase activo · Martín López',
    primary: { label: 'Ver pase', href: '/visits/pass', icon: <ScanIcon /> },
    secondary: [{ label: 'Visitas', href: '/visits' }],
  },
  entregas: {
    eyebrow: 'Entrega pendiente',
    title: '1 paquete',
    detail: 'Sobre de Correo Argentino',
    primary: {
      label: 'Ver entrega',
      href: '/deliveries/pending',
      icon: <PackageIcon />,
    },
    secondary: [{ label: 'Entregas', href: '/deliveries' }],
  },
  reservas: {
    eyebrow: 'Tu próxima reserva',
    title: 'SUM',
    detail: 'Hoy · 20:30',
    primary: {
      label: 'Ver reserva',
      href: '/reservations/next',
      icon: <CalendarIcon />,
    },
    secondary: [{ label: 'Reservar otro', href: '/reservations/new' }],
  },
};

export function Hub() {
  const [activeTab, setActiveTab] = useState<TabOption>('expensas');
  const panel = HUB_PANELS[activeTab];

  return (
    <div className="grid w-full gap-6 text-white">
      <section className="relative isolate grid gap-5 overflow-hidden rounded-b-4xl border border-white/15 p-4 shadow-2xl shadow-black/50">
        {/* Foto de fondo */}
        <Image
          src="/fachada.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 100vw, 480px"
          className="-z-20 scale-110 object-cover blur-md"
        />
        {/* Degradé para que el texto siempre se lea */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-b from-white/5 via-black/40 to-black/70"
        />

        <HubHeader address="Aráoz 1280" unit="Unidad 7D" initials="FO" />
        <HubTabs activeTab={activeTab} onChange={setActiveTab} />

        <div role="tabpanel" aria-label={activeTab} className="min-h-60">
          <FastSelector {...panel} />
        </div>

        <hr className="border-white/15" />
        <QuickActions />
      </section>

      {/* "En tu edificio": lo que siga va acá */}
    </div>
  );
}
