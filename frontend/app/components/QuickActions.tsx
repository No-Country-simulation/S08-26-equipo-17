import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowButton } from './ArrowButton';
import { CalendarIcon, MessageIcon, UserPlusIcon } from './HubIcons';

interface QuickAction {
  label: string;
  href: string;
  icon: ReactNode;
}

// TODO: ajustar las rutas a las reales
const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Autorizar visita', href: '/visits/new', icon: <UserPlusIcon /> },
  { label: 'Hacer reclamo', href: '/claims/new', icon: <MessageIcon /> },
  {
    label: 'Reservar espacio',
    href: '/reservations/new',
    icon: <CalendarIcon />,
  },
];

export const QuickActions = () => (
  <div className="grid grid-cols-3 gap-2">
    {QUICK_ACTIONS.map(({ label, href, icon }) => (
      <Link
        key={href}
        href={href}
        className="grid min-w-0 gap-6 rounded-3xl border border-border-components bg-background-components p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
      >
        <span className="flex items-start justify-between">
          {icon}
          <ArrowButton />
        </span>
        <span className="text-xs font-bold leading-tight">{label}</span>
      </Link>
    ))}
  </div>
);
