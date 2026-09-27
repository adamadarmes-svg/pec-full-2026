const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const monthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatCurrency = (value) => currency.format(value ?? 0);

export const formatDate = (iso) => dateFormatter.format(new Date(iso));

export const formatMonth = (yyyyMm) => monthFormatter.format(new Date(`${yyyyMm}-01T00:00:00Z`));

export const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');

export function todayInput() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 10);
}

export const currentMonth = () => todayInput().slice(0, 7);
