import { Navbar } from '@/app/components/Navbar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full overflow-hidden">
      {/* <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-45 bg-linear-to-b from-black/45 via-black/10 to-transparent" /> */}
      {children}
      {/* <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-black/10 via-transparent to-[#1e201f]/20" /> */}
      <Navbar />
    </div>
  );
}
