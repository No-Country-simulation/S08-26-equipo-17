'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type NavIcon = (props: { active: boolean }) => ReactNode;

// MARK: ICONS
const HomeIcon: NavIcon = ({ active }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
  </svg>
);

const BuildingIcon: NavIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <path d="M6 21V7a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v14" />
    <path d="M13 11h4a1 1 0 0 1 1 1v9" />
    <path d="M3 21h18" />
    <path d="M8 9h.01M8 12h.01M8 15h.01M8 18h.01" />
    <path d="M15 14h.01M15 17h.01" />
  </svg>
);

const CalendarIcon: NavIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

const MoreIcon: NavIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const ScanIcon = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 3H5a2 2 0 0 0-2 2v2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M17 21h2a2 2 0 0 0 2-2v-2" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

// MARK: NAV ITEMS
interface NavEntry {
  href: string;
  label: string;
  Icon: NavIcon;
}

const navItems: NavEntry[] = [
  { href: '/home', label: 'Inicio', Icon: HomeIcon },
  { href: '/building', label: 'Mi edificio', Icon: BuildingIcon },
  { href: '/reservations', label: 'Reservas', Icon: CalendarIcon },
  { href: '/more', label: 'Más', Icon: MoreIcon },
];

const SCAN_HREF = '/scan';

interface NavItemProps extends NavEntry {
  active: boolean;
}

const NavItem = ({ href, label, Icon, active }: NavItemProps) => (
  <Link
    href={href}
    aria-current={active ? 'page' : undefined}
    className="relative flex flex-col items-center gap-1"
  >
    {active && (
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-white"
      />
    )}
    <span className={active ? 'text-white' : 'text-gray-400'}>
      <Icon active={active} />
    </span>
    <span
      className={`text-xs ${
        active ? 'font-semibold text-white' : 'text-gray-400'
      }`}
    >
      {label}
    </span>
  </Link>
);

export const Navbar = () => {
  const pathname = usePathname();

  // También marca activo en subrutas (ej: /reservations/new)
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isScanActive = isActive(SCAN_HREF);

  // Los dos items a la izquierda y los dos de la derecha del botón central.
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="grid w-full max-w-lg grid-cols-[1fr_1fr_auto_1fr_1fr] items-center rounded-4xl bg-[#131815] px-4 py-3 shadow-xl backdrop-blur-md">
        {leftItems.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}

        {/* Botón central */}
        <Link
          href={SCAN_HREF}
          aria-current={isScanActive ? 'page' : undefined}
          className={`mx-2 flex h-12 -translate-y-3 items-center gap-1.5 rounded-2xl bg-yellowbrand px-3 text-sm font-bold text-black shadow-[0_6px_24px_2px_rgba(226,240,38,0.45)] transition-transform ${
            isScanActive ? 'scale-105' : ''
          }`}
        >
          <ScanIcon className="h-5 w-5" />
          Pase
        </Link>

        {rightItems.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </div>
    </nav>
  );
};
