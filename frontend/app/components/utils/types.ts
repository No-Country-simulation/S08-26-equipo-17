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
export type TodayItem =
  | {
      id: string;
      type: 'visits';
      href: string;
      tabLabel: string; // '1 pase vigente'
      title: string; // 'Visitas hoy'
      count: number;
      imageSrc: string;
    }
  | {
      id: string;
      type: 'delivery';
      href: string;
      tabLabel: string; // '1 paquete'
      title: string; // '1 paquete para retirar'
      detail: string; // 'Te lo guarda Diego Sosa en recepción'
    };
