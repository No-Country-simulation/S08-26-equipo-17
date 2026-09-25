'use client';

import { Hub } from '@/app/components/Hub';

import { TodaySection } from '@/app/components/TodaySection';

const page = () => {
  return (
    <div className="w-full grid gap-4">
      <Hub />

      <TodaySection />
    </div>
  );
};

export default page;
