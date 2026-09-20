// expenses/StatCard.tsx
interface StatCardProps {
  label: string;
  value: string;
}

export const StatCard = ({ label, value }: StatCardProps) => (
  <div className="grid gap-1 min-w-0 rounded-2xl border border-border-components bg-background-components p-3">
    <p className="truncate text-[11px] text-secondary-text">{label}</p>
    <p className="truncate text-sm font-bold">{value}</p>
  </div>
);
