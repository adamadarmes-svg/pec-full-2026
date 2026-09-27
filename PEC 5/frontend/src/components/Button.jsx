const VARIANTS = {
  primary:
    'shine bg-accent text-on-accent hover:bg-accent-dark hover:shadow-[0_0_28px_-6px_rgb(62_230_195/0.6)]',
  secondary:
    'bg-transparent text-ink ring-1 ring-inset ring-line-strong hover:bg-panel-2 hover:ring-accent/50 hover:text-accent',
  danger: 'shine bg-danger text-void hover:shadow-[0_0_28px_-6px_rgb(255_95_95/0.6)]',
  ghost: 'bg-transparent text-muted hover:bg-panel-2 hover:text-ink',
  dangerGhost: 'bg-transparent text-danger/90 ring-1 ring-inset ring-transparent hover:bg-danger/10 hover:ring-danger/40',
};

export default function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-4 font-mono text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
