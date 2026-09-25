// expenses/types.ts
export type ExpenseStatus = 'pending' | 'paid' | 'overdue';

export interface Expense {
  total: number;
  periodLabel: string; // 'Septiembre de 2026'
  dueLabel: string; // 'vence hoy'
  status: ExpenseStatus;
  commonExpenses: number;
  unitExpenses: number;
  share: number; // porcentaje, ej: 1.897
}
import type { ComponentType } from 'react';

export interface TodayItem {
  id: string;
  href: string;
  title: string;
  imageSrc?: string;
  eyebrow?: string;
  detail?: string;
  footer?: {
    label: string;
    action: string;
  };
  action?: {
    type: 'chevron' | 'text';
    label?: string;
  };
  icon?: ComponentType<{ className?: string }>;
}
