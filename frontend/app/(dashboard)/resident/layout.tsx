import { Navbar } from '@/app/components/Navbar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full w-full">
      {children}
      <div className="pointer-events-none absolute inset-0  from-black/60 via-transparent to-[#1e201f]" />
      <Navbar />
    </div>
  );
}
