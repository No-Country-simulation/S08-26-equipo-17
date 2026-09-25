'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { TodayItem } from '@/app/components/utils/types';

interface TodayCardProps {
  item: TodayItem;
}

const ChevronRightIcon = ({
  className = 'h-4 w-4',
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ScanIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M7 3H5a2 2 0 0 0-2 2v2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M17 21h2a2 2 0 0 0 2-2v-2" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

export const TodayCard = ({ item }: TodayCardProps) => {
  const {
    href,
    title,
    detail,
    eyebrow,
    imageSrc,
    footer,
    action,
    icon: Icon,
  } = item;

  return (
    <Link
      href={href}
      className="relative block h-44 overflow-hidden rounded-3xl border border-white/10 bg-white/10"
    >
      {imageSrc && (
        <>
          <Image
            src={'/visitas_fondo.jpg'}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-cover blur-xs"
          />
          <div className="absolute inset-0 bg-black/40" />
        </>
      )}

      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/80">{eyebrow ?? 'Hoy'}</p>
            <p className="mt-1 text-[32px] font-bold leading-tight text-white">
              {title}
            </p>
            {detail && <p className="mt-1 text-sm text-white/60">{detail}</p>}
          </div>

          {Icon && (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/40 glass hover:bg-black/60">
              <Icon className="h-4 w-4 text-white" />
            </span>
          )}
        </div>

        {!footer && action?.type === 'chevron' && (
          <div className="flex justify-end">
            <ChevronRightIcon className="h-5 w-5 text-white/70" />
          </div>
        )}
      </div>

      {footer && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-yellow-400 px-4 py-3">
          <span className="flex items-center gap-1 text-sm font-semibold text-black">
            <ScanIcon className="h-4 w-4" />
            {footer.label}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-black">
            {footer.action}
            <ChevronRightIcon className="h-4 w-4" />
          </span>
        </div>
      )}
    </Link>
  );
};
