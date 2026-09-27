import { useEffect, useRef, useState } from 'react';
import { useExpenses } from './hooks/useExpenses.js';
import SummaryPanel from './components/SummaryPanel.jsx';
import FilterBar from './components/FilterBar.jsx';
import ExpenseForm from './components/ExpenseForm.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import StatusMessage from './components/StatusMessage.jsx';

export default function App() {
  const [filters, setFilters] = useState({ category: '', month: '' });
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const formRef = useRef(null);

  const { expenses, status, error, isSlow, reload, createExpense, updateExpense, deleteExpense } =
    useExpenses(filters);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleEdit = (expense) => {
    setEditing(expense);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (values) => {
    if (editing) {
      await updateExpense(editing.id, values);
      setEditing(null);
      setNotice('Gasto actualizado');
    } else {
      await createExpense(values);
      setNotice('Gasto añadido');
    }
  };

  const handleDelete = async (id) => {
    await deleteExpense(id);
    if (editing?.id === id) setEditing(null);
    setNotice('Gasto eliminado');
  };

  const hasFilters = Boolean(filters.category || filters.month);

  const link =
    status === 'error'
      ? { label: 'Offline', dot: 'bg-danger' }
      : status === 'loading'
        ? { label: 'Sync', dot: 'bg-cat-comida animate-blink' }
        : { label: 'Online', dot: 'bg-accent' };

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
      <header className="flex animate-fade items-center justify-between gap-4 border-b border-line py-5">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="size-8" />
          <h1 className="font-display text-base font-semibold tracking-tight">Cuentas Claras</h1>
          <span className="eyebrow hidden border-l border-line-strong pl-3 text-faint sm:inline" aria-hidden="true">
            Finanzas · v5
          </span>
        </div>
        <div className="flex items-center gap-2 border border-line bg-panel/60 px-3 py-1.5" aria-hidden="true">
          <span className={`size-1.5 ${link.dot}`} />
          <span className="eyebrow">{link.label}</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 py-8 pb-16 lg:gap-8">
        <SummaryPanel expenses={expenses} filters={filters} isLoading={status === 'loading'} />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-8">
          <aside
            ref={formRef}
            style={{ animationDelay: '80ms' }}
            className={`frame animate-rise scroll-mt-4 p-5 sm:p-6 lg:sticky lg:top-6 ${editing ? 'frame-active' : ''}`}
          >
            <ExpenseForm
              key={editing?.id ?? 'new'}
              expense={editing}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(null)}
            />
          </aside>

          <section
            aria-labelledby="list-title"
            style={{ animationDelay: '160ms' }}
            className="frame min-w-0 animate-rise p-5 sm:p-6"
          >
            <div className="mb-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2 border-b border-line pb-4">
                <span className="eyebrow" aria-hidden="true">
                  03 — Historial
                </span>
                <h2 id="list-title" className="font-display text-xl font-semibold tracking-tight">
                  Movimientos
                </h2>
              </div>
              <FilterBar filters={filters} onChange={setFilters} />
            </div>

            <StatusMessage
              status={status}
              error={error}
              isSlow={isSlow}
              isEmpty={status === 'ready' && expenses.length === 0}
              hasFilters={hasFilters}
              onRetry={reload}
              onClearFilters={() => setFilters({ category: '', month: '' })}
            />

            {status === 'ready' && expenses.length > 0 && (
              <ExpenseList
                expenses={expenses}
                editingId={editing?.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </section>
        </div>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-5 font-mono text-[0.6875rem] tracking-[0.14em] text-faint uppercase">
        <span>Cuentas Claras · PEC 5 Desarrollo Web Fullstack · CEI</span>
        <span aria-hidden="true">© {new Date().getFullYear()}</span>
      </footer>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        {notice && (
          <p
            key={notice}
            className="relative flex animate-toast items-center gap-3 overflow-hidden border border-accent/40 bg-panel/90 px-5 py-3 font-mono text-xs font-medium tracking-[0.12em] text-ink uppercase shadow-[0_20px_50px_-15px_rgb(0_0_0/0.9),0_0_30px_-10px_rgb(62_230_195/0.4)] backdrop-blur-md"
          >
            <span className="size-1.5 bg-accent shadow-[0_0_8px_var(--color-accent)]" aria-hidden="true" />
            {notice}
            <span className="absolute inset-x-0 bottom-0 h-px origin-left animate-drain bg-accent" aria-hidden="true" />
          </p>
        )}
      </div>
    </div>
  );
}
