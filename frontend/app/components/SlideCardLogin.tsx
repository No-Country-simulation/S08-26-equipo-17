'use client';

import { useState, TouchEvent } from 'react';

const slides = [
  {
    id: 1,
    title: 'Gestioná tu edificio.',
    description:
      'Todo más claro, más simple y más cerca de lo que pasa en casa.',
    color: 'bg-amber-500',
  },
  {
    id: 2,
    title: 'Viví tu unidad más simple.',
    description:
      'Visitas, entregas, avisos y espacios, todo desde un mismo lugar.',
    color: 'bg-emerald-500',
  },
  {
    id: 3,
    title: 'Comunicación en tiempo real.',
    description: 'Entérate de las novedades y avisos importantes de inmediato.',
    color: 'bg-sky-500',
  },
  {
    id: 4,
    title: 'Reservas sin complicaciones.',
    description: 'Gestioná el uso del SUM, parrilla y amenities en un clic.',
    color: 'bg-indigo-500',
  },
];

export function SlideCardLogin() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Distancia mínima en píxeles para considerar que fue un deslice intencional
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
    <div className="flex flex-col items-center gap-6 w-10/12 max-w-md mx-auto select-none">
      {/* Contenedor de la Tarjeta con Listeners Táctiles */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="p-2 bg-card rounded-4xl w-full grid gap-5 overflow-hidden shadow-sm touch-pan-y"
      >
        {/* Visual / Fotos con Fade Out */}
        <div className="relative h-90 rounded-4xl overflow-hidden">
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className="w-full h-full shrink-0">
                <div className={`w-full h-full ${slide.color}`} />
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-card to-transparent pointer-events-none" />
        </div>

        {/* Textos Cambiantes */}
        <div className="text-center px-6 min-h-25 flex flex-col justify-center">
          <h2 className="font-bold text-2xl text-foreground tracking-tight">
            {slides[currentIndex].title}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            {slides[currentIndex].description}
          </p>
        </div>
      </div>

      {/* Indicadores / Dots del Carrusel */}
      <div className="flex items-center justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir al slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === index
                ? 'w-7 bg-slate-900'
                : 'w-2.5 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
