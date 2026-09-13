import ExoplanetCard from "./ExoplanetCard";
import ExoplanetForm from "./ExoplanetForm";
import { panelBase } from "../ui";

function ExoplanetList({ exoplanetas, editandoId, onEdit, onCancelEdit, onUpdate, onDelete, enviando }) {
  if (exoplanetas.length === 0) {
    return (
      <div className="frame border border-border px-6 py-16 text-center">
        <p className="font-serif text-base text-ink">No hay exoplanetas todavía.</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-ink-faint">
          Registra el primer hallazgo arriba
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {exoplanetas.map((exoplaneta) => (
        <li key={exoplaneta._id}>
          {editandoId === exoplaneta._id ? (
            <div className={panelBase}>
              <ExoplanetForm
                initialData={exoplaneta}
                submitLabel="Guardar cambios"
                enviando={enviando}
                onCancel={onCancelEdit}
                onSubmit={(datos) => onUpdate(exoplaneta._id, datos)}
              />
            </div>
          ) : (
            <ExoplanetCard exoplaneta={exoplaneta} onEdit={onEdit} onDelete={onDelete} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default ExoplanetList;