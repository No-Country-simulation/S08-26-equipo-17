import { Navbar } from '@/app/components/Navbar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full">
      {children}
      <Navbar />
    </div>
  );
}
