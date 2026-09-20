import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowButton } from './ArrowButton';
import { MailIcon, MessageIcon } from './HubIcons';

interface Contact {
  title: string;
  name: string;
  href: string;
  icon: ReactNode;
}

// TODO: ajustar las rutas a las reales
const CONTACTS: Contact[] = [
  {
    title: 'Administración',
    name: 'Estudio Aráoz',
    href: '/contact/administration',
    icon: <MailIcon />,
  },
  {
    title: 'Recepción',
    name: 'Diego Sosa',
    href: '/contact/reception',
    icon: <MessageIcon />,
  },
];

export const ContactList = () => (
  <div className="grid gap-2">
    {CONTACTS.map(({ title, name, href, icon }) => (
      <Link
        key={href}
        href={href}
        className="flex items-center gap-3 rounded-3xl border border-border-components bg-background-components p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-components">
          {icon}
        </span>
        <span className="grid min-w-0 flex-1">
          <span className="truncate text-sm font-bold">{title}</span>
          <span className="truncate text-xs text-secondary-text">{name}</span>
        </span>
        <ArrowButton />
      </Link>
    ))}
  </div>
);
