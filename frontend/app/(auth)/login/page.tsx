'use client';

import { OnboardingCard } from '@/app/components/OnboardingCard';
import { LoginForm } from '@/app/components/LoginForm';
import { useState } from 'react';

export default function LoginPage() {
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
