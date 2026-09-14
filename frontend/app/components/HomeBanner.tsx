import React from 'react';

interface props {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}

export const HomeBanner = ({
  title = 'Hoy, en casa.',
  subtitle = '2 asuntos para revisar',
  imageUrl,
}: props) => {
  return (
    <div className="relative flex h-50 w-full items-center overflow-hidden rounded-4xl bg-white p-8 shadow-sm">
      <div className="z-10">
        <h2 className="text-3xl font-bold tracking-tight text-black">
          {title}
        </h2>
        <p className="text-lg font-normal text-gray-500 md:text-xl">
          {subtitle}
        </p>
      </div>

      <div className="absolute right-0 w-3/4">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-contain mask-[linear-gradient(to_right,transparent_20%,black_100%)]"
        />
      </div>
    </div>
  );
};
