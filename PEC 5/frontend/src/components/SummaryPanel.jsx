import { CATEGORIES } from '../constants/options.js';
import { formatCurrency, formatMonth } from '../utils/format.js';

export default function SummaryPanel({ expenses, filters, isLoading }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = CATEGORIES.map((c) => ({
    ...c,
    amount: expenses.filter((e) => e.category === c.value).reduce((sum, e) => sum + e.amount, 0),
  }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const scope = filters.month ? `en ${formatMonth(filters.month)}` : 'en total';
  const categoryLabel = filters.category
    ? CATEGORIES.find((c) => c.value === filters.category)?.label.toLowerCase()
    : null;

  return (
    <section aria-labelledby="summary-title" className="frame flex animate-rise flex-col gap-7 p-5 sm:p-8">
      <div className="flex items-center justify-between gap-4" aria-hidden="true">
        <span className="eyebrow">01 — Resumen</span>
        <span className="eyebrow hidden text-faint sm:inline">EUR · {filters.month || 'Histórico'}</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <p id="summary-title" className="text-sm text-muted sm:text-base">
            Has gastado {scope}
            {categoryLabel && ` en ${categoryLabel}`}
          </p>
          <p
            className={`text-glow mt-3 font-display text-5xl leading-none font-light tracking-tighter tabular break-words transition-opacity duration-500 sm:text-7xl lg:text-8xl ${isLoading ? 'animate-blink opacity-40' : ''}`}
            aria-live="polite"
          >
            {formatCurrency(total)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 border-l border-line-strong pl-4 sm:items-end sm:border-l-0 sm:border-r sm:pr-4 sm:pl-0">
          <span className="font-mono text-2xl font-medium text-ink tabular">
            {String(expenses.length).padStart(2, '0')}
          </span>
          <p className="eyebrow">
            {expenses.length} {expenses.length === 1 ? 'movimiento' : 'movimientos'}
          </p>
        </div>
      </div>

      {byCategory.length > 0 && (
        <div className="animate-fade">
          <div
            className="flex h-2.5 w-full origin-left animate-grow gap-[3px] sm:h-3"
            role="img"
            aria-label={byCategory
              .map((c) => `${c.label}: ${Math.round((c.amount / total) * 100)} %`)
              .join(', ')}
          >
            {byCategory.map((c) => (
              <div
                key={c.value}
                className={`${c.bar} h-full min-w-[3px] transition-[width,filter] duration-700 ease-out hover:brightness-125`}
                style={{ width: `${(c.amount / total) * 100}%` }}
                title={`${c.label} · ${formatCurrency(c.amount)}`}
              />
            ))}
          </div>
          <ul className="mt-5 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {byCategory.map((c, i) => (
              <li
                key={c.value}
                style={{ animationDelay: `${i * 60}ms` }}
                className="flex animate-rise items-center gap-3 border border-line bg-field/60 px-3 py-2.5 text-sm transition-colors duration-300 hover:border-line-strong hover:bg-panel-2"
              >
                <span className={`${c.bar} size-2 shrink-0`} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{c.label}</span>
                <span className="font-mono text-xs text-faint tabular" aria-hidden="true">
                  {Math.round((c.amount / total) * 100)}%
                </span>
                <span className="font-mono text-xs text-muted tabular">{formatCurrency(c.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
