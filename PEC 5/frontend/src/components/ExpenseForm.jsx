import { useState } from 'react';
import Field, { inputClass } from './Field.jsx';
import Button from './Button.jsx';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/options.js';
import { todayInput, toDateInput } from '../utils/format.js';

const emptyValues = () => ({
  title: '',
  amount: '',
  category: 'comida',
  date: todayInput(),
  paymentMethod: 'tarjeta',
  notes: '',
});

const fromExpense = (expense) => ({
  title: expense.title,
  amount: String(expense.amount),
  category: expense.category,
  date: toDateInput(expense.date),
  paymentMethod: expense.paymentMethod,
  notes: expense.notes ?? '',
});

function validate(values) {
  const errors = {};
  const title = values.title.trim();
  const amount = Number(values.amount.replace(',', '.'));

  if (title.length < 2) errors.title = 'Escribe un concepto de al menos 2 caracteres';
  else if (title.length > 80) errors.title = 'Máximo 80 caracteres';

  if (values.amount === '' || Number.isNaN(amount)) errors.amount = 'Escribe un importe, por ejemplo 12,50';
  else if (amount <= 0) errors.amount = 'El importe debe ser mayor que 0';

  if (!values.date) errors.date = 'Elige una fecha';
  if (values.notes.length > 300) errors.notes = 'Máximo 300 caracteres';
  return errors;
}

export default function ExpenseForm({ expense, onSubmit, onCancel }) {
  const isEditing = Boolean(expense);
  const [values, setValues] = useState(() => (expense ? fromExpense(expense) : emptyValues()));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setFormError('');
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        notes: values.notes.trim(),
        amount: Number(values.amount.replace(',', '.')),
      });
      if (!isEditing) setValues(emptyValues());
    } catch (error) {
      setErrors(error.details ?? {});
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex animate-fade flex-col gap-5">
      <div className="flex flex-col gap-2 border-b border-line pb-4">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow" aria-hidden="true">
            02 — {isEditing ? 'Edición' : 'Registro'}
          </span>
          <span
            className={`size-1.5 ${isEditing ? 'animate-blink bg-cat-comida' : 'bg-accent'}`}
            aria-hidden="true"
          />
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {isEditing ? 'Editar gasto' : 'Nuevo gasto'}
          </h2>
          {isEditing && (
            <span className="truncate font-mono text-xs text-muted" title={expense.title}>
              {expense.title}
            </span>
          )}
        </div>
      </div>

      <Field id="title" label="Concepto" error={errors.title}>
        {(a11y) => (
          <input
            {...a11y}
            name="title"
            className={inputClass}
            value={values.title}
            onChange={handleChange}
            placeholder="Compra semanal, abono de bus…"
            maxLength={80}
            autoComplete="off"
          />
        )}
      </Field>

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
        <Field id="amount" label="Importe (€)" error={errors.amount}>
          {(a11y) => (
            <input
              {...a11y}
              name="amount"
              className={`${inputClass} tabular`}
              value={values.amount}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="0,00"
              autoComplete="off"
            />
          )}
        </Field>

        <Field id="date" label="Fecha" error={errors.date}>
          {(a11y) => (
            <input
              {...a11y}
              type="date"
              name="date"
              className={inputClass}
              value={values.date}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field id="category" label="Categoría" error={errors.category}>
          {(a11y) => (
            <select {...a11y} name="category" className={inputClass} value={values.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="paymentMethod" label="Pagado con" error={errors.paymentMethod}>
          {(a11y) => (
            <select
              {...a11y}
              name="paymentMethod"
              className={inputClass}
              value={values.paymentMethod}
              onChange={handleChange}
            >
              {PAYMENT_METHODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field id="notes" label="Notas" hint={`Opcional · ${values.notes.length}/300`} error={errors.notes}>
        {(a11y) => (
          <textarea
            {...a11y}
            name="notes"
            rows={3}
            className={`${inputClass} resize-none py-2.5 leading-relaxed`}
            value={values.notes}
            onChange={handleChange}
            maxLength={300}
          />
        )}
      </Field>

      {formError && (
        <p role="alert" className="animate-fade border-l-2 border-danger bg-danger/10 px-3 py-2.5 font-mono text-xs text-danger">
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-1 min-[420px]:flex-row">
        {isEditing && (
          <Button variant="secondary" onClick={onCancel} className="min-[420px]:flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="min-[420px]:flex-1">
          {isSubmitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Añadir gasto'}
        </Button>
      </div>
    </form>
  );
}
