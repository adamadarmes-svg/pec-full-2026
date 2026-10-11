import { useEffect, useRef, useState } from "react";
import { campoSelect, campoSelectBare } from "@/ui";

function FieldSelect({ value, onChange, options, variant = "box", className = "" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const base = variant === "bare" ? campoSelectBare : campoSelect;
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button type="button" className={base} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={selected ? "text-ink" : "text-ink-faint"}>{selected?.label ?? "Seleccionar"}</span>
        <svg
          className={`h-2.5 w-2.5 shrink-0 text-ink-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-auto border border-border-strong bg-bg shadow-[0_20px_45px_rgba(0,0,0,0.6)]">
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <li key={option.value || "vacio"}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors ${
                    isActive ? "bg-accent-dim text-accent-strong" : "text-ink-dim hover:bg-surface-strong hover:text-ink"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className={`h-1 w-1 shrink-0 ${isActive ? "bg-accent-strong" : "bg-transparent"}`} />
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default FieldSelect;
