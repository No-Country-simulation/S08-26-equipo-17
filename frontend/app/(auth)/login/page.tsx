'use client';

import { useState } from 'react';

import { OnboardingCard } from '@/app/components/OnboardingCard';
import { LoginForm } from '@/app/components/LoginForm';

export default function LoginPage() {
  // TODO: Cambiar nombre de isLogged?

  const [isLogged, setIsLogged] = useState(false);

  return (
    <main className="h-full w-full grid place-items-center">
      {isLogged ? (
        <LoginForm></LoginForm>
      ) : (
        <OnboardingCard sendIsLogged={() => setIsLogged(true)} />
      )}
    </main>
  );
}
