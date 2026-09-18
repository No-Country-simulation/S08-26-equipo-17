'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// MARK: ICONS
const HomeIcon = ({ active }: { active: boolean }) => (
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

const BuildingIcon = ({ active }: { active: boolean }) => (
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

const ScanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <path d="M7 3H5a2 2 0 0 0-2 2v2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M17 21h2a2 2 0 0 0 2-2v-2" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

const CalendarIcon = ({ active }: { active: boolean }) => (
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

const MoreIcon = () => (
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

// MARK: NAV ITEMS
const navItems = [
  { href: '/home', label: 'Inicio', Icon: HomeIcon },
  { href: '/building', label: 'Mi edificio', Icon: BuildingIcon },
  { href: '/reservations', label: 'Reservas', Icon: CalendarIcon },
  { href: '/more', label: 'Más', Icon: MoreIcon },
] as const;

const SCAN_HREF = '/scan';

export const Navbar = () => {
  const pathname = usePathname();
  const isScanActive = pathname === SCAN_HREF;

  // Los dos items a la izquierda y los dos de la derecha del botón central.
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="relative flex w-full max-w-lg items-center justify-between rounded-4xl bg-black/60 px-6 pb-3 pt-5 shadow-xl backdrop-blur-md">
        {leftItems.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1"
            >
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
        })}

        {/* Botón central flotante */}
        <Link
          href={SCAN_HREF}
          aria-label="Acceso"
          className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
        >
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-yellowbrand text-black shadow-[0_0_20px_4px_rgba(226,240,38,0.5)] transition-transform ${
              isScanActive ? 'scale-105' : ''
            }`}
          >
            <ScanIcon />
          </span>
          <span className="text-xs text-gray-400">Acceso</span>
        </Link>

        {rightItems.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1"
            >
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
        })}
      </div>
    </nav>
  );
};
