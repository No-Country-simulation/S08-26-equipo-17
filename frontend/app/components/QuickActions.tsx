import Link from 'next/link';
import type { ReactNode } from 'react';
import { CalendarIcon, MessageIcon, UserPlusIcon } from './HubIcons';

interface QuickAction {
  label: string;
  href: string;
  icon: ReactNode;
}

// TODO: ajustar las rutas a las reales
const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Autorizar', href: '/visits/new', icon: <UserPlusIcon /> },
  { label: 'Reclamar', href: '/claims/new', icon: <MessageIcon /> },
  { label: 'Reservar', href: '/reservations/new', icon: <CalendarIcon /> },
];

export const QuickActions = () => (
  <nav
    aria-label="Acciones rápidas"
    className="grid grid-cols-3 gap-2 text-white"
  >
    {QUICK_ACTIONS.map(({ label, href, icon }) => (
      <Link
        key={href}
        href={href}
        className="group grid justify-items-center gap-2 focus:outline-none"
      >
        <span className="glass flex h-14 w-14 items-center justify-center rounded-full group-focus-visible:ring-2 group-focus-visible:ring-yellow-400">
          {icon}
        </span>
        <span className="text-xs font-semibold">{label}</span>
      </Link>
    ))}
  </nav>
);
