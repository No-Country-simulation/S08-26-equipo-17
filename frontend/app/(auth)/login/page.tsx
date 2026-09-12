import { SlideCardLogin } from '@/app/components/SlideCardLogin';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-xl  text-center my-10">CondoTrack</h1>
      <SlideCardLogin />
    </main>
  );
}
