import { Navbar } from '@/app/components/Navbar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full">
      {children}
      <div className="absolute inset-0 via-transparent to-[#1e201f]" />
      <Navbar />
    </div>
  );
}
