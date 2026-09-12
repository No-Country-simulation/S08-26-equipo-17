import { SlideCardLogin } from '@/app/components/SlideCardLogin';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-xl font-bold ">CondoTrack</h1>
      <SlideCardLogin></SlideCardLogin>
    </main>
  );
}
