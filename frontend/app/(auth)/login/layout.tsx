export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="size-full">
      {children}
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-[#1e201f] pointer-events-none" />
    </div>
  );
}
