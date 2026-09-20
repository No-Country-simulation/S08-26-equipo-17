import Link from 'next/link';
import type { ReactNode } from 'react';

interface FastSelectorProps {
  eyebrow: string;
  title: string;
  detail: string;
  buttonTitle: string;
  icon: ReactNode;
  href: string;
  badge?: ReactNode;
  children?: ReactNode;
}

export const FastSelector = ({
  eyebrow,
  title,
  detail,
  buttonTitle,
  icon,
  href,
  badge,
  children,
}: FastSelectorProps) => {
  return (
    <div className="mx-2 grid gap-4">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-secondary-text text-xs uppercase tracking-widest">
            {eyebrow}
          </p>
          {badge}
        </div>
        <p className="text-4xl font-black">{title}</p>
        <p className="font-bold text-secondary-text text-xs">{detail}</p>
      </div>

      {children}

      <Link
        href={href}
        className="flex items-center justify-between p-3 rounded-2xl bg-background-components w-full text-xs font-bold border border-border-components focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
      >
        <span className="flex items-center gap-3">
          {icon}
          {buttonTitle}
        </span>
        <ChevronIcon />
      </Link>
    </div>
  );
};

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="h-4 w-4"
  >
    <path d="m9 5 7 7-7 7" />
  </svg>
);
