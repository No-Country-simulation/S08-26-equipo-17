'use client';

import Image from 'next/image';
import { useState } from 'react';
import { TodayCard } from './TodayCard';
import type { TodayItem } from '@/app/components/utils/types';

// TODO: reemplazar por datos del backend (y poner una imagen real en /public)
const MOCK_TODAY: TodayItem[] = [
  {
    id: 'visits',
    type: 'visits',
    href: '/visits',
    tabLabel: '1 pase vigente',
    title: 'Visitas hoy',
    count: 2,
    imageSrc: '/images/hub/lobby.jpg',
  },
  {
    id: 'delivery',
    type: 'delivery',
    href: '/deliveries',
    tabLabel: '1 paquete',
    title: '1 paquete para retirar',
    detail: 'Te lo guarda Diego Sosa en recepción',
  },
];

interface TodaySectionProps {
  items?: TodayItem[];
}

export const TodaySection = ({ items = MOCK_TODAY }: TodaySectionProps) => {
  const [activeId, setActiveId] = useState(items[0]?.id);

  if (items.length === 0) return null;

  // Si el backend cambia la lista y el id activo ya no existe, cae al primero
  const active = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <section aria-labelledby="today-title" className="grid gap-3">
      <h2 id="today-title" className="text-sm font-semibold">
        Lo de hoy
      </h2>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10">
        {active.type === 'visits' && (
          <>
            <Image
              src={active.imageSrc}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}

        <div
          role="tabpanel"
          id="today-panel"
          aria-labelledby={`today-tab-${active.id}`}
        >
          <TodayCard item={active} />
        </div>

        <div
          role="tablist"
          aria-label="Lo de hoy"
          className="relative flex gap-2 overflow-x-auto bg-black/40 px-3 py-2 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const isActive = item.id === active.id;

            return (
              <button
                key={item.id}
                id={`today-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="today-panel"
                onClick={() => setActiveId(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                  isActive
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-neutral-400'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    isActive ? 'bg-yellow-400/30' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isActive ? 'bg-yellow-400' : 'bg-neutral-500'
                    }`}
                  />
                </span>
                {item.tabLabel}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
