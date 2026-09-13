import { btnGhost, btnPeligro, cardBase } from "../ui";

function formatoNumero(valor, unidad) {
  if (valor === undefined || valor === null || valor === "") return "—";
  return `${valor} ${unidad}`;
}

function ExoplanetCard({ exoplaneta, onEdit, onDelete }) {
  const {
    nombre,
    estrellaAnfitriona,
    tipoEspectral,
    tipoPlaneta,
    masa,
    radio,
    periodoOrbital,
    temperaturaEquilibrio,
    distancia,
    metodoDescubrimiento,
    anioDescubrimiento,
    zonaHabitable,
    confirmado,
    descripcion,
  } = exoplaneta;

  const filas = [
    ["Masa", formatoNumero(masa, "M⊕")],
    ["Radio", formatoNumero(radio, "R⊕")],
    ["Periodo", formatoNumero(periodoOrbital, "días")],
    ["T. equilibrio", formatoNumero(temperaturaEquilibrio, "K")],
    ["Distancia", formatoNumero(distancia, "al")],
    [
      "Descubrimiento",
      `${metodoDescubrimiento || "—"}${anioDescubrimiento ? `, ${anioDescubrimiento}` : ""}`,
    ],
  ];

  return (
    <article className={`flex h-full flex-col gap-5 ${cardBase}`}>
      <header className="border-b border-border pb-4">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-accent/75">
          <span>{tipoPlaneta || "Desconocido"}</span>
          <span className="h-px flex-1 bg-border" />
          <span className={confirmado ? "text-accent-strong" : "text-ink-faint"}>
            {confirmado ? "Confirmado" : "Candidato"}
          </span>
        </div>
        <h3 className="mt-3 font-serif text-lg font-medium leading-tight text-ink">{nombre}</h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs uppercase tracking-wide text-ink-dim">
          <span>{estrellaAnfitriona}</span>
          {tipoEspectral && <span className="text-ink-faint">· {tipoEspectral}</span>}
          {zonaHabitable && (
            <span className="inline-flex items-center gap-1.5 text-habitable">
              <span className="h-1 w-1 bg-habitable" />
              Zona habitable
            </span>
          )}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-3.5">
        {filas.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="flex flex-col gap-1">
            <dt className="text-[10px] uppercase tracking-wider text-ink-faint">{etiqueta}</dt>
            <dd className="font-serif text-sm tabular-nums text-ink">{valor}</dd>
          </div>
        ))}
      </dl>

      {descripcion && (
        <p className="border-t border-border pt-4 text-sm leading-relaxed text-ink-dim">{descripcion}</p>
      )}

      <footer className="mt-auto flex gap-2 border-t border-border pt-4">
        <button type="button" className={btnGhost} onClick={() => onEdit(exoplaneta)}>
          Editar
        </button>
        <button type="button" className={btnPeligro} onClick={() => onDelete(exoplaneta)}>
          Eliminar
        </button>
      </footer>
    </article>
  );
}

export default ExoplanetCard;