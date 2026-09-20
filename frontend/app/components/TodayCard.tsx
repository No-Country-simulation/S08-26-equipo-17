import Link from 'next/link';
import {
  ArrowUpRightIcon,
  ChevronRightIcon,
  PackageIcon,
} from '@/app/components/HubIcons';
import type { TodayItem } from '@/app/components/utils/types';

const LINK_BASE =
  'relative flex h-36 w-full p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-400';

export const TodayCard = ({ item }: { item: TodayItem }) => {
  if (item.type === 'visits') {
    return (
      <Link
        href={item.href}
        className={`${LINK_BASE} items-start justify-between`}
      >
        <div className="grid gap-1">
          <p className="text-sm text-neutral-200">{item.title}</p>
          <p className="text-4xl font-black">
            {String(item.count).padStart(2, '0')}
          </p>
        </div>

        <span className="grid justify-items-center gap-1">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/20 backdrop-blur"
          >
            <ArrowUpRightIcon />
          </span>
          <span className="flex items-center text-xs text-neutral-200">
            Ver
            <ChevronRightIcon />
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link href={item.href} className={`${LINK_BASE} flex-col justify-between`}>
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-black"
      >
        <PackageIcon />
      </span>

      <div className="flex items-end justify-between gap-3">
        <div className="grid min-w-0 gap-0.5">
          <p className="truncate text-sm font-bold">{item.title}</p>
          <p className="truncate text-xs text-secondary-text">{item.detail}</p>
        </div>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10"
        >
          <ChevronRightIcon />
        </span>
      </div>
    </Link>
  );
};
