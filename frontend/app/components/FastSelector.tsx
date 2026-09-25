import Link from 'next/link';
import type { ReactNode } from 'react';

export interface HubAction {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface FastSelectorProps {
  eyebrow?: string;
  title: string;
  detail: ReactNode;
  primary: HubAction;
  secondary: HubAction[];
}

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400';

export const FastSelector = ({
  eyebrow,
  title,
  detail,
  primary,
  secondary,
}: FastSelectorProps) => (
  <div className="grid justify-items-center gap-5 text-center text-white">
    <div className="grid gap-1">
      {eyebrow && <p className="text-xs">{eyebrow}</p>}
      <p className="text-5xl font-black tracking-tight">{title}</p>
      <div className="flex items-center justify-center gap-1.5 text-xs ">
        {detail}
      </div>
    </div>

    <Link
      href={primary.href}
      className={`flex items-center gap-2 rounded-2xl bg-neutral-100 px-8 py-3 text-sm font-bold text-black  [&_svg]:h-4 [&_svg]:w-4 ${FOCUS}`}
    >
      {primary.icon}
      {primary.label}
    </Link>

    <div className="flex flex-wrap justify-center gap-2">
      {secondary.map(({ label, href, icon }) => (
        <Link
          key={href + label}
          href={href}
          className={`flex items-center  gap-2 rounded-2xl glass px-4 py-2 text-xs font-bold [&_svg]:h-4 [&_svg]:w-4 ${FOCUS}`}
        >
          {icon}
          {label}
        </Link>
      ))}
    </div>
  </div>
);
