import Image from 'next/image';
import Link from 'next/link';

interface HubHeaderProps {
  address: string;
  unit: string;
  initials: string;
}

export const HubHeader = ({ address, unit, initials }: HubHeaderProps) => (
  <header className="flex items-center justify-between gap-3 text-white">
    <div className="flex min-w-0 items-center gap-3">
      <Image
        src="/logo_vector.svg"
        alt="CondoTrack"
        width={36}
        height={24}
        priority
      />
      <p className="truncate text-xs">
        {address} · {unit}
      </p>
    </div>

    <Link
      href="/profile"
      aria-label="Mi perfil"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
    >
      {initials}
    </Link>
  </header>
);
