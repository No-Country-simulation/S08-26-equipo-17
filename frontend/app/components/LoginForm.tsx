'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import logo_vector from '@/public/logo_vector.svg';

const Logo = () => (
  <div className="flex items-center justify-center gap-2">
    <Image src={logo_vector} alt="CondoTrack logo" width={32} height={32} />
    <h1 className="text-xl font-extrabold tracking-tight text-black">
      Condo<span className="text-yellowbrand">Track</span>
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

const Login = ({
  onForgotPassword,
  handleSubmit,
}: {
  onForgotPassword: () => void;
  handleSubmit: () => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid p-5 gap-10">
      <div className="w-full text-center">
        <h2 className="text-3xl font-bold">Ingresá a CondoTrack</h2>
        <p className="text-secondarytext">
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
        <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-4">
          <span className="text-gray-400">
            <MailIcon />
          </span>
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-4">
          <span className="text-gray-400">
            <LockIcon />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            className="text-gray-400"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-gray-500"
          >
            Olvidé mi contraseña
          </button>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-yellowbrand py-4 font-semibold text-black"
        >
          Ingresar
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <p className="text-xs text-gray-500">CUENTAS DE DEMOSTRACIÓN</p>

        {demoAccounts.map((account) => (
          <div
            key={account.email}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{account.name}</p>
              <p className="text-xs text-gray-500">{account.email}</p>
            </div>
            <span className="text-xs text-gray-500">{account.role}</span>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>
          ¿Todavía no tenés acceso? El alta la hace la administración de tu
          edificio.
        </p>
        <p>
          Al ingresar aceptás los Términos y las Políticas de privacidad de
          CondoTrack.
        </p>
      </div>
    </div>
  );
};

const ForgotPasswordView = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: conectar con el endpoint real de recuperación
    setSent(true);
  };

  return (
    <div className="w-[390px] h-[844px] grid place-items-center p-4">
      <div className="w-full text-center">
        <h2 className="text-3xl font-bold">Recuperá tu acceso</h2>
        <p className="text-secondarytext">
          Te mandamos un enlace para crear una contraseña nueva.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-4">
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
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-yellowbrand py-4 font-semibold text-black"
        >
          Enviar enlace
        </button>
      </form>

      {sent && (
        <p className="text-center text-sm text-gray-500">
          Si el correo existe en nuestro sistema, vas a recibir un enlace en
          unos minutos.
        </p>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-center text-sm text-gray-500"
      >
        Volver a ingresar
      </button>
    </div>
  );
};

const LoadingView = () => (
  <div className="bg-black w-[390px] h-[844px] grid place-items-center">
    <div>
      <div className="flex items-center justify-center gap-2">
        <Image src={logo_vector} alt="CondoTrack logo" width={80} height={32} />
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Condo<span className="text-yellowbrand">Track</span>
        </h1>
      </div>

      {/* Contenedor de la barra (fondo tenue) */}
      <div className="mt-10 mx-auto w-6/12 h-1 bg-white/10 overflow-hidden relative rounded-full">
        {/* Línea amarilla animada */}
        <div className="h-full bg-yellowbrand w-1/2 absolute rounded-full animate-loading-bar" />
      </div>
    </div>

    {/* Animación CSS inyectada */}
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
    <div className="flex w-full flex-col gap-6 h-full">
      {/* <Logo /> */}
      {views[view]}
    </div>
  );
};
