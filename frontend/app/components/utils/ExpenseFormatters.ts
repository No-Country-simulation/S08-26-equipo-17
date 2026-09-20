// expenses/formatters.ts
const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export const formatCurrency = (value: number) => currency.format(value); // "$ 184.250"
export const formatShare = (value: number) => `${percent.format(value)}%`; // "1,897%"
