import { inputClass } from './Field.jsx';
import { CATEGORIES } from '../constants/options.js';
import { currentMonth } from '../utils/format.js';

export default function FilterBar({ filters, onChange }) {
  const update = (name) => (event) => onChange({ ...filters, [name]: event.target.value });
  const hasFilters = filters.category || filters.month;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="eyebrow flex min-w-36 flex-1 flex-col gap-2">
        Categoría
        <select className={inputClass} value={filters.category} onChange={update('category')}>
          <option value="">Todas</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="eyebrow flex min-w-36 flex-1 flex-col gap-2">
        Mes
        <input
          type="month"
          className={inputClass}
          value={filters.month}
          max={currentMonth()}
          onChange={update('month')}
        />
      </label>

      {hasFilters && (
        <button
          type="button"
          onClick={() => onChange({ category: '', month: '' })}
          className="min-h-11 animate-fade cursor-pointer border border-dashed border-accent/40 px-3 font-mono text-xs font-semibold tracking-[0.12em] text-accent uppercase transition-colors duration-300 hover:border-solid hover:bg-accent/10"
        >
          Quitar filtros
        </button>
      )}
    </div>
  );
}
