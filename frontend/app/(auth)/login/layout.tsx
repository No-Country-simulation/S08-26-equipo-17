export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-full w-full">{children}</div>;
}
