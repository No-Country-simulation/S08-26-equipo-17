const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'h-5 w-5',
  'aria-hidden': true,
  focusable: false,
};

export const CalendarIcon = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

export const PackageIcon = () => (
  <svg {...base}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </svg>
);

export const IdCardIcon = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6.5 16c.5-1.5 1.5-2 2.5-2s2 .5 2.5 2M14 10h4M14 13h4" />
  </svg>
);

export const WalletIcon = () => (
  <svg {...base}>
    <path d="M3 7a2 2 0 0 1 2-2h13v4" />
    <path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z" />
    <circle cx="16" cy="14" r="1" />
  </svg>
);

export const UserPlusIcon = () => (
  <svg {...base}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.6-3.5 3.3-5.5 6.5-5.5s5.9 2 6.5 5.5" />
    <path d="M19 8v6M16 11h6" />
  </svg>
);

export const MessageIcon = () => (
  <svg {...base}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
  </svg>
);

export const MailIcon = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const ArrowUpRightIcon = () => (
  <svg {...base} strokeWidth={2.2} className="h-4 w-4">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const ChevronRightIcon = () => (
  <svg {...base} strokeWidth={2.2} className="h-4 w-4">
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const ScanIcon = () => (
  <svg {...base}>
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

export const PieChartIcon = () => (
  <svg {...base}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10Z" />
  </svg>
);

export const ListIcon = () => (
  <svg {...base}>
    <path d="M4 6h16M4 12h16M4 18h10" />
  </svg>
);
