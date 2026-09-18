'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import logo_vector from '@/public/logo_vector.svg';

const Logo = () => (
  <div className="flex items-center justify-center gap-2 pt-2">
    <Image src={logo_vector} alt="CondoTrack logo" width={32} height={32} />
    <h1 className="text-xl font-extrabold tracking-tight text-white">
      Condo<span className="text-[#e2f026]">Track</span>
    </h1>
  </div>
);

type DemoAccount = {
  name: string;
  email: string;
  role: string;
};

const demoAccounts: DemoAccount[] = [
  {
    name: 'Felipe Osorio',
    email: 'felipe@araoz1280.com.ar',
    role: 'Residente',
  },
  {
    name: 'Diego Sosa',
    email: 'recepcion@araoz1280.com.ar',
    role: 'Recepción',
  },
  {
    name: 'Mariana Ferrari',
    email: 'admin@araoz1280.com.ar',
    role: 'Administración',
  },
];

const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-3.27 2.61A9.12 9.12 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 4.21-5.34" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
);

type View = 'login' | 'forgot-password' | 'loading';

// MARK: Login
const Login = ({
  onForgotPassword,
  handleSubmit,
}: {
  onForgotPassword: () => void;
  handleSubmit: () => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-8 w-full">
      <Logo />

      <div className="w-full text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Ingresá a CondoTrack
        </h2>
        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
          Accedé a la gestión de tu edificio: visitas, entregas, reservas y
          reclamos.
        </p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/80 px-5 py-4 focus-within:border-neutral-700 transition">
          <span className="text-gray-400">
            <MailIcon />
          </span>
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/80 px-5 py-4 focus-within:border-neutral-700 transition">
          <span className="text-gray-400">
            <LockIcon />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            className="text-gray-400 hover:text-gray-200 transition"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-gray-300 underline underline-offset-4 decoration-gray-600 hover:decoration-gray-400"
          >
            Olvidé mi contraseña
          </button>
        </div>

        <button
          type="submit"
          className="w-full rounded-full border border-neutral-300 bg-black/40 py-4 font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99]"
        >
          Ingresar
        </button>
      </form>

      {/* Contenedor de Cuentas Demo */}
      <div className="flex flex-col gap-3 rounded-3xl border border-neutral-800/80 bg-neutral-900/50 p-4">
        <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase px-1">
          CUENTAS DE DEMOSTRACIÓN
        </p>

        <div className="flex flex-col gap-2">
          {demoAccounts.map((account) => (
            <div
              key={account.email}
              className="flex items-center justify-between rounded-2xl bg-neutral-800/50 border border-neutral-800/40 px-4 py-3 cursor-pointer hover:bg-neutral-800/80 transition"
            >
              <div>
                <p className="text-sm font-semibold text-gray-200">
                  {account.name}
                </p>
                <p className="text-xs text-gray-400">{account.email}</p>
              </div>
              <span className="text-xs text-gray-400">{account.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 space-y-3 leading-relaxed px-2">
        <p>
          ¿Todavía no tenés acceso? El alta la hace la administración de tu
          edificio.
        </p>
        <p>
          Al ingresar aceptás los{' '}
          <span className="font-semibold text-gray-200 underline">
            Términos
          </span>{' '}
          y las{' '}
          <span className="font-semibold text-gray-200 underline">
            Políticas de privacidad
          </span>{' '}
          de CondoTrack.
        </p>
      </div>
    </div>
  );
};

// MARK: FORGOT PASS
const ForgotPasswordView = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="flex flex-col gap-8 w-full my-auto">
      <Logo />

      <div className="w-full text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Recuperá tu acceso
        </h2>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          Te mandamos un enlace para crear una contraseña nueva.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/80 px-5 py-4">
          <span className="text-gray-400">
            <MailIcon />
          </span>
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-[#e2f026] py-4 font-bold text-black hover:opacity-90 transition"
        >
          Enviar enlace
        </button>
      </form>

      {sent && (
        <p className="text-center text-sm text-gray-400">
          Si el correo existe en nuestro sistema, vas a recibir un enlace en
          unos minutos.
        </p>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-center text-sm text-gray-400 hover:text-white transition"
      >
        Volver a ingresar
      </button>
    </div>
  );
};

// MARK: LOADING VIEW
const LoadingView = () => (
  <div className="flex flex-col items-center justify-center my-auto w-full">
    <div className="flex items-center justify-center gap-2">
      <Image src={logo_vector} alt="CondoTrack logo" width={80} height={32} />
      <h1 className="text-4xl font-extrabold tracking-tight text-white">
        Condo<span className="text-[#e2f026]">Track</span>
      </h1>
    </div>

    <div className="mt-10 w-6/12 h-1 bg-white/10 overflow-hidden relative rounded-full">
      <div className="h-full bg-[#e2f026] w-1/2 absolute rounded-full animate-loading-bar" />
    </div>

    <style>{`
      @keyframes bounce-x {
        0%, 100% { left: 0; }
        50% { left: 50%; }
      }
      .animate-loading-bar {
        animation: bounce-x 1.4s ease-in-out infinite;
      }
    `}</style>
  </div>
);

export const LoginForm = () => {
  const [view, setView] = useState<View>('login');

  const views: Record<View, ReactNode> = {
    login: (
      <Login
        onForgotPassword={() => setView('forgot-password')}
        handleSubmit={() => setView('loading')}
      />
    ),
    'forgot-password': <ForgotPasswordView onBack={() => setView('login')} />,
    loading: <LoadingView />,
  };

  return (
    <div className="max-w-sm w-full mx-auto p-4">
      <div>
        <div className="relative z-10 flex h-full w-full flex-col">
          {views[view]}
        </div>
      </div>
    </div>
  );
};
