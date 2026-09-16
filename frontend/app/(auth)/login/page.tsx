'use client';

import { SlideCardLogin } from '@/app/components/SlideCardLogin';
import { LoginForm } from '@/app/components/LoginForm';
import { useState } from 'react';

export default function LoginPage() {
  const [isLogged, setIsLogged] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      {isLogged ? (
        <LoginForm></LoginForm>
      ) : (
        <SlideCardLogin sendIsLogged={() => setIsLogged(true)} />
      )}
    </main>
  );
}
