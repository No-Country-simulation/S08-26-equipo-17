'use client';

import { useState, TouchEvent } from 'react';
import { NativeSwipeButton } from './NativeSwipeButton';

import Image from 'next/image';

import logo_vector from '@/public/logo_vector.svg';

interface SlideCardLoginProps {
  sendIsLogged: () => void;
}

const slides = [
  {
    id: 1,
    title: 'Disfrutá más tus espacios.',
    description: 'SUM, cowork, terraza y lavandería con disponibilidad clara.',
  },
  {
    id: 2,
    title: 'Gestioná tu edificio.',
    description:
      'Todo más claro, más simple y más cerca de lo que pasa en casa.',
  },
  {
    id: 3,
    title: 'Viví tu unidad más simple.',
    description:
      'Visitas, entregas, avisos y espacios, todo desde un mismo lugar.',
  },
];

export function SlideCardLogin({ sendIsLogged }: SlideCardLoginProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Tarjeta principal con bordes redondeados globales y de corte (overflow-hidden) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-[#f4f4ee] text-slate-900 rounded-[2.5rem] flex flex-col justify-between min-h-165 shadow-2xl overflow-hidden select-none touch-pan-y relative"
      >
        {/* Área superior: Carrusel de fotos de borde a borde (sin padding) */}
        <div className="relative w-full h-100">
          {/* Logo CondoTrack en la parte superior */}
          <div className="absolute inset-x-0 top-7 z-20 flex items-center justify-center gap-2">
            <Image
              src={logo_vector}
              alt="CondoTrack logo"
              width={32}
              height={32}
            />
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              Condo<span className="text-[#e2f026]">Track</span>
            </h1>
          </div>

          {/* Galería / Slider */}
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className="relative w-full h-full shrink-0">
                <Image
                  src={`/Onboarding/onboarding-${slide.id}.jpg`}
                  alt="onboarding"
                  fill
                  priority={slide.id === 1}
                  sizes="(max-width: 768px) 100vw, 384px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Degradado para fundir suavemente la imagen con el color base (#f4f4ee) */}
          <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent 60% to-[#f4f4ee] pointer-events-none" />
        </div>

        {/* Contenido inferior: Con padding propio para textos, dots y botón */}
        <div className="flex flex-col gap-4 p-6 pt-0">
          {/* Título y Descripción */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {slides[currentIndex].title}
            </h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {slides[currentIndex].description}
            </p>
          </div>

          {/* Indicadores / Dots alineados a la izquierda */}
          <div className="flex items-center gap-1.5 py-1">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir al slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === index
                    ? 'w-6 bg-slate-900'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          {/* Botón de acción */}
          <div className="w-full pt-1">
            <NativeSwipeButton onSuccess={sendIsLogged} text="Empezar" />
          </div>
        </div>
      </div>
    </div>
  );
}
