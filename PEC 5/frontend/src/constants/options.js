export const CATEGORIES = [
  { value: 'comida', label: 'Comida', bar: 'bg-cat-comida' },
  { value: 'transporte', label: 'Transporte', bar: 'bg-cat-transporte' },
  { value: 'vivienda', label: 'Vivienda', bar: 'bg-cat-vivienda' },
  { value: 'ocio', label: 'Ocio', bar: 'bg-cat-ocio' },
  { value: 'salud', label: 'Salud', bar: 'bg-cat-salud' },
  { value: 'educacion', label: 'Educación', bar: 'bg-cat-educacion' },
  { value: 'otros', label: 'Otros', bar: 'bg-cat-otros' },
];

export const PAYMENT_METHODS = [
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'bizum', label: 'Bizum' },
];

export const getCategory = (value) =>
  CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];

export const getPaymentLabel = (value) =>
  PAYMENT_METHODS.find((p) => p.value === value)?.label ?? value;
