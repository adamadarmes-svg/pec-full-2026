import { useState } from 'react';
import Button from './Button.jsx';
import { getCategory, getPaymentLabel } from '../constants/options.js';
import { formatCurrency, formatDate } from '../utils/format.js';

export default function ExpenseItem({ expense, index = 0, isEditing, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const category = getCategory(expense.category);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await onDelete(expense.id);
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <li
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
      className={`group row-sweep relative flex animate-rise flex-col gap-3 border-b border-line py-4 pr-2 pl-5 transition-colors duration-300 sm:flex-row sm:items-center sm:gap-6 ${
        isEditing ? 'bg-accent/[0.06]' : 'hover:bg-white/[0.02]'
      }`}
    >
      <span
        className={`${category.bar} absolute top-4 bottom-4 left-0 w-[3px] transition-all duration-300 group-hover:top-2 group-hover:bottom-2 group-hover:shadow-[0_0_12px_currentColor]`}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="flex min-w-0 items-center gap-2 font-medium break-words">
            {expense.title}
            {isEditing && (
              <span className="shrink-0 border border-accent/40 px-1.5 py-0.5 font-mono text-[0.625rem] tracking-widest text-accent uppercase">
                Editando
              </span>
            )}
          </h3>
          <p className="font-mono text-base font-semibold whitespace-nowrap tabular sm:hidden">
            {formatCurrency(expense.amount)}
          </p>
        </div>
        <p className="mt-1 font-mono text-xs tracking-wide text-muted">
          <span className="text-ink/80">{category.label}</span>
          <span className="mx-2 text-faint">/</span>
          {formatDate(expense.date)}
          <span className="mx-2 text-faint">/</span>
          {getPaymentLabel(expense.paymentMethod).toLowerCase()}
        </p>
        {expense.notes && <p className="mt-2 border-l border-line-strong pl-3 text-sm break-words text-ink/70">{expense.notes}</p>}
        {error && (
          <p role="alert" className="mt-2 animate-fade font-mono text-xs text-danger">
            {error}
          </p>
        )}
      </div>

      <p className="hidden font-mono text-lg font-semibold whitespace-nowrap tabular transition-colors duration-300 group-hover:text-accent sm:block">
        {formatCurrency(expense.amount)}
      </p>

      <div className="flex shrink-0 animate-fade gap-2" key={confirming ? 'confirm' : 'idle'}>
        {confirming ? (
          <>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting} className="flex-1 sm:flex-none">
              {isDeleting ? 'Eliminando…' : 'Sí, eliminar'}
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)} className="flex-1 sm:flex-none">
              No
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => onEdit(expense)}
              className="flex-1 sm:flex-none"
              aria-label={`Editar ${expense.title}`}
            >
              Editar
            </Button>
            <Button
              variant="dangerGhost"
              onClick={() => setConfirming(true)}
              className="flex-1 sm:flex-none"
              aria-label={`Eliminar ${expense.title}`}
            >
              Eliminar
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
