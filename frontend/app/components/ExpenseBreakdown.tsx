// expenses/ExpenseBreakdown.tsx
import { StatCard } from './StatCard';
import {
  formatCurrency,
  formatShare,
} from '@/app/components/utils/ExpenseFormatters';

interface ExpenseBreakdownProps {
  commonExpenses: number;
  unitExpenses: number;
  share: number;
}

export const ExpenseBreakdown = ({
  commonExpenses,
  unitExpenses,
  share,
}: ExpenseBreakdownProps) => (
  <div className="grid grid-cols-3 gap-2">
    <StatCard label="Gastos comunes" value={formatCurrency(commonExpenses)} />
    <StatCard label="De tu unidad" value={formatCurrency(unitExpenses)} />
    <StatCard label="Tu parte" value={formatShare(share)} />
  </div>
);
