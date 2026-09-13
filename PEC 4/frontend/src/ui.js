export const btnBase =
  "inline-flex items-center justify-center gap-2 border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const btnPrimario = `${btnBase} border-accent bg-accent text-[#1a1206] hover:border-accent-strong hover:bg-accent-strong`;
export const btnGhost = `${btnBase} border-border text-ink-dim hover:border-accent/60 hover:text-ink`;
export const btnPeligro = `${btnBase} border-peligro/40 text-peligro hover:border-peligro hover:bg-peligro-dim`;

export const campoInput =
  "w-full border border-border bg-surface-strong px-3.5 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors focus:border-accent/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const campoSelect =
  "flex w-full cursor-pointer items-center justify-between gap-2 border border-border bg-surface-strong px-3.5 py-2.5 text-left text-sm text-ink outline-none transition-colors focus:border-accent/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const campoSelectBare =
  "flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent px-4 py-3 text-left text-sm text-ink outline-none transition-colors focus:bg-surface-strong";

export const panelBase = "frame border border-border bg-surface p-7 backdrop-blur-xl";
export const cardBase =
  "frame border border-border bg-surface p-6 backdrop-blur-xl transition-colors duration-200 hover:border-border-strong";
