import Button from './Button.jsx';

export default function StatusMessage({ status, error, isSlow, isEmpty, hasFilters, onRetry, onClearFilters }) {
  if (status === 'loading') {
    return (
      <div className="flex animate-fade flex-col items-center py-14 text-center text-muted" role="status">
        <div className="relative h-px w-40 overflow-hidden bg-line" aria-hidden="true">
          <span className="absolute inset-y-0 left-0 w-2/5 animate-scan bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>
        <p className="eyebrow mt-5">Cargando gastos…</p>
        {isSlow && (
          <p className="mx-auto mt-3 max-w-sm animate-fade text-sm text-faint">
            La API está en un servidor gratuito que se duerme por inactividad. El primer arranque puede tardar hasta un
            minuto.
          </p>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className="my-2 flex animate-rise flex-col items-center gap-4 border border-danger/30 bg-danger/[0.04] px-4 py-10 text-center"
        role="alert"
      >
        <span className="eyebrow text-danger" aria-hidden="true">
          ● Error de conexión
        </span>
        <p className="max-w-sm text-sm text-ink/80">{error}</p>
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="my-2 flex animate-rise flex-col items-center gap-4 border border-dashed border-line-strong px-4 py-12 text-center text-muted">
        <svg viewBox="0 0 24 24" className="size-6 text-faint" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
          <path d="M4 4h16v16H4z" />
          <path d="M4 9h16M9 9v11" />
        </svg>
        {hasFilters ? (
          <>
            <p className="text-sm">No hay gastos con estos filtros.</p>
            <Button variant="secondary" onClick={onClearFilters}>
              Quitar filtros
            </Button>
          </>
        ) : (
          <p className="max-w-xs text-sm">Aún no hay gastos. Añade el primero con el formulario.</p>
        )}
      </div>
    );
  }

  return null;
}
