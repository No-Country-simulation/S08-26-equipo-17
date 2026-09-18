import React, { useState, useRef, useEffect } from 'react';

interface SwipeButtonProps {
  onSuccess?: () => void;
  text?: string;
}

export const NativeSwipeButton: React.FC<SwipeButtonProps> = ({
  onSuccess,
  text = 'Empezar',
}) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  // Calcula el ancho útil de arrastre
  const getMaxDrag = () => {
    if (!containerRef.current) return 0;
    // Ancho contenedor (p. ej. 320px) - Ancho botón (48px) - Padding total (12px)
    return containerRef.current.clientWidth - 48 - 12;
  };

  const handleStart = (clientX: number) => {
    if (isCompleted) return;
    setIsDragging(true);
    startXRef.current = clientX - dragX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || isCompleted) return;
    const maxDrag = getMaxDrag();
    const currentX = clientX - startXRef.current;

    // Clampeamos el valor entre 0 y el límite máximo
    const boundedX = Math.max(0, Math.min(currentX, maxDrag));
    setDragX(boundedX);
  };

  const handleEnd = () => {
    if (!isDragging || isCompleted) return;
    setIsDragging(false);

    const maxDrag = getMaxDrag();
    // Si superó el 80% del trayecto, completa la acción
    if (dragX >= maxDrag * 0.8) {
      setDragX(maxDrag);
      setIsCompleted(true);
      if (onSuccess) onSuccess();
    } else {
      // Si no, vuelve al inicio
      setDragX(0);
    }
  };

  // Listeners globales para detectar el arrastre incluso si el puntero sale del botón
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, dragX]);

  // Cálculo del porcentaje del relleno amarillo (proporcional al arrastre)
  const maxDrag = getMaxDrag();
  const fillWidth =
    maxDrag > 0 && (isDragging || isCompleted)
      ? (dragX / maxDrag) * containerRef.current?.clientWidth!
      : 0;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-between w-full max-w-[320px] h-16 bg-[#18181b] rounded-full p-1.5 overflow-hidden select-none shadow-lg"
    >
      {/* Fondo amarillo que se expande */}
      <div
        className={`absolute left-0 top-0 bottom-0 bg-yellowbrand transition-all ${
          !isDragging ? 'duration-300 ease-out' : 'duration-75 ease-linear'
        }`}
        style={{ width: `${fillWidth}px` }}
      />

      {/* Texto del botón */}
      <span
        className={`absolute inset-0 flex items-center justify-center font-medium text-lg pointer-events-none ${
          isCompleted ? 'text-black font-semibold' : 'text-white'
        }`}
        style={{
          opacity: isCompleted ? 1 : Math.max(0, 1 - dragX / (maxDrag / 1.5)),
        }}
      >
        {isCompleted ? '¡Listo!' : text}
      </span>

      {/* Círculo deslizable (Thumb) */}
      <div
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        className={`z-10 flex items-center justify-center w-12 h-12 bg-yellowbrand rounded-full cursor-grab active:cursor-grabbing shadow-md ${
          !isDragging ? 'transition-transform duration-300 ease-out' : ''
        }`}
        style={{ transform: `translateX(${dragX}px)` }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-5 h-5 text-black"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </div>
    </div>
  );
};
