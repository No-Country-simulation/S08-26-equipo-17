'use client';

import { SlideCardLogin } from '@/app/components/SlideCardLogin';
import { useState } from 'react';

export default function LoginPage() {
  const [isLogged, setIsLogged] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      {isLogged ? (
        'hello'
      ) : (
        <SlideCardLogin sendIsLogged={() => setIsLogged(true)} />
      )}
    </main>
  );
}
