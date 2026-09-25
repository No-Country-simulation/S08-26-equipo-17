'use client';

import { TodayCard } from './TodayCard';
import type { TodayItem } from '@/app/components/utils/types';

const ArrowUpRightIcon = ({
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
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

// TODO: reemplazar por datos del backend (y poner imágenes reales en /public)
const MOCK_TODAY: TodayItem[] = [
  {
    id: 'visits',
    href: '/visits',
    imageSrc: '/images/hub/lobby.jpg',
    eyebrow: 'Hoy',
    title: '2 visitas',
    icon: ArrowUpRightIcon,
    footer: { label: 'Pase activo', action: 'Ver pase' },
  },
  {
    id: 'delivery-received',
    href: '/deliveries',
    imageSrc: '/images/hub/plants.jpg',
    eyebrow: 'Hoy, en casa',
    title: 'Paquete recibido en recepción',
    detail: 'Historial · recién',
  },
  {
    id: 'reservation',
    href: '/reservations',
    imageSrc: '/images/hub/sum.jpg',
    eyebrow: 'Próxima reserva',
    title: 'SUM',
    detail: 'Hoy · 20:30',
  },
  {
    id: 'delivery-pending',
    href: '/deliveries',
    imageSrc: '/images/hub/reception.jpg',
    eyebrow: 'En recepción',
    title: '1 paquete para retirar',
    detail: 'Te lo entregan cuando bajes',
    action: { type: 'chevron' },
  },
];

interface TodaySectionProps {
  items?: TodayItem[];
}

export const TodaySection = ({ items = MOCK_TODAY }: TodaySectionProps) => {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="today-title" className="grid gap-3 p-5">
      <h2 id="today-title" className="text-lg font-semibold">
        En tu edificio
      </h2>

      {items.map((item) => (
        <TodayCard key={item.id} item={item} />
      ))}
    </section>
  );
};
