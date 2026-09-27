export default function Field({ id, label, hint, error, children }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="eyebrow">
        {label}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} className="animate-fade font-mono text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="font-mono text-xs text-faint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const inputClass =
  'w-full min-h-11 border border-line bg-field px-3 text-base font-normal text-ink transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-faint hover:border-line-strong focus:border-accent/70 focus:bg-panel focus:shadow-[0_0_0_3px_rgb(62_230_195/0.12)] focus:outline-none aria-invalid:border-danger/70 aria-invalid:focus:shadow-[0_0_0_3px_rgb(255_95_95/0.12)]';
