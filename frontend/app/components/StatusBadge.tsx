// expenses/StatusBadge.tsx
import type { ExpenseStatus } from '@/app/components/utils/types';

const STATUS_STYLES: Record<
  ExpenseStatus,
  { label: string; className: string }
> = {
  pending: { label: 'Pendiente', className: 'bg-yellow-400 text-black' },
  paid: { label: 'Pagada', className: 'bg-green-500 text-black' },
  overdue: { label: 'Vencida', className: 'bg-red-500 text-white' },
};

export const StatusBadge = ({ status }: { status: ExpenseStatus }) => {
  const { label, className } = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-3.5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      {label}
    </span>
  );
};
